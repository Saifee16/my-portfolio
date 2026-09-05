import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  del,
  get,
  head,
  put,
  type GetBlobResult,
  type HeadBlobResult,
  type PutBlobResult,
} from "@vercel/blob";
import { isBlobAssetUrl, isControlledAssetUrl, isLocalAssetUrl, isAssetFilename } from "./asset-url.ts";

export type StorageDriver = "filesystem" | "vercel-blob" | "r2";

export type StoredObject = {
  pathname: string;
  url: string;
  etag: string;
};

export type StoredText = {
  text: string;
  etag: string;
};

export type StoredAsset = {
  bytes: Uint8Array;
  contentType: string;
};

export type PrivateWriteOptions = {
  ifMatch?: string;
};

export type BlobStorageApi = {
  put: (pathname: string, body: Parameters<typeof put>[1], options: Parameters<typeof put>[2]) => Promise<PutBlobResult>;
  get: (urlOrPathname: string, options: Parameters<typeof get>[1]) => Promise<GetBlobResult | null>;
  head?: (urlOrPathname: string, options?: Parameters<typeof head>[1]) => Promise<HeadBlobResult>;
  del: typeof del;
};

export interface StorageAdapter {
  readonly driver: StorageDriver;
  readPrivateText(key: string, options?: { bootstrapFile?: string }): Promise<StoredText | null>;
  writePrivateText(key: string, text: string, options?: PrivateWriteOptions): Promise<StoredObject>;
  deletePrivateObject(key: string, options?: PrivateWriteOptions): Promise<void>;
  uploadAsset(filename: string, bytes: Uint8Array, contentType: string): Promise<StoredObject>;
  readAsset(url: string): Promise<StoredAsset | null>;
  deleteAsset(url: string): Promise<void>;
}

export class StorageConflictError extends Error {
  constructor(message = "The stored value changed before it could be saved") {
    super(message);
    this.name = "StorageConflictError";
  }
}

export class StorageDataError extends Error {
  constructor(key: string) {
    super(`Persisted ${key} is not valid JSON`);
    this.name = "StorageDataError";
  }
}

function etag(bytes: Uint8Array) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function sha256(value: string | Uint8Array) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key: Uint8Array | string, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function safeChildPath(root: string, child: string) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, child);
  if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error("Unsafe storage path");
  return resolved;
}

function blobPath(key: string) {
  const normalized = key.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some(part => part === ".." || part === ".")) throw new Error("Unsafe Blob pathname");
  return `cms/${normalized}`;
}

function contentTypeForFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function streamBytes(stream: ReadableStream<Uint8Array>) {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function isConflict(error: unknown) {
  return error instanceof BlobPreconditionFailedError || (error instanceof Error && /precondition|etag|if-match/i.test(error.message));
}

function normalizeEtag(value: string) {
  let normalized = value.trim();
  if (normalized.toLowerCase().startsWith("w/")) normalized = normalized.slice(2).trim();
  if (normalized.startsWith('"') && normalized.endsWith('"')) normalized = normalized.slice(1, -1);
  return normalized;
}

function sameEtag(left: string, right: string) {
  return normalizeEtag(left) === normalizeEtag(right);
}

function etagCandidates(value: string) {
  const normalized = normalizeEtag(value);
  return [...new Set([value.trim(), normalized, `"${normalized}"`, `W/"${normalized}"`, `W/${normalized}`])];
}

async function readFileIfPresent(file: string) {
  try {
    return await fs.readFile(file);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

export function createFilesystemStorage(root = process.cwd()): StorageAdapter {
  const dataRoot = path.join(root, "data");
  const uploadsRoot = path.join(root, "public", "uploads");

  return {
    driver: "filesystem",

    async readPrivateText(key, options) {
      const file = safeChildPath(dataRoot, key);
      let bytes = await readFileIfPresent(file);
      if (!bytes && options?.bootstrapFile) {
        bytes = await readFileIfPresent(options.bootstrapFile);
        if (bytes) {
          await this.writePrivateText(key, new TextDecoder().decode(bytes));
        }
      }
      return bytes ? { text: new TextDecoder().decode(bytes), etag: etag(bytes) } : null;
    },

    async writePrivateText(key, text, options) {
      const file = safeChildPath(dataRoot, key);
      const bytes = new TextEncoder().encode(text);
      if (options?.ifMatch) {
        const current = await readFileIfPresent(file);
        if (!current || etag(current) !== options.ifMatch) throw new StorageConflictError();
      }
      await fs.mkdir(path.dirname(file), { recursive: true });
      const temporary = `${file}.${process.pid}.${crypto.randomBytes(8).toString("hex")}.tmp`;
      try {
        await fs.writeFile(temporary, bytes);
        await fs.rename(temporary, file);
      } catch (error) {
        await fs.unlink(temporary).catch(() => undefined);
        throw error;
      }
      return { pathname: key, url: key, etag: etag(bytes) };
    },

    async deletePrivateObject(key) {
      await fs.unlink(safeChildPath(dataRoot, key)).catch(error => {
        if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
      });
    },

    async uploadAsset(filename, bytes, contentType) {
      void contentType;
      if (!isAssetFilename(filename)) throw new Error("Unsafe asset filename");
      const file = safeChildPath(uploadsRoot, filename);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, bytes, { flag: "wx" });
      return { pathname: `uploads/${filename}`, url: `/uploads/${filename}`, etag: etag(bytes) };
    },

    async readAsset(url) {
      if (!isLocalAssetUrl(url)) return null;
      const filename = url.slice("/uploads/".length);
      const bytes = await readFileIfPresent(safeChildPath(uploadsRoot, filename));
      return bytes ? { bytes: new Uint8Array(bytes), contentType: contentTypeForFilename(filename) } : null;
    },

    async deleteAsset(url) {
      if (!isLocalAssetUrl(url)) return;
      const filename = url.slice("/uploads/".length);
      await fs.unlink(safeChildPath(uploadsRoot, filename)).catch(error => {
        if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
      });
    },
  };
}

function blobObject(result: PutBlobResult, pathname: string): StoredObject {
  return { pathname, url: result.url, etag: result.etag };
}

export function createBlobStorage(api: BlobStorageApi = { put, get, head, del }): StorageAdapter {
  return {
    driver: "vercel-blob",

    async readPrivateText(key, options) {
      const pathname = blobPath(key);
      let result = await api.get(pathname, { access: "private", useCache: false });
      if (!result && options?.bootstrapFile) {
        const seed = await readFileIfPresent(options.bootstrapFile);
        if (seed) {
          try {
            const stored = await api.put(pathname, seed, {
              access: "private",
              addRandomSuffix: false,
              allowOverwrite: false,
              contentType: "application/json",
            });
            return { text: new TextDecoder().decode(seed), etag: stored.etag };
          } catch (error) {
            result = await api.get(pathname, { access: "private", useCache: false });
            if (!result) throw error;
          }
        }
      }
      if (!result || result.statusCode === 304) return null;
      const bytes = await streamBytes(result.stream);
      return { text: new TextDecoder().decode(bytes), etag: result.blob.etag };
    },

    async writePrivateText(key, text, options) {
      const pathname = blobPath(key);
      try {
        const stored = await api.put(pathname, text, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
          ...(options?.ifMatch ? { ifMatch: options.ifMatch } : {}),
        });
        return blobObject(stored, pathname);
      } catch (error) {
        if (isConflict(error) && options?.ifMatch) {
          if (api.head) {
            const metadata = await api.head(pathname);
            if (!sameEtag(metadata.etag, options.ifMatch)) throw new StorageConflictError();
            try {
              const stored = await api.put(pathname, text, {
                access: "private",
                addRandomSuffix: false,
                allowOverwrite: true,
                contentType: "application/json",
                ifMatch: metadata.etag,
              });
              return blobObject(stored, pathname);
            } catch (retryError) {
              if (isConflict(retryError)) throw new StorageConflictError();
              throw retryError;
            }
          }
          try {
            for (const ifMatch of etagCandidates(options.ifMatch)) {
              try {
                const stored = await api.put(pathname, text, {
                  access: "private",
                  addRandomSuffix: false,
                  allowOverwrite: true,
                  contentType: "application/json",
                  ifMatch,
                });
                return blobObject(stored, pathname);
              } catch (retryError) {
                if (!isConflict(retryError)) throw retryError;
              }
            }
            throw new StorageConflictError();
          } catch (retryError) {
            if (isConflict(retryError)) throw new StorageConflictError();
            throw retryError;
          }
        }
        if (isConflict(error)) throw new StorageConflictError();
        throw error;
      }
    },

    async deletePrivateObject(key, options) {
      try {
        await api.del(blobPath(key), options?.ifMatch ? { ifMatch: options.ifMatch } : undefined);
      } catch (error) {
        if (error instanceof BlobNotFoundError) return;
        if (isConflict(error)) throw new StorageConflictError();
        throw error;
      }
    },

    async uploadAsset(filename, bytes, contentType) {
      if (!isAssetFilename(filename)) throw new Error("Unsafe asset filename");
      const pathname = `uploads/${filename}`;
      const stored = await api.put(pathname, Buffer.from(bytes), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType,
        cacheControlMaxAge: 31536000,
      });
      return { pathname, url: `/media/${filename}`, etag: stored.etag };
    },

    async readAsset(url) {
      if (isControlledAssetUrl(url)) {
        const filename = url.slice("/media/".length);
        const result = await api.get(`uploads/${filename}`, { access: "private", useCache: false });
        if (!result || result.statusCode === 304) return null;
        return { bytes: await streamBytes(result.stream), contentType: result.blob.contentType };
      }
      if (!isBlobAssetUrl(url)) return null;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get("content-type") ?? contentTypeForFilename(new URL(url).pathname) };
    },

    async deleteAsset(url) {
      const pathname = isControlledAssetUrl(url) ? `uploads/${url.slice("/media/".length)}` : isBlobAssetUrl(url) ? url : null;
      if (!pathname) return;
      try {
        await api.del(pathname);
      } catch (error) {
        if (!(error instanceof BlobNotFoundError)) throw error;
      }
    },
  };
}

type R2Config = { endpoint: string; bucket: string; accessKeyId: string; secretAccessKey: string };

function r2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new Error("R2 storage is not configured");
  return { endpoint: endpoint.replace(/\/$/, ""), bucket, accessKeyId, secretAccessKey };
}

function r2Path(config: R2Config, key: string) {
  const normalized = key.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some(part => part === ".." || part === ".")) throw new Error("Unsafe R2 pathname");
  return `/${encodeURIComponent(config.bucket)}/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}

async function r2Request(config: R2Config, method: "GET" | "PUT" | "HEAD" | "DELETE", key: string, body?: Uint8Array, options?: { contentType?: string; ifMatch?: string }) {
  const endpoint = new URL(config.endpoint);
  const canonicalUri = r2Path(config, key);
  const payloadHash = body ? sha256(body) : sha256(new Uint8Array());
  const amzDate = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const date = amzDate.slice(0, 8);
  const host = endpoint.host;
  const headers = new Headers({ host, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate });
  if (options?.contentType) headers.set("content-type", options.contentType);
  if (options?.ifMatch) headers.set("if-match", options.ifMatch);
  const canonicalHeaders = [...headers.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([name, value]) => `${name}:${value.trim().replace(/\s+/g, " ")}\n`).join("");
  const signedHeaders = [...headers.keys()].sort().join(";");
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${date}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${sha256(canonicalRequest)}`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, date), "auto"), "s3"), "aws4_request");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  headers.set("authorization", `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`);
  return fetch(`${endpoint.origin}${canonicalUri}`, { method, headers, body: body ? Buffer.from(body) : undefined, cache: "no-store" });
}

export function createR2Storage(config = r2Config()): StorageAdapter {
  return {
    driver: "r2",

    async readPrivateText(key, options) {
      let response = await r2Request(config, "GET", `cms/${key}`);
      if (response.status === 404 && options?.bootstrapFile) {
        const seed = await readFileIfPresent(options.bootstrapFile);
        if (seed) {
          const created = await r2Request(config, "PUT", `cms/${key}`, new Uint8Array(seed), { contentType: "application/json" });
          if (!created.ok && created.status !== 409) throw new Error(`R2 bootstrap failed (${created.status})`);
          response = await r2Request(config, "GET", `cms/${key}`);
        }
      }
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`R2 read failed (${response.status})`);
      return { text: await response.text(), etag: response.headers.get("etag")?.replaceAll('"', "") ?? "" };
    },

    async writePrivateText(key, text, options) {
      const bytes = new TextEncoder().encode(text);
      const response = await r2Request(config, "PUT", `cms/${key}`, bytes, { contentType: "application/json", ifMatch: options?.ifMatch });
      if (response.status === 412) throw new StorageConflictError();
      if (!response.ok) throw new Error(`R2 write failed (${response.status})`);
      return { pathname: key, url: key, etag: response.headers.get("etag")?.replaceAll('"', "") ?? etag(bytes) };
    },

    async deletePrivateObject(key, options) {
      const response = await r2Request(config, "DELETE", `cms/${key}`, undefined, { ifMatch: options?.ifMatch });
      if (response.status === 404) return;
      if (response.status === 412) throw new StorageConflictError();
      if (!response.ok) throw new Error(`R2 delete failed (${response.status})`);
    },

    async uploadAsset(filename, bytes, contentType) {
      if (!isAssetFilename(filename)) throw new Error("Unsafe asset filename");
      const response = await r2Request(config, "PUT", `uploads/${filename}`, bytes, { contentType });
      if (!response.ok) throw new Error(`R2 upload failed (${response.status})`);
      return { pathname: `uploads/${filename}`, url: `/media/${filename}`, etag: response.headers.get("etag")?.replaceAll('"', "") ?? etag(bytes) };
    },

    async readAsset(url) {
      if (isControlledAssetUrl(url)) {
        const filename = url.slice("/media/".length);
        const response = await r2Request(config, "GET", `uploads/${filename}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`R2 asset read failed (${response.status})`);
        return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get("content-type") ?? contentTypeForFilename(filename) };
      }
      if (!isBlobAssetUrl(url)) return null;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get("content-type") ?? contentTypeForFilename(new URL(url).pathname) };
    },

    async deleteAsset(url) {
      const filename = isControlledAssetUrl(url) ? url.slice("/media/".length) : null;
      if (!filename) return;
      const response = await r2Request(config, "DELETE", `uploads/${filename}`);
      if (response.status !== 404 && !response.ok) throw new Error(`R2 asset delete failed (${response.status})`);
    },
  };
}

export function getStorage(): StorageAdapter {
  const configured = process.env.STORAGE_DRIVER?.trim().toLowerCase();
  const driver = configured || (process.env.R2_ENDPOINT ? "r2" : process.env.VERCEL ? "vercel-blob" : "filesystem");
  if (driver === "filesystem") return createFilesystemStorage();
  if (driver === "vercel-blob" || driver === "blob") return createBlobStorage();
  if (driver === "r2") return createR2Storage();
  throw new Error(`Unsupported STORAGE_DRIVER: ${driver}`);
}

export function isBlobStorage(storage = getStorage()) {
  return storage.driver === "vercel-blob";
}

export function parseStoredJson<T>(text: string, key: string) {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new StorageDataError(key);
  }
}

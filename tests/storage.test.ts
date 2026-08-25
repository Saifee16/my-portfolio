import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { isAssetUrl, isBlobAssetUrl } from "../lib/asset-url.ts";
import { getContent, getContentSnapshot, saveContent } from "../lib/cms.ts";
import { issueAdminSession, revokeAdminSession, verifySessionToken } from "../lib/session.ts";
import { createBlobStorage, createFilesystemStorage, parseStoredJson, StorageConflictError, type BlobStorageApi } from "../lib/storage.ts";

function memoryBlobApi() {
  const objects = new Map<string, { body: Uint8Array; access: string; etag: string; url: string }>();
  const hash = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
  const keyFor = (value: string) => value.startsWith("http") ? new URL(value).pathname.slice(1) : value;
  const api = {
    async put(pathname: string, body: Parameters<BlobStorageApi["put"]>[1], options: Parameters<BlobStorageApi["put"]>[2]) {
      const bytes = typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(await new Response(body as BodyInit).arrayBuffer());
      const previous = objects.get(pathname);
      if (options.ifMatch && (!previous || previous.etag !== options.ifMatch)) throw new Error("precondition failed");
      if (previous && options.allowOverwrite === false) throw new Error("already exists");
      const etag = hash(bytes);
      const url = `https://test.${options.access}.blob.vercel-storage.com/${pathname}`;
      objects.set(pathname, { body: bytes, access: options.access, etag, url });
      return { pathname, url, downloadUrl: url, contentType: String(options.contentType ?? "application/octet-stream"), contentDisposition: "inline", etag, size: bytes.byteLength, uploadedAt: new Date(), cacheControl: "" };
    },
    async get(value: string) {
      const pathname = keyFor(value);
      const object = objects.get(pathname);
      if (!object) return null;
      const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(object.body); controller.close(); } });
      return { statusCode: 200 as const, stream, headers: new Headers(), blob: { url: object.url, downloadUrl: object.url, pathname, contentDisposition: "inline", cacheControl: "", uploadedAt: new Date(), etag: object.etag, contentType: "application/json", size: object.body.byteLength } };
    },
    async del(value: string | string[]) {
      for (const item of Array.isArray(value) ? value : [value]) objects.delete(keyFor(item));
    },
  } satisfies BlobStorageApi;
  return { api, objects };
}

test("filesystem storage preserves atomic JSON writes and asset cleanup", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-storage-"));
  try {
    const storage = createFilesystemStorage(root);
    const first = await storage.writePrivateText("content.json", "{\"version\":1}");
    assert.equal((await storage.readPrivateText("content.json"))?.text, "{\"version\":1}");
    await assert.rejects(storage.writePrivateText("content.json", "{\"version\":2}", { ifMatch: "stale" }), StorageConflictError);
    assert.equal((await storage.writePrivateText("content.json", "{\"version\":2}", { ifMatch: first.etag })).etag !== first.etag, true);

    const asset = await storage.uploadAsset("image-123-abc.png", new Uint8Array([1, 2, 3]), "image/png");
    assert.equal(isAssetUrl(asset.url), true);
    assert.deepEqual([...((await storage.readAsset(asset.url))?.bytes ?? [])], [1, 2, 3]);
    await storage.deleteAsset(asset.url);
    assert.equal(await storage.readAsset(asset.url), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Blob storage bootstraps canonical content and rejects stale writes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-blob-seed-"));
  try {
    const seed = path.join(root, "content.json");
    await writeFile(seed, "{\"seed\":true}", "utf8");
    const { api } = memoryBlobApi();
    const storage = createBlobStorage(api);
    const bootstrapped = await storage.readPrivateText("content.json", { bootstrapFile: seed });
    assert.equal(bootstrapped?.text, "{\"seed\":true}");
    assert.equal((await storage.readPrivateText("content.json", { bootstrapFile: seed }))?.text, "{\"seed\":true}");
    await assert.rejects(storage.writePrivateText("content.json", "{\"new\":true}", { ifMatch: "stale" }), StorageConflictError);

    const asset = await storage.uploadAsset("image-123-abc.png", new Uint8Array([137, 80, 78]), "image/png");
    assert.equal(asset.url, "/media/image-123-abc.png");
    assert.equal(isAssetUrl(asset.url), true);
    assert.equal(isBlobAssetUrl(asset.url), false);
    assert.deepEqual([...((await storage.readAsset(asset.url))?.bytes ?? [])], [137, 80, 78]);
    await storage.deleteAsset(asset.url);
    assert.equal(await storage.readAsset(asset.url), null);
    assert.equal((await storage.readPrivateText("content.json"))?.text, "{\"seed\":true}");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("CMS Blob bootstrap, write, conflict, and malformed JSON handling are safe", async () => {
  const { api } = memoryBlobApi();
  const storage = createBlobStorage(api);
  const content = await getContent(storage);
  assert.equal(content.profile.name, "Saifullah Suleman");
  const snapshot = await getContentSnapshot(storage);
  const next = { ...content, profile: { ...content.profile, shortName: `${content.profile.shortName} test` } };
  await saveContent(next, snapshot.etag, storage);
  assert.equal((await getContent(storage)).profile.shortName, `${content.profile.shortName} test`);
  await assert.rejects(saveContent(content, snapshot.etag, storage), StorageConflictError);

  await storage.writePrivateText("content.json", "not-json");
  assert.throws(() => parseStoredJson("not-json", "content.json"), /not valid JSON/);
  await assert.rejects(getContent(storage), /not valid JSON/);
});

test("Blob-backed sessions remain revocable across verification calls", async () => {
  const previousSecret = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = "a deliberately local test secret that is longer than 32 characters";
  try {
    const { api } = memoryBlobApi();
    const storage = createBlobStorage(api);
    const token = await issueAdminSession(storage);
    assert.equal(await verifySessionToken(token, storage), true);
    await revokeAdminSession(token, storage);
    assert.equal(await verifySessionToken(token, storage), false);
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previousSecret;
  }
});

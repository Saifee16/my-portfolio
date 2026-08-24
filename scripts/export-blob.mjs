import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list } from "@vercel/blob";

const outputArgument = process.argv.find(argument => argument.startsWith("--output="));
const outputDirectory = path.resolve(outputArgument?.slice("--output=".length) ?? process.env.BLOB_BACKUP_DIR ?? "backups/blob-export");

if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required");

async function listAll() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ limit: 1_000, ...(cursor ? { cursor } : {}) });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.filter(blob => (blob.pathname.startsWith("cms/") && !blob.pathname.startsWith("cms/sessions/")) || blob.pathname.startsWith("uploads/"));
}

function safeOutput(pathname) {
  const target = path.resolve(outputDirectory, pathname);
  if (!target.startsWith(`${outputDirectory}${path.sep}`)) throw new Error("Unsafe backup pathname");
  return target;
}

const blobs = await listAll();
const manifest = [];
for (const blob of blobs) {
  const access = blob.pathname.startsWith("cms/") ? "private" : "public";
  const result = await get(blob.url, { access, useCache: false });
  if (!result || result.statusCode === 304) throw new Error(`Could not read ${blob.pathname}`);
  const target = safeOutput(blob.pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, new Uint8Array(await new Response(result.stream).arrayBuffer()));
  manifest.push({ pathname: blob.pathname, url: blob.url, etag: blob.etag, size: blob.size, uploadedAt: blob.uploadedAt.toISOString(), access });
}

await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Exported ${manifest.length} Blob objects to ${outputDirectory}`);

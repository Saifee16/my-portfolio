import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const sourceArgument = process.argv.find(argument => argument.startsWith("--source="));
const sourceDirectory = path.resolve(sourceArgument?.slice("--source=".length) ?? process.env.BLOB_BACKUP_DIR ?? "backups/blob-export");
const allowOverwrite = process.argv.includes("--allow-overwrite");

if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required");
await access(path.join(sourceDirectory, "manifest.json"));

function contentType(pathname) {
  if (pathname.endsWith(".json")) return "application/json";
  if (pathname.endsWith(".pdf")) return "application/pdf";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

const manifest = JSON.parse(await readFile(path.join(sourceDirectory, "manifest.json"), "utf8"));
for (const item of manifest) {
  if (!item || typeof item.pathname !== "string" || item.pathname.startsWith("cms/sessions/") || (!item.pathname.startsWith("cms/") && !item.pathname.startsWith("uploads/"))) continue;
  const pathname = item.pathname.replaceAll("\\", "/");
  if (pathname.split("/").includes("..")) throw new Error("Unsafe restore pathname");
  const source = path.resolve(sourceDirectory, pathname);
  if (!source.startsWith(`${sourceDirectory}${path.sep}`)) throw new Error("Unsafe restore pathname");
  const bytes = await readFile(source);
  await put(pathname, bytes, {
    access: pathname.startsWith("cms/") ? "private" : "public",
    addRandomSuffix: false,
    allowOverwrite,
    contentType: contentType(pathname),
  });
}

await mkdir(sourceDirectory, { recursive: true });
await writeFile(path.join(sourceDirectory, "restore-complete.txt"), `${new Date().toISOString()}\n`, "utf8");
console.log(`Restored ${manifest.length} Blob objects from ${sourceDirectory}${allowOverwrite ? " (overwrite enabled)" : ""}`);

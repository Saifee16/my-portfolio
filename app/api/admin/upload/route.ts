import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isSameOriginRequest } from "@/lib/request";
import { hasValidFileSignature, uploadRules, type UploadKind } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 11 * 1024 * 1024) return NextResponse.json({ error: "Upload too large" }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid multipart upload" }, { status: 400 });
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "image");
  if (!(kind in uploadRules)) return NextResponse.json({ error: "Unsupported upload kind" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  const rule = uploadRules[kind as UploadKind];
  if (!rule.mimeTypes.includes(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (file.size <= 0 || file.size > rule.maxBytes) return NextResponse.json({ error: "File size outside allowed range" }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidFileSignature(file.type, bytes)) return NextResponse.json({ error: "File signature does not match its declared type" }, { status: 415 });
  const extMap: Record<string,string> = { "application/pdf":"pdf", "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" };
  const filename = `${kind}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${extMap[file.type]}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}

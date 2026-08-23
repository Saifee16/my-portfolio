import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const allowed: Record<string, string[]> = {
  cv: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp"],
  certificate: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "image");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!allowed[kind]?.includes(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  const max = kind === "cv" || kind === "certificate" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size <= 0 || file.size > max) return NextResponse.json({ error: "File size outside allowed range" }, { status: 413 });
  const extMap: Record<string,string> = { "application/pdf":"pdf", "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" };
  const filename = `${kind}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${extMap[file.type]}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${filename}` });
}

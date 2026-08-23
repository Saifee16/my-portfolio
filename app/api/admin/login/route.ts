import { NextResponse } from "next/server";
import { adminAuthConfigured, createSessionToken, setAdminCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 10_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  if (!adminAuthConfigured()) return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!body.password || !verifyPassword(body.password)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await setAdminCookie(createSessionToken());
  return NextResponse.json({ ok: true });
}

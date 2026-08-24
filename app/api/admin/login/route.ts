import { NextResponse } from "next/server";
import { adminAuthConfigured, issueAdminSession, setAdminCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 10_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const limit = checkRateLimit(request, "admin-login", 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }
  if (!adminAuthConfigured()) return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (typeof body.password !== "string" || body.password.length > 512 || !verifyPassword(body.password)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await setAdminCookie(await issueAdminSession());
  return NextResponse.json({ ok: true });
}

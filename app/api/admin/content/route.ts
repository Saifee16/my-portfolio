import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContentSnapshot, saveContent } from "@/lib/cms";
import { isPortfolioContent } from "@/lib/content-validation";
import { isSameOriginRequest } from "@/lib/request";
import { StorageConflictError } from "@/lib/storage";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await getContentSnapshot();
  return NextResponse.json(snapshot.value, { headers: { ETag: snapshot.etag, "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 2_000_000) return NextResponse.json({ error: "Content payload too large" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (!isPortfolioContent(body)) return NextResponse.json({ error: "Invalid portfolio content" }, { status: 400 });
  try {
    const stored = await saveContent(body, request.headers.get("if-match") ?? undefined);
    return NextResponse.json({ ok: true }, { headers: { ETag: stored.etag, "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof StorageConflictError)) throw error;
    const latest = await getContentSnapshot();
    return NextResponse.json({ error: "Content changed in another session. Reload before saving again." }, { status: 409, headers: { ETag: latest.etag, "Cache-Control": "no-store" } });
  }
}

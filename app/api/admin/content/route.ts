import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/cms";
import { isPortfolioContent } from "@/lib/content-validation";
import { isSameOriginRequest } from "@/lib/request";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getContent());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 2_000_000) return NextResponse.json({ error: "Content payload too large" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (!isPortfolioContent(body)) return NextResponse.json({ error: "Invalid portfolio content" }, { status: 400 });
  await saveContent(body);
  return NextResponse.json({ ok: true });
}

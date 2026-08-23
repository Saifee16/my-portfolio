import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/cms";
import type { PortfolioContent } from "@/lib/types";

function looksValid(input: unknown): input is PortfolioContent {
  if (!input || typeof input !== "object") return false;
  const x = input as Partial<PortfolioContent>;
  return !!x.profile && Array.isArray(x.projects) && Array.isArray(x.experience) && Array.isArray(x.education) && Array.isArray(x.certifications) && Array.isArray(x.research) && Array.isArray(x.blog) && !!x.cv && !!x.newsletter && !!x.settings;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getContent());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 2_000_000) return NextResponse.json({ error: "Content payload too large" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (!looksValid(body)) return NextResponse.json({ error: "Invalid portfolio content" }, { status: 400 });
  await saveContent(body);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getContent, recordAnalytics } from "@/lib/cms";

export async function POST(request: Request) {
  const content = await getContent();
  if (!content.settings.analyticsEnabled) return new NextResponse(null, { status: 204 });
  const body = await request.json().catch(() => ({})) as { path?: string; event?: string };
  const path = String(body.path ?? "").slice(0, 200);
  const event = String(body.event ?? "page_view").slice(0, 60);
  if (!path.startsWith("/") || path.startsWith("/admin")) return new NextResponse(null, { status: 204 });
  await recordAnalytics({ path, event, at: new Date().toISOString() });
  return new NextResponse(null, { status: 204 });
}

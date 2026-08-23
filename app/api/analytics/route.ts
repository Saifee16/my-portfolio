import { NextResponse } from "next/server";
import { getContent, recordAnalytics } from "@/lib/cms";
import { checkRateLimit } from "@/lib/rate-limit";

const allowedEvents = new Set(["page_view", "project_open", "github_click", "live_site_click", "cv_download", "blog_read", "newsletter_conversion"]);

export async function POST(request: Request) {
  const content = await getContent();
  if (!content.settings.analyticsEnabled) return new NextResponse(null, { status: 204 });
  const limit = checkRateLimit(request, "analytics", 60, 60 * 1000);
  if (!limit.allowed) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const body = await request.json().catch(() => ({})) as { path?: string; event?: string };
  const path = String(body.path ?? "").slice(0, 200);
  const event = String(body.event ?? "page_view").slice(0, 60);
  if (!path.startsWith("/") || path.startsWith("/admin") || !allowedEvents.has(event)) return new NextResponse(null, { status: 204 });
  await recordAnalytics({ path, event, at: new Date().toISOString() });
  return new NextResponse(null, { status: 204 });
}

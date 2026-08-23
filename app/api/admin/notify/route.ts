import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent, getSubscribers } from "@/lib/cms";
import { notifySubscriber } from "@/lib/mailer";
import { siteDefaults } from "@/lib/site";
import { isSameOriginRequest } from "@/lib/request";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 10_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const body = await request.json().catch(() => ({})) as { postId?: string };
  if (typeof body.postId !== "string" || body.postId.length > 120) return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  const content = await getContent();
  const post = content.blog.find(p => p.id === body.postId && p.status === "Published");
  if (!post) return NextResponse.json({ error: "Published post not found" }, { status: 404 });
  const subscribers = (await getSubscribers()).filter(s=>s.status === "active");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url;
  if (!subscribers.length) return NextResponse.json({ sent: false, reason: "No active subscribers" }, { status: 202 });
  const results = await Promise.all(subscribers.map(s => notifySubscriber(s.email, s.token, post.title, post.slug, baseUrl)));
  const sent = results.filter(r=>r.sent).length;
  return NextResponse.json({ sent: sent > 0, sentCount: sent, total: subscribers.length, reason: sent ? undefined : results[0]?.reason }, { status: sent ? 200 : 202 });
}

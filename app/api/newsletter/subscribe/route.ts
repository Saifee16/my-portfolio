import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getContent, getSubscribersSnapshot, saveSubscribers } from "@/lib/cms";
import { sendConfirmation } from "@/lib/mailer";
import { siteDefaults } from "@/lib/site";
import { checkRateLimit } from "@/lib/rate-limit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericMessage = "If this address can be subscribed, check your inbox for a confirmation message.";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 10_000) return NextResponse.json({ message: "Request too large" }, { status: 413 });
  const limit = checkRateLimit(request, "newsletter-subscribe", 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const { email, website } = await request.json().catch(() => ({ email: "", website: "" })) as { email?: string; website?: string };
  if (typeof website === "string" && website.trim()) return NextResponse.json({ message: genericMessage });
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!emailPattern.test(normalized) || normalized.length > 254) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  const snapshot = await getSubscribersSnapshot();
  const subscribers = snapshot.value;
  const existing = subscribers.find(s=>s.email===normalized);
  if (existing?.status === "active") return NextResponse.json({ message: genericMessage });
  const token = crypto.randomBytes(24).toString("hex");
  const item = { email: normalized, status: "pending" as const, token, createdAt: new Date().toISOString(), confirmedAt: "", expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() };
  if (existing) Object.assign(existing, item); else subscribers.push(item);
  await saveSubscribers(subscribers, snapshot.etag);
  const content = await getContent();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url;
  await sendConfirmation(normalized, token, baseUrl);
  return NextResponse.json({ message: genericMessage });
}

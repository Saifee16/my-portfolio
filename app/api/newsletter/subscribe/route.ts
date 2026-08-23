import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getContent, getSubscribers, saveSubscribers } from "@/lib/cms";
import { sendConfirmation } from "@/lib/mailer";
import { siteDefaults } from "@/lib/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 10_000) return NextResponse.json({ message: "Request too large" }, { status: 413 });
  const { email } = await request.json().catch(() => ({ email: "" })) as { email?: string };
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!emailPattern.test(normalized) || normalized.length > 254) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  const subscribers = await getSubscribers();
  const existing = subscribers.find(s=>s.email===normalized);
  if (existing?.status === "active") return NextResponse.json({ message: "You’re already subscribed." });
  const token = crypto.randomBytes(24).toString("hex");
  const item = { email: normalized, status: "pending" as const, token, createdAt: new Date().toISOString(), confirmedAt: "" };
  if (existing) Object.assign(existing, item); else subscribers.push(item);
  await saveSubscribers(subscribers);
  const content = await getContent();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url;
  const result = await sendConfirmation(normalized, token, baseUrl);
  return NextResponse.json({ message: result.sent ? "Check your inbox to confirm your subscription." : "Subscription saved as pending. Configure email delivery in the server environment to send confirmation messages." });
}

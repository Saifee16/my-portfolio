import { NextResponse } from "next/server";
import { getSubscribers, saveSubscribers } from "@/lib/cms";
import { isConfirmationTokenActive } from "@/lib/newsletter";
import { isSameOriginRequest } from "@/lib/request";

function redirect(request: Request, result: "confirmed" | "invalid") {
  return NextResponse.redirect(new URL(`/newsletter/confirm?result=${result}`, request.url), 303);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || token.length > 200) return redirect(request, "invalid");
  const subscribers = await getSubscribers();
  const index = subscribers.findIndex(subscriber => subscriber.token === token);
  const candidate = index >= 0 ? subscribers[index] : undefined;
  if (!candidate || !isConfirmationTokenActive(candidate)) return redirect(request, "invalid");
  if (candidate.status !== "active") {
    subscribers[index] = { ...candidate, status: "active", confirmedAt: new Date().toISOString() };
    await saveSubscribers(subscribers);
  }
  return redirect(request, "confirmed");
}

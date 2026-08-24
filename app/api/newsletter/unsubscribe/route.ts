import { NextResponse } from "next/server";
import { getSubscribersSnapshot, saveSubscribers } from "@/lib/cms";
import { isSameOriginRequest } from "@/lib/request";

function redirect(request: Request, result: "success" | "invalid") {
  return NextResponse.redirect(new URL(`/newsletter/unsubscribe?result=${result}`, request.url), 303);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || token.length > 200) return redirect(request, "invalid");
  const snapshot = await getSubscribersSnapshot();
  const subscribers = snapshot.value;
  const index = subscribers.findIndex(subscriber => subscriber.token === token && subscriber.status !== "unsubscribed");
  if (index < 0) return redirect(request, "invalid");
  subscribers[index] = { ...subscribers[index], status: "unsubscribed" };
  await saveSubscribers(subscribers, snapshot.etag);
  return redirect(request, "success");
}

import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSubscribers } from "@/lib/cms";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subscribers = await getSubscribers();
  return NextResponse.json(subscribers.map(subscriber => Object.fromEntries(Object.entries(subscriber).filter(([key]) => key !== "token"))));
}

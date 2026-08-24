import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/request";
export async function POST(request: Request) { if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); await clearAdminCookie(); return NextResponse.json({ ok: true }); }

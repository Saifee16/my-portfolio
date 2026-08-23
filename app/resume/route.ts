import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getContent } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const { cv } = await getContent();
  if (!cv.activeFileUrl || !/^\/uploads\/[a-z0-9][a-z0-9._-]*\.pdf$/i.test(cv.activeFileUrl)) {
    return NextResponse.json({ error: "Resume is not available yet" }, { status: 404 });
  }
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(process.cwd(), "public", cv.activeFileUrl.slice(1));
  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return NextResponse.json({ error: "Resume is not available" }, { status: 404 });
  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Saifullah-Suleman-Resume.pdf"',
        "Cache-Control": "public, max-age=300, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume is not available" }, { status: 404 });
  }
}

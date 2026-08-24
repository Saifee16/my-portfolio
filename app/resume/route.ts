import { NextResponse } from "next/server";
import { getContent } from "@/lib/cms";
import { isPdfAssetUrl } from "@/lib/asset-url";
import { getStorage } from "@/lib/storage";
import { hasValidFileSignature } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET() {
  const { cv } = await getContent();
  if (!isPdfAssetUrl(cv.activeFileUrl)) return NextResponse.json({ error: "Resume is not available yet" }, { status: 404 });
  const asset = await getStorage().readAsset(cv.activeFileUrl);
  if (!asset || !hasValidFileSignature("application/pdf", asset.bytes)) return NextResponse.json({ error: "Resume is not available" }, { status: 404 });
  return new NextResponse(Buffer.from(asset.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Saifullah-Suleman-Resume.pdf"',
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}

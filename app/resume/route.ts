import { NextResponse } from "next/server";
import { getContent } from "@/lib/cms";
import { isPdfAssetUrl } from "@/lib/asset-url";
import { createFilesystemStorage, getStorage } from "@/lib/storage";
import { hasValidFileSignature } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET() {
  const { cv } = await getContent();
  if (!isPdfAssetUrl(cv.activeFileUrl)) return NextResponse.json({ error: "Resume is not available yet" }, { status: 404 });
  // The bundled CV remains available when the CMS uses remote storage.
  const bundledCv = ["/uploads/saifullah-ai-cv.pdf", "/uploads/saifullah-ba-cv.pdf"].includes(cv.activeFileUrl);
  const storage = bundledCv ? createFilesystemStorage() : getStorage();
  const asset = await storage.readAsset(cv.activeFileUrl);
  if (!asset || !hasValidFileSignature("application/pdf", asset.bytes)) return NextResponse.json({ error: "Resume is not available" }, { status: 404 });
  return new NextResponse(Buffer.from(asset.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Saifullah-Suleman-Resume.pdf"',
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}

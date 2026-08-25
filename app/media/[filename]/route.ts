import { isAssetFilename } from "@/lib/asset-url";
import { getStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isAssetFilename(filename)) return new Response("Not Found", { status: 404 });
  const asset = await getStorage().readAsset(`/media/${filename}`);
  if (!asset) return new Response("Not Found", { status: 404 });
  return new Response(Buffer.from(asset.bytes), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms";
import { siteDefaults } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> { const content = await getContent(); const base = (process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url).replace(/\/$/, ""); return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/admin", "/api/admin/"] }], sitemap: `${base}/sitemap.xml` }; }

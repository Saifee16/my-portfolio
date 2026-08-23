import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms";
import { siteDefaults } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const content=await getContent(); const base=(process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url).replace(/\/$/,""); const projectUrls=content.projects.filter(p=>p.visibility==="Public").map(p=>({url:`${base}/projects/${p.slug}`,lastModified:new Date()})); const blogUrls=content.blog.filter(p=>p.status==="Published").map(p=>({url:`${base}/blog/${p.slug}`,lastModified:p.publishedAt?new Date(p.publishedAt):new Date()})); return [{url:base,lastModified:new Date()},{url:`${base}/blog`,lastModified:new Date()},...projectUrls,...blogUrls]; }

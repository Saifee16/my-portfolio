import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms";
import { siteDefaults } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? content.settings.siteUrl ?? siteDefaults.url).replace(/\/$/, "");
  const projectUrls = content.projects.filter(project => project.visibility === "Public").map(project => ({ url: `${base}/projects/${project.slug}`, lastModified: new Date() }));
  const blogUrls = content.blog.filter(post => post.status === "Published").map(post => ({ url: `${base}/blog/${post.slug}`, lastModified: post.publishedAt && !Number.isNaN(new Date(post.publishedAt).getTime()) ? new Date(post.publishedAt) : new Date() }));
  return [{ url: base, lastModified: new Date() }, ...(blogUrls.length ? [{ url: `${base}/blog`, lastModified: new Date() }] : []), ...(content.certifications.length ? [{ url: `${base}/certifications`, lastModified: new Date() }] : []), ...projectUrls, ...blogUrls];
}

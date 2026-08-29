import { getContent } from "@/lib/cms";
import { siteDefaults } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET() {
  const { blog } = await getContent();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? siteDefaults.url).replace(/\/$/, "");
  const posts = blog.filter(post => post.status === "Published").sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  const items = posts.map(post => `<item><title>${escapeXml(post.title)}</title><link>${base}/blog/${encodeURIComponent(post.slug)}</link><guid>${base}/blog/${encodeURIComponent(post.slug)}</guid><description>${escapeXml(post.excerpt)}</description>${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}</item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteDefaults.name)} — Engineering notes</title><link>${base}${posts.length ? "/blog" : ""}</link><description>Engineering notes on applied AI, backend systems, evaluation, and product engineering.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300, must-revalidate" } });
}

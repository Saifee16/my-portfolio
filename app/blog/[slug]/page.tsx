import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { estimateReadingTime, jsonLd } from "@/lib/content-utils";
import { renderMarkdown } from "@/lib/markdown";
import { siteDefaults } from "@/lib/site";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { blog } = await getContent();
  const post = blog.find(item => item.slug === slug && item.status === "Published");
  if (!post) return { title: "Writing" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, url: `/blog/${post.slug}`, publishedTime: post.publishedAt || undefined, authors: [siteDefaults.name], ...(post.coverImage ? { images: [{ url: post.coverImage, alt: `Editorial cover for ${post.title}` }] } : {}) },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { blog, profile } = await getContent();
  const post = blog.find(item => item.slug === slug && item.status === "Published");
  if (!post) notFound();
  const html = renderMarkdown(post.content);
  const related = blog.filter(item => item.status === "Published" && item.id !== post.id && (item.category === post.category || item.tags.some(tag => post.tags.includes(tag)))).slice(0, 3);
  const canonical = `${siteDefaults.url}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: { "@type": "Person", name: profile.name, url: siteDefaults.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(post.coverImage ? { image: post.coverImage.startsWith("http") ? post.coverImage : `${siteDefaults.url}${post.coverImage}` } : {}),
  };
  return <><Navbar /><main className="section pt-16"><Link className="text-link" href="/blog">← All writing</Link><article className="mt-10" aria-labelledby="article-title"><div className="max-w-4xl border-t border-white/10 pt-6"><div className="flex flex-wrap gap-3 mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]"><span className="text-[var(--accent)]">{post.category}</span><span>{post.publishedAt}</span><span>{estimateReadingTime(post.content)} min read</span><span>{profile.name}</span></div><h1 id="article-title" className="mt-6 text-[clamp(3rem,7vw,6.8rem)] font-medium leading-[.93] tracking-[-.06em]">{post.title}</h1><p className="mt-6 text-xl leading-8 text-[var(--copy)]">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-2">{post.tags.map(tag=><span className="chip" key={tag}>{tag}</span>)}</div></div>{post.coverImage ? <Image src={post.coverImage} alt={`Editorial cover for ${post.title}`} width={1600} height={900} className="mt-10 aspect-video w-full object-cover" priority /> : null}<div className="prose mt-16" dangerouslySetInnerHTML={{ __html: html }} /></article>{related.length ? <section className="mt-20 border-t border-white/10 pt-6"><p className="eyebrow">Related notes</p><div className="mt-6 grid gap-4 lg:grid-cols-3">{related.map(item => <article className="surface p-5" key={item.id}><p className="eyebrow">{item.category}</p><h2 className="mt-3 text-xl font-medium"><Link className="hover:text-[var(--accent)]" href={`/blog/${item.slug}`}>{item.title}</Link></h2><p className="mt-3 text-sm leading-6 text-[var(--copy)]">{item.excerpt}</p></article>)}</div></section> : null}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} /></main><Footer /></>;
}

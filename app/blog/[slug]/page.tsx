import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { renderMarkdown } from "@/lib/markdown";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const { blog } = await getContent(); const post = blog.find(p=>p.slug===slug && p.status === "Published");
  return post ? { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt } : { title: "Writing" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { blog, profile } = await getContent(); const post = blog.find(p=>p.slug===slug && p.status === "Published"); if (!post) notFound();
  const html = renderMarkdown(post.content);
  return <><Navbar /><main className="section pt-16"><Link className="text-link" href="/blog">← All writing</Link><article className="mt-10"><div className="max-w-4xl border-t border-white/10 pt-6"><div className="flex flex-wrap gap-3 mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]"><span className="text-[var(--accent)]">{post.category}</span><span>{post.publishedAt}</span><span>{profile.name}</span></div><h1 className="mt-6 text-[clamp(3rem,7vw,6.8rem)] font-medium leading-[.93] tracking-[-.06em]">{post.title}</h1><p className="mt-6 text-xl leading-8 text-[var(--copy)]">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-2">{post.tags.map(tag=><span className="chip" key={tag}>{tag}</span>)}</div></div><div className="prose mt-16" dangerouslySetInnerHTML={{ __html: html }} /></article></main><Footer /></>;
}

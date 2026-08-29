import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { estimateReadingTime } from "@/lib/content-utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NewsletterForm } from "@/components/newsletter-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Writing",
  description: "Engineering notes on applied AI, backend systems, evaluation, infrastructure, and product engineering.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const { blog, newsletter } = await getContent();
  const posts = blog.filter(post => post.status === "Published").sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  if (!posts.length) notFound();
  return <><Navbar /><main className="section pt-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Writing / Engineering journal</p><h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">Notes from systems I actually build.</h1></div><a className="text-link" href="/feed.xml">RSS feed ↗</a></div><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--copy)]">Architecture decisions, failure modes, evaluation, backend systems, applied AI, and lessons from product work.</p><div className="mt-16 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="surface p-6 sm:p-8"><div className="space-y-9">{posts.map(post=><article className="border-t border-white/10 pt-6" key={post.id}><div className="flex flex-wrap items-center gap-3 mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]"><span className="text-[var(--accent)]">{post.category}</span><span>{post.publishedAt}</span><span>{estimateReadingTime(post.content)} min read</span></div><h2 className="mt-4 text-3xl font-medium tracking-[-.04em]"><Link href={`/blog/${post.slug}`} className="hover:text-[var(--accent)]">{post.title}</Link></h2><p className="mt-4 leading-7 text-[var(--copy)]">{post.excerpt}</p><Link className="text-link mt-5 inline-flex" href={`/blog/${post.slug}`}>Read note →</Link></article>)}</div></section>{newsletter.enabled ? <aside className="surface self-start p-6 sm:p-8 lg:sticky lg:top-24"><p className="eyebrow">Subscribe</p><h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">{newsletter.heading}</h2><p className="mt-4 leading-7 text-[var(--copy)]">{newsletter.description}</p><NewsletterForm /></aside> : null}</div></main><Footer /></>;
}

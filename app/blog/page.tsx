import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  const posts = blog.filter(post => post.status === "Published").sort((a, b) => Number(b.featured) - Number(a.featured) || (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  if (!posts.length) notFound();
  return <><Navbar /><main id="main" className="section">
    <div className="flex items-center justify-between gap-5">
      <p className="eyebrow">Writing / Engineering journal</p>
      <a className="text-link shrink-0" href="/feed.xml">RSS feed ↗</a>
    </div>
    <h1 className="mt-4 max-w-5xl text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[1.02] tracking-[-.055em]">AI research, with an engineering perspective.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--copy)]">Architecture decisions, failure modes, evaluation, backend systems, applied AI, and lessons from product work.</p>
    <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post,index)=><article className={`surface overflow-hidden ${index===0?"sm:col-span-2 xl:col-span-3":""}`} key={post.id}>
        <Link href={`/blog/${post.slug}`} scroll className={`group block ${index===0 && post.coverImage?"lg:grid lg:grid-cols-2 lg:items-center":""}`}>
          {post.coverImage?<Image src={post.coverImage} alt="" width={1600} height={900} sizes={index===0?"(max-width: 1023px) 100vw, 50vw":"(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"} className={`aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02] ${index === 0 ? "lg:h-full" : ""}`} />:null}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3 mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]"><span className="text-[var(--accent)]">{post.category}</span><span>{post.publishedAt}</span><span>{estimateReadingTime(post.content)} min read</span></div>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] group-hover:text-[var(--accent)]">{post.title}</h2>
            <p className="mt-4 leading-7 text-[var(--copy)]">{post.excerpt}</p><span className="text-link mt-5 inline-flex">Read note →</span>
          </div>
        </Link>
      </article>)}
    </section>
    {newsletter.enabled ? <aside className="surface mt-8 grid p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-10"><div><p className="eyebrow">Subscribe</p><h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">{newsletter.heading}</h2><p className="mt-4 leading-7 text-[var(--copy)]">{newsletter.description}</p></div><NewsletterForm /></aside> : null}
  </main><Footer /></>;
}

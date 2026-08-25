import Link from "next/link";
import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import { NewsletterForm } from "@/components/newsletter-form";

export async function WritingSection() {
  const { blog, newsletter } = await getContent();
  const posts = blog.filter(p => p.status === "Published").sort((a,b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0,3);
  if (!posts.length) return null;
  return (
    <section id="writing" className="section">
      <SectionHeading index="04" eyebrow="Writing" title="Engineering notes from systems I actually build." description="No generic tutorial wall: the blog is for architecture decisions, failure modes, evaluation, backend systems, and product lessons." />
      <div className="mt-9 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="surface p-6 sm:p-8">
          <div className="space-y-8">{posts.map(post => <article key={post.id} className="border-t border-white/10 pt-6"><p className="eyebrow">{post.category}</p><h3 className="mt-3 text-2xl font-medium tracking-[-.035em]"><a href={`/blog/${post.slug}`} className="hover:text-[var(--accent)]">{post.title}</a></h3><p className="mt-3 leading-7 text-[var(--copy)]">{post.excerpt}</p><div className="mt-5"><a className="text-link" href={`/blog/${post.slug}`}>Read note →</a></div></article>)}</div>
          <Link className="text-link mt-8 inline-flex" href="/blog">View all writing →</Link>
        </div>
        {newsletter.enabled ? <aside className="surface p-6 sm:p-8"><p className="eyebrow">Email notes</p><h3 className="mt-4 text-3xl font-medium tracking-[-.04em]">{newsletter.heading}</h3><p className="mt-4 leading-7 text-[var(--copy)]">{newsletter.description}</p><NewsletterForm /><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Double opt-in when email delivery is configured. No advertising profiles or tracking pixels.</p></aside> : null}
      </div>
    </section>
  );
}

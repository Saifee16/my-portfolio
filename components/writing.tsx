import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import { NewsletterForm } from "@/components/newsletter-form";

export async function WritingSection() {
  const { blog, newsletter } = await getContent();
  const posts = blog.filter(p => p.status === "Published").sort((a,b) => Number(b.featured) - Number(a.featured) || (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0,3);
  if (!posts.length) return null;
  return (
    <section id="writing" className="section">
      <SectionHeading index="04" eyebrow="Writing" title="Engineering notes from systems I actually build." description="No generic tutorial wall: the blog is for architecture decisions, failure modes, evaluation, backend systems, and product lessons." />
      <div className="mt-9 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post, index) => <article key={post.id} className={`surface overflow-hidden ${index === 0 ? "sm:col-span-2" : ""}`}><Link href={`/blog/${post.slug}`} scroll className="group block">{post.coverImage ? <Image src={post.coverImage} alt="" width={1600} height={900} className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : null}<div className="p-6"><p className="eyebrow">{post.category}</p><h3 className={`mt-3 font-medium tracking-[-.04em] group-hover:text-[var(--accent)] ${index === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{post.title}</h3><p className="mt-3 leading-7 text-[var(--copy)]">{post.excerpt}</p><span className="text-link mt-5 inline-flex">Read note →</span></div></Link></article>)}
          <Link className="text-link mt-8 inline-flex" href="/blog">View all writing →</Link>
        </div>
        {newsletter.enabled ? <aside className="surface w-full max-w-3xl justify-self-center p-6 sm:p-8"><p className="eyebrow">Email notes</p><h3 className="mt-4 text-3xl font-medium tracking-[-.04em]">{newsletter.heading}</h3><p className="mt-4 leading-7 text-[var(--copy)]">{newsletter.description}</p><NewsletterForm /><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Double opt-in when email delivery is configured. No advertising profiles or tracking pixels.</p></aside> : null}
      </div>
    </section>
  );
}

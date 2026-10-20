import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import { NewsletterForm } from "@/components/newsletter-form";

export async function WritingSection() {
  const { blog, newsletter, research } = await getContent();
  const posts = blog.filter(p => p.status === "Published").sort((a,b) => Number(b.featured) - Number(a.featured) || (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0,3);
  if (!posts.length) return null;
  const index = research.length ? "05" : "04";
  return (
    <section id="writing" className="section">
      <SectionHeading index={index} eyebrow="Writing" title="Notes on AI research and engineering." description="Practical perspectives on neural networks, reasoning, scientific machine learning, and the systems around them." />
      <div className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post, index) => <article key={post.id} className={`surface overflow-hidden ${index === 0 ? "sm:col-span-2" : ""}`}><Link href={`/blog/${post.slug}`} scroll className={`group block ${index === 0 && post.coverImage ? "lg:grid lg:grid-cols-2 lg:items-center" : ""}`}>{post.coverImage ? <Image src={post.coverImage} alt="" width={1600} height={900} sizes={index === 0 ? "(max-width: 1023px) 100vw, 50vw" : "(max-width: 639px) 100vw, 50vw"} className={`aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02] ${index === 0 ? "lg:h-full" : ""}`} /> : null}<div className="p-6"><p className="eyebrow">{post.category}</p><h3 className={`mt-3 font-medium tracking-[-.04em] group-hover:text-[var(--accent)] ${index === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{post.title}</h3><p className="mt-3 leading-7 text-[var(--copy)]">{post.excerpt}</p><span className="text-link mt-5 inline-flex">Read note →</span></div></Link></article>)}
        </div>
        <Link className="text-link inline-flex" href="/blog">View all writing →</Link>
        {newsletter.enabled ? <aside className="surface grid p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-10"><div><p className="eyebrow">Email notes</p><h3 className="mt-4 text-3xl font-medium tracking-[-.04em]">{newsletter.heading}</h3><p className="mt-4 leading-7 text-[var(--copy)]">{newsletter.description}</p></div><div><NewsletterForm /><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Double opt-in when email delivery is configured. No advertising profiles or tracking pixels.</p></div></aside> : null}
      </div>
    </section>
  );
}

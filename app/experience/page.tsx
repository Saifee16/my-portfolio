import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/cms";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Experience", description: "Professional experience and engineering work by Saifullah Suleman.", alternates: { canonical: "/experience" } };

export default async function ExperiencePage() {
  const { experience } = await getContent();
  return <><Navbar /><main className="section"><Link className="text-link" href="/#experience">← Back to home</Link><div className="mt-10 border-t border-white/10 pt-6"><p className="eyebrow">Experience / timeline</p><h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">Applied AI, backend systems, and product work in context.</h1></div><div className="mt-14">{experience.length ? experience.map((item, index) => <article className="timeline-item" key={`${item.title}-${index}`}><div className="mono text-[11px] uppercase tracking-[.13em] text-[var(--muted)]">{item.period}</div><div><h2 className="text-3xl font-medium tracking-[-.04em]">{item.title}</h2><p className="mt-2 text-[var(--accent)]">{item.organization}</p><p className="mt-5 max-w-3xl leading-8 text-[var(--copy)]">{item.description}</p>{item.highlights.length ? <ul className="mt-5 grid max-w-4xl gap-2 pl-5 text-sm leading-7 text-[var(--copy)] sm:grid-cols-2">{item.highlights.map(highlight => <li className="list-disc" key={highlight}>{highlight}</li>)}</ul> : null}{item.links.length ? <div className="mt-5 flex flex-wrap gap-5">{item.links.map(link => <a className="text-link" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label} ↗</a>)}</div> : null}</div></article>) : <div className="surface p-8"><p className="eyebrow">No public experience yet</p><p className="mt-4 text-lg leading-8 text-[var(--copy)]">Experience entries will appear here once they are added in the CMS.</p></div>}</div></main><Footer /></>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/cms";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Now", description: "What Saifullah Suleman is researching, building, and learning now.", alternates: { canonical: "/now" } };

export default async function NowPage() {
  const { now, profile, activity } = await getContent();
  const entries = now.filter(item => item.visible).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <><Navbar /><main className="section"><Link className="text-link" href="/#about">← Back to home</Link><div className="mt-10 border-t border-white/10 pt-6"><p className="eyebrow">Now / current focus</p><h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">What I&apos;m researching, building, and learning.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--copy)]">{profile.availability}</p></div><div className="mt-14 grid gap-5 lg:grid-cols-2">{entries.length ? entries.map(item => <article className="surface p-6 sm:p-8" key={item.id}><p className="mono text-[10px] uppercase tracking-[.13em] text-[var(--muted)]">Updated {item.updatedAt}</p><h2 className="mt-5 text-3xl font-medium tracking-[-.04em]">{item.title}</h2><p className="mt-4 leading-8 text-[var(--copy)]">{item.summary}</p>{item.links.length ? <div className="mt-6 flex flex-wrap gap-5">{item.links.map(link => <a className="text-link" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label} ↗</a>)}</div> : null}</article>) : <div className="surface p-8 lg:col-span-2"><p className="eyebrow">No public updates yet</p><p className="mt-4 max-w-xl text-lg leading-8 text-[var(--copy)]">This page stays quiet until there is a verified current project, research thread, or learning update to share.</p></div>}</div>{activity.enabled && activity.githubUrl ? <div className="mt-12 border-t border-white/10 pt-6"><p className="eyebrow">Open activity</p><a className="text-link mt-4 inline-flex" href={activity.githubUrl} target="_blank" rel="noopener noreferrer">View GitHub activity ↗</a></div> : null}</main><Footer /></>;
}

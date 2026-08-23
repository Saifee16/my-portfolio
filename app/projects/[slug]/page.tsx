import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getContent();
  const project = projects.find(p => p.slug === slug && p.visibility !== "Draft");
  return project ? { title: project.title, description: project.subtitle } : { title: "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { projects } = await getContent();
  const project = projects.find(p => p.slug === slug && p.visibility !== "Draft");
  if (!project) notFound();
  return <><Navbar /><main className="section pt-16"><Link className="text-link" href="/#work">← Back to work</Link><div className="mt-10 grid gap-8 border-t border-white/10 pt-6 lg:grid-cols-[180px_1fr]"><div><p className="eyebrow">{String(project.rank).padStart(2,"0")} / {project.category}</p><p className="status mt-4">{project.status}</p></div><div><h1 className="max-w-5xl text-[clamp(3.2rem,7vw,7.5rem)] font-medium leading-[.9] tracking-[-.065em]">{project.title}</h1><p className="mt-7 max-w-3xl text-xl leading-8 text-[var(--copy)]">{project.subtitle}</p><div className="mt-7 flex flex-wrap gap-2">{project.stack.map(item => <span className="chip" key={item}>{item}</span>)}</div><div className="mt-8 flex flex-wrap gap-5">{project.repoUrl ? <a className="text-link" href={project.repoUrl} target="_blank" rel="noreferrer">Repository ↗</a> : <span className="mono text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">{project.repoVisibility}</span>}{project.liveUrl ? <a className="text-link" href={project.liveUrl} target="_blank" rel="noreferrer">Live product ↗</a> : null}</div></div></div>
      <div className="mt-16 grid gap-5 lg:grid-cols-2"><section className="case-panel"><p className="eyebrow">Case study</p><h2 className="mt-4">What this project demonstrates</h2><p className="mt-4">{project.caseStudy}</p></section><section className="case-panel"><p className="eyebrow">Architecture</p><div className="architecture mt-4">{project.architecture}</div></section></div>
      <section className="case-panel mt-5"><p className="eyebrow">Engineering highlights</p><ul className="mt-5 grid gap-3 lg:grid-cols-2">{project.highlights.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="case-panel mt-5"><p className="eyebrow">Boundaries / limitations</p><p className="mt-4">{project.limitations}</p></section>
    </main><Footer /></>;
}

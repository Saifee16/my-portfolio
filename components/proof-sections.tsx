import Link from "next/link";
import { getContent } from "@/lib/cms";

export async function ProofStrip() {
  const { profile, cv, impact } = await getContent();
  const metrics = impact.filter(item => item.visible && item.value.trim()).slice(0, 4);
  if (!metrics.length && !profile.availability && !cv.activeFileUrl) return null;
  return <section className="section pt-0" aria-label="Credibility summary">
    <div className="surface grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
      <div><p className="eyebrow">Available for focused work</p><p className="mt-3 max-w-2xl text-lg leading-7 text-[var(--copy)]">{profile.availability}</p></div>
      <div className="flex flex-wrap gap-x-7 gap-y-4 sm:justify-end">{metrics.map(metric => <div key={metric.id}><p className="text-2xl font-medium tracking-[-.04em]">{metric.value}</p><p className="mono mt-1 text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">{metric.label}</p></div>)}{cv.activeFileUrl ? <Link href="/resume" className="text-link self-center">Résumé ↓</Link> : null}</div>
    </div>
  </section>;
}

export async function ResearchSection() {
  const { research } = await getContent();
  const items = research.filter(item => item.title.trim()).sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.year || 0) - Number(a.year || 0)).slice(0, 3);
  if (!items.length) return null;
  return <section id="research" className="section"><div className="section-rule pt-6"><p className="eyebrow">04 / Research</p><div className="mt-6 flex flex-wrap items-end justify-between gap-5"><h2 className="section-title">Research work with a clear publication path.</h2><Link className="text-link" href="/research">All research →</Link></div><p className="section-copy mt-7">Work in progress is labeled honestly; published material links to the paper, preprint, or DOI.</p></div><div className="mt-9 grid gap-4 lg:grid-cols-3">{items.map(item => <article className="surface p-6" key={`${item.title}-${item.year}`}><div className="flex items-start justify-between gap-4"><p className="eyebrow">{item.status}</p>{item.year ? <span className="mono text-[10px] text-[var(--muted)]">{item.year}</span> : null}</div><h3 className="mt-6 text-2xl font-medium leading-tight tracking-[-.035em]">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[var(--copy)]">{item.description}</p><div className="mt-6 flex flex-wrap gap-4">{item.publicationUrl ? <a className="text-link" href={item.publicationUrl} target="_blank" rel="noopener noreferrer">Publication ↗</a> : null}{item.pdfUrl ? <a className="text-link" href={item.pdfUrl} target="_blank" rel="noopener noreferrer">Paper PDF ↗</a> : null}</div></article>)}</div></section>;
}

export async function VerifiedProofSections() {
  const { skills, community, testimonials } = await getContent();
  const visibleSkills = skills.filter(group => group.visible && group.skills.length);
  const visibleCommunity = community.filter(item => item.visible && item.title.trim());
  const visibleTestimonials = testimonials.filter(item => item.visible && item.quote.trim());
  if (!visibleSkills.length && !visibleCommunity.length && !visibleTestimonials.length) return null;
  return <section className="section pb-20"><div className="section-rule pt-6"><p className="eyebrow">Verified proof</p><h2 className="section-title mt-6">The signals behind the work.</h2></div><div className="mt-9 grid gap-5 lg:grid-cols-2">{visibleSkills.length ? <div className="surface p-6 sm:p-8"><p className="eyebrow">Skills</p><div className="mt-6 space-y-6">{visibleSkills.map(group => <div key={group.id}><h3 className="text-xl font-medium">{group.category}</h3><div className="mt-3 flex flex-wrap gap-2">{group.skills.map(skill => <span className="chip" key={skill}>{skill}</span>)}</div></div>)}</div></div> : null}{visibleCommunity.length ? <div className="surface p-6 sm:p-8"><p className="eyebrow">Community & leadership</p><div className="mt-4 space-y-5">{visibleCommunity.map(item => <article className="border-t border-white/10 pt-4" key={item.id}><p className="mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">{item.period}</p><h3 className="mt-2 text-xl font-medium">{item.title}</h3><p className="mt-1 text-sm text-[var(--accent)]">{item.organization}</p><p className="mt-3 text-sm leading-7 text-[var(--copy)]">{item.description}</p>{item.url ? <a className="text-link mt-4 inline-flex" href={item.url} target="_blank" rel="noopener noreferrer">Details ↗</a> : null}</article>)}</div></div> : null}</div>{visibleTestimonials.length ? <div className="mt-5 grid gap-5 lg:grid-cols-2">{visibleTestimonials.map(item => <figure className="surface p-6 sm:p-8" key={item.id}><blockquote className="text-2xl leading-9 tracking-[-.025em]">“{item.quote}”</blockquote><figcaption className="mt-6 text-sm text-[var(--muted)]">{item.author} · {item.role}{item.organization ? `, ${item.organization}` : ""}{item.profileUrl ? <a className="text-link ml-4" href={item.profileUrl} target="_blank" rel="noopener noreferrer">Profile ↗</a> : null}</figcaption></figure>)}</div> : null}</section>;
}

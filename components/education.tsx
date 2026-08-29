import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import { formatEducationPeriod } from "@/lib/content-utils";
import Link from "next/link";

export async function EducationSection() {
  const { education, certifications, research } = await getContent();
  const featured = certifications.filter(c => c.featured).slice(0, 6);
  return (
    <section id="education" className="section">
      <SectionHeading index="03" eyebrow="Education & research" title="From telecommunications and computer vision toward applied AI systems." />
      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {education.map((item, idx) => (
          <article className="surface p-6 sm:p-8" key={`${item.degree}-${idx}`}>
            <div className="mono text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">{formatEducationPeriod(item)}</div>
            <h3 className="mt-8 text-3xl font-medium tracking-[-.045em]">{item.degree}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--accent)]">{item.institution}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{item.location}</p>
            <p className="mt-5 leading-7 text-[var(--copy)]">{item.description.split(" Before the program begins")[0]}</p>
          </article>
        ))}
      </div>
      <div className={`mt-5 grid gap-5 ${featured.length ? "lg:grid-cols-[1.2fr_.8fr]" : ""}`}>
        <div className={`surface p-6 sm:p-8 ${featured.length ? "" : "lg:col-span-2"}`}>
          <div className="eyebrow">Research</div>
          {research.map((item, idx) => { const detailsPending = /pending|to be added/i.test(`${item.status} ${item.authors} ${item.venue}`); return <div className="mt-7" key={`${item.title}-${idx}`}><h3 className="text-xl font-medium leading-7">{item.title}</h3><p className="mt-2 mono text-[10px] uppercase tracking-[.12em] text-[var(--accent)]">{item.status}</p>{detailsPending ? null : <><p className="mt-2 text-sm text-[var(--muted)]">{item.authors}{item.venue ? ` · ${item.venue}` : ""}{item.year ? ` · ${item.year}` : ""}</p><p className="mt-4 leading-7 text-[var(--copy)]">{item.description}</p><div className="mt-5 flex flex-wrap gap-5">{item.url ? <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer">Publication ↗</a> : null}{item.doi ? <a className="text-link" href={`https://doi.org/${encodeURIComponent(item.doi)}`} target="_blank" rel="noopener noreferrer">DOI ↗</a> : null}</div></>}</div>; })}
        </div>
        {featured.length ? <div className="surface p-6 sm:p-8"><div className="eyebrow">Featured certifications</div><div className="mt-6 space-y-4">{featured.map(cert => <div key={cert.id} className="border-t border-white/10 pt-4"><p className="font-medium">{cert.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{cert.issuer} · {cert.issueDate}</p></div>)}</div><Link className="text-link mt-7 inline-flex" href="/certifications">View all certifications →</Link></div> : null}
      </div>
    </section>
  );
}

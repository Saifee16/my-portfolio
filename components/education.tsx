import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import { formatEducationPeriod } from "@/lib/content-utils";

export async function EducationSection() {
  const { education, certifications } = await getContent();
  const featured = certifications.filter(c => c.featured).slice(0, 6);
  return (
    <section id="education" className="section">
      <SectionHeading index="03" eyebrow="Education" title="From telecommunications and computer vision toward applied AI systems." />
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
      {featured.length ? <div className="mt-5 surface p-6 sm:p-8"><div className="eyebrow">Featured certifications</div><div className="mt-6 grid gap-4 sm:grid-cols-2">{featured.map(cert => <div key={cert.id} className="border-t border-white/10 pt-4"><p className="font-medium">{cert.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{cert.issuer} · {cert.issueDate}</p></div>)}</div><a className="text-link mt-7 inline-flex" href="/certifications">View all certifications →</a></div> : null}
    </section>
  );
}

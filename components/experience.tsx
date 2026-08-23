import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";

export async function ExperienceSection() {
  const { experience } = await getContent();
  return (
    <section id="experience" className="section">
      <SectionHeading index="02" eyebrow="Experience & leadership" title="Engineering across client work, products, and teams." />
      <div className="mt-14">
        {experience.map((item, idx) => (
          <article className="timeline-item" key={`${item.title}-${idx}`}>
            <div className="mono text-[11px] uppercase tracking-[.13em] text-[var(--muted)]">{item.period}</div>
            <div>
              <h3 className="text-2xl font-medium tracking-[-.035em]">{item.title}</h3>
              <p className="mt-1 text-sm text-[var(--accent)]">{item.organization}</p>
              <p className="mt-4 max-w-3xl leading-7 text-[var(--copy)]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

export async function ExperienceSection() {
  const { experience } = await getContent();
  const professionalExperience = experience.filter(item => !/TE Links/i.test(item.organization));
  const leadershipExperience = experience.filter(item => /TE Links/i.test(item.organization));
  const groups = [
    { title: "Professional experience", items: professionalExperience },
    { title: "Leadership & community", items: leadershipExperience }
  ];
  return (
    <section id="experience" className="section">
      <SectionHeading index="02" eyebrow="Experience" title="Experience across client work and teams." />
      <div className="mt-10 space-y-12">
        {groups.map(group => group.items.length ? (
          <div key={group.title}>
            <h3 className="text-xl font-medium tracking-[-.03em]">{group.title}</h3>
            <div className="mt-4">
              {group.items.map((item, idx) => (
                <article className="timeline-item" key={`${item.title}-${idx}`}>
                  <div className="mono text-[11px] uppercase tracking-[.13em] text-[var(--muted)]">{item.period}</div>
                  <div>
                    <h4 className="text-2xl font-medium tracking-[-.035em]">{item.title}</h4>
                    <p className="mt-1 text-sm text-[var(--accent)]">{item.organization}</p>
                    <p className="mt-4 max-w-3xl leading-7 text-[var(--copy)]">{item.description}</p>
                    {item.highlights.length ? <ul className="mt-4 grid max-w-3xl gap-2 pl-5 text-sm leading-7 text-[var(--copy)] sm:grid-cols-2">{item.highlights.slice(0, 4).map(highlight => <li className="list-disc" key={highlight}>{highlight}</li>)}</ul> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null)}
      </div>
      <Link className="text-link mt-8 inline-flex" href="/experience">View full experience →</Link>
    </section>
  );
}

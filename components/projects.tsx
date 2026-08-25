import { getContent } from "@/lib/cms";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

export async function Projects() {
  const { projects } = await getContent();
  const visible = projects.filter(p => p.visibility === "Public").sort((a,b) => a.rank-b.rank);
  const flagship = visible.filter(p => p.featured);
  const rest = visible.filter(p => !p.featured);
  const primaryFlagship = flagship[0];
  const pairedFlagships = flagship.slice(1, 3);
  const compactFlagships = flagship.slice(3);
  return (
    <section id="work" className="section">
      <SectionHeading index="01" eyebrow="Selected engineering" title="Systems built around reliability, evidence, and real constraints." description="The first four projects form a deliberate engineering progression: backend foundations → evaluated ML → LLM infrastructure → secure retrieval systems. Product and research work follows with its maturity labeled clearly." />
      <div className="mt-10 space-y-4">
        {primaryFlagship ? <ProjectCard project={primaryFlagship} featured key={primaryFlagship.slug} /> : null}
        {pairedFlagships.length ? <div className="grid gap-4 lg:grid-cols-2">{pairedFlagships.map(p => <ProjectCard project={p} featured paired key={p.slug} />)}</div> : null}
        {compactFlagships.map(p => <ProjectCard project={p} key={p.slug} />)}
      </div>
      <div className="mt-16 flex items-end justify-between gap-6 border-b border-white/10 pb-5"><h3 className="text-3xl font-medium tracking-[-.04em] sm:text-4xl">Production, product & research</h3><span className="mono hidden text-[10px] uppercase tracking-[.14em] text-[var(--muted)] sm:block">Maturity shown explicitly</span></div>
      <div className="grid gap-5 pt-5 lg:grid-cols-2">{rest.map(p => <ProjectCard project={p} key={p.slug} />)}</div>
    </section>
  );
}

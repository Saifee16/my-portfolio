import type { Project } from "@/lib/types";
import { isSafeExternalUrl } from "@/lib/content-utils";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const repositoryIsPublic = Boolean(project.repoUrl && !/private/i.test(project.repoVisibility) && isSafeExternalUrl(project.repoUrl));
  const liveUrlIsSafe = Boolean(project.liveUrl && isSafeExternalUrl(project.liveUrl));
  const statusTone = /shipped|production/i.test(project.status) ? "status-live" : /private alpha/i.test(project.status) ? "status-alpha" : /private development/i.test(project.status) ? "status-development" : /research/i.test(project.status) ? "status-research" : "";
  return (
    <article className={`project-card ${featured ? "featured" : ""}`}>
      <div className="flex items-start justify-between gap-4 mono text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">
        <span>{String(project.rank).padStart(2, "0")} / {project.category}</span>
        <span className={`status ${statusTone}`}>{project.status}</span>
      </div>
      <div className={featured ? "mt-12 lg:mt-16" : "mt-10"}>
        <h3 className={featured ? "max-w-4xl text-4xl font-medium tracking-[-.05em] sm:text-6xl lg:text-7xl" : "text-3xl font-medium tracking-[-.045em] sm:text-4xl"}>{project.title}</h3>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--copy)]">{project.subtitle}</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">{project.stack.slice(0, featured ? 8 : 5).map(item => <span className="chip" key={item}>{item}</span>)}</div>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-5">
        <a href={`/projects/${project.slug}`} className="text-link">Case study →</a>
        {repositoryIsPublic ? <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-link">Repository ↗</a> : <span className="mono text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">{project.repoVisibility}</span>}
        {liveUrlIsSafe ? <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-link">Live ↗</a> : null}
      </div>
    </article>
  );
}

import { getContent } from "@/lib/cms";

export async function Hero() {
  const { profile, cv } = await getContent();
  return (
    <section id="top" className="relative min-h-[78vh] overflow-hidden">
      <div className="shell flex min-h-[78vh] flex-col justify-between py-10 sm:py-14 lg:py-16">
        <p className="mono max-w-3xl text-[11px] uppercase leading-5 tracking-[.2em] text-[var(--muted)] sm:text-xs">{profile.eyebrow}</p>
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="mb-6 flex min-w-0 items-center gap-3"><span className="h-12 w-[2px] bg-[var(--accent)]" aria-hidden="true" /><p className="eyebrow min-w-0 break-words">{profile.title}</p></div>
          <h1 className="max-w-[1220px] text-balance text-[clamp(3.4rem,8.1vw,8.7rem)] font-medium leading-[.89] tracking-[-.067em] text-white">{profile.hero}</h1>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <p className="max-w-2xl text-pretty text-lg leading-8 text-[var(--copy)] sm:text-xl">{profile.summary}</p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="#work" className="button button-primary">View engineering work ↓</a>
              {cv.activeFileUrl ? <a href="/resume" download className="button button-secondary">Download résumé ↓</a> : <a href={profile.github} target="_blank" rel="noopener noreferrer" className="button button-secondary">GitHub ↗</a>}
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-white/10 pt-5 mono text-[11px] uppercase tracking-[.15em] text-[var(--muted)] sm:grid-cols-3 sm:text-xs">
          <span>RAG / LLM infrastructure / ML APIs</span>
          <span>Backend systems / full-stack products</span>
          <span className="sm:text-right">Research / computer vision / product execution</span>
        </div>
      </div>
    </section>
  );
}

import { getContent } from "@/lib/cms";

export async function Hero() {
  const { profile, cv } = await getContent();
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="shell py-14 sm:py-16 lg:py-20">
        <div>
          <div className="mb-6 flex min-w-0 items-center gap-3"><span className="h-12 w-[2px] bg-[var(--accent)]" aria-hidden="true" /><p className="eyebrow min-w-0 break-words">{profile.title}</p></div>
          <h1 className="max-w-[1320px] text-balance text-[clamp(3.4rem,7.2vw,7.4rem)] font-medium leading-[.91] tracking-[-.062em] text-white">{profile.hero}</h1>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <p className="max-w-2xl text-pretty text-lg leading-8 text-[var(--copy)] sm:text-xl">{profile.summary}</p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="#work" className="button button-primary">View engineering work ↓</a>
              {cv.activeFileUrl ? <a href="/resume" download className="button button-secondary">Download résumé ↓</a> : <a href={profile.github} target="_blank" rel="noopener noreferrer" className="button button-secondary">GitHub ↗</a>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

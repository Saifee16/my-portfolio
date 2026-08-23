import Link from "next/link";
import { getContent } from "@/lib/cms";

const nav = [
  ["Work", "#work"],
  ["Experience", "#experience"],
  ["Education", "#education"],
  ["Writing", "#writing"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;

export async function Navbar() {
  const content = await getContent();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(8,8,10,.86)] backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/#top" className="mono text-xs font-semibold uppercase tracking-[.18em] text-white">Saifullah<span className="text-[var(--accent)]">.</span></Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={href} href={`/${href}`} className="nav-link">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-4">
          {content.cv.activeFileUrl ? <a className="nav-link text-white" href={content.cv.activeFileUrl} download>Résumé ↓</a> : null}
          <a className="nav-link text-white" href={content.profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </header>
  );
}

import { getContent } from "@/lib/cms";
export async function Footer() { const { profile } = await getContent(); return <footer className="border-t border-white/10"><div className="shell py-6 mono text-[10px] tracking-[.12em] text-[var(--muted)]"><span>© {new Date().getFullYear()} {profile.name}</span></div></footer>; }

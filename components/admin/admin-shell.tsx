import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";

const links = [
  ["Dashboard", "/admin"], ["Profile", "/admin/profile"], ["Projects", "/admin/projects"], ["Experience", "/admin/experience"], ["Education", "/admin/education"], ["Research", "/admin/research"], ["Blog", "/admin/blog"], ["CV / Resume", "/admin/cv"], ["Newsletter", "/admin/newsletter"], ["Settings", "/admin/settings"],
] as const;

export async function AdminShell({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <div className="min-h-screen bg-[#08080a]"><header className="border-b border-white/10"><div className="shell flex h-16 items-center justify-between"><a href="/admin" className="mono text-xs uppercase tracking-[.16em]">Portfolio CMS<span className="text-[var(--accent)]">.</span></a><a className="nav-link" href="/" target="_blank">View site ↗</a></div></header><div className="shell grid gap-8 py-8 lg:grid-cols-[210px_1fr]"><aside className="admin-sidebar surface self-start p-2 lg:sticky lg:top-6">{links.map(([label,href])=><a href={href} key={href}>{label}</a>)}<div className="mt-2 border-t border-white/10 px-3 py-3"><LogoutButton /></div></aside><main className="min-w-0">{children}</main></div></div>;
}

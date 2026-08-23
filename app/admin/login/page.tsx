import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
export default async function AdminLogin() { if(await isAdmin()) redirect("/admin"); return <main className="section flex min-h-[70vh] items-center"><div className="mx-auto w-full max-w-md surface p-7 sm:p-9"><p className="eyebrow">Private portfolio CMS</p><h1 className="mt-4 text-4xl font-medium tracking-[-.045em]">Admin sign in</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">No public registration. Credentials are read from server environment variables.</p><LoginForm /></div></main>; }

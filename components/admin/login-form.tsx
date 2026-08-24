"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const res = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password}) }); if (res.ok) { router.push("/admin"); router.refresh(); } else { const body = await res.json().catch(() => ({})) as { error?: string }; setError(res.status === 503 ? "Admin credentials are not configured on the server." : (body.error ?? "Invalid credentials.")); } } catch { setError("Could not reach the server. Try again."); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="form-label">Admin password<input className="form-input" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error ? <p className="text-sm text-red-300" aria-live="polite">{error}</p> : null}<button className="button button-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>;
}

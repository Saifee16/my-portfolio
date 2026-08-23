"use client";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website }) });
      const data = await res.json() as { message?: string };
      setMessage(data.message ?? (res.ok ? "Check your inbox to confirm." : "Could not subscribe."));
      if (res.ok) setEmail("");
    } catch { setMessage("Could not subscribe right now."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-6"><div className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" className="form-input flex-1" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} /><button className="button button-primary" disabled={busy}>{busy ? "Subscribing…" : "Subscribe"}</button></div><label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)} /></label>{message ? <p className="mt-3 text-sm text-[var(--muted)]" aria-live="polite">{message}</p> : null}</form>;
}

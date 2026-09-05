"use client";

import { useMemo, useState } from "react";
import type { Certification } from "@/lib/types";

export function CertificationList({ certifications }: { certifications: Certification[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(certifications.map(item => item.category || "Other")))], [certifications]);
  const [active, setActive] = useState("All");
  const visible = active === "All" ? certifications : certifications.filter(item => (item.category || "Other") === active);
  return <div className="mt-14"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Certification categories">{categories.map(category => <button className={`button ${active === category ? "button-primary" : "button-secondary"}`} type="button" role="tab" aria-selected={active === category} onClick={() => setActive(category)} key={category}>{category}</button>)}</div><div className="mt-8 grid gap-4 lg:grid-cols-2">{visible.map(cert => <article className="surface p-6" key={cert.id}><p className="eyebrow">{cert.category || "Other"}</p><h2 className="mt-4 text-2xl font-medium tracking-[-.035em]">{cert.name}</h2><p className="mt-2 text-[var(--accent)]">{cert.issuer}</p><p className="mt-3 text-sm text-[var(--muted)]">{cert.issueDate}{cert.credentialId ? ` · ${cert.credentialId}` : ""}</p><div className="mt-5 flex flex-wrap gap-5">{cert.credentialUrl ? <a className="text-link" href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">Credential ↗</a> : null}{cert.assetUrl ? <a className="text-link" href={cert.assetUrl} target="_blank" rel="noopener noreferrer">Certificate file ↗</a> : null}</div></article>)}</div></div>;
}

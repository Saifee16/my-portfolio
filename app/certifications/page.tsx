import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Certifications", description: "Selected certifications and professional credentials for Saifullah Suleman." };

export default async function CertificationsPage() {
  const { certifications } = await getContent();
  if (!certifications.length) notFound();
  const groups = certifications.reduce<Record<string, typeof certifications>>((result, certification) => {
    const key = certification.category || "Other";
    (result[key] ??= []).push(certification);
    return result;
  }, {});
  return <><Navbar /><main className="section pt-16"><Link className="text-link" href="/#education">← Back to education</Link><div className="mt-10 border-t border-white/10 pt-6"><p className="eyebrow">Credentials</p><h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">Certifications, kept useful.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--copy)]">Selected professional credentials, grouped for quick review.</p></div><div className="mt-14 space-y-12">{Object.entries(groups).map(([category, items]) => <section key={category}><p className="eyebrow">{category}</p><div className="mt-4 grid gap-4 lg:grid-cols-2">{items.map(cert => <article className="surface p-6" key={cert.id}><h2 className="text-2xl font-medium tracking-[-.035em]">{cert.name}</h2><p className="mt-2 text-[var(--accent)]">{cert.issuer}</p><p className="mt-3 text-sm text-[var(--muted)]">{cert.issueDate}{cert.credentialId ? ` · ${cert.credentialId}` : ""}</p><div className="mt-5 flex flex-wrap gap-5">{cert.credentialUrl ? <a className="text-link" href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">Credential ↗</a> : null}{cert.assetUrl ? <a className="text-link" href={cert.assetUrl} target="_blank" rel="noopener noreferrer">Certificate file ↗</a> : null}</div></article>)}</div></section>)}</div></main><Footer /></>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CertificationList } from "@/components/certification-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Certifications", description: "Selected certifications and professional credentials for Saifullah Suleman." };

export default async function CertificationsPage() {
  const { certifications } = await getContent();
  if (!certifications.length) notFound();
  return <><Navbar /><main className="section pt-16"><Link className="text-link" href="/#education">← Back to education</Link><div className="mt-10 border-t border-white/10 pt-6"><p className="eyebrow">Credentials</p><h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">Certifications, kept useful.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--copy)]">Selected professional credentials, filterable for quick review.</p></div><CertificationList certifications={certifications} /></main><Footer /></>;
}

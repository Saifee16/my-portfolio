import type { Metadata } from "next";
import "./globals.css";
import { siteDefaults } from "@/lib/site";
import { jsonLd } from "@/lib/content-utils";
import { AnalyticsPing } from "@/components/analytics-ping";

export const metadata: Metadata = {
  metadataBase: new URL(siteDefaults.url),
  title: { default: "Saifullah Suleman — Applied AI & Full-Stack Engineer", template: "%s — Saifullah Suleman" },
  description: "Applied AI and full-stack engineering portfolio with a backend focus: RAG, LLM infrastructure, ML APIs, computer vision, commerce systems, and engineering writing.",
  keywords: ["Saifullah Suleman", "Applied AI Engineer", "Backend Engineer", "Full-Stack Developer", "FastAPI", "RAG", "LLM Infrastructure", "Machine Learning", "Computer Vision"],
  authors: [{ name: siteDefaults.name }],
  creator: siteDefaults.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "Saifullah Suleman — Applied AI & Full-Stack Engineer", description: "Applied AI, backend systems, full-stack engineering, and technical product work.", url: "/", siteName: siteDefaults.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Saifullah Suleman — Applied AI and Full-Stack Engineer" }] },
  twitter: { card: "summary_large_image", title: "Saifullah Suleman — Applied AI & Full-Stack Engineer", description: "Applied AI, backend systems, and full-stack engineering." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personSchema = { "@context": "https://schema.org", "@type": "Person", name: siteDefaults.name, url: siteDefaults.url, email: siteDefaults.email, jobTitle: "Applied AI & Full-Stack Engineer", sameAs: [siteDefaults.github, siteDefaults.linkedin] };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: siteDefaults.name, url: siteDefaults.url, description: "Applied AI and full-stack engineering portfolio with a backend focus." };
  return (
    <html lang="en">
      <body>
        <div className="site-grid" aria-hidden="true" />
        <div className="site-glow" aria-hidden="true" />
        <AnalyticsPing />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
        {children}
      </body>
    </html>
  );
}

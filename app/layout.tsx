import type { Metadata } from "next";
import "./globals.css";
import { siteDefaults } from "@/lib/site";
import { jsonLd } from "@/lib/content-utils";
import { AnalyticsPing } from "@/components/analytics-ping";

export const metadata: Metadata = {
  metadataBase: new URL(siteDefaults.url),
  title: { default: "Saifullah Suleman — Associate Business Analyst", template: "%s — Saifullah Suleman" },
  description: "Business analysis, solution design, systems integration, applied AI, and data analytics by Saifullah Suleman.",
  keywords: ["Saifullah Suleman", "Associate Business Analyst", "Solution Design", "Systems Integration", "Requirements Gathering", "Workflow Analysis", "Applied AI", "REST APIs", "Power BI", "Tableau", "FastAPI", "RAG"],
  authors: [{ name: siteDefaults.name }],
  creator: siteDefaults.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "Saifullah Suleman — Associate Business Analyst", description: "Business analysis, solution design, systems integration, and practical AI-enabled solutions.", url: "/", siteName: siteDefaults.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Saifullah Suleman — Associate Business Analyst, Solution Design & Systems Integration" }] },
  twitter: { card: "summary_large_image", title: "Saifullah Suleman — Associate Business Analyst", description: "Business analysis, solution design, systems integration, and applied AI." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personSchema = { "@context": "https://schema.org", "@type": "Person", name: siteDefaults.name, url: siteDefaults.url, email: siteDefaults.email, jobTitle: "AI Research Associate", description: "Business analysis, solution design, systems integration, applied AI, and data analytics.", sameAs: [siteDefaults.github, siteDefaults.linkedin] };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: siteDefaults.name, url: siteDefaults.url, description: "Business analysis, solution design, systems integration, and AI-enabled technology solutions." };
  return (
    <html lang="en" data-scroll-behavior="smooth">
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

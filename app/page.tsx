import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { ExperienceSection } from "@/components/experience";
import { EducationSection } from "@/components/education";
import { WritingSection } from "@/components/writing";
import { AboutSection } from "@/components/about";
import { ContactSection } from "@/components/contact";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return <><a className="skip-link" href="#main">Skip to content</a><Navbar /><main id="main"><Hero /><Projects /><ExperienceSection /><EducationSection /><WritingSection /><AboutSection /><ContactSection /></main><Footer /></>;
}

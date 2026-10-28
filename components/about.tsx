import Image from "next/image";
import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";

export async function AboutSection() {
  const { profile, blog, research } = await getContent();
  const index = String(4 + (research.length ? 1 : 0) + (blog.some(post => post.status === "Published") ? 1 : 0)).padStart(2, "0");
  return (
    <section id="about" className="section">
      <SectionHeading index={index} eyebrow="Profile" title="Business understanding. Practical solution design." />
      <div className={`${profile.photoUrl ? "grid gap-5 lg:grid-cols-[.7fr_1.3fr]" : ""}`}>
        {profile.photoUrl ? <div className="surface min-h-[22rem] overflow-hidden p-5"><Image src={profile.photoUrl} alt={`${profile.name} professional portrait`} width={900} height={1100} className="h-full min-h-[20rem] w-full object-cover grayscale" /></div> : null}
        <div className={`surface p-6 sm:p-10 ${profile.photoUrl ? "" : "max-w-5xl"}`}>
          <p className="text-xl leading-8 tracking-[-.025em] text-white sm:text-2xl sm:leading-9">{profile.about}</p>
          <div className="mt-10 border-l-2 border-[var(--accent)] pl-5"><p className="eyebrow">Availability</p><p className="mt-3 leading-7 text-[var(--copy)]">{profile.availability}</p></div>
          <div className="mt-10 grid gap-3 mono text-[10px] uppercase tracking-[.13em] text-[var(--muted)] sm:grid-cols-2"><span>Business analysis / stakeholder needs</span><span>Solution design / systems integration</span><span>Applied AI / data & analytics</span><span>Development / testing / delivery</span></div>
        </div>
      </div>
    </section>
  );
}

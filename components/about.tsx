import Image from "next/image";
import { getContent } from "@/lib/cms";
import { SectionHeading } from "@/components/section-heading";

export async function AboutSection() {
  const { profile } = await getContent();
  return (
    <section id="about" className="section">
      <SectionHeading index="05" eyebrow="Profile" title="Applied AI depth. Full-stack breadth. Backend discipline." />
      <div className="mt-14 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <div className="surface min-h-[22rem] overflow-hidden p-5">
          {profile.photoUrl ? <Image src={profile.photoUrl} alt={`${profile.name} professional portrait`} width={900} height={1100} className="h-full min-h-[20rem] w-full object-cover grayscale" /> : <div className="flex h-full min-h-[20rem] items-end bg-[linear-gradient(145deg,rgba(183,255,60,.09),rgba(255,255,255,.01))] p-6"><div><p className="eyebrow">Portrait optional</p><p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">Upload a professional portrait from the admin panel when you have one strong enough to improve the page.</p></div></div>}
        </div>
        <div className="surface p-6 sm:p-10">
          <p className="text-2xl leading-10 tracking-[-.025em] text-white sm:text-3xl">{profile.about}</p>
          <div className="mt-10 border-l-2 border-[var(--accent)] pl-5"><p className="eyebrow">Availability</p><p className="mt-3 leading-7 text-[var(--copy)]">{profile.availability}</p></div>
          <div className="mt-10 grid gap-3 mono text-[10px] uppercase tracking-[.13em] text-[var(--muted)] sm:grid-cols-2"><span>Applied AI / RAG / LLM systems</span><span>FastAPI / APIs / data systems</span><span>Full-stack product engineering</span><span>Testing / security / deployment</span></div>
        </div>
      </div>
    </section>
  );
}

import { getContent } from "@/lib/cms";

export async function ContactSection() {
  const { profile, settings } = await getContent();
  return (
    <section id="contact" className="section pb-20">
      <div className="border-t border-white/10 pt-6"><p className="eyebrow">06 / Contact</p><h2 className="mt-10 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[.92] tracking-[-.06em]">Have a hard systems problem or a product worth shipping?</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--copy)]">For engineering opportunities, collaboration, research, or product work, send the problem and context.</p><div className="mt-9 flex flex-wrap gap-3"><a className="button button-primary" href={`mailto:${profile.email}`}>Email me ↗</a><a className="button button-secondary" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="button button-secondary" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a className="button button-secondary" href={profile.whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a></div>{settings.phoneVisible ? <p className="mt-6 mono text-xs text-[var(--muted)]">+92 348 3034922</p> : null}</div>
    </section>
  );
}

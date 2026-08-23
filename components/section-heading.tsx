export function SectionHeading({ index, eyebrow, title, description }: { index: string; eyebrow: string; title: string; description?: string }) {
  return (
    <div className="grid gap-8 border-t border-white/10 pt-6 lg:grid-cols-[180px_1fr]">
      <div className="mono text-[11px] uppercase tracking-[.16em] text-[var(--muted)]">{index} / {eyebrow}</div>
      <div>
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-copy mt-7">{description}</p> : null}
      </div>
    </div>
  );
}

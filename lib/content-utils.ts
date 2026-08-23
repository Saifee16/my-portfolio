import type { Education } from "@/lib/types";

export function formatEducationPeriod(item: Education, now = new Date()) {
  if (!item.startDate) return item.period;
  const start = new Date(`${item.startDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return item.period;
  const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(start);
  return now.getTime() >= start.getTime() ? `${label} – Present` : `Starting ${label}`;
}

export function estimateReadingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

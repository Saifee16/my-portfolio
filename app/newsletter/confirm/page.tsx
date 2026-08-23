import Link from "next/link";
import { getSubscribers, saveSubscribers } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams; const subscribers = await getSubscribers(); const index = token ? subscribers.findIndex(s=>s.token===token) : -1; let ok = false;
  if (index >= 0) { subscribers[index] = { ...subscribers[index], status: "active", confirmedAt: new Date().toISOString() }; await saveSubscribers(subscribers); ok = true; }
  return <main className="section"><div className="mx-auto max-w-xl surface p-8 text-center"><p className="eyebrow">Newsletter</p><h1 className="mt-5 text-4xl font-medium tracking-[-.045em]">{ok ? "Subscription confirmed." : "Confirmation link is invalid."}</h1><p className="mt-4 leading-7 text-[var(--copy)]">{ok ? "You’ll receive new engineering notes when Saifullah explicitly chooses to notify subscribers." : "The token may be missing, expired, or already removed."}</p><Link className="button button-primary mt-7" href="/">Return home</Link></div></main>;
}

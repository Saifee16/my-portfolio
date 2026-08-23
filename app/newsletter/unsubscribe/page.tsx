import Link from "next/link";
import { getSubscribers, saveSubscribers } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const subscribers = await getSubscribers();
  const index = token ? subscribers.findIndex(s => s.token === token) : -1;
  let ok = false;
  if (index >= 0) {
    subscribers[index] = { ...subscribers[index], status: "unsubscribed" };
    await saveSubscribers(subscribers);
    ok = true;
  }
  return <main className="section"><div className="mx-auto max-w-xl surface p-8 text-center"><p className="eyebrow">Newsletter</p><h1 className="mt-5 text-4xl font-medium tracking-[-.045em]">{ok ? "You’re unsubscribed." : "Unsubscribe link is invalid."}</h1><p className="mt-4 leading-7 text-[var(--copy)]">{ok ? "No further engineering-note notifications will be sent to this address." : "The token may be missing or no longer recognized."}</p><Link className="button button-primary mt-7" href="/">Return home</Link></div></main>;
}

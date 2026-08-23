import Link from "next/link";
import { getSubscribers } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; result?: string }> }) {
  const { token, result } = await searchParams;
  const subscribers = await getSubscribers();
  const candidate = token ? subscribers.find(subscriber => subscriber.token === token) : undefined;
  const completed = result === "success";
  const canUnsubscribe = Boolean(!completed && token && candidate && candidate.status !== "unsubscribed");
  return <main className="section"><div className="mx-auto max-w-xl surface p-8 text-center"><p className="eyebrow">Newsletter</p><h1 className="mt-5 text-4xl font-medium tracking-[-.045em]">{completed ? "You’re unsubscribed." : canUnsubscribe ? "Leave the newsletter?" : "Unsubscribe link is invalid."}</h1><p className="mt-4 leading-7 text-[var(--copy)]">{completed ? "No further engineering-note notifications will be sent to this address." : canUnsubscribe ? "Use the button below to stop future engineering-note notifications. Opening the link alone does not change your subscription." : "The token may be missing or no longer recognized."}</p>{canUnsubscribe ? <form className="mt-7" action="/api/newsletter/unsubscribe" method="post"><input type="hidden" name="token" value={token} /><button className="button button-primary" type="submit">Unsubscribe</button></form> : null}<Link className="button button-secondary mt-7" href="/">Return home</Link></div></main>;
}

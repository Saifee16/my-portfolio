import Link from "next/link";
import { getSubscribers } from "@/lib/cms";
import { isConfirmationTokenActive } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string; result?: string }> }) {
  const { token, result } = await searchParams;
  const subscribers = await getSubscribers();
  const candidate = token ? subscribers.find(subscriber => subscriber.token === token) : undefined;
  const alreadyConfirmed = result === "confirmed" || candidate?.status === "active";
  const canConfirm = Boolean(token && candidate?.status === "pending" && isConfirmationTokenActive(candidate));
  return <main className="section"><div className="mx-auto max-w-xl surface p-8 text-center"><p className="eyebrow">Newsletter</p><h1 className="mt-5 text-4xl font-medium tracking-[-.045em]">{alreadyConfirmed ? "Subscription confirmed." : canConfirm ? "Confirm your subscription." : "Confirmation link is invalid."}</h1><p className="mt-4 leading-7 text-[var(--copy)]">{alreadyConfirmed ? "You’ll receive new engineering notes when Saifullah explicitly chooses to notify subscribers." : canConfirm ? "Use the button below to confirm this address. Opening the link alone does not change your subscription." : "The token may be missing, expired, or already removed."}</p>{canConfirm ? <form className="mt-7" action="/api/newsletter/confirm" method="post"><input type="hidden" name="token" value={token} /><button className="button button-primary" type="submit">Confirm subscription</button></form> : null}<Link className="button button-secondary mt-7" href="/">Return home</Link></div></main>;
}

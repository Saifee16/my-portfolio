import type { Subscriber } from "@/lib/types";

export function isConfirmationTokenActive(subscriber: Subscriber | undefined, now = Date.now()) {
  return Boolean(subscriber && (subscriber.status === "active" || (subscriber.status === "pending" && (!subscriber.expiresAt || new Date(subscriber.expiresAt).getTime() > now))));
}

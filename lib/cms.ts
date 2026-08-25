import path from "node:path";
import { isAssetUrl } from "./asset-url.ts";
import { getStorage, parseStoredJson, type StorageAdapter } from "./storage.ts";
import { normalizePortfolioContent } from "./content-validation.ts";
import type { AnalyticsEvent, PortfolioContent, Subscriber } from "./types.ts";

type JsonSnapshot<T> = { value: T; etag: string };

const contentKey = "content.json";
const subscribersKey = "subscribers.json";
const analyticsKey = "analytics.json";
const seedPath = (name: string) => path.join(process.cwd(), "data", name);

async function readJson<T>(storage: StorageAdapter, key: string, fallback: T): Promise<JsonSnapshot<T>> {
  const object = await storage.readPrivateText(key, { bootstrapFile: seedPath(key) });
  if (!object) return { value: fallback, etag: "" };
  return { value: parseStoredJson<T>(object.text, key), etag: object.etag };
}

function contentAssets(value: unknown, assets = new Set<string>()) {
  if (typeof value === "string") {
    if (isAssetUrl(value, false)) assets.add(value);
    return assets;
  }
  if (Array.isArray(value)) {
    value.forEach(item => contentAssets(item, assets));
    return assets;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(item => contentAssets(item, assets));
  }
  return assets;
}

async function deleteRemovedAssets(previous: PortfolioContent, next: PortfolioContent, storage: StorageAdapter) {
  const current = contentAssets(previous);
  const retained = contentAssets(next);
  const results = await Promise.all([...current].filter(asset => !retained.has(asset)).map(async asset => {
    try {
      await storage.deleteAsset(asset);
      return null;
    } catch {
      return asset;
    }
  }));
  return results.filter((asset): asset is string => Boolean(asset));
}

export async function getContentSnapshot(storage = getStorage()) {
  const snapshot = await readJson<PortfolioContent>(storage, contentKey, {} as PortfolioContent);
  return { ...snapshot, value: normalizePortfolioContent(snapshot.value) };
}

export async function getContent(storage = getStorage()): Promise<PortfolioContent> {
  return (await getContentSnapshot(storage)).value;
}

export async function saveContent(content: PortfolioContent, expectedEtag?: string, storage = getStorage()) {
  const previous = await getContentSnapshot(storage);
  const ifMatch = expectedEtag ?? previous.etag;
  const stored = await storage.writePrivateText(contentKey, JSON.stringify(content, null, 2), ifMatch ? { ifMatch } : undefined);
  const cleanupFailures = await deleteRemovedAssets(previous.value, content, storage);
  return { ...stored, cleanupFailures };
}

export async function getSubscribersSnapshot(storage = getStorage()) {
  return readJson<Subscriber[]>(storage, subscribersKey, []);
}

export async function getSubscribers(storage = getStorage()): Promise<Subscriber[]> {
  return (await getSubscribersSnapshot(storage)).value;
}

export async function saveSubscribers(items: Subscriber[], expectedEtag?: string, storage = getStorage()) {
  const previous = await getSubscribersSnapshot(storage);
  const ifMatch = expectedEtag ?? previous.etag;
  return storage.writePrivateText(subscribersKey, JSON.stringify(items, null, 2), ifMatch ? { ifMatch } : undefined);
}

export async function getAnalytics(storage = getStorage()): Promise<AnalyticsEvent[]> {
  if (storage.driver === "vercel-blob") return [];
  const payload = await readJson<{ events: AnalyticsEvent[] }>(storage, analyticsKey, { events: [] });
  return payload.value.events;
}

export async function recordAnalytics(event: AnalyticsEvent, storage = getStorage()) {
  // ponytail: Blob-backed page-view writes would turn normal browsing into a write-heavy analytics store.
  if (storage.driver === "vercel-blob") return;
  const payload = await readJson<{ events: AnalyticsEvent[] }>(storage, analyticsKey, { events: [] });
  const trimmed = [...payload.value.events, event].slice(-5000);
  await storage.writePrivateText(analyticsKey, JSON.stringify({ events: trimmed }, null, 2), payload.etag ? { ifMatch: payload.etag } : undefined);
}

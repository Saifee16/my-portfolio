import "server-only";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import type { AnalyticsEvent, PortfolioContent, Subscriber } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const contentFile = path.join(dataDir, "content.json");
const subscribersFile = path.join(dataDir, "subscribers.json");
const analyticsFile = path.join(dataDir, "analytics.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function atomicWrite(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(temp, file);
}

export async function getContent(): Promise<PortfolioContent> {
  return readJson<PortfolioContent>(contentFile, {} as PortfolioContent);
}

export async function saveContent(content: PortfolioContent) {
  await atomicWrite(contentFile, content);
}

export async function getSubscribers(): Promise<Subscriber[]> {
  return readJson<Subscriber[]>(subscribersFile, []);
}

export async function saveSubscribers(items: Subscriber[]) {
  await atomicWrite(subscribersFile, items);
}

export async function getAnalytics(): Promise<AnalyticsEvent[]> {
  const payload = await readJson<{ events: AnalyticsEvent[] }>(analyticsFile, { events: [] });
  return payload.events;
}

export async function recordAnalytics(event: AnalyticsEvent) {
  const events = await getAnalytics();
  events.push(event);
  const trimmed = events.slice(-5000);
  await atomicWrite(analyticsFile, { events: trimmed });
}

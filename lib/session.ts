import crypto from "node:crypto";
import { getStorage, parseStoredJson, type StorageAdapter } from "./storage.ts";

const MAX_AGE_SECONDS = 60 * 60 * 12;
const SESSION_FILE = "admin-sessions.json";
type SessionRecord = { idHash: string; expiresAt: number; revokedAt?: number };
type SessionSnapshot = { record: SessionRecord; etag: string };

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be configured with at least 32 characters");
  return value;
}

function signature(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function sessionId(token: string) {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return "";
  const parts = token.slice(0, dot).split(":");
  return parts.length === 2 ? parts[1] : "";
}

function sessionIdHash(token: string) {
  const id = sessionId(token);
  return id ? crypto.createHash("sha256").update(id).digest("hex") : "";
}

function sessionKey(storage: StorageAdapter, idHash: string) {
  return storage.driver === "vercel-blob" ? `sessions/${idHash}.json` : SESSION_FILE;
}

function isSessionRecord(value: unknown): value is SessionRecord {
  return Boolean(value && typeof value === "object" &&
    typeof (value as SessionRecord).idHash === "string" &&
    typeof (value as SessionRecord).expiresAt === "number");
}

async function readSessions(storage: StorageAdapter): Promise<{ records: SessionRecord[]; etag: string }> {
  try {
    const value = await storage.readPrivateText(SESSION_FILE);
    if (!value) return { records: [], etag: "" };
    const parsed = parseStoredJson<unknown>(value.text, SESSION_FILE);
    const records = Array.isArray(parsed) ? parsed.filter(isSessionRecord) : [];
    return { records, etag: value.etag };
  } catch {
    return { records: [], etag: "" };
  }
}

async function readBlobSession(storage: StorageAdapter, idHash: string): Promise<SessionSnapshot | null> {
  const value = await storage.readPrivateText(sessionKey(storage, idHash));
  if (!value) return null;
  try {
    const record = parseStoredJson<unknown>(value.text, sessionKey(storage, idHash));
    return isSessionRecord(record) ? { record, etag: value.etag } : null;
  } catch {
    return null;
  }
}

export function createSessionToken() {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export async function issueAdminSession(storage = getStorage()) {
  const token = createSessionToken();
  const now = Date.now();
  const idHash = sessionIdHash(token);
  if (storage.driver === "vercel-blob") {
    await storage.writePrivateText(`sessions/${idHash}.json`, JSON.stringify({ idHash, expiresAt: now + MAX_AGE_SECONDS * 1000 }));
    return token;
  }
  const existing = (await readSessions(storage)).records.filter(session => session.expiresAt > now && !session.revokedAt);
  existing.push({ idHash, expiresAt: now + MAX_AGE_SECONDS * 1000 });
  await storage.writePrivateText(SESSION_FILE, JSON.stringify(existing.slice(-10), null, 2));
  return token;
}

export async function verifySessionToken(token?: string | null, storage = getStorage()) {
  if (!token) return false;
  try {
    const dot = token.lastIndexOf(".");
    if (dot < 1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!safeEqual(signature(payload), sig)) return false;
    const issued = Number(payload.split(":")[0]);
    if (!Number.isFinite(issued) || Date.now() - issued < 0 || Date.now() - issued >= MAX_AGE_SECONDS * 1000) return false;
    const idHash = sessionIdHash(token);
    if (!idHash) return false;
    if (storage.driver === "vercel-blob") {
      const session = await readBlobSession(storage, idHash);
      return Boolean(session && !session.record.revokedAt && session.record.expiresAt > Date.now());
    }
    const session = (await readSessions(storage)).records.find(item => item.idHash === idHash);
    return Boolean(session && !session.revokedAt && session.expiresAt > Date.now());
  } catch {
    return false;
  }
}

export async function revokeAdminSession(token?: string | null, storage = getStorage()) {
  if (!token) return;
  const idHash = sessionIdHash(token);
  if (!idHash) return;
  const now = Date.now();
  if (storage.driver === "vercel-blob") {
    const key = sessionKey(storage, idHash);
    const existing = await readBlobSession(storage, idHash);
    const record = { idHash, expiresAt: existing?.record.expiresAt ?? now + MAX_AGE_SECONDS * 1000, revokedAt: now };
    try {
      await storage.writePrivateText(key, JSON.stringify(record), existing ? { ifMatch: existing.etag } : undefined);
    } catch {
      // A concurrent logout already revoked this session; fail closed either way.
    }
    return;
  }
  const sessions = (await readSessions(storage)).records.filter(session => session.expiresAt > now);
  const match = sessions.find(session => session.idHash === idHash);
  if (match) match.revokedAt = now;
  else sessions.push({ idHash, expiresAt: now + MAX_AGE_SECONDS * 1000, revokedAt: now });
  await storage.writePrivateText(SESSION_FILE, JSON.stringify(sessions.slice(-10), null, 2));
}

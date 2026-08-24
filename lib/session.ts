import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const MAX_AGE_SECONDS = 60 * 60 * 12;
const SESSION_FILE = path.join(process.cwd(), "data", "admin-sessions.json");
type SessionRecord = { idHash: string; expiresAt: number; revokedAt?: number };

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

async function readSessions(): Promise<SessionRecord[]> {
  try {
    const value = JSON.parse(await fs.readFile(SESSION_FILE, "utf8")) as unknown;
    return Array.isArray(value) ? value.filter(item => item && typeof item === "object") as SessionRecord[] : [];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: SessionRecord[]) {
  await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
  const temp = `${SESSION_FILE}.${process.pid}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  await fs.writeFile(temp, JSON.stringify(sessions, null, 2), "utf8");
  await fs.rename(temp, SESSION_FILE);
}

export function createSessionToken() {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export async function issueAdminSession() {
  const token = createSessionToken();
  const now = Date.now();
  const existing = (await readSessions()).filter(session => session.expiresAt > now && !session.revokedAt);
  existing.push({ idHash: sessionIdHash(token), expiresAt: now + MAX_AGE_SECONDS * 1000 });
  await writeSessions(existing.slice(-10));
  return token;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;
  try {
    const dot = token.lastIndexOf(".");
    if (dot < 1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!safeEqual(signature(payload), sig)) return false;
    const issued = Number(payload.split(":")[0]);
    if (!Number.isFinite(issued) || Date.now() - issued < 0 || Date.now() - issued >= MAX_AGE_SECONDS * 1000) return false;
    const session = (await readSessions()).find(item => item.idHash === sessionIdHash(token));
    return Boolean(session && !session.revokedAt && session.expiresAt > Date.now());
  } catch {
    return false;
  }
}

export async function revokeAdminSession(token?: string | null) {
  if (!token) return;
  const idHash = sessionIdHash(token);
  if (!idHash) return;
  const now = Date.now();
  const sessions = (await readSessions()).filter(session => session.expiresAt > now);
  const match = sessions.find(session => session.idHash === idHash);
  if (match) match.revokedAt = now;
  else sessions.push({ idHash, expiresAt: now + MAX_AGE_SECONDS * 1000, revokedAt: now });
  await writeSessions(sessions.slice(-10));
}

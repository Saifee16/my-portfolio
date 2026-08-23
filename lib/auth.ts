import "server-only";
import { cookies } from "next/headers";
import { hashAdminPassword, isAdminPasswordHash, verifyAdminPasswordHash } from "@/lib/security";
import { issueAdminSession, revokeAdminSession, verifySessionToken } from "@/lib/session";

const COOKIE_NAME = "portfolio_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export function adminAuthConfigured() {
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  return Boolean(isAdminPasswordHash(hashedPassword) && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

export function verifyPassword(input: string) {
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  return Boolean(hashedPassword && isAdminPasswordHash(hashedPassword) && verifyAdminPasswordHash(input, hashedPassword));
}

export async function isAdmin() {
  const store = await cookies();
  if (!adminAuthConfigured()) return false;
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  await revokeAdminSession(store.get(COOKIE_NAME)?.value);
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export { hashAdminPassword, issueAdminSession, revokeAdminSession, verifySessionToken };

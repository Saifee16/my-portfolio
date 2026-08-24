import crypto from "node:crypto";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 32;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;

function toBase64Url(value: Uint8Array) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

function safeEqual(a: Uint8Array, b: Uint8Array) {
  return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function hashAdminPassword(password: string) {
  if (password.length < 14) throw new Error("Admin passwords must be at least 14 characters long");
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${toBase64Url(salt)}$${toBase64Url(derived)}`;
}

export function verifyAdminPasswordHash(password: string, encoded: string) {
  try {
    const [algorithm, nValue, rValue, pValue, saltValue, digestValue] = encoded.split("$");
    const n = Number(nValue);
    const r = Number(rValue);
    const p = Number(pValue);
    if (
      algorithm !== "scrypt" ||
      !Number.isSafeInteger(n) ||
      n < 16_384 ||
      n > 1_048_576 ||
      (n & (n - 1)) !== 0 ||
      !Number.isSafeInteger(r) ||
      r < 1 ||
      r > 32 ||
      !Number.isSafeInteger(p) ||
      p < 1 ||
      p > 8 ||
      !saltValue ||
      !digestValue
    ) return false;
    const salt = fromBase64Url(saltValue);
    const expected = fromBase64Url(digestValue);
    if (salt.length < 16 || expected.length !== SCRYPT_KEY_LENGTH) return false;
    const actual = crypto.scryptSync(password, salt, expected.length, { N: n, r, p, maxmem: SCRYPT_MAXMEM });
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function isAdminPasswordHash(value: string | undefined) {
  if (!value) return false;
  const [algorithm, nValue, rValue, pValue, saltValue, digestValue, extra] = value.split("$");
  const n = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);
  if (extra || algorithm !== "scrypt" || !saltValue || !digestValue) return false;
  return (
    Number.isSafeInteger(n) &&
    n >= 16_384 &&
    n <= 1_048_576 &&
    (n & (n - 1)) === 0 &&
    Number.isSafeInteger(r) &&
    r >= 1 &&
    r <= 32 &&
    Number.isSafeInteger(p) &&
    p >= 1 &&
    p <= 8 &&
    fromBase64Url(saltValue).length >= 16 &&
    fromBase64Url(digestValue).length === SCRYPT_KEY_LENGTH
  );
}

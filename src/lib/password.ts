/**
 * Password + token primitives. Deliberately free of Next.js imports so the
 * same code runs in route handlers, in Workers, and in plain Node scripts.
 *
 * - Passwords are stored as `pbkdf2$<iterations>$<saltHex>$<hashBase64>`
 *   derived with PBKDF2-SHA256 via Web Crypto.
 * - All comparisons are constant time over byte arrays.
 */

const ITERATIONS = 150_000;
const KEY_BITS = 256;
const MIN_ITERATIONS = 10_000;
const MAX_ITERATIONS = 1_000_000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const derived = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toBase64(derived)}`;
}

/** Constant-time comparison over byte arrays. */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  // Reject weakened or absurd hashes instead of burning CPU on them.
  if (!Number.isFinite(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return false;
  try {
    const expected = fromBase64(parts[3]);
    const actual = await derive(password, fromHex(parts[2]), iterations);
    return bytesEqual(actual, expected);
  } catch {
    return false;
  }
}

/** URL-safe random session id (172 bits of entropy). */
export function newSessionId(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Constant-time compare for opaque secrets such as the cron token. */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  return bytesEqual(enc.encode(a), enc.encode(b));
}

/** SHA-256 hex digest, used for privacy-preserving IP bucketing. */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return toHex(new Uint8Array(digest));
}

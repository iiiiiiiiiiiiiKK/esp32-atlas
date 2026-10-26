import { cookies } from "next/headers";

/**
 * Session plumbing for the admin console. Password hashing lives in
 * `password.ts` (no Next imports) and is re-exported here for convenience.
 *
 * Sessions live in D1 and are referenced by an opaque random id stored in an
 * HttpOnly, SameSite=Lax cookie — no JWT, so revocation is immediate.
 */

export {
  hashPassword,
  verifyPassword,
  newSessionId,
  safeEqual,
  sha256Hex,
  bytesEqual,
} from "./password";

export const SESSION_COOKIE = "atlas_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export function sessionExpiry(): string {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString();
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export const SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);

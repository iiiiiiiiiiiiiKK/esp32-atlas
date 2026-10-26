import { NextResponse } from "next/server";
import { z } from "zod";
import { first, mutate } from "@/lib/db";
import {
  hashPassword,
  newSessionId,
  sessionExpiry,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

/**
 * Per-isolate throttle: a speed bump in front of PBKDF2, not the main control.
 * The durable control is the real hash verification plus short session TTLs.
 */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now();
  const record = attempts.get(ip);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  const row = await first<{ id: number; email: string; password_hash: string; role: string }>(
    `SELECT id, email, password_hash, role FROM admin_users WHERE email = ?`,
    [parsed.email.toLowerCase()],
  );

  // Always verify something so response time does not reveal account existence.
  const storedHash = row?.password_hash ?? (await hashPassword("placeholder-for-timing"));
  const ok = await verifyPassword(parsed.password, storedHash);

  if (!row || !ok) {
    attempts.set(ip, {
      count: (record && now - record.first < WINDOW_MS ? record.count : 0) + 1,
      first: record && now - record.first < WINDOW_MS ? record.first : now,
    });
    return NextResponse.json({ error: "invalid-credentials" }, { status: 401 });
  }

  attempts.delete(ip);
  const sessionId = newSessionId();
  await mutate(`INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`, [
    sessionId,
    row.id,
    new Date().toISOString(),
    sessionExpiry(),
  ]);
  // Housekeeping: drop this user's expired sessions.
  await mutate(`DELETE FROM sessions WHERE user_id = ? AND expires_at < ?`, [row.id, new Date().toISOString()]);
  await mutate(`UPDATE admin_users SET last_login_at = ? WHERE id = ?`, [new Date().toISOString(), row.id]);

  const response = NextResponse.json({ ok: true, email: row.email, role: row.role });
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

import { first, mutate, query } from "./db";
import { readSessionCookie } from "./auth";

export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

/**
 * Resolves the signed-in admin from the session cookie.
 * Returns null for missing/expired sessions — every /admin route and admin API
 * calls this, so hiding the UI is never the only protection.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const sessionId = await readSessionCookie();
  if (!sessionId) return null;
  const row = await first(
    `SELECT u.id, u.email, u.role, s.expires_at
     FROM sessions s JOIN admin_users u ON u.id = s.user_id
     WHERE s.id = ?`,
    [sessionId],
  );
  if (!row) return null;
  if (Date.parse(String(row.expires_at)) < Date.now()) {
    await mutate(`DELETE FROM sessions WHERE id = ?`, [sessionId]);
    return null;
  }
  return { id: Number(row.id), email: String(row.email), role: String(row.role) };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function listPendingSubmissions(): Promise<
  Array<{ id: number; repoUrl: string; fullName: string | null; note: unknown; createdAt: string }>
> {
  const rows = await query(
    `SELECT id, repo_url, full_name, note_i18n, created_at FROM project_submissions
     WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100`,
  );
  return rows.map((r) => ({
    id: Number(r.id),
    repoUrl: String(r.repo_url),
    fullName: (r.full_name as string) ?? null,
    note: r.note_i18n,
    createdAt: String(r.created_at),
  }));
}

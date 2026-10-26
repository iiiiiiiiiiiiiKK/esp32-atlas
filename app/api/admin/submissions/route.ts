import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { first, mutate } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid-input" }, { status: 400 });

  const sub = await first<{ id: number; full_name: string | null; status: string }>(
    `SELECT id, full_name, status FROM project_submissions WHERE id = ?`,
    [parsed.data.id],
  );
  if (!sub) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (sub.status !== "pending") return NextResponse.json({ error: "already-reviewed" }, { status: 409 });

  if (parsed.data.action === "approve") {
    if (!sub.full_name) return NextResponse.json({ error: "missing-repo" }, { status: 422 });
    // Approving creates a *pending* repository row: metrics get filled by the
    // next sync, so we never show numbers we have not fetched ourselves.
    const slug = sub.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date().toISOString();
    await mutate(
      `INSERT INTO repositories (slug, owner, name, full_name, html_url, stars, forks, open_issues,
         topics, tags, chips, frameworks, curation_status, data_origin, first_seen_at, sync_status)
       VALUES (?, ?, ?, ?, ?, 0, 0, 0, '[]', '[]', '[]', '[]', 'pending', 'github', ?, 'stale')
       ON CONFLICT(full_name) DO UPDATE SET curation_status = 'pending'`,
      [
        slug,
        sub.full_name.split("/")[0],
        sub.full_name.split("/")[1],
        sub.full_name,
        `https://github.com/${sub.full_name}`,
        now,
      ],
    );
    await mutate(
      `UPDATE project_submissions SET status = 'approved', reviewed_at = ?, reviewed_by = ? WHERE id = ?`,
      [now, admin.email, parsed.data.id],
    );
    return NextResponse.json({ ok: true, status: "approved", syncRequired: true });
  }

  await mutate(
    `UPDATE project_submissions SET status = 'rejected', reviewed_at = ?, reviewed_by = ?, reject_reason = ? WHERE id = ?`,
    [new Date().toISOString(), admin.email, parsed.data.reason ?? null, parsed.data.id],
  );
  return NextResponse.json({ ok: true, status: "rejected" });
}

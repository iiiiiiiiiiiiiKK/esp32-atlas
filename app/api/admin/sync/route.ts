import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { runSync, getSyncToken } from "@/lib/sync";
import { safeEqual } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sync endpoint, used by both the admin button and the Cloudflare cron trigger.
 *
 * Auth:
 *  - `Authorization: Bearer <SYNC_TOKEN>` for cron/CI, compared in constant time.
 *  - an admin session cookie for the console button.
 */
export async function POST(request: Request) {
  const expected = await getSyncToken();
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const cronOk = typeof expected === "string" && expected.length > 0 && bearer.length > 0 && safeEqual(bearer, expected);
  const admin = cronOk ? null : await getCurrentAdmin();

  if (!cronOk && !admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let limit = 30;
  try {
    const body = (await request.json()) as { limit?: number };
    if (typeof body?.limit === "number" && body.limit > 0 && body.limit <= 60) limit = body.limit;
  } catch {
    // empty body is fine
  }

  try {
    const result = await runSync({ trigger: cronOk ? "cron" : "admin", limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "sync-failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "method-not-allowed" }, { status: 405, headers: { Allow: "POST" } });
}

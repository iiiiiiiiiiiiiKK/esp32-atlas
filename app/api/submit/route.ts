import { NextResponse } from "next/server";
import { first, mutate, query } from "@/lib/db";
import { sha256Hex } from "@/lib/password";
import { parseRepoUrl, submitSchema } from "@/lib/validation";

export const runtime = "nodejs";

const WINDOW_MINUTES = 30;
const MAX_PER_WINDOW = 5;

/** IPs are hashed before storage, so the table cannot be used to track visitors. */
async function hashIp(ip: string): Promise<string> {
  return (await sha256Hex(`atlas:${ip}`)).slice(0, 32);
}

/**
 * Accepts a public GitHub repository URL and queues it for human review.
 * Guards: strict URL allow-list (GitHub only → no SSRF), repo existence check
 * against the GitHub API, duplicate detection, and a per-IP rate limit.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    // Distinguish "not a GitHub URL" from other validation problems so the UI
    // can explain exactly what is wrong.
    const isUrlProblem = parsed.error.issues.some((issue) => issue.path[0] === "repoUrl");
    return NextResponse.json(
      { error: isUrlProblem ? "invalid-github-url" : "invalid-input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const target = parseRepoUrl(parsed.data.repoUrl);
  if (!target) return NextResponse.json({ error: "invalid-github-url" }, { status: 400 });

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "local";
  const ipHash = await hashIp(ip);
  const windowAt = new Date(Date.now() - (Date.now() % (WINDOW_MINUTES * 60000))).toISOString();

  const used = await first<{ count: number }>(
    `SELECT count FROM submit_rate_limit WHERE ip_hash = ? AND window_at = ?`,
    [ipHash, windowAt],
  );
  if (Number(used?.count ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  await mutate(
    `INSERT INTO submit_rate_limit (ip_hash, window_at, count) VALUES (?, ?, 1)
     ON CONFLICT(ip_hash, window_at) DO UPDATE SET count = count + 1`,
    [ipHash, windowAt],
  );

  const existing = await first<{ slug: string }>(
    `SELECT slug FROM repositories WHERE full_name = ? COLLATE NOCASE`,
    [target.fullName],
  );
  if (existing) return NextResponse.json({ error: "duplicate", slug: existing.slug }, { status: 409 });

  const pending = await first<{ id: number }>(
    `SELECT id FROM project_submissions WHERE full_name = ? COLLATE NOCASE AND status = 'pending'`,
    [target.fullName],
  );
  if (pending) return NextResponse.json({ error: "already-pending" }, { status: 409 });

  // Verify the repository actually exists and is public before queueing it.
  const headers: Record<string, string> = {
    "User-Agent": "esp32-atlas-submit",
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let check: Record<string, unknown> = { checked_at: new Date().toISOString(), verified: false };
  try {
    const res = await fetch(`https://api.github.com/repos/${target.fullName}`, { headers });
    if (res.ok) {
      const repo = (await res.json()) as {
        full_name: string;
        stargazers_count: number;
        archived: boolean;
        fork: boolean;
        description: string | null;
        pushed_at: string;
      };
      check = {
        checked_at: new Date().toISOString(),
        verified: true,
        stars: repo.stargazers_count,
        archived: repo.archived,
        fork: repo.fork,
        description: repo.description,
        pushed_at: repo.pushed_at,
      };
      if (repo.archived) {
        return NextResponse.json({ error: "repo-archived" }, { status: 422 });
      }
    } else if (res.status === 404) {
      return NextResponse.json({ error: "repo-not-found" }, { status: 404 });
    } else {
      check = { checked_at: new Date().toISOString(), verified: false, status: res.status };
    }
  } catch {
    check = { checked_at: new Date().toISOString(), verified: false, status: "network-error" };
  }

  await mutate(
    `INSERT INTO project_submissions (repo_url, full_name, note_i18n, submitter_ip, status, github_check, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
    [
      `https://github.com/${target.fullName}`,
      target.fullName,
      JSON.stringify({ zh: parsed.data.note, en: parsed.data.note }),
      ipHash,
      JSON.stringify(check),
      new Date().toISOString(),
    ],
  );

  return NextResponse.json({ ok: true, status: "pending", fullName: target.fullName });
}

export async function GET() {
  // Public: only aggregate counts, never submitter data.
  const rows = await query<{ status: string; n: number }>(
    `SELECT status, COUNT(*) AS n FROM project_submissions GROUP BY status`,
  );
  return NextResponse.json({
    pending: Number(rows.find((r) => r.status === "pending")?.n ?? 0),
    approved: Number(rows.find((r) => r.status === "approved")?.n ?? 0),
  });
}

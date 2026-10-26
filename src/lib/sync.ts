import { getCloudflareContext } from "@opennextjs/cloudflare";
import { first, mutate, query } from "./db";

/**
 * GitHub sync engine. Runs inside the Worker (cron or admin-triggered), never
 * on a page render — requests are never blocked by GitHub latency.
 *
 * Rules:
 *  - A GITHUB_TOKEN secret is used when configured (5000 req/h); otherwise the
 *    anonymous 60 req/h budget is respected with sequential calls and backoff.
 *  - On failure the previous metrics are kept and `sync_status` becomes 'stale'.
 *  - Every run appends a `repository_snapshots` row so growth can be computed
 *    later — growth is never fabricated before snapshots exist.
 */

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  archived: boolean;
  disabled?: boolean;
  default_branch: string;
  description: string | null;
  topics?: string[];
  language: string | null;
  license: { spdx_id?: string } | null;
  homepage: string | null;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
}

export interface SyncResult {
  total: number;
  updated: number;
  failed: number;
  rateLimited: boolean;
  errors: string[];
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "esp32-atlas-sync",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function ghFetch<T>(path: string): Promise<{ data: T | null; status: number; remaining: number | null }> {
  const res = await fetch(`https://api.github.com${path}`, { headers: ghHeaders() });
  const remainingHeader = res.headers.get("x-ratelimit-remaining");
  const remaining = remainingHeader === null ? null : Number(remainingHeader);
  if (!res.ok) return { data: null, status: res.status, remaining };
  return { data: (await res.json()) as T, status: res.status, remaining };
}

export async function runSync(options: {
  trigger: "cron" | "manual" | "admin";
  limit?: number;
}): Promise<SyncResult> {
  const startedAt = new Date().toISOString();
  const jobId = await insertJob(startedAt, options.trigger);

  const rows = await query<{ id: number; full_name: string }>(
    `SELECT id, full_name FROM repositories WHERE curation_status = 'published'
     ORDER BY COALESCE(last_synced_at, '') ASC LIMIT ?`,
    [options.limit ?? 30],
  );

  const result: SyncResult = { total: rows.length, updated: 0, failed: 0, rateLimited: false, errors: [] };
  let remaining: number | null = null;

  for (const row of rows) {
    if (remaining !== null && remaining <= 1) {
      result.rateLimited = true;
      result.errors.push(`rate limit reached before ${row.full_name}`);
      break;
    }
    try {
      const repoRes = await ghFetch<GitHubRepo>(`/repos/${row.full_name}`);
      remaining = repoRes.remaining ?? remaining;
      if (!repoRes.data) {
        // Deleted/renamed/private repo: keep last known data, mark it stale.
        await flagStale(row.id, repoRes.status === 404 ? "repo not found (404)" : `http ${repoRes.status}`);
        result.failed += 1;
        continue;
      }
      const repo = repoRes.data;
      const relRes = await ghFetch<GitHubRelease>(`/repos/${row.full_name}/releases/latest`);
      remaining = relRes.remaining ?? remaining;
      const release = relRes.data;
      const now = new Date().toISOString();

      // Editorial columns (category, difficulty, scores, summary) are
      // deliberately absent here so a sync can never overwrite curation.
      await mutate(
        `UPDATE repositories SET description = ?, topics = ?, language = ?, license = ?,
           stars = ?, forks = ?, open_issues = ?, updated_at = ?, pushed_at = ?,
           default_branch = ?, archived = ?, disabled = ?, homepage = ?,
           latest_release_tag = ?, latest_release_at = ?, latest_release_url = ?,
           last_synced_at = ?, sync_status = 'ok', sync_error = NULL
         WHERE id = ?`,
        [
          repo.description,
          repo.topics ?? [],
          repo.language,
          repo.license?.spdx_id ?? null,
          repo.stargazers_count,
          repo.forks_count,
          repo.open_issues_count,
          repo.updated_at,
          repo.pushed_at,
          repo.default_branch,
          repo.archived,
          repo.disabled ?? false,
          repo.homepage,
          release?.tag_name ?? null,
          release?.published_at ?? null,
          release?.html_url ?? null,
          now,
          row.id,
        ],
      );

      await mutate(
        `INSERT INTO repository_snapshots (repository_id, captured_at, stars, forks, open_issues)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(repository_id, captured_at) DO UPDATE SET
           stars = excluded.stars, forks = excluded.forks, open_issues = excluded.open_issues`,
        [row.id, now, repo.stargazers_count, repo.forks_count, repo.open_issues_count],
      );

      result.updated += 1;
    } catch (err) {
      result.failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`${row.full_name}: ${message}`);
      await flagStale(row.id, message);
    }
  }

  const status = result.failed === 0 ? "ok" : result.updated > 0 ? "partial" : "failed";
  await mutate(
    `UPDATE sync_jobs SET finished_at = ?, status = ?, total = ?, updated = ?, failed = ?,
       message = ?, rate_limit = ? WHERE id = ?`,
    [
      new Date().toISOString(),
      status,
      result.total,
      result.updated,
      result.failed,
      result.errors.slice(0, 5).join(" | ").slice(0, 900),
      remaining === null ? null : String(remaining),
      jobId,
    ],
  );

  return result;
}

async function insertJob(startedAt: string, trigger: string): Promise<number> {
  await mutate(
    `INSERT INTO sync_jobs (started_at, trigger, status, total, updated, failed) VALUES (?, ?, 'running', 0, 0, 0)`,
    [startedAt, trigger],
  );
  const row = await first<{ id: number }>(`SELECT MAX(id) AS id FROM sync_jobs WHERE started_at = ?`, [startedAt]);
  return Number(row?.id ?? 0);
}

async function flagStale(repoId: number, error: string): Promise<void> {
  await mutate(
    `UPDATE repositories SET sync_status = 'stale', sync_error = ? WHERE id = ?`,
    [error.slice(0, 300), repoId],
  );
}

export async function getSyncToken(): Promise<string | null> {
  const { env } = await getCloudflareContext({ async: true });
  const value = (env as unknown as { SYNC_TOKEN?: string }).SYNC_TOKEN;
  return value ?? null;
}

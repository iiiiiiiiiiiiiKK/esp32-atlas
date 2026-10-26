/**
 * Fetches repository metadata from the GitHub REST API and rewrites
 * `src/data/github-snapshot.json`.
 *
 * - Uses GITHUB_TOKEN when present (5000 req/h); otherwise anonymous (60/h) with
 *   sequential requests and backoff on 403/429.
 * - Only public metadata is stored; no private data is ever requested.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const snapshotPath = resolve(root, "src/data/github-snapshot.json");

interface SnapshotRepo {
  full_name: string;
  owner: string;
  html_url: string;
  description: string | null;
  topics: string[];
  language: string | null;
  license: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  homepage: string | null;
  has_discussions?: boolean;
  latest_release: { tag: string; published_at: string; url: string } | null;
}

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
const headers: Record<string, string> = {
  "User-Agent": "esp32-atlas-sync",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (token) headers.Authorization = `Bearer ${token}`;

function readTrackedRepos(): string[] {
  if (!existsSync(snapshotPath)) return [];
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as { items: SnapshotRepo[] };
  return snapshot.items.map((i) => i.full_name);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gh<T>(path: string, attempt = 0): Promise<T | null> {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset") ?? "0");
    const waitMs = Math.min(60000, Math.max(2000, reset * 1000 - Date.now()));
    if (attempt >= 3) {
      throw new Error(`GitHub rate limit persisted on ${path} (status ${res.status})`);
    }
    console.warn(`rate limited on ${path}, waiting ${Math.round(waitMs / 1000)}s`);
    await sleep(waitMs);
    return gh<T>(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchRepo(fullName: string): Promise<SnapshotRepo | null> {
  const repo = await gh<Record<string, unknown>>(`/repos/${fullName}`);
  if (!repo) return null;
  const release = await gh<Record<string, unknown>>(`/repos/${fullName}/releases/latest`);
  return {
    full_name: String(repo.full_name),
    owner: String((repo.owner as { login: string }).login),
    html_url: String(repo.html_url),
    description: (repo.description as string) ?? null,
    topics: (repo.topics as string[]) ?? [],
    language: (repo.language as string) ?? null,
    license: ((repo.license as { spdx_id?: string } | null)?.spdx_id) ?? null,
    stars: Number(repo.stargazers_count ?? 0),
    forks: Number(repo.forks_count ?? 0),
    open_issues: Number(repo.open_issues_count ?? 0),
    created_at: String(repo.created_at),
    updated_at: String(repo.updated_at),
    pushed_at: String(repo.pushed_at),
    archived: Boolean(repo.archived),
    disabled: Boolean(repo.disabled),
    default_branch: String(repo.default_branch ?? "main"),
    homepage: (repo.homepage as string) ?? null,
    has_discussions: Boolean(repo.has_discussions),
    latest_release: release
      ? {
          tag: String(release.tag_name),
          published_at: String(release.published_at),
          url: String(release.html_url),
        }
      : null,
  };
}

async function main() {
  const repos = readTrackedRepos();
  if (repos.length === 0) {
    console.error("No repositories in snapshot; nothing to sync.");
    process.exit(1);
  }
  const items: SnapshotRepo[] = [];
  const failures: string[] = [];
  for (const fullName of repos) {
    try {
      const repo = await fetchRepo(fullName);
      if (repo) items.push(repo);
      else failures.push(`${fullName}: 404`);
    } catch (err) {
      failures.push(`${fullName}: ${err instanceof Error ? err.message : String(err)}`);
      // keep the previous record so a transient failure never drops data
      const prev = JSON.parse(readFileSync(snapshotPath, "utf8")) as { items: SnapshotRepo[] };
      const existing = prev.items.find((i) => i.full_name === fullName);
      if (existing) items.push(existing);
    }
  }
  writeFileSync(
    snapshotPath,
    `${JSON.stringify({ fetched_at: new Date().toISOString(), items }, null, 2)}\n`,
    "utf8",
  );
  console.log(`synced ${items.length}/${repos.length} repos`);
  if (failures.length > 0) console.warn("failures:\n" + failures.join("\n"));
  if (!token) console.warn("No GITHUB_TOKEN set — anonymous rate limit is 60 req/h.");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

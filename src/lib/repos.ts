import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { query, first } from "./db";
import type { Row } from "./db";
import {
  fallbackChips,
  fallbackGuide,
  fallbackPaths,
  fallbackRepoBySlug,
  fallbackRepos,
  fallbackSourceNote,
  fallbackTutorials,
} from "./fallback";
import type {
  ChipRecord,
  Difficulty,
  GuideContent,
  I18nText,
  LearningPathRecord,
  RepoRecord,
  SnapshotPoint,
  TutorialRecord,
} from "./types";

/**
 * Data-access layer with an explicit degraded mode.
 *
 * Every read goes through D1. If D1 is unreachable — network failure, an
 * outage, or the free-tier daily row-read quota being exhausted — the read
 * falls back to the snapshot bundled at build time (`src/data/github-snapshot.json`
 * + `src/content/*`). Pages then render real, labelled data instead of throwing
 * a 500 into `app/error.tsx`.
 *
 * The fallback is never silent: `dataStatus()` reports it and the layout shows
 * a banner, because presenting stale metrics as live would break the product's
 * core promise.
 */

/** Cached per request: the override flag never changes mid-request. */
const forcedDegraded = cache(async (): Promise<boolean> => {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { FORCE_DEGRADED?: string }).FORCE_DEGRADED === "1";
  } catch {
    // Outside a Worker (unit tests, plain node) the flag is simply off.
    return process.env.FORCE_DEGRADED === "1";
  }
});

export interface DataStatus {
  degraded: boolean;
  reason: string | null;
  snapshotFetchedAt: string | null;
  repoCount: number;
}

/**
 * Per-request status cell.
 *
 * React's `cache()` is scoped to a single server render, so the flag is shared
 * by every read in that request and reset automatically for the next one — no
 * module-level leakage between concurrent requests in the same isolate.
 */
const requestStatus = cache((): { degraded: boolean; reason: string | null } => ({
  degraded: false,
  reason: null,
}));

/** Reads the current degradation state without performing any I/O. */
export function dataStatus(): DataStatus {
  const note = fallbackSourceNote();
  const state = requestStatus();
  return {
    degraded: state.degraded,
    reason: state.reason,
    snapshotFetchedAt: note.fetchedAt,
    repoCount: note.repoCount,
  };
}

/** Test seam: lets unit tests simulate an outage. */
export function __setDegraded(value: boolean, reason: string | null = null): void {
  const state = requestStatus();
  state.degraded = value;
  state.reason = value ? reason : null;
}

function markDegraded(err: unknown): void {
  const reason = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
  const state = requestStatus();
  state.degraded = true;
  state.reason = reason;
}

/**
 * Runs a database read, falling back to the bundled snapshot on any failure.
 * `fallback` is only invoked when the query throws, so the happy path keeps its
 * single round-trip.
 */
async function readWithFallback<T>(run: () => Promise<T>, fallback: () => T): Promise<T> {
  // Opt-in switch used by the degraded-mode test and for local UI checks.
  // Read from the Worker environment (wrangler var / .dev.vars), not from
  // process.env, because OpenNext inlines process.env at build time.
  if (await forcedDegraded()) {
    markDegraded(new Error("forced degraded mode (FORCE_DEGRADED=1)"));
    return fallback();
  }
  try {
    return await run();
  } catch (err) {
    markDegraded(err);
    return fallback();
  }
}

function json<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapRepo(row: Row): RepoRecord {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    owner: String(row.owner),
    name: String(row.name),
    fullName: String(row.full_name),
    htmlUrl: String(row.html_url),
    homepage: (row.homepage as string) ?? null,
    description: (row.description as string) ?? null,
    summary: json<I18nText | null>(row.summary_i18n, null),
    topics: json<string[]>(row.topics, []),
    language: (row.language as string) ?? null,
    license: (row.license as string) ?? null,
    stars: Number(row.stars ?? 0),
    forks: Number(row.forks ?? 0),
    openIssues: Number(row.open_issues ?? 0),
    createdAt: (row.created_at as string) ?? null,
    updatedAt: (row.updated_at as string) ?? null,
    pushedAt: (row.pushed_at as string) ?? null,
    defaultBranch: (row.default_branch as string) ?? null,
    archived: Number(row.archived ?? 0) === 1,
    latestReleaseTag: (row.latest_release_tag as string) ?? null,
    latestReleaseAt: (row.latest_release_at as string) ?? null,
    latestReleaseUrl: (row.latest_release_url as string) ?? null,
    category: (row.category as RepoRecord["category"]) ?? null,
    chips: json<string[]>(row.chips, []),
    frameworks: json<string[]>(row.frameworks, []),
    difficulty: (row.difficulty as Difficulty) ?? null,
    docScore: row.doc_score === null || row.doc_score === undefined ? null : Number(row.doc_score),
    demoScore: row.demo_score === null || row.demo_score === undefined ? null : Number(row.demo_score),
    beginnerFriendly: Number(row.beginner_friendly ?? 0) === 1,
    tags: json<string[]>(row.tags, []),
    featured: Number(row.featured ?? 0) === 1,
    dataOrigin: (row.data_origin as RepoRecord["dataOrigin"]) ?? "github",
    firstSeenAt: String(row.first_seen_at ?? ""),
    lastSyncedAt: (row.last_synced_at as string) ?? null,
    syncStatus: (row.sync_status as RepoRecord["syncStatus"]) ?? "ok",
    syncError: (row.sync_error as string) ?? null,
  };
}

const REPO_COLUMNS = `id, slug, owner, name, full_name, html_url, homepage, description,
  summary_i18n, topics, language, license, stars, forks, open_issues, created_at,
  updated_at, pushed_at, default_branch, archived, latest_release_tag,
  latest_release_at, latest_release_url, category, chips, frameworks, difficulty,
  doc_score, demo_score, beginner_friendly, tags, featured, data_origin,
  first_seen_at, last_synced_at, sync_status, sync_error`;

export async function listRepos(limit = 500): Promise<RepoRecord[]> {
  return readWithFallback(
    async () => {
      const rows = await query(
        `SELECT ${REPO_COLUMNS} FROM repositories WHERE curation_status = 'published' ORDER BY stars DESC LIMIT ?`,
        [limit],
      );
      return rows.map(mapRepo);
    },
    () => fallbackRepos().slice(0, limit),
  );
}

export async function getRepoBySlug(slug: string): Promise<RepoRecord | null> {
  return readWithFallback(
    async () => {
      const row = await first(
        `SELECT ${REPO_COLUMNS} FROM repositories WHERE slug = ? AND curation_status = 'published'`,
        [slug],
      );
      return row ? mapRepo(row) : null;
    },
    () => fallbackRepoBySlug(slug),
  );
}

export async function getGuide(repoId: number): Promise<{ content: GuideContent; confidence: string } | null> {
  // The fallback needs the repository's full name, so it is resolved lazily
  // from the (id-stable) snapshot ordering.
  const slug = fallbackRepos().find((r) => r.id === repoId)?.fullName ?? null;
  return readWithFallback(
    async () => {
      const row = await first(`SELECT content, confidence FROM project_guides WHERE repository_id = ?`, [repoId]);
      if (!row) return slug ? fallbackGuide(slug) : null;
      return {
        content: json<GuideContent>(row.content, {} as GuideContent),
        confidence: String(row.confidence ?? "unverified"),
      };
    },
    () => (slug ? fallbackGuide(slug) : null),
  );
}

export async function getSnapshots(repoId: number, limit = 120): Promise<SnapshotPoint[]> {
  return readWithFallback(
    async () => {
      const rows = await query(
        `SELECT captured_at, stars, forks, open_issues FROM repository_snapshots
         WHERE repository_id = ? ORDER BY captured_at DESC LIMIT ?`,
        [repoId, limit],
      );
      return rows
        .map((r) => ({
          capturedAt: String(r.captured_at),
          stars: Number(r.stars),
          forks: Number(r.forks),
          openIssues: Number(r.open_issues),
        }))
        .reverse();
    },
    // No snapshot history offline: growth must show as "accumulating", never as a number.
    () => [],
  );
}

/**
 * Growth is only reported when a snapshot at least `minAgeDays` old exists.
 * Otherwise we return null and the UI says "accumulating" — we never invent it.
 */
export async function getStarGrowth(
  repoId: number,
  days: number,
  now = Date.now(),
): Promise<{ delta: number; fromCapturedAt: string; toCapturedAt: string } | null> {
  return readWithFallback(
    async () => {
      const newest = await first(
        `SELECT captured_at, stars FROM repository_snapshots WHERE repository_id = ? ORDER BY captured_at DESC LIMIT 1`,
        [repoId],
      );
      if (!newest) return null;
      const cutoff = new Date(now - days * 86400000).toISOString();
      const baseline = await first(
        `SELECT captured_at, stars FROM repository_snapshots
         WHERE repository_id = ? AND captured_at <= ? ORDER BY captured_at DESC LIMIT 1`,
        [repoId, cutoff],
      );
      if (!baseline) return null;
      const delta = Number(newest.stars) - Number(baseline.stars);
      return {
        delta,
        fromCapturedAt: String(baseline.captured_at),
        toCapturedAt: String(newest.captured_at),
      };
    },
    () => null,
  );
}

export async function countSnapshots(): Promise<{ repos: number; snapshots: number; earliest: string | null }> {
  return readWithFallback<{ repos: number; snapshots: number; earliest: string | null }>(
    async () => {
      const row = await first(
        `SELECT COUNT(DISTINCT repository_id) AS repos, COUNT(*) AS snapshots, MIN(captured_at) AS earliest
         FROM repository_snapshots`,
      );
      return {
        repos: Number(row?.repos ?? 0),
        snapshots: Number(row?.snapshots ?? 0),
        earliest: (row?.earliest as string) ?? null,
      };
    },
    () => ({ repos: 0, snapshots: 0, earliest: null }),
  );
}

export async function lastSyncedAt(): Promise<string | null> {
  return readWithFallback<string | null>(
    async () => {
      const row = await first(`SELECT MAX(last_synced_at) AS ts FROM repositories`);
      return (row?.ts as string) ?? null;
    },
    () => fallbackSourceNote().fetchedAt,
  );
}

function mapTutorial(row: Row): TutorialRecord {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: json<I18nText>(row.title_i18n, { zh: "", en: "" }),
    url: String(row.url),
    source: String(row.source),
    author: (row.author as string) ?? null,
    lang: String(row.lang) as TutorialRecord["lang"],
    difficulty: String(row.difficulty) as Difficulty,
    topics: json<string[]>(row.topics, []),
    chips: json<string[]>(row.chips, []),
    frameworks: json<string[]>(row.frameworks, []),
    goal: json<I18nText | null>(row.goal_i18n, null),
    relatedRepos: json<string[]>(row.related_repos, []),
    verifiedAt: (row.verified_at as string) ?? null,
    checkStatus: (row.check_status as TutorialRecord["checkStatus"]) ?? "unverified",
    dataOrigin: String(row.data_origin ?? "manual"),
  };
}

export async function listTutorials(): Promise<TutorialRecord[]> {
  return readWithFallback(
    async () => {
      const rows = await query(`SELECT * FROM tutorials ORDER BY lang ASC, source ASC, slug ASC`);
      return rows.map(mapTutorial);
    },
    () => fallbackTutorials(),
  );
}

export async function getTutorial(slug: string): Promise<TutorialRecord | null> {
  return readWithFallback(
    async () => {
      const row = await first(`SELECT * FROM tutorials WHERE slug = ?`, [slug]);
      return row ? mapTutorial(row) : null;
    },
    () => fallbackTutorials().find((t) => t.slug === slug) ?? null,
  );
}

export async function listChips(): Promise<ChipRecord[]> {
  return readWithFallback(
    async () => {
      const rows = await query(
        `SELECT * FROM chips ORDER BY
          CASE slug WHEN 'esp32' THEN 1 WHEN 'esp32-s3' THEN 2 WHEN 'esp32-c3' THEN 3
            WHEN 'esp32-c6' THEN 4 WHEN 'esp32-s2' THEN 5 WHEN 'esp32-h2' THEN 6 ELSE 7 END`,
      );
      return rows.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        name: String(row.name),
        family: String(row.family),
        cores: (row.cores as string) ?? null,
        clock: (row.clock as string) ?? null,
        sram: (row.sram as string) ?? null,
        flash: (row.flash as string) ?? null,
        wifi: (row.wifi as string) ?? null,
        ble: (row.ble as string) ?? null,
        threadZigbee: (row.thread_zigbee as string) ?? null,
        usb: (row.usb as string) ?? null,
        camera: (row.camera as string) ?? null,
        display: (row.display as string) ?? null,
        useCases: json<I18nText | null>(row.use_cases_i18n, null),
        boards: json<string[]>(row.boards, []),
        officialUrl: (row.official_url as string) ?? null,
        confidence: String(row.confidence ?? "unverified"),
        verifiedAt: (row.verified_at as string) ?? null,
      }));
    },
    () => fallbackChips(),
  );
}

export async function listPaths(): Promise<LearningPathRecord[]> {
  return readWithFallback(
    async () => {
      const paths = await query(`SELECT * FROM learning_paths ORDER BY sort_order ASC`);
      const steps = await query(`SELECT * FROM learning_path_steps ORDER BY path_id ASC, step_no ASC`);
      const byPath = new Map<number, LearningPathRecord["steps"]>();
      for (const step of steps) {
        const pathId = Number(step.path_id);
        const list = byPath.get(pathId) ?? [];
        list.push({
          id: Number(step.id),
          stepNo: Number(step.step_no),
          title: json<I18nText>(step.title_i18n, { zh: "", en: "" }),
          goal: json<I18nText>(step.goal_i18n, { zh: "", en: "" }),
          prereq: json<I18nText | null>(step.prereq_i18n, null),
          resources: json<LearningPathRecord["steps"][number]["resources"]>(step.resources, []),
          projects: json<string[]>(step.projects, []),
          estimate: (step.estimate as string) ?? null,
          doneWhen: json<I18nText | null>(step.done_when_i18n, null),
        });
        byPath.set(pathId, list);
      }
      return paths.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        title: json<I18nText>(row.title_i18n, { zh: "", en: "" }),
        summary: json<I18nText>(row.summary_i18n, { zh: "", en: "" }),
        level: String(row.level) as Difficulty,
        hours: (row.hours as string) ?? null,
        chips: json<string[]>(row.chips, []),
        frameworks: json<string[]>(row.frameworks, []),
        icon: (row.icon as string) ?? null,
        sortOrder: Number(row.sort_order ?? 0),
        steps: byPath.get(Number(row.id)) ?? [],
      }));
    },
    () => fallbackPaths(),
  );
}

export async function getPath(slug: string): Promise<LearningPathRecord | null> {
  const all = await listPaths();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getSyncJobs(limit = 10): Promise<Row[]> {
  return readWithFallback(
    () => query(`SELECT * FROM sync_jobs ORDER BY started_at DESC LIMIT ?`, [limit]),
    () => [],
  );
}

export async function getAdminCounts(): Promise<{
  published: number;
  pending: number;
  rejected: number;
  tutorials: number;
}> {
  return readWithFallback(
    async () => {
      const repos = await first(
        `SELECT
          SUM(CASE WHEN curation_status='published' THEN 1 ELSE 0 END) AS published,
          SUM(CASE WHEN curation_status='pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN curation_status='rejected' THEN 1 ELSE 0 END) AS rejected
         FROM repositories`,
      );
      const tut = await first(`SELECT COUNT(*) AS n FROM tutorials`);
      return {
        published: Number(repos?.published ?? 0),
        pending: Number(repos?.pending ?? 0),
        rejected: Number(repos?.rejected ?? 0),
        tutorials: Number(tut?.n ?? 0),
      };
    },
    () => ({
      published: fallbackRepos().length,
      pending: 0,
      rejected: 0,
      tutorials: fallbackTutorials().length,
    }),
  );
}

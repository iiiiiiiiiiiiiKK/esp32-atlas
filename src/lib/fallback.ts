/**
 * Build-time snapshot fallback.
 *
 * The whole catalogue already exists as source-of-truth TypeScript:
 *   · GitHub metrics  → src/data/github-snapshot.json (fetched by scripts/fetch-github.ts)
 *   · editorial layer → src/content/{curation,guides,tutorials,chips,paths}.ts
 *
 * That means every page can be rendered *without* the database. This module
 * assembles those sources into the same shapes `src/lib/repos.ts` returns, so
 * that when D1 is unavailable (network failure, quota exhaustion, outage) the
 * site degrades to a real, labelled snapshot instead of a 500 error page.
 *
 * It is deliberately read-only and dependency-free: no fetch, no D1, no
 * Date.now() at module scope, so the values are deterministic per build.
 */

import snapshot from "@/data/github-snapshot.json";
import { CURATION } from "@/content/curation";
import { GUIDES } from "@/content/guides";
import { TUTORIALS, VERIFIED_AT } from "@/content/tutorials";
import { PATHS } from "@/content/paths";
import { CHIPS } from "@/content/chips";
import type {
  ChipRecord,
  GuideContent,
  I18nText,
  LearningPathRecord,
  RepoRecord,
  TutorialRecord,
} from "./types";

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
  default_branch: string;
  homepage: string | null;
  latest_release: { tag: string; published_at: string; url: string } | null;
}

interface SnapshotFile {
  fetched_at: string;
  items: SnapshotRepo[];
}

const SNAPSHOT = snapshot as SnapshotFile;

/** When the bundled metrics were fetched — shown to the user as the data age. */
export const SNAPSHOT_FETCHED_AT = SNAPSHOT.fetched_at;

export function slugFor(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const reposByFullName = new Map(SNAPSHOT.items.map((r) => [r.full_name, r]));
const guidesByFullName = new Map(GUIDES.map((g) => [g.fullName, g]));

let cachedRepos: RepoRecord[] | null = null;

/**
 * The full published catalogue reconstructed from bundled sources.
 * Order matches the database query (stars descending) so list pages, "top
 * repos" and pagination stay consistent between the live and fallback paths.
 */
export function fallbackRepos(): RepoRecord[] {
  if (cachedRepos) return cachedRepos;
  const repos: RepoRecord[] = [];
  let id = 0;

  for (const curation of CURATION) {
    const repo = reposByFullName.get(curation.fullName);
    if (!repo) continue; // snapshot and content disagree → skip rather than invent
    id += 1;
    repos.push({
      id,
      slug: slugFor(repo.full_name),
      owner: repo.owner,
      name: repo.full_name.split("/")[1] ?? repo.full_name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      homepage: repo.homepage,
      description: repo.description,
      summary: curation.summary,
      topics: repo.topics ?? [],
      language: repo.language,
      license: repo.license,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.open_issues,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      defaultBranch: repo.default_branch,
      archived: Boolean(repo.archived),
      latestReleaseTag: repo.latest_release?.tag ?? null,
      latestReleaseAt: repo.latest_release?.published_at ?? null,
      latestReleaseUrl: repo.latest_release?.url ?? null,
      category: curation.category,
      chips: curation.chips,
      frameworks: curation.frameworks,
      difficulty: curation.difficulty,
      docScore: curation.docScore,
      demoScore: curation.demoScore,
      beginnerFriendly: curation.beginnerFriendly,
      tags: curation.tags,
      featured: curation.featured ?? false,
      dataOrigin: "github",
      firstSeenAt: SNAPSHOT.fetched_at,
      lastSyncedAt: SNAPSHOT.fetched_at,
      // Marked stale on purpose: the numbers come from the build, not a live sync.
      syncStatus: "stale",
      syncError: "bundled snapshot (database unavailable)",
    });
  }

  repos.sort((a, b) => b.stars - a.stars);
  cachedRepos = repos;
  return repos;
}

export function fallbackRepoBySlug(slug: string): RepoRecord | null {
  return fallbackRepos().find((r) => r.slug === slug) ?? null;
}

export function fallbackGuide(fullName: string): { content: GuideContent; confidence: string } | null {
  const guide = guidesByFullName.get(fullName);
  if (!guide) return null;
  return { content: guide.content, confidence: guide.confidence };
}

let cachedTutorials: TutorialRecord[] | null = null;

export function fallbackTutorials(): TutorialRecord[] {
  if (cachedTutorials) return cachedTutorials;
  cachedTutorials = TUTORIALS.map((t, index) => ({
    id: index + 1,
    slug: t.slug,
    title: t.title,
    url: t.url,
    source: t.source,
    author: t.author ?? null,
    lang: t.lang,
    difficulty: t.difficulty,
    topics: t.topics,
    chips: t.chips,
    frameworks: t.frameworks,
    goal: t.goal,
    relatedRepos: t.relatedRepos,
    verifiedAt: VERIFIED_AT,
    checkStatus: "ok" as const,
    dataOrigin: "manual",
  }));
  return cachedTutorials;
}

let cachedChips: ChipRecord[] | null = null;

export function fallbackChips(): ChipRecord[] {
  if (cachedChips) return cachedChips;
  cachedChips = CHIPS.map((chip, index) => ({
    id: index + 1,
    slug: chip.slug,
    name: chip.name,
    family: chip.family,
    cores: chip.cores,
    clock: chip.clock,
    sram: chip.sram,
    flash: chip.flash,
    wifi: chip.wifi,
    ble: chip.ble,
    threadZigbee: chip.threadZigbee,
    usb: chip.usb,
    camera: chip.camera,
    display: chip.display,
    useCases: chip.useCases as I18nText,
    boards: chip.boards,
    officialUrl: chip.officialUrl,
    confidence: chip.confidence,
    verifiedAt: VERIFIED_AT,
  }));
  return cachedChips;
}

let cachedPaths: LearningPathRecord[] | null = null;

export function fallbackPaths(): LearningPathRecord[] {
  if (cachedPaths) return cachedPaths;
  cachedPaths = PATHS.map((path, pathIndex) => ({
    id: pathIndex + 1,
    slug: path.slug,
    title: path.title,
    summary: path.summary,
    level: path.level,
    hours: path.hours,
    chips: path.chips,
    frameworks: path.frameworks,
    icon: path.icon,
    sortOrder: pathIndex,
    steps: path.steps.map((step, stepIndex) => ({
      id: pathIndex * 100 + stepIndex + 1,
      stepNo: step.no,
      title: step.title,
      goal: step.goal,
      prereq: step.prereq ?? null,
      resources: step.resources,
      projects: step.projects,
      estimate: step.estimate,
      doneWhen: step.doneWhen,
    })),
  }));
  return cachedPaths;
}

/** Title used to label fallback data in the UI. */
export function fallbackSourceNote(): { fetchedAt: string; repoCount: number } {
  return { fetchedAt: SNAPSHOT_FETCHED_AT, repoCount: fallbackRepos().length };
}

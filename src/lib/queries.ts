import {
  matchesFilters,
  parseFilters,
  recommendScore,
  sortRepos,
  tokenize,
  PAGE_SIZE,
} from "./search";
import { listRepos, listTutorials } from "./repos";
import type { ExploreFilters, RepoRecord, SortKey } from "./types";

export interface ExploreResult {
  items: RepoRecord[];
  total: number;
  all: RepoRecord[];
  totalPages: number;
  page: number;
  tutorialRepos: Set<string>;
  reasons: Map<number, string[]>;
}

/**
 * Filtering runs over the published corpus (small, curated). Scoring and
 * filtering logic is pure and unit tested in `src/lib/search.test.ts`.
 */
export async function explore(
  params: Record<string, string | string[] | undefined>,
  overrides: Partial<ExploreFilters> = {},
): Promise<ExploreResult> {
  const filters: ExploreFilters = { ...parseFilters(params), ...overrides };
  const [repos, tutorials] = await Promise.all([listRepos(1000), listTutorials()]);
  const tutorialRepos = new Set(tutorials.flatMap((t) => t.relatedRepos));
  const now = Date.now();
  const matched = repos.filter((r) => matchesFilters(r, filters, { now, tutorialRepos }));
  const ctx = { now, terms: tokenize(filters.q), goal: null };
  const sorted = sortRepos(matched, filters.sort as SortKey, ctx);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reasons = new Map<number, string[]>();
  for (const repo of items) reasons.set(repo.id, recommendScore(repo, ctx).reasons);
  return { items, total, all: sorted, totalPages, page, tutorialRepos, reasons };
}

export async function corpusSummary() {
  const [repos, tutorials] = await Promise.all([listRepos(1000), listTutorials()]);
  const now = Date.now();
  const day = 86400000;
  const hot = repos.filter((r) => r.pushedAt && now - Date.parse(r.pushedAt) < 7 * day);
  const active = repos.filter((r) => r.pushedAt && now - Date.parse(r.pushedAt) < 90 * day);
  const beginners = repos.filter((r) => r.beginnerFriendly);
  const fresh = [...repos].sort((a, b) => (b.firstSeenAt ?? "").localeCompare(a.firstSeenAt ?? ""));
  const trending = sortRepos(active, "recommended", { now });
  return { repos, tutorials, hot, active, beginners, fresh, trending };
}

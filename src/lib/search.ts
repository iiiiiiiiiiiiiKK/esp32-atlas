import type {
  Category,
  Difficulty,
  ExploreFilters,
  RepoRecord,
  SortKey,
} from "@/lib/types";

export const PAGE_SIZE = 12;

const DAY = 24 * 60 * 60 * 1000;

export function daysSince(iso: string | null, now = Date.now()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (now - t) / DAY;
}

/** Activity buckets used across radar/home. Never claims growth that we did not measure. */
export function activityBucket(pushedAt: string | null, now = Date.now()): "hot" | "warm" | "cold" | "stale" {
  const d = daysSince(pushedAt, now);
  if (d <= 7) return "hot";
  if (d <= 45) return "warm";
  if (d <= 365) return "cold";
  return "stale";
}

export function releaseRecency(iso: string | null, now = Date.now()): "recent" | "older" | "none" {
  if (!iso) return "none";
  return daysSince(iso, now) <= 180 ? "recent" : "older";
}

export interface RecommendContext {
  now?: number;
  /** Free-text query already tokenised. */
  terms?: string[];
  /** Category the user picked from the goal shortcuts. */
  goal?: Category | null;
}

/**
 * Explainable relevance score. Total stars are capped and never dominate:
 * freshness, documentation, beginner fit, demo availability and text match
 * each contribute a bounded amount. See docs/ranking.md.
 */
export function recommendScore(repo: RepoRecord, ctx: RecommendContext = {}): {
  score: number;
  reasons: string[];
} {
  const now = ctx.now ?? Date.now();
  const reasons: string[] = [];
  let score = 0;

  const age = daysSince(repo.pushedAt, now);
  const freshness = age <= 7 ? 30 : age <= 30 ? 24 : age <= 90 ? 16 : age <= 365 ? 8 : 0;
  score += freshness;
  if (freshness >= 24) reasons.push("active");
  else if (freshness === 0) reasons.push("inactive");

  // Stars contribute logarithmically, hard-capped at 25 points.
  const starPoints = Math.min(25, Math.log10(Math.max(repo.stars, 1)) * 6);
  score += starPoints;
  if (repo.stars >= 5000) reasons.push("popular");

  if (repo.docScore !== null) {
    score += Math.round((repo.docScore / 100) * 12);
    if (repo.docScore >= 80) reasons.push("documented");
  }
  if (repo.demoScore !== null) {
    score += Math.round((repo.demoScore / 100) * 8);
    if (repo.demoScore >= 70) reasons.push("demo");
  }
  if (repo.beginnerFriendly) {
    score += 8;
    reasons.push("beginner");
  }
  if (repo.difficulty === "beginner") score += 4;
  if (repo.latestReleaseAt && daysSince(repo.latestReleaseAt, now) <= 180) {
    score += 6;
    reasons.push("release");
  }
  if (repo.featured) {
    score += 6;
    reasons.push("editorial");
  }
  if (repo.archived) {
    score -= 30;
    reasons.push("archived");
  }
  if (repo.syncStatus !== "ok") score -= 4;

  const terms = ctx.terms ?? [];
  if (terms.length > 0) {
    const haystack = [
      repo.name,
      repo.fullName,
      repo.description ?? "",
      repo.summary?.zh ?? "",
      repo.summary?.en ?? "",
      repo.topics.join(" "),
      repo.tags.join(" "),
      repo.chips.join(" "),
      repo.frameworks.join(" "),
      repo.category ?? "",
    ]
      .join(" ")
      .toLowerCase();
    let hits = 0;
    for (const term of terms) if (haystack.includes(term)) hits += 1;
    score += hits * 14;
    if (hits > 0) reasons.push("match");
  }

  if (ctx.goal && repo.category === ctx.goal) {
    score += 18;
    reasons.push("goal");
  }
  if (ctx.goal && repo.category !== ctx.goal) score -= 6;

  return { score: Math.round(score), reasons };
}

export function sortRepos(
  repos: RepoRecord[],
  sort: SortKey,
  ctx: RecommendContext = {},
): RepoRecord[] {
  const copy = [...repos];
  switch (sort) {
    case "stars":
      return copy.sort((a, b) => b.stars - a.stars);
    case "updated":
      return copy.sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""));
    case "new":
      return copy.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    case "forks":
      return copy.sort((a, b) => b.forks - a.forks);
    case "recommended":
    default:
      return copy.sort((a, b) => {
        const sb = recommendScore(b, ctx).score;
        const sa = recommendScore(a, ctx).score;
        if (sb !== sa) return sb - sa;
        return b.stars - a.stars;
      });
  }
}

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .slice(0, 8);
}

export interface Filterable {
  category?: string | null;
  chips: string[];
  frameworks: string[];
  difficulty?: string | null;
  language?: string | null;
  license?: string | null;
  beginnerFriendly: boolean;
  docScore?: number | null;
  demoScore?: number | null;
  pushedAt?: string | null;
  latestReleaseAt?: string | null;
  archived: boolean;
  stars: number;
  description?: string | null;
  name: string;
  fullName: string;
  topics: string[];
  tags: string[];
  summary?: { zh: string; en: string } | null;
}

export const FLAG_KEYS = [
  "active",
  "release",
  "documented",
  "beginner",
  "tutorial",
  "demo",
  "video",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

export interface MatchOptions {
  now?: number;
  /** Whether a tutorial exists for the repository (slug list). */
  tutorialRepos?: Set<string>;
}

/** Pure, explainable filtering used by /explore and unit tested. */
export function matchesFilters(
  item: Filterable,
  filters: ExploreFilters,
  options: MatchOptions = {},
): boolean {
  const now = options.now ?? Date.now();
  if (filters.q) {
    const terms = tokenize(filters.q);
    const haystack = [
      item.name,
      item.fullName,
      item.description ?? "",
      item.summary?.zh ?? "",
      item.summary?.en ?? "",
      item.topics.join(" "),
      item.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    if (!terms.every((t) => haystack.includes(t))) return false;
  }
  if (filters.category.length > 0 && (!item.category || !filters.category.includes(item.category))) {
    return false;
  }
  if (filters.chips.length > 0 && !filters.chips.some((c) => item.chips.includes(c))) return false;
  if (
    filters.frameworks.length > 0 &&
    !filters.frameworks.some((f) => item.frameworks.includes(f))
  ) {
    return false;
  }
  if (filters.difficulty.length > 0 && (!item.difficulty || !filters.difficulty.includes(item.difficulty))) {
    return false;
  }
  if (filters.language.length > 0 && (!item.language || !filters.language.includes(item.language))) {
    return false;
  }
  if (filters.license.length > 0 && (!item.license || !filters.license.includes(item.license))) {
    return false;
  }
  for (const flag of filters.flags as FlagKey[]) {
    if (flag === "active" && daysSince(item.pushedAt ?? null, now) > 90) return false;
    if (flag === "release" && releaseRecency(item.latestReleaseAt ?? null, now) !== "recent") return false;
    if (flag === "documented" && (item.docScore ?? 0) < 70) return false;
    if (flag === "beginner" && !item.beginnerFriendly) return false;
    if (flag === "demo" && (item.demoScore ?? 0) < 50) return false;
    if (flag === "tutorial" && !(options.tutorialRepos?.has(item.fullName) ?? false)) return false;
  }
  return true;
}

export function parseFilters(params: Record<string, string | string[] | undefined>): ExploreFilters {
  const list = (key: string): string[] => {
    const raw = params[key];
    if (!raw) return [];
    const values = Array.isArray(raw) ? raw : raw.split(",");
    return values.map((v) => v.trim()).filter(Boolean).slice(0, 20);
  };
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: SortKey = (["recommended", "stars", "updated", "new", "forks"] as const).includes(
    (sortRaw ?? "recommended") as SortKey,
  )
    ? ((sortRaw ?? "recommended") as SortKey)
    : "recommended";
  const pageRaw = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Math.min(50, Number.parseInt(pageRaw ?? "1", 10) || 1));
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  return {
    q: q.slice(0, 120),
    category: list("category"),
    chips: list("chip"),
    frameworks: list("framework"),
    difficulty: list("difficulty"),
    language: list("language"),
    license: list("license"),
    flags: list("flag").filter((f) => (FLAG_KEYS as readonly string[]).includes(f)),
    sort,
    page,
  };
}

export function filtersToQuery(filters: ExploreFilters): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.category.length) sp.set("category", filters.category.join(","));
  if (filters.chips.length) sp.set("chip", filters.chips.join(","));
  if (filters.frameworks.length) sp.set("framework", filters.frameworks.join(","));
  if (filters.difficulty.length) sp.set("difficulty", filters.difficulty.join(","));
  if (filters.language.length) sp.set("language", filters.language.join(","));
  if (filters.license.length) sp.set("license", filters.license.join(","));
  if (filters.flags.length) sp.set("flag", filters.flags.join(","));
  if (filters.sort !== "recommended") sp.set("sort", filters.sort);
  if (filters.page > 1) sp.set("page", String(filters.page));
  return sp.toString();
}

export function activeFilterCount(filters: ExploreFilters): number {
  return (
    (filters.q ? 1 : 0) +
    filters.category.length +
    filters.chips.length +
    filters.frameworks.length +
    filters.difficulty.length +
    filters.language.length +
    filters.license.length +
    filters.flags.length
  );
}

export const DIFFICULTY_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];

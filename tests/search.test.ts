import { describe, expect, it } from "vitest";
import {
  activityBucket,
  activeFilterCount,
  daysSince,
  filtersToQuery,
  matchesFilters,
  parseFilters,
  recommendScore,
  releaseRecency,
  sortRepos,
  tokenize,
} from "@/lib/search";
import type { ExploreFilters, RepoRecord } from "@/lib/types";

const NOW = Date.parse("2026-10-25T12:00:00Z");

function repo(overrides: Partial<RepoRecord> = {}): RepoRecord {
  return {
    id: 1,
    slug: "owner-repo",
    owner: "owner",
    name: "repo",
    fullName: "owner/repo",
    htmlUrl: "https://github.com/owner/repo",
    homepage: null,
    description: "An ESP32 LED controller",
    summary: { zh: "灯带控制器", en: "LED strip controller" },
    topics: ["led", "esp32"],
    language: "C++",
    license: "MIT",
    stars: 1000,
    forks: 100,
    openIssues: 20,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2026-10-20T00:00:00Z",
    pushedAt: "2026-10-20T00:00:00Z",
    defaultBranch: "main",
    archived: false,
    latestReleaseTag: "v1.2.3",
    latestReleaseAt: "2026-09-01T00:00:00Z",
    latestReleaseUrl: null,
    category: "led",
    chips: ["esp32"],
    frameworks: ["arduino"],
    difficulty: "beginner",
    docScore: 80,
    demoScore: 70,
    beginnerFriendly: true,
    tags: ["led"],
    featured: false,
    dataOrigin: "github",
    firstSeenAt: "2026-10-01T00:00:00Z",
    lastSyncedAt: "2026-10-25T00:00:00Z",
    syncStatus: "ok",
    syncError: null,
    ...overrides,
  };
}

const emptyFilters: ExploreFilters = {
  q: "",
  category: [],
  chips: [],
  frameworks: [],
  difficulty: [],
  language: [],
  license: [],
  flags: [],
  sort: "recommended",
  page: 1,
};

describe("daysSince / activityBucket", () => {
  it("returns Infinity for missing timestamps instead of pretending it is fresh", () => {
    expect(daysSince(null, NOW)).toBe(Number.POSITIVE_INFINITY);
    expect(daysSince("not-a-date", NOW)).toBe(Number.POSITIVE_INFINITY);
  });

  it("buckets activity by recency", () => {
    expect(activityBucket("2026-10-24T00:00:00Z", NOW)).toBe("hot");
    expect(activityBucket("2026-10-01T00:00:00Z", NOW)).toBe("warm");
    expect(activityBucket("2026-01-01T00:00:00Z", NOW)).toBe("cold");
    expect(activityBucket("2020-01-01T00:00:00Z", NOW)).toBe("stale");
    expect(activityBucket(null, NOW)).toBe("stale");
  });

  it("classifies release recency", () => {
    expect(releaseRecency("2026-09-01T00:00:00Z", NOW)).toBe("recent");
    expect(releaseRecency("2024-01-01T00:00:00Z", NOW)).toBe("older");
    expect(releaseRecency(null, NOW)).toBe("none");
  });
});

describe("tokenize", () => {
  it("drops single characters and caps the term count", () => {
    expect(tokenize("AI 语音 a bbb")).toEqual(["ai", "语音", "bbb"]);
    expect(tokenize("a b c d")).toHaveLength(0);
    expect(tokenize("one two three four five six seven eight nine ten")).toHaveLength(8);
  });
});

describe("matchesFilters", () => {
  it("matches everything when no filters are set", () => {
    expect(matchesFilters(repo(), emptyFilters, { now: NOW })).toBe(true);
  });

  it("requires all query terms to match (AND semantics)", () => {
    expect(matchesFilters(repo(), { ...emptyFilters, q: "led esp32" }, { now: NOW })).toBe(true);
    expect(matchesFilters(repo(), { ...emptyFilters, q: "led camera" }, { now: NOW })).toBe(false);
  });

  it("searches localized summaries, not only the GitHub description", () => {
    const onlyZh = repo({ description: "unrelated text" });
    expect(matchesFilters(onlyZh, { ...emptyFilters, q: "灯带" }, { now: NOW })).toBe(true);
  });

  it("filters by category, chip, framework and difficulty", () => {
    expect(matchesFilters(repo(), { ...emptyFilters, category: ["ai-voice"] }, { now: NOW })).toBe(false);
    expect(matchesFilters(repo(), { ...emptyFilters, chips: ["esp32-s3"] }, { now: NOW })).toBe(false);
    expect(matchesFilters(repo(), { ...emptyFilters, frameworks: ["esphome"] }, { now: NOW })).toBe(false);
    expect(matchesFilters(repo(), { ...emptyFilters, difficulty: ["beginner"] }, { now: NOW })).toBe(true);
  });

  it("applies the active flag using the real push date", () => {
    const stale = repo({ pushedAt: "2024-01-01T00:00:00Z" });
    expect(matchesFilters(stale, { ...emptyFilters, flags: ["active"] }, { now: NOW })).toBe(false);
    expect(matchesFilters(repo(), { ...emptyFilters, flags: ["active"] }, { now: NOW })).toBe(true);
  });

  it("requires an actual tutorial link for the tutorial flag", () => {
    expect(matchesFilters(repo(), { ...emptyFilters, flags: ["tutorial"] }, { now: NOW })).toBe(false);
    expect(
      matchesFilters(repo(), { ...emptyFilters, flags: ["tutorial"] }, {
        now: NOW,
        tutorialRepos: new Set(["owner/repo"]),
      }),
    ).toBe(true);
  });

  it("never treats a missing score as documented", () => {
    const noScore = repo({ docScore: null });
    expect(matchesFilters(noScore, { ...emptyFilters, flags: ["documented"] }, { now: NOW })).toBe(false);
  });
});

describe("recommendScore", () => {
  it("rewards freshness, docs and beginner fit", () => {
    const fresh = recommendScore(repo(), { now: NOW });
    const stale = recommendScore(repo({ pushedAt: "2021-01-01T00:00:00Z", latestReleaseAt: null }), { now: NOW });
    expect(fresh.score).toBeGreaterThan(stale.score);
    expect(fresh.reasons).toContain("active");
    expect(fresh.reasons).toContain("documented");
    expect(fresh.reasons).toContain("beginner");
  });

  it("penalises archived repositories", () => {
    const archived = recommendScore(repo({ archived: true }), { now: NOW });
    const live = recommendScore(repo(), { now: NOW });
    expect(archived.score).toBeLessThan(live.score);
    expect(archived.reasons).toContain("archived");
  });

  it("caps the stars contribution so stars alone cannot win", () => {
    const small = recommendScore(repo({ stars: 10, pushedAt: "2021-01-01T00:00:00Z" }), { now: NOW });
    const huge = recommendScore(repo({ stars: 500000, pushedAt: "2021-01-01T00:00:00Z" }), { now: NOW });
    expect(huge.score - small.score).toBeLessThanOrEqual(25);
  });

  it("boosts exact goal category matches", () => {
    const withGoal = recommendScore(repo(), { now: NOW, goal: "led" });
    const otherGoal = recommendScore(repo(), { now: NOW, goal: "robotics" });
    expect(withGoal.score).toBeGreaterThan(otherGoal.score);
  });

  it("adds points per keyword hit", () => {
    const hit = recommendScore(repo(), { now: NOW, terms: ["led"] });
    const miss = recommendScore(repo(), { now: NOW, terms: ["zzz"] });
    expect(hit.score - miss.score).toBe(14);
  });
});

describe("sortRepos", () => {
  const a = repo({ id: 1, stars: 10, pushedAt: "2025-01-01T00:00:00Z", forks: 5 });
  const b = repo({ id: 2, stars: 50, pushedAt: "2026-10-20T00:00:00Z", forks: 500 });
  const c = repo({ id: 3, stars: 30, pushedAt: "2026-01-01T00:00:00Z", forks: 50 });

  it("sorts by stars, recency and forks", () => {
    expect(sortRepos([a, b, c], "stars").map((r) => r.id)).toEqual([2, 3, 1]);
    expect(sortRepos([a, b, c], "updated").map((r) => r.id)).toEqual([2, 3, 1]);
    expect(sortRepos([a, b, c], "forks").map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it("tolerates missing push dates without throwing", () => {
    const noDate = repo({ id: 4, pushedAt: null });
    expect(() => sortRepos([a, noDate], "updated")).not.toThrow();
  });
});

describe("parseFilters / filtersToQuery", () => {
  it("parses comma lists and clamps the page", () => {
    const parsed = parseFilters({ category: "led,display", page: "999", sort: "nonsense" });
    expect(parsed.category).toEqual(["led", "display"]);
    expect(parsed.page).toBe(50);
    expect(parsed.sort).toBe("recommended");
  });

  it("drops unknown flags", () => {
    expect(parseFilters({ flag: "active,hacked" }).flags).toEqual(["active"]);
  });

  it("truncates over-long queries", () => {
    expect(parseFilters({ q: "x".repeat(500) }).q).toHaveLength(120);
  });

  it("round-trips filters into a shareable query string", () => {
    const parsed = parseFilters({ q: "led", category: "led", flag: "active", sort: "stars", page: "2" });
    const qs = filtersToQuery(parsed);
    const again = parseFilters(Object.fromEntries(new URLSearchParams(qs)));
    expect(again.q).toBe("led");
    expect(again.category).toEqual(["led"]);
    expect(again.flags).toEqual(["active"]);
    expect(again.sort).toBe("stars");
    expect(again.page).toBe(2);
  });

  it("omits default values from the URL", () => {
    expect(filtersToQuery(emptyFilters)).toBe("");
  });

  it("counts active filters for the clear button", () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(activeFilterCount({ ...emptyFilters, q: "x", category: ["led"], flags: ["active"] })).toBe(3);
  });
});

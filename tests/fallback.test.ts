import { describe, expect, it } from "vitest";
import {
  SNAPSHOT_FETCHED_AT,
  fallbackChips,
  fallbackGuide,
  fallbackPaths,
  fallbackRepoBySlug,
  fallbackRepos,
  fallbackSourceNote,
  fallbackTutorials,
  slugFor,
} from "@/lib/fallback";

/**
 * The degraded-mode data path must be trustworthy on its own: during a D1
 * outage these values are what every page renders, so they get the same
 * integrity guarantees as the database.
 */

describe("fallback catalogue", () => {
  it("reconstructs every curated repository from bundled sources", () => {
    const repos = fallbackRepos();
    expect(repos.length).toBeGreaterThanOrEqual(30);
    for (const repo of repos) {
      expect(repo.fullName).toMatch(/^[\w.-]+\/[\w.-]+$/);
      expect(repo.htmlUrl).toMatch(/^https:\/\/github\.com\//);
      expect(repo.summary?.zh.length ?? 0).toBeGreaterThan(0);
      expect(repo.summary?.en.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("keeps ids stable and unique so guide lookups work", () => {
    const repos = fallbackRepos();
    const ids = repos.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Calling twice must not renumber anything (memoised).
    expect(fallbackRepos().map((r) => r.id)).toEqual(ids);
  });

  it("orders by stars descending like the live query", () => {
    const stars = fallbackRepos().map((r) => r.stars);
    expect([...stars].sort((a, b) => b - a)).toEqual(stars);
  });

  it("marks itself stale — never pretends to be a live sync", () => {
    for (const repo of fallbackRepos()) {
      expect(repo.syncStatus).toBe("stale");
      expect(repo.lastSyncedAt).toBe(SNAPSHOT_FETCHED_AT);
    }
  });

  it("resolves repositories by the same slug the router uses", () => {
    const repo = fallbackRepoBySlug("78-xiaozhi-esp32");
    expect(repo?.fullName).toBe("78/xiaozhi-esp32");
    expect(fallbackRepoBySlug("does-not-exist")).toBeNull();
  });

  it("serves a guide for a repository that has one, keyed by full name", () => {
    const guide = fallbackGuide("78/xiaozhi-esp32");
    expect(guide).not.toBeNull();
    expect(guide?.content.quickStart.length).toBeGreaterThan(0);
    expect(fallbackGuide("wled/WLED")).not.toBeNull();
    expect(fallbackGuide("nobody/nothing")).toBeNull();
  });

  it("exposes tutorials, chips and paths without the database", () => {
    expect(fallbackTutorials().length).toBeGreaterThanOrEqual(40);
    expect(fallbackChips().length).toBe(7);
    expect(fallbackPaths().length).toBeGreaterThanOrEqual(10);
    for (const path of fallbackPaths()) {
      expect(path.steps.length).toBeGreaterThan(0);
      expect(path.steps[0].goal.zh.length).toBeGreaterThan(0);
    }
  });

  it("reports a source note with a real timestamp", () => {
    const note = fallbackSourceNote();
    expect(Number.isNaN(Date.parse(note.fetchedAt))).toBe(false);
    expect(note.repoCount).toBeGreaterThan(0);
  });
});

describe("slugFor", () => {
  it("matches the slugs generated for the database seed", () => {
    expect(slugFor("78/xiaozhi-esp32")).toBe("78-xiaozhi-esp32");
    expect(slugFor("espressif/arduino-esp32")).toBe("espressif-arduino-esp32");
    expect(slugFor("HASwitchPlate/openHASP")).toBe("haswitchplate-openhasp");
  });
});

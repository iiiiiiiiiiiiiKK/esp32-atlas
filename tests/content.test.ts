import { describe, expect, it } from "vitest";
import { CURATION } from "@/content/curation";
import { GUIDES } from "@/content/guides";
import { CHIPS } from "@/content/chips";
import { PATHS } from "@/content/paths";
import { TUTORIALS } from "@/content/tutorials";

/**
 * Content integrity tests. These catch the failure mode that matters most for a
 * curated directory: fabricated or broken references between records.
 */

describe("curation ←→ github snapshot", () => {
  it("every editorial entry has a curated summary in both languages", () => {
    for (const entry of CURATION) {
      expect(entry.summary.zh.length, entry.fullName).toBeGreaterThan(10);
      expect(entry.summary.en.length, entry.fullName).toBeGreaterThan(10);
    }
  });

  it("never marks a repository both beginner friendly and advanced", () => {
    for (const entry of CURATION) {
      if (entry.difficulty === "advanced") {
        expect(entry.beginnerFriendly, entry.fullName).toBe(false);
      }
    }
  });

  it("keeps editorial scores inside 0-100", () => {
    for (const entry of CURATION) {
      expect(entry.docScore).toBeGreaterThanOrEqual(0);
      expect(entry.docScore).toBeLessThanOrEqual(100);
      expect(entry.demoScore).toBeGreaterThanOrEqual(0);
      expect(entry.demoScore).toBeLessThanOrEqual(100);
    }
  });

  it("uses only known chip slugs", () => {
    const known = new Set(CHIPS.map((c) => c.slug));
    for (const entry of CURATION) {
      for (const chip of entry.chips) {
        expect(known.has(chip as never), `${entry.fullName} → ${chip}`).toBe(true);
      }
    }
  });

  it("has no duplicate repository entries", () => {
    const names = CURATION.map((c) => c.fullName);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("guides", () => {
  it("only reference repositories that exist in the catalogue", () => {
    const known = new Set(CURATION.map((c) => c.fullName));
    for (const guide of GUIDES) {
      expect(known.has(guide.fullName), guide.fullName).toBe(true);
    }
  });

  it("has at most one guide per repository", () => {
    const names = GUIDES.map((g) => g.fullName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("ships bilingual quick starts with real steps", () => {
    for (const guide of GUIDES) {
      expect(guide.content.quickStart.length, guide.fullName).toBeGreaterThan(0);
      for (const step of guide.content.quickStart) {
        expect(step.step.zh.length).toBeGreaterThan(0);
        expect(step.detail.en.length).toBeGreaterThan(0);
      }
    }
  });

  it("links only https URLs", () => {
    for (const guide of GUIDES) {
      for (const doc of guide.content.docs) {
        expect(doc.url.startsWith("https://"), `${guide.fullName} → ${doc.url}`).toBe(true);
      }
    }
  });

  it("marks the unverified guide as unverified", () => {
    const unverified = GUIDES.filter((g) => g.confidence === "unverified");
    expect(unverified.length).toBeGreaterThan(0);
    for (const guide of unverified) {
      expect(guide.content.maintenance.en.length).toBeGreaterThan(0);
    }
  });
});

describe("tutorials", () => {
  it("only links https sources", () => {
    for (const tutorial of TUTORIALS) {
      expect(tutorial.url.startsWith("https://"), tutorial.slug).toBe(true);
    }
  });

  it("has unique slugs", () => {
    const slugs = TUTORIALS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses valid languages and difficulties", () => {
    for (const tutorial of TUTORIALS) {
      expect(["zh", "en"]).toContain(tutorial.lang);
      expect(["beginner", "intermediate", "advanced"]).toContain(tutorial.difficulty);
    }
  });

  it("references only known repositories", () => {
    const known = new Set(CURATION.map((c) => c.fullName));
    for (const tutorial of TUTORIALS) {
      for (const repo of tutorial.relatedRepos) {
        expect(known.has(repo), `${tutorial.slug} → ${repo}`).toBe(true);
      }
    }
  });

  it("states a learning goal in both languages", () => {
    for (const tutorial of TUTORIALS) {
      expect(tutorial.goal.zh.length, tutorial.slug).toBeGreaterThan(5);
      expect(tutorial.goal.en.length, tutorial.slug).toBeGreaterThan(5);
    }
  });
});

describe("learning paths", () => {
  it("has unique slugs and sequential step numbers", () => {
    const slugs = PATHS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const path of PATHS) {
      const numbers = path.steps.map((s) => s.no);
      expect(numbers).toEqual(numbers.map((_, i) => i + 1));
    }
  });

  it("gives every step a goal, an estimate and completion criteria", () => {
    for (const path of PATHS) {
      for (const step of path.steps) {
        expect(step.goal.zh.length, `${path.slug}#${step.no}`).toBeGreaterThan(5);
        expect(step.estimate.length, `${path.slug}#${step.no}`).toBeGreaterThan(0);
        expect(step.doneWhen.en.length, `${path.slug}#${step.no}`).toBeGreaterThan(10);
      }
    }
  });

  it("only references known repositories", () => {
    const known = new Set(CURATION.map((c) => c.fullName));
    for (const path of PATHS) {
      for (const step of path.steps) {
        for (const repo of step.projects) {
          expect(known.has(repo), `${path.slug} → ${repo}`).toBe(true);
        }
      }
    }
  });

  it("declares ten paths as promised on the landing page", () => {
    expect(PATHS.length).toBeGreaterThanOrEqual(10);
  });
});

describe("chips", () => {
  it("flags at least one spec set as unverified rather than guessing", () => {
    expect(CHIPS.some((c) => c.confidence === "unverified")).toBe(true);
  });

  it("links official Espressif pages over https", () => {
    for (const chip of CHIPS) {
      expect(chip.officialUrl.startsWith("https://www.espressif.com/"), chip.slug).toBe(true);
    }
  });

  it("keeps on-chip flash separate from module flash wording", () => {
    for (const chip of CHIPS) {
      expect(chip.flash.toLowerCase()).not.toMatch(/^\d+\s*(mb|kb)\s*flash$/);
    }
  });
});

import { describe, expect, it } from "vitest";
import { formatNumber, formatDate, relativeDays, repoSlug } from "@/lib/format";
import { t } from "@/lib/i18n";

/**
 * These helpers decide what numbers and dates the user sees, so they get their
 * own tests — a wrong locale or timezone here silently lies about freshness.
 */

describe("formatNumber", () => {
  it("keeps small numbers exact and compacts large ones", () => {
    expect(formatNumber(42, "en")).toBe("42");
    expect(formatNumber(32000, "en")).toMatch(/32K/i);
    expect(formatNumber(32000, "zh")).toMatch(/3\.2/);
  });
});

describe("formatDate", () => {
  it("formats ISO timestamps in UTC so the date never shifts per timezone", () => {
    expect(formatDate("2026-10-25T23:30:00Z", "en")).toContain("2026");
    expect(formatDate("2026-10-25T23:30:00Z", "en")).toContain("25");
  });

  it("returns an em dash for missing or invalid dates instead of 'Invalid Date'", () => {
    expect(formatDate(null, "en")).toBe("—");
    expect(formatDate("nonsense", "zh")).toBe("—");
  });
});

describe("relativeDays", () => {
  const now = Date.parse("2026-10-25T12:00:00Z");

  it("describes recent timestamps in both languages", () => {
    expect(relativeDays("2026-10-25T09:00:00Z", "en", now)).toBe("today");
    expect(relativeDays("2026-10-24T09:00:00Z", "en", now)).toBe("yesterday");
    expect(relativeDays("2026-10-24T09:00:00Z", "zh", now)).toBe("昨天");
  });

  it("falls back to months and years", () => {
    expect(relativeDays("2026-08-25T12:00:00Z", "en", now)).toContain("mo");
    expect(relativeDays("2023-10-25T12:00:00Z", "en", now)).toContain("yr");
  });

  it("returns an em dash for missing timestamps", () => {
    expect(relativeDays(null, "en", now)).toBe("—");
  });
});

describe("repoSlug", () => {
  it("produces URL-safe slugs", () => {
    expect(repoSlug("78/xiaozhi-esp32")).toBe("78-xiaozhi-esp32");
    expect(repoSlug("espressif/arduino-esp32")).toBe("espressif-arduino-esp32");
    expect(repoSlug("a/__b__")).toBe("a-b");
  });
});

describe("t (i18n text picker)", () => {
  it("prefers the requested language and falls back deterministically", () => {
    expect(t({ zh: "中文", en: "English" }, "en")).toBe("English");
    expect(t({ zh: "中文", en: "" }, "en")).toBe("中文");
    expect(t(null, "zh")).toBe("");
  });
});

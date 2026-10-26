import { describe, expect, it } from "vitest";
import { explainReason } from "@/lib/degraded-copy";

/**
 * The degraded banner is the only thing standing between "an outage" and
 * "a user silently reading stale star counts". These tests pin the copy so a
 * future refactor cannot quietly downgrade it to a raw stack-trace dump.
 */

const QUOTA =
  "D1_ERROR: Your account has exceeded D1's free tier daily row read limit. Upgrade to a paid plan or wait until tomorrow (midnight UTC) to continue. See https://developers.cloudflare.com/d1/platform/limits/ for more details.";

describe("explainReason", () => {
  it("recognises the D1 free-tier row-read limit and explains the reset", () => {
    const zh = explainReason(QUOTA, "zh");
    expect(zh.kind).toBe("d1-quota");
    expect(zh.summary).toContain("每日行读取");
    expect(zh.detail).toContain("UTC");
    // The explanation must not be the raw driver string.
    expect(zh.summary).not.toContain("D1_ERROR");

    const en = explainReason(QUOTA, "en");
    expect(en.kind).toBe("d1-quota");
    expect(en.summary).toContain("daily row-read limit");
    expect(en.summary).not.toContain("https://");
  });

  it("explains that the quota is account-wide, not per project", () => {
    const zh = explainReason(QUOTA, "zh");
    expect(zh.detail).toContain("同一账号");
    const en = explainReason(QUOTA, "en");
    expect(en.detail).toContain("per account");
  });

  it("labels the FORCE_DEGRADED simulation as not a real fault", () => {
    for (const lang of ["zh", "en"] as const) {
      const r = explainReason("forced degraded mode (FORCE_DEGRADED=1)", lang);
      expect(r.kind).toBe("forced");
      expect(r.summary).toMatch(/FORCE_DEGRADED/);
    }
  });

  it("falls back gracefully for generic D1 errors", () => {
    const r = explainReason("D1_ERROR: some other failure", "en");
    expect(r.kind).toBe("d1-unavailable");
    expect(r.summary.length).toBeGreaterThan(10);
  });

  it("recognises network failures", () => {
    const r = explainReason("fetch failed: ECONNRESET", "zh");
    expect(r.kind).toBe("network");
  });

  it("never returns an empty summary, even for null or junk input", () => {
    for (const raw of [null, "", "???", "kaboom"]) {
      const r = explainReason(raw, "zh");
      expect(r.summary.length).toBeGreaterThan(0);
      expect(r.kind).toBe("unknown");
    }
  });

  it("keeps the copy free of unbreakable long URLs", () => {
    for (const lang of ["zh", "en"] as const) {
      const r = explainReason(QUOTA, lang);
      const text = `${r.summary} ${r.detail ?? ""}`;
      // No http(s) URLs in the human copy — those live in the technical detail.
      expect(text).not.toMatch(/https?:\/\//);
      // And no single token longer than 40 chars that could overflow a phone.
      const longest = Math.max(...text.split(/\s+/).map((t) => t.length));
      expect(longest).toBeLessThanOrEqual(40);
    }
  });
});

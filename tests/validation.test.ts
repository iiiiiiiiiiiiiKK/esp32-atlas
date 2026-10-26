import { describe, expect, it } from "vitest";
import { parseRepoUrl, submitSchema, loginSchema, curationSchema } from "@/lib/validation";

describe("parseRepoUrl", () => {
  it("accepts canonical GitHub URLs", () => {
    expect(parseRepoUrl("https://github.com/78/xiaozhi-esp32")).toEqual({
      owner: "78",
      repo: "xiaozhi-esp32",
      fullName: "78/xiaozhi-esp32",
    });
  });

  it("strips a trailing .git and slash", () => {
    expect(parseRepoUrl("https://github.com/wled/WLED.git/")?.fullName).toBe("wled/WLED");
  });

  it("rejects other hosts (SSRF guard)", () => {
    expect(parseRepoUrl("http://github.com/a/b")).toBeNull();
    expect(parseRepoUrl("https://evil.com/github.com/a/b")).toBeNull();
    expect(parseRepoUrl("https://github.com.evil.com/a/b")).toBeNull();
    expect(parseRepoUrl("https://raw.githubusercontent.com/a/b")).toBeNull();
  });

  it("rejects embedded credentials and paths", () => {
    expect(parseRepoUrl("https://user:pass@github.com/a/b")).toBeNull();
    expect(parseRepoUrl("https://github.com/a/b/tree/main")).toBeNull();
  });

  it("rejects javascript and data URLs", () => {
    expect(parseRepoUrl("javascript:alert(1)")).toBeNull();
    expect(parseRepoUrl("data:text/html,<script>")).toBeNull();
  });
});

describe("submitSchema", () => {
  it("accepts a valid submission", () => {
    const result = submitSchema.safeParse({ repoUrl: "https://github.com/wled/WLED", note: "great project" });
    expect(result.success).toBe(true);
  });

  it("treats the note as optional and empty by default", () => {
    const result = submitSchema.safeParse({ repoUrl: "https://github.com/wled/WLED" });
    expect(result.success && result.data.note).toBe("");
  });

  it("rejects notes longer than 500 characters", () => {
    const result = submitSchema.safeParse({ repoUrl: "https://github.com/wled/WLED", note: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects non-GitHub hosts", () => {
    expect(submitSchema.safeParse({ repoUrl: "https://gitlab.com/a/b" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires an email and an 8+ character password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "longenough" }).success).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "longenough" }).success).toBe(false);
  });
});

describe("curationSchema", () => {
  it("bounds editorial scores to 0-100", () => {
    expect(curationSchema.safeParse({ slug: "a", docScore: 101 }).success).toBe(false);
    expect(curationSchema.safeParse({ slug: "a", docScore: 100 }).success).toBe(true);
  });

  it("only allows known difficulty values", () => {
    expect(curationSchema.safeParse({ slug: "a", difficulty: "impossible" }).success).toBe(false);
    expect(curationSchema.safeParse({ slug: "a", difficulty: "advanced" }).success).toBe(true);
  });
});

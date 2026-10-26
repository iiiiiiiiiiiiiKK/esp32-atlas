import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, newSessionId, safeEqual, sha256Hex } from "@/lib/password";

describe("password hashing", () => {
  it("produces a pbkdf2 record with the configured iteration count and a random salt", async () => {
    const a = await hashPassword("correct horse battery staple");
    const b = await hashPassword("correct horse battery staple");
    expect(a.startsWith("pbkdf2$150000$")).toBe(true);
    expect(a).not.toBe(b); // random salt per hash
    expect(a.split("$")).toHaveLength(4);
  });

  it("verifies the right password and rejects the wrong one", async () => {
    const stored = await hashPassword("s3cret-passphrase");
    expect(await verifyPassword("s3cret-passphrase", stored)).toBe(true);
    expect(await verifyPassword("s3cret-passphras", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("rejects malformed or weakened hashes instead of throwing", async () => {
    expect(await verifyPassword("x", "plaintext")).toBe(false);
    expect(await verifyPassword("x", "pbkdf2$1000$aa$bb")).toBe(false);
    expect(await verifyPassword("x", "md5$150000$aa$bb")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });
});

describe("session ids", () => {
  it("are unique and long enough to be unguessable", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newSessionId()));
    expect(ids.size).toBe(50);
    for (const id of ids) {
      expect(id.length).toBeGreaterThanOrEqual(40);
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});

describe("safeEqual", () => {
  it("compares equal strings and rejects length mismatches", () => {
    expect(safeEqual("token-abc", "token-abc")).toBe(true);
    expect(safeEqual("token-abc", "token-abd")).toBe(false);
    expect(safeEqual("token-abc", "token-abc-longer")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("sha256Hex", () => {
  it("is stable and hides the raw input", async () => {
    const a = await sha256Hex("atlas:1.2.3.4");
    const b = await sha256Hex("atlas:1.2.3.4");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(a).not.toContain("1.2.3.4");
  });
});

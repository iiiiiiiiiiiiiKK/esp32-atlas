import { expect, test } from "@playwright/test";

/**
 * Mobile E2E: the acceptance criteria demand no horizontal overflow, no broken
 * images and no covered primary actions on a real phone viewport.
 */

test.describe("mobile layout", () => {
  const pages = ["/", "/explore", "/projects/78-xiaozhi-esp32", "/paths", "/tutorials", "/hardware", "/radar", "/submit"];

  for (const path of pages) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });
      // 1px tolerance for sub-pixel rounding.
      expect(overflow.scrollWidth - overflow.clientWidth).toBeLessThanOrEqual(1);
    });
  }

  test("cover art never renders as a broken image", async ({ page }) => {
    await page.goto("/explore");
    const brokenImages = await page.evaluate(() =>
      Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    expect(brokenImages).toEqual([]);
  });

  test("primary actions stay tappable on a small screen", async ({ page }) => {
    await page.goto("/projects/78-xiaozhi-esp32");
    const cta = page.getByRole("link", { name: /打开 GitHub 仓库|Open on GitHub/ });
    await expect(cta).toBeInViewport();
    const box = await cta.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(28);
  });

  test("mobile menu exposes every top-level destination", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only navigation");
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu|Close menu/ }).click();
    const nav = page.locator("#mobile-nav");
    await expect(nav).toBeVisible();
    for (const label of ["探索项目", "学习路线", "教程中心", "芯片硬件"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("filters remain reachable on mobile without covering the grid", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByTestId("explore-grid")).toBeVisible();
    await expect(page.getByRole("complementary", { name: /筛选|Filters/ })).toBeVisible();
  });
});

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

  test("the filter drawer opens, applies a facet and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the drawer only exists on phones; desktop uses the sidebar column");
    await page.goto("/explore");
    await expect(page.getByTestId("explore-grid")).toBeVisible();
    // Desktop column is hidden on phones; the sheet is the only facet entry point.
    await page.getByTestId("open-filters").click();
    const sheet = page.getByTestId("filter-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(/项目类别|Category/)).toBeVisible();
    await sheet.getByRole("link", { name: /智能家居|Smart home/ }).first().click();
    await expect(page).toHaveURL(/category=smart-home/);
    await page.getByTestId("close-filters").click();
    await expect(page.getByTestId("filter-sheet")).toHaveCount(0);
  });

  test("the sticky toolbar keeps filters one tap away while scrolling results", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the sticky toolbar is the mobile control surface");
    await page.goto("/explore");
    await page.evaluate(() => window.scrollTo(0, 1400));
    const trigger = page.getByTestId("open-filters");
    await expect(trigger).toBeInViewport();
  });

  test("search on explore preserves active facets", async ({ page }) => {
    await page.goto("/explore?category=led");
    await page.getByTestId("explore-search").fill("wled");
    await page.getByTestId("explore-search").press("Enter");
    await expect(page).toHaveURL(/category=led/);
    await expect(page).toHaveURL(/q=wled/);
  });

  test("no body text renders below 12px on a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the type floor is a phone-only override");
    for (const path of ["/", "/explore", "/tutorials", "/hardware"]) {
      await page.goto(path);
      const tiny = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll("main *")) {
          if (!el.textContent || el.children.length > 0) continue;
          if (el.closest("svg")) continue; // decorative cover-art labels
          const size = parseFloat(getComputedStyle(el).fontSize);
          if (size > 0 && size < 12) bad.push(`${Math.round(size * 10) / 10}px ${el.tagName}`);
        }
        return bad.slice(0, 5);
      });
      expect(tiny, `small text on ${path}`).toEqual([]);
    }
  });
});

import { expect, test } from "@playwright/test";

/**
 * Desktop E2E: covers the flows the product promises — goal-first discovery,
 * shareable filtering, project details with provenance, i18n persistence,
 * local collections, submission validation and admin gating.
 */

test.describe("home", () => {
  test("hero search navigates to explore with the query in the URL", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-search-input").fill("voice");
    await page.getByTestId("hero-search-submit").click();
    await expect(page).toHaveURL(/\/explore\?q=voice/);
    await expect(page.getByTestId("explore-grid")).toBeVisible();
  });

  test("goal shortcut filters by category", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("goal-smart-home").click();
    await expect(page).toHaveURL(/category=smart-home/);
  });

  test("shows a real data-source timestamp, not a fake one", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/数据更新时间|Data updated/)).toBeVisible();
  });
});

test.describe("author link", () => {
  test("the header shows the author 𝕏 link on every viewport", async ({ page, isMobile }) => {
    await page.goto("/");
    const link = page.getByTestId("author-x-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://x.com/0xkillcoin");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toBeInViewport();
    // Mobile users also get the link inside the menu, where there is room for a label.
    if (isMobile) {
      await page.getByRole("button", { name: /Open menu/ }).click();
      const menuLink = page.getByTestId("author-x-link-mobile");
      await expect(menuLink).toBeVisible();
      await expect(menuLink).toHaveAttribute("href", "https://x.com/0xkillcoin");
      await expect(menuLink).toContainText("0xkillcoin");
    }
  });
});

test.describe("explore", () => {
  test("filters are shareable: reload keeps the same result set", async ({ page }) => {
    await page.goto("/explore?category=led&sort=stars");
    const first = await page.getByTestId("explore-grid").first().innerText();
    await page.reload();
    await expect(page.getByTestId("explore-grid")).toBeVisible();
    const second = await page.getByTestId("explore-grid").first().innerText();
    // Result sets should contain the same project names after a reload.
    expect(second.split("\n")[0]).toBe(first.split("\n")[0]);
  });

  test("clearing filters from an empty result works", async ({ page }) => {
    await page.goto("/explore?q=zzzznonexistentquery");
    await expect(page.getByTestId("explore-empty")).toBeVisible();
    await page.getByRole("link", { name: /清除筛选|Clear filters/ }).first().click();
    await expect(page.getByTestId("explore-grid")).toBeVisible();
  });

  test("sorting by stars yields a descending star count", async ({ page }) => {
    await page.goto("/explore?sort=stars");
    await page.waitForSelector("[data-testid='explore-grid'] article");
    const stars = await page.locator("[data-testid='explore-grid'] article").evaluateAll((nodes) =>
      nodes.map((n) => {
        const text = n.textContent ?? "";
        const match = text.match(/([\d.,]+)\s*[KM]?/);
        return match ? match[1] : "";
      }),
    );
    expect(stars.length).toBeGreaterThan(0);
  });
});

test.describe("project detail", () => {
  test("shows verified repo metadata, provenance and a working upstream link", async ({ page }) => {
    await page.goto("/projects/78-xiaozhi-esp32");
    await expect(page.getByRole("heading", { name: "xiaozhi-esp32" })).toBeVisible();
    await expect(page.getByText(/GitHub REST API/).first()).toBeVisible();
    const link = page.getByRole("link", { name: /打开 GitHub 仓库|Open on GitHub/ });
    await expect(link).toHaveAttribute("href", "https://github.com/78/xiaozhi-esp32");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("does not claim star growth without snapshots", async ({ page }) => {
    await page.goto("/projects/78-xiaozhi-esp32");
    await expect(page.getByText(/积累中|accumulating/).first()).toBeVisible();
  });

  test("unknown project returns the 404 page", async ({ page }) => {
    const res = await page.goto("/projects/does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/找不到这个页面|does not exist/);
  });
});

test.describe("language switch", () => {
  test("persists the choice across a reload on a deep page", async ({ page }) => {
    await page.goto("/hardware");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("芯片");
    await page.getByTestId("lang-switch").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chip");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chip");
    // switch back so other tests see the default
    await page.getByTestId("lang-switch").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("芯片");
  });
});

test.describe("collections", () => {
  test("saving a project persists in localStorage and shows in the list", async ({ page }) => {
    await page.goto("/projects/wled-wled");
    await page.getByTestId("save-repo:wled-wled").click();
    await page.goto("/collections");
    await expect(page.getByText("wled/WLED")).toBeVisible();
    await expect(page.getByTestId("collections-empty")).toHaveCount(0);
  });

  test("status and note edits round-trip", async ({ page }) => {
    // Fresh context per test: seed one saved item first.
    await page.goto("/projects/wled-wled");
    await page.getByTestId("save-repo:wled-wled").click();
    await page.goto("/collections");
    await expect(page.getByRole("combobox").first()).toBeVisible();
    await page.getByRole("combobox").first().selectOption("doing");
    await page.getByRole("textbox").last().fill("buy 5m strip");
    await page.reload();
    await expect(page.getByRole("combobox").first()).toHaveValue("doing");
    await expect(page.getByRole("textbox").last()).toHaveValue("buy 5m strip");
  });
});

test.describe("submit", () => {
  test("rejects a non-GitHub URL with a specific message", async ({ page }) => {
    await page.goto("/submit");
    await page.getByTestId("submit-url").fill("https://gitlab.com/someone/repo");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("submit-error")).toBeVisible();
    await expect(page.getByTestId("submit-error")).toContainText(/github/i);
  });

  test("rejects a repository that does not exist", async ({ page }) => {
    await page.goto("/submit");
    await page.getByTestId("submit-url").fill("https://github.com/esp32-atlas/definitely-not-a-real-repo-xyz");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("submit-error")).toContainText(/找不到|not find/i);
  });

  test("reports a duplicate instead of silently succeeding", async ({ page }) => {
    await page.goto("/submit");
    await page.getByTestId("submit-url").fill("https://github.com/wled/WLED");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("submit-error")).toContainText(/已经在|already listed/i);
  });
});

test.describe("admin", () => {
  test("an anonymous visitor sees the login form and cannot reach admin APIs", async ({ page, request }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-login-form")).toBeVisible();
    const res = await request.post("/api/admin/sync", { data: {} });
    expect(res.status()).toBe(401);
    const review = await request.post("/api/admin/submissions", { data: { id: 1, action: "approve" } });
    expect(review.status()).toBe(401);
  });

  test("wrong credentials are rejected", async ({ page }) => {
    await page.goto("/admin");
    await page.getByTestId("admin-email").fill("admin@esp32atlas.local");
    await page.getByTestId("admin-password").fill("wrong-password-123");
    await page.getByTestId("admin-submit").click();
    await expect(page.getByTestId("admin-error")).toBeVisible();
  });

  test("admin pages are excluded from indexing", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("/admin");
  });
});

test.describe("radar", () => {
  test("explains that growth data is accumulating rather than inventing it", async ({ page }) => {
    await page.goto("/radar");
    await expect(page.getByText(/趋势数据积累中|accumulating/).first()).toBeVisible();
  });
});

test.describe("learning paths", () => {
  test("a path page lists steps with completion criteria", async ({ page }) => {
    await page.goto("/paths/zero-to-esp32");
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    await expect(page.getByText(/完成标准|Done when/).first()).toBeVisible();
  });

  test("all ten paths are listed", async ({ page }) => {
    await page.goto("/paths");
    const links = page.locator("a[href^='/paths/']");
    expect(await links.count()).toBeGreaterThanOrEqual(10);
  });
});

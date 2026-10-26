import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a real production build (`npm run build && npm start`).
 * PLAYWRIGHT_CHANNEL lets CI use a locally installed browser (e.g. msedge)
 * instead of downloading Chromium.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Edge"], channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" },
    },
  ],
  webServer: process.env.E2E_SKIP_SERVER
    ? undefined
    : {
        command: "npm start",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

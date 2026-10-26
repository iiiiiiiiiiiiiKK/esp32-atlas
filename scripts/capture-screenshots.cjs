const { chromium } = require("playwright");

/**
 * Visual QA helper (not part of CI): captures the screenshots used in the README
 * from a running production build.
 *
 *   npx opennextjs-cloudflare preview --port 3100
 *   node scripts/capture-screenshots.cjs
 */
const SHOTS = [
  ["home-desktop", "/", 1440, 900],
  ["explore-desktop", "/explore", 1440, 900],
  ["project-desktop", "/projects/78-xiaozhi-esp32", 1440, 1000],
  ["hardware-desktop", "/hardware", 1440, 900],
  ["paths-desktop", "/paths", 1440, 900],
  ["tutorials-desktop", "/tutorials", 1440, 900],
  ["radar-desktop", "/radar", 1440, 900],
  ["admin-desktop", "/admin", 1440, 800],
  ["home-mobile", "/", 412, 900],
  ["explore-mobile", "/explore", 412, 900],
  ["project-mobile", "/projects/78-xiaozhi-esp32", 412, 900],
];

(async () => {
  const base = process.env.SHOT_BASE ?? "http://127.0.0.1:3100";
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  for (const [name, path, width, height] of SHOTS) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `docs/screenshots/${name}.png` });
    console.log("captured", name);
    await page.close();
  }
  await browser.close();
})();

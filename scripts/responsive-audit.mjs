const { chromium } = await import("playwright");

/**
 * Responsive audit against a running production build.
 *
 *   npx opennextjs-cloudflare preview --port 3100
 *   node scripts/responsive-audit.mjs
 *
 * For every (device × page) it checks:
 *  1. horizontal overflow of the document (hard failure)
 *  2. elements sticking out of the viewport that are NOT inside an
 *     overflow-x scroll container (hard failure)
 *  3. sticky header covering the first main element (hard failure)
 *  4. tap targets: buttons/selects/inputs/.btn/.pill must be >= 32px tall on
 *     touch viewports (hard failure). Plain inline text links are exempt —
 *     they are inline prose links, and enforcing 32px would break the layout.
 *  5. console errors / failed navigations (hard failure; aborted RSC prefetches
 *     are normal Next.js behaviour and are ignored)
 */

const BASE = process.env.AUDIT_BASE ?? "http://127.0.0.1:3100";

const PAGES = [
  "/",
  "/explore",
  "/explore?q=voice&category=ai-voice",
  "/projects/78-xiaozhi-esp32",
  "/paths",
  "/paths/zero-to-esp32",
  "/tutorials",
  "/hardware",
  "/radar",
  "/collections",
  "/submit",
  "/admin",
  "/about",
];

// Real Apple viewports in CSS px. SE (320) is the narrowest iPhone still in use.
const DEVICES = [
  { name: "iPhone SE 1st (320x568)", width: 320, height: 568, dpr: 2 },
  { name: "iPhone SE2/8 (375x667)", width: 375, height: 667, dpr: 2 },
  { name: "iPhone 12/13 (390x844)", width: 390, height: 844, dpr: 3 },
  { name: "iPhone 15 Pro Max (430x932)", width: 430, height: 932, dpr: 3 },
  { name: "iPad mini (768x1024)", width: 768, height: 1024, dpr: 2 },
  { name: "Laptop (1024x768)", width: 1024, height: 768, dpr: 1 },
  { name: "Desktop (1440x900)", width: 1440, height: 900, dpr: 1 },
];

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const results = [];

for (const device of DEVICES) {
  const touch = device.width < 1024;
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.dpr,
    isMobile: device.width < 768,
    hasTouch: touch,
    locale: "zh-CN",
  });

  for (const path of PAGES) {
    const page = await context.newPage();
    const consoleErrors = [];
    const realFailures = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 150));
    });
    page.on("requestfailed", (req) => {
      const url = req.url();
      const reason = req.failure()?.errorText ?? "";
      // Next.js aborts RSC prefetches when the pointer leaves / navigation happens.
      if (url.includes("_rsc=") && reason.includes("ERR_ABORTED")) return;
      realFailures.push(`${url.slice(0, 80)} ${reason}`);
    });

    const report = { device: device.name, width: device.width, path, hard: [], soft: [] };
    try {
      const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
      if (!res || res.status() >= 400) report.hard.push(`http ${res ? res.status() : "no response"}`);
      await page.waitForTimeout(200);

      const audit = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;

        /** True when some ancestor clips horizontally, i.e. content legitimately scrolls there. */
        const insideScroller = (el) => {
          let node = el.parentElement;
          while (node && node !== document.body) {
            const s = getComputedStyle(node);
            if (["auto", "scroll", "hidden", "clip"].includes(s.overflowX)) return true;
            node = node.parentElement;
          }
          return false;
        };

        const offenders = [];
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          const s = getComputedStyle(el);
          if (s.position === "fixed" || s.visibility === "hidden") continue;
          if (r.right > vw + 1 || r.left < -1) {
            if (insideScroller(el)) continue;
            offenders.push({
              tag: el.tagName,
              cls: String(el.className || "").slice(0, 40),
              box: `${Math.round(r.left)}..${Math.round(r.right)}`,
              text: (el.textContent || "").trim().slice(0, 24),
            });
          }
        }

        // Sticky header must not cover content at rest.
        const header = document.querySelector("header");
        const firstMain = document.querySelector("main")?.firstElementChild;
        const overlap =
          header && firstMain
            ? Math.round(header.getBoundingClientRect().bottom - firstMain.getBoundingClientRect().top)
            : null;

        // Touch targets: only genuinely interactive elements. Static badges
        // (span.pill) are labels, not tap targets, so they are excluded.
        const small = [];
        const sel =
          "button, select, textarea, input:not([type=hidden]), a[href].btn, a[href].pill, label.pill";
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const s = getComputedStyle(el);
          if (s.visibility === "hidden" || s.display === "none") continue;
          if (el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
          if (r.height < 32) {
            small.push({
              tag: el.tagName,
              label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 20),
              size: `${Math.round(r.width)}x${Math.round(r.height)}`,
            });
          }
        }

        return {
          vw,
          overflow: doc.scrollWidth - vw,
          offenders: offenders.slice(0, 5),
          offenderCount: offenders.length,
          overlap,
          small: small.slice(0, 6),
          smallCount: small.length,
        };
      });

      if (audit.overflow > 1) {
        report.hard.push(
          `overflow ${audit.overflow}px (${audit.offenderCount} elements: ${audit.offenders
            .map((o) => `${o.tag}.${o.cls}${o.box}`)
            .join(", ")})`,
        );
      }
      if (audit.overlap !== null && audit.overlap > 4) report.hard.push(`header overlaps content by ${audit.overlap}px`);
      if (audit.smallCount > 0 && device.width < 1024) {
        report.hard.push(
          `${audit.smallCount} small control(s): ${audit.small.map((s) => `${s.tag}“${s.label}”${s.size}`).join(", ")}`,
        );
      }
      if (consoleErrors.length) report.hard.push(`console: ${consoleErrors[0]}`);
      if (realFailures.length) report.hard.push(`request failed: ${realFailures[0]}`);
      report.audit = audit;
    } catch (err) {
      report.hard.push(`exception: ${err.message.slice(0, 110)}`);
    }

    results.push(report);
    await page.close();
  }
  await context.close();
}

await browser.close();

let failures = 0;
for (const r of results) {
  if (r.hard.length) {
    failures += 1;
    console.log(`FAIL  ${r.device.padEnd(26)} ${r.path.padEnd(34)} ${r.hard.join(" || ")}`);
  }
}
const ok = results.length - failures;
console.log(`\n${results.length} checks (${DEVICES.length} viewports × ${PAGES.length} pages) · ${failures} failure(s) · ${ok} clean`);
process.exitCode = failures > 0 ? 1 : 0;

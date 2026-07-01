// scripts/screenshot-vendors.mjs
// Capture per-vendor proof screenshots described in scripts/config/vendor-screenshots.json.
// Each entry binds a vendor MDX claim to a (url, selector) pair on the vendor's site.
// Output: public/images/vendors/{slug}-{1|2}.webp
// Log:    scripts/logs/screenshot-run-{date}.json
//
// Usage:
//   node scripts/screenshot-vendors.mjs                 # all vendors in config
//   node scripts/screenshot-vendors.mjs --vendor=veriff # one vendor
//   node scripts/screenshot-vendors.mjs --inspect=https://www.veriff.com/pricing
//                                                       # dump section structure of a URL
//   node scripts/screenshot-vendors.mjs --headed       # show browser (debug)

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { launch } from "cloakbrowser";
import sharp from "sharp";

const CONFIG_PATH = "scripts/config/vendor-screenshots.json";
const OUT_DIR = "public/images/vendors";
const LOG_DIR = "scripts/logs";

const args = process.argv.slice(2);
const ONLY_VENDOR = args.find((a) => a.startsWith("--vendor="))?.split("=")[1];
const INSPECT_URL = args.find((a) => a.startsWith("--inspect="))?.split("=")[1];
const HEADED = args.includes("--headed");

const NAV_TIMEOUT_MS = 45000;
const HYDRATE_WAIT_MS = 2500;
const BETWEEN_SHOTS_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Generic cookie/consent dismissal — tried in order, first match wins.
const COOKIE_SELECTORS = [
  "#onetrust-accept-btn-handler",
  "#onetrust-pc-btn-handler",
  "#truste-consent-button",
  "#hs-eu-confirmation-button",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  "#CybotCookiebotDialogBodyButtonAccept",
  "#cookiescript_accept",
  "#axeptio_btn_acceptAll",
  ".qc-cmp2-summary-buttons button[mode='primary']",
  "button#accept-cookies",
  "button.cookie-accept",
  "button[aria-label*='accept' i]",
  "button[data-cookieman-accept-all]",
  "button:has-text('Accept all')",
  "button:has-text('Accept All')",
  "button:has-text('Accept cookies')",
  "button:has-text('Allow all cookies')",
  "button:has-text('I agree')",
  "button:has-text('Got it')",
  "button:has-text('Allow all')",
  "button:has-text('Agree')",
  "[data-testid='uc-accept-all-button']",
];

async function dismissCookies(page) {
  for (const sel of COOKIE_SELECTORS) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.isVisible({ timeout: 600 }).catch(() => false)) {
        await loc.click({ timeout: 1500 }).catch(() => {});
        await sleep(400);
        return sel;
      }
    } catch {}
  }
  return null;
}

// Resolve a config selector to a Playwright Locator.
// Supports:
//   "near:Some heading text"  → nearest <section>/<article>/<main> ancestor of the first
//                                element whose visible text contains "Some heading text".
//   "near:Pricing plans|main" → same, but climb only up to <main>/<section>/<article>/<div role=region>.
//   anything else             → plain CSS selector.
let nearCounter = 0;
async function resolveLocator(page, sel) {
  if (!sel.startsWith("near:")) return { locator: page.locator(sel).first(), anchor: null };
  const text = sel.slice(5).trim();
  const marker = `shot-target-${++nearCounter}-${Date.now()}`;
  // In-page: find element, walk up to a visible sectioning ancestor, tag it with data-marker.
  const found = await page.evaluate(({ needle, marker }) => {
    const lower = needle.toLowerCase();
    const isVisible = (el) => {
      if (!el || !(el instanceof Element)) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return false;
      const s = window.getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0) return false;
      // Reject elements inside nav/footer/aside/header (chrome, not content).
      let p = el.parentElement;
      while (p && p !== document.body) {
        const t = p.tagName.toLowerCase();
        if (t === "nav" || t === "footer" || t === "aside" || t === "header") return false;
        p = p.parentElement;
      }
      return true;
    };
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, [role=heading]"))
      .filter((el) => (el.innerText || "").trim().toLowerCase().includes(lower))
      .filter(isVisible);
    const hit = headings[0];
    if (!hit) return null;
    const MIN_H = 200;
    // Walk up to nearest visible section/article/main, ignoring height (we clip later).
    let n = hit;
    while (n && n !== document.body) {
      const tag = n.tagName.toLowerCase();
      if ((tag === "section" || tag === "article" || tag === "main" || n.getAttribute("role") === "region") && isVisible(n)) {
        const r = n.getBoundingClientRect();
        if (r.height >= MIN_H) break;
      }
      n = n.parentElement;
    }
    if (!n || n === document.body) {
      // No sectioning ancestor — walk up to first visible block with reasonable height.
      n = hit;
      while (n && n !== document.body) {
        if (isVisible(n)) {
          const r = n.getBoundingClientRect();
          if (r.height >= MIN_H) break;
        }
        n = n.parentElement;
      }
      if (!n || n === document.body) n = hit.parentElement || hit;
    }
    if (!n) return null;
    n.setAttribute("data-shot-marker", marker);
    hit.setAttribute("data-shot-anchor", marker);
    return { tag: n.tagName.toLowerCase(), rectHeight: Math.round(n.getBoundingClientRect().height) };
  }, { needle: text, marker });
  if (!found) throw new Error(`near: text not found — "${text}"`);
  if (process.env.DEBUG_SEL) console.log(`    [resolved] ${sel} → <${found.tag} data-shot-marker=${marker}> h=${found.rectHeight}`);
  return {
    locator: page.locator(`[data-shot-marker="${marker}"]`).first(),
    anchor: page.locator(`[data-shot-anchor="${marker}"]`).first(),
  };
}

async function captureOne(page, entry, slug, index) {
  const result = {
    slug,
    index,
    url: entry.url,
    selector: entry.selector,
    claim: entry.claim,
    ok: false,
    error: null,
    note: null,
    cookieDismissed: null,
    outPath: null,
  };

  try {
    await page.goto(entry.url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT_MS }).catch(() => {});
    await sleep(HYDRATE_WAIT_MS);

    result.cookieDismissed = await dismissCookies(page);
    await sleep(500);

    let target, anchor;
    try {
      const r = await resolveLocator(page, entry.selector);
      target = r.locator;
      anchor = r.anchor;
    } catch (e) {
      result.error = String(e.message);
      return result;
    }
    const exists = await target.count();
    if (!exists) {
      result.error = `selector_not_found: ${entry.selector}`;
      return result;
    }

    await target.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await sleep(700);

    const pngPath = `${OUT_DIR}/${slug}-${index}.png`;
    const webpPath = `${OUT_DIR}/${slug}-${index}.webp`;
    mkdirSync(dirname(resolve(pngPath)), { recursive: true });

    const MAX_SHOT_HEIGHT = 1800;
    const box = await target.boundingBox().catch(() => null);
    let captured = false;
    if (box && box.height > MAX_SHOT_HEIGHT) {
      // Element too tall — anchor clip at the heading position (so we capture the relevant section).
      const anchorBox = anchor ? await anchor.boundingBox().catch(() => null) : null;
      const startY = anchorBox ? Math.max(0, Math.floor(anchorBox.y) - 40) : Math.max(0, Math.floor(box.y));
      const clip = {
        x: Math.max(0, Math.floor(box.x)),
        y: startY,
        width: Math.min(1600, Math.floor(box.width)),
        height: MAX_SHOT_HEIGHT,
      };
      await page.screenshot({ path: pngPath, type: "png", clip, fullPage: true, timeout: 15000 });
      captured = true;
      result.note = `clipped_at_anchor (section ${Math.round(box.height)}px)`;
    } else {
      try {
        await target.screenshot({ path: pngPath, type: "png", timeout: 8000 });
        captured = true;
      } catch (e1) {
        if (box && box.width > 50 && box.height > 50) {
          const clip = {
            x: Math.max(0, Math.floor(box.x)),
            y: Math.max(0, Math.floor(box.y)),
            width: Math.min(1600, Math.floor(box.width)),
            height: Math.min(MAX_SHOT_HEIGHT, Math.floor(box.height)),
          };
          await page.screenshot({ path: pngPath, type: "png", clip, fullPage: true, timeout: 15000 });
          captured = true;
          result.note = `used_clip_fallback (${e1.message?.slice(0, 60)})`;
        } else {
          throw e1;
        }
      }
    }
    if (!captured) throw new Error("capture_failed");

    await sharp(pngPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath);

    // discard intermediate png
    const { unlinkSync } = await import("fs");
    try { unlinkSync(pngPath); } catch {}

    result.ok = true;
    result.outPath = webpPath;
  } catch (err) {
    result.error = String(err?.message || err);
  }
  return result;
}

async function inspectStructure(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
  await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT_MS }).catch(() => {});
  await sleep(HYDRATE_WAIT_MS);
  await dismissCookies(page);
  await sleep(500);

  const dump = await page.evaluate(() => {
    const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "G", "INPUT", "LINK", "META", "BR", "HR"]);
    const SKIP_ID_RX = /cookie|consent|cybot|onetrust|truste|hs-eu|axeptio|cookiebot|qc-cmp/i;
    const out = [];
    const nodes = document.querySelectorAll("section, main, article, h1, h2, h3, [id], [class*=pricing i], [class*=plan i], [class*=tier i], [class*=cert i], [class*=trust i], [class*=compliance i], [class*=badge i], [class*=feature i]");
    let i = 0;
    for (const n of nodes) {
      if (i > 200) break;
      if (SKIP_TAGS.has(n.tagName)) continue;
      const id = n.id || "";
      if (id && SKIP_ID_RX.test(id)) continue;
      const text = (n.innerText || "").trim().replace(/\s+/g, " ").slice(0, 120);
      if (!text) continue;
      const cls = n.className && typeof n.className === "string"
        ? `.${n.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
      out.push(`<${n.tagName.toLowerCase()}>${id ? "#" + id : ""}${cls}  — ${text}`);
      i++;
    }
    return out;
  });
  return dump;
}

async function main() {
  const browser = await launch({ headless: !HEADED, humanize: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  if (INSPECT_URL) {
    console.log(`Inspecting: ${INSPECT_URL}\n`);
    const lines = await inspectStructure(page, INSPECT_URL);
    lines.forEach((l) => console.log(l));
    await browser.close();
    return;
  }

  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  const slugs = ONLY_VENDOR ? [ONLY_VENDOR] : Object.keys(config);

  const results = [];
  for (const slug of slugs) {
    const entries = config[slug];
    if (!entries) {
      console.warn(`No config for slug: ${slug}`);
      continue;
    }
    console.log(`\n=== ${slug} ===`);
    for (let i = 0; i < entries.length; i++) {
      const r = await captureOne(page, entries[i], slug, i + 1);
      results.push(r);
      console.log(r.ok ? `  ✓ ${r.outPath}` : `  ✗ ${r.error}`);
      await sleep(BETWEEN_SHOTS_MS);
    }
  }

  await browser.close();

  mkdirSync(LOG_DIR, { recursive: true });
  const logPath = `${LOG_DIR}/screenshot-run-${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(logPath, JSON.stringify(results, null, 2));
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n${okCount}/${results.length} captured. Log: ${logPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

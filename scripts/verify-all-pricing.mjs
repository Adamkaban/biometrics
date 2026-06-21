/**
 * Scrape pricing pages for all 68 vendors.
 * Outputs scripts/pricing-report.json — review before touching DB.
 *
 * Run: node scripts/verify-all-pricing.mjs
 */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const CHROMIUM =
  "/Users/usara/.cloakbrowser/chromium-145.0.7632.109.2/Chromium.app/Contents/MacOS/Chromium";

const { vendors } = JSON.parse(readFileSync(resolve(ROOT, "src/data/vendors.json"), "utf8"));

// URL patterns to try in order
const PRICING_PATHS = ["/pricing", "/pricing/", "/plans", "/plans/", "/en/pricing", ""];

// Domains to skip (not real product pricing pages)
const SKIP_DOMAINS = [
  "mcpmarket.com",   // MCP marketplace, not a product
  "docs.swiftdil.com", // API docs only
  "documentation.iwsinc.com", // API docs only
  "zunoy.com/uptime", // uptime page
  "ibera.run",       // dead/fake domain
  "azakaw.com",      // appears to be down/fake
];

// Price extraction — runs inside browser context
function extractPricingScript() {
  const PRICE_RE = /\$[\d,]+\.?\d*|\€[\d,]+\.?\d*|\£[\d,]+\.?\d*|[\d,]+\.?\d*\s*(?:USD|EUR|GBP)/gi;
  const PERIOD_RE = /per\s+(?:check|verification|user|month|year|mo)|\/\s*(?:check|verification|user|month|mo|year)/gi;
  const PLAN_RE = /\b(free|starter|essential|essentials|basic|core|standard|professional|pro|growth|business|enterprise|custom|advanced|plus|premium|compliance)\b/gi;

  // Find pricing containers
  const SELECTORS = [
    "[class*='pric']",
    "[class*='plan-']",
    "[class*='plans']",
    "[class*='tier']",
    "[class*='package']",
    "[class*='billing']",
    "section:has(h2)",
    "table",
  ];

  const seen = new Set();
  const results = [];

  for (const sel of SELECTORS) {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        const text = el.innerText?.trim() || "";
        if (!text || text.length > 3000 || seen.has(text)) return;

        const hasPriceSignal = PRICE_RE.test(text) || text.includes("Contact") || text.includes("Request");
        const hasPlanSignal = PLAN_RE.test(text);
        PRICE_RE.lastIndex = 0;
        PLAN_RE.lastIndex = 0;

        if (hasPriceSignal && hasPlanSignal && text.length > 20) {
          seen.add(text);
          // Extract just the first 25 lines
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 25);
          results.push(lines.join(" | "));
        }
      });
    } catch (_) {}
  }

  // Fallback: scan all text nodes for dollar/euro amounts near plan words
  if (results.length === 0) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const lines = [];
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent.trim();
      if (t.length > 2 && t.length < 200) {
        if (PRICE_RE.test(t) || PLAN_RE.test(t)) {
          PRICE_RE.lastIndex = 0;
          PLAN_RE.lastIndex = 0;
          lines.push(t);
        }
      }
    }
    if (lines.length > 0) results.push(lines.slice(0, 30).join(" | "));
  }

  return results.slice(0, 8);
}

async function tryUrls(page, baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  for (const path of PRICING_PATHS) {
    const url = base + path;
    try {
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 12000 });
      if (!resp || resp.status() >= 400) continue;
      await page.waitForTimeout(2000);
      const data = await page.evaluate(extractPricingScript);
      if (data.length > 0) return { url, data };
    } catch (_) {
      // try next path
    }
  }
  return null;
}

async function main() {
  const report = [];
  const already_done = new Set(["Sumsub", "Veriff", "ComplyCube", "Ondato", "Shufti", "Identomat", "Experian Identity proofing"]);

  // Build target list
  const targets = vendors.filter((v) => {
    if (!v.vendor_website) return false;
    if (SKIP_DOMAINS.some((d) => v.vendor_website.includes(d))) return false;
    return true;
  });

  console.log(`Scraping ${targets.length} vendors (${vendors.length - targets.length} skipped)\n`);

  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });

  // Block images/fonts for speed
  await context.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}", (r) => r.abort());

  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  for (let i = 0; i < targets.length; i++) {
    const vendor = targets[i];
    const existingPlans = vendor.website_data?.pricing_plans ?? [];
    const prefix = `[${i + 1}/${targets.length}]`;

    process.stdout.write(`${prefix} ${vendor.name}... `);

    const entry = {
      name: vendor.name,
      website: vendor.vendor_website,
      existing_plans: existingPlans.map((p) => `${p.name}: ${p.price}`),
      status: "pending",
      scraped_url: null,
      scraped_data: [],
      note: null,
    };

    if (already_done.has(vendor.name)) {
      entry.status = "already_verified";
      entry.note = "verified in previous session";
      console.log("skip (already verified)");
      report.push(entry);
      continue;
    }

    try {
      const result = await tryUrls(page, vendor.vendor_website);
      if (result) {
        entry.status = "found";
        entry.scraped_url = result.url;
        entry.scraped_data = result.data;
        console.log(`✓ (${result.data.length} blocks at ${result.url})`);
      } else {
        entry.status = "no_pricing_found";
        entry.note = "tried all URL patterns, no pricing data detected";
        console.log("✗ (no pricing)");
      }
    } catch (e) {
      entry.status = "error";
      entry.note = e.message.slice(0, 100);
      console.log(`! (${entry.note})`);
    }

    report.push(entry);

    // Write partial results after each vendor
    writeFileSync(resolve(ROOT, "scripts/pricing-report.json"), JSON.stringify(report, null, 2));

    // Delay to be polite
    if (i < targets.length - 1) await page.waitForTimeout(1500);
  }

  await browser.close();

  const found = report.filter((r) => r.status === "found").length;
  const notFound = report.filter((r) => r.status === "no_pricing_found").length;
  const errors = report.filter((r) => r.status === "error").length;
  const skipped = report.filter((r) => r.status === "already_verified").length;

  console.log(`\nDone. found=${found} no_pricing=${notFound} errors=${errors} skipped=${skipped}`);
  console.log(`Report: scripts/pricing-report.json`);
}

main().catch(console.error);

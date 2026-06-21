/**
 * Verify vendor pricing pages using CloakBrowser Chromium + playwright-core
 * Run: node scripts/verify-pricing.mjs
 */
import { chromium } from "playwright-core";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const CHROMIUM = "/Users/usara/.cloakbrowser/chromium-145.0.7632.109.2/Chromium.app/Contents/MacOS/Chromium";

// Priority vendors with known conflicts — real sites only
const TARGETS = [
  { name: "Sumsub",     url: "https://sumsub.com/pricing/" },
  { name: "Veriff",     url: "https://www.veriff.com/pricing" },
  { name: "ComplyCube", url: "https://www.complycube.com/en/pricing" },
  { name: "Ondato",     url: "https://ondato.com/pricing/" },
  { name: "Shufti Pro", url: "https://shuftipro.com/pricing/" },
  { name: "Identomat",  url: "https://www.identomat.com/pricing" },
  { name: "Experian Identity proofing", url: "https://www.experian.com/business/products/identity-and-fraud/" },
];

async function scrapePricing(page, vendor) {
  console.log(`\n=== ${vendor.name} ===`);
  console.log(`URL: ${vendor.url}`);

  try {
    await page.goto(vendor.url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2500);

    // Extract all text containing price signals
    const priceData = await page.evaluate(() => {
      const patterns = /(\$[\d,.]+|\d+\s*(?:USD|per\s+\w+|\/\s*(?:mo|month|year|check|verification|user)))/gi;
      const planKeywords = /\b(basic|starter|essential|professional|pro|enterprise|business|compliance|growth|free|custom|pay.?as.?you.?go)\b/gi;

      // Find price containers
      const candidates = [];

      // Look for pricing cards/tables
      const selectors = [
        "[class*='pric']",
        "[class*='plan']",
        "[class*='tier']",
        "[class*='package']",
        "table",
        "[data-testid*='pric']",
      ];

      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          const text = el.innerText?.trim();
          if (text && (patterns.test(text) || planKeywords.test(text))) {
            patterns.lastIndex = 0;
            planKeywords.lastIndex = 0;
            if (text.length < 2000) candidates.push(text);
          }
        });
      }

      // Fallback: full page text with just price lines
      if (candidates.length === 0) {
        const body = document.body.innerText;
        const lines = body.split("\n").filter(l => patterns.test(l) || planKeywords.test(l));
        patterns.lastIndex = 0;
        planKeywords.lastIndex = 0;
        candidates.push(...lines.slice(0, 40));
      }

      return [...new Set(candidates)].slice(0, 10);
    });

    if (priceData.length === 0) {
      console.log("  [no pricing data found — page may require JS or login]");
    } else {
      priceData.forEach((chunk, i) => {
        console.log(`\n  [block ${i + 1}]`);
        // Trim long blocks
        const lines = chunk.split("\n").filter(l => l.trim()).slice(0, 15);
        lines.forEach(l => console.log("  " + l.trim().slice(0, 120)));
      });
    }
  } catch (e) {
    console.log(`  [ERROR: ${e.message.slice(0, 100)}]`);
  }
}

async function main() {
  console.log("Launching CloakBrowser Chromium...");
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-web-security",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });

  const page = await context.newPage();

  for (const vendor of TARGETS) {
    await scrapePricing(page, vendor);
    await page.waitForTimeout(1000);
  }

  await browser.close();
  console.log("\n\nDone.");
}

main().catch(console.error);

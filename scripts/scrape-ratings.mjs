// scripts/scrape-ratings.mjs
// Run: node scripts/scrape-ratings.mjs 2>&1 | tee scripts/logs/ratings-$(date +%Y%m%d).log
// Requires: npm install cloakbrowser playwright-core
import { readFileSync, writeFileSync } from "fs";
import { launch } from "cloakbrowser";

const raw = JSON.parse(readFileSync("src/data/vendors.json", "utf-8"));
const DELAY_MS = 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchG2Ratings(page, productUrl) {
  if (!productUrl?.includes("g2.com")) return null;
  try {
    await page.goto(productUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Extract star breakdown via DOM — more reliable than regex on rendered HTML
    const breakdown = await page.evaluate(() => {
      const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      // G2 star filter buttons carry data-value and review counts in text
      document.querySelectorAll("[data-value]").forEach((el) => {
        const star = parseInt(el.getAttribute("data-value"));
        if (star >= 1 && star <= 5) {
          const match = (el.textContent || "").match(/(\d[\d,]*)/);
          if (match) result[star] = parseInt(match[1].replace(/,/g, ""));
        }
      });
      return result;
    });

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    if (total > 0) return breakdown;

    // Fallback: regex on full HTML for alternate G2 layouts
    const html = await page.content();
    const starPattern = /data-value="([1-5])"\s[^>]*>[\s\S]*?(\d[\d,]*)\s*review/gi;
    let m;
    while ((m = starPattern.exec(html)) !== null) {
      breakdown[parseInt(m[1])] = parseInt(m[2].replace(/,/g, ""));
    }
    const total2 = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return total2 > 0 ? breakdown : null;
  } catch (e) {
    console.error(` [err: ${e.message}]`);
    return null;
  }
}

const browser = await launch({ humanize: true });
const page = await browser.newPage();

const results = [];
for (const v of raw.vendors) {
  process.stdout.write(`Scraping ${v.name}...`);
  const breakdown = await fetchG2Ratings(page, v.product_url);
  const totalFromSources = breakdown
    ? Object.values(breakdown).reduce((a, b) => a + b, 0)
    : (v.total_reviews_all_sources ?? v.reviews_count);
  results.push({
    ...v,
    rating_breakdown: breakdown ?? v.rating_breakdown ?? null,
    total_reviews_all_sources: totalFromSources,
  });
  console.log(breakdown ? ` ✓ (${totalFromSources} reviews)` : " – no data");
  await sleep(DELAY_MS);
}

await browser.close();
writeFileSync("src/data/vendors.json", JSON.stringify({ vendors: results }, null, 2));

const hits = results.filter((v) => v.rating_breakdown !== null).length;
console.log(`Done. ${hits}/${results.length} vendors have rating breakdown.`);

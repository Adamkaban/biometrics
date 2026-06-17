// scripts/scrape-ratings.mjs
import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("src/data/vendors.json", "utf-8"));
const DELAY_MS = 2000; // polite crawling
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchG2Ratings(productUrl) {
  if (!productUrl?.includes("g2.com")) return null;
  try {
    const res = await fetch(productUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)" },
    });
    const html = await res.text();

    // G2 embeds rating breakdown in data attributes on star filter buttons
    // Pattern: data-value="5" ... (N) ... or JSON in <script> tags
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const starPattern = /data-value="([1-5])"\s[^>]*>[\s\S]*?(\d[\d,]*)\s*review/gi;
    let m;
    while ((m = starPattern.exec(html)) !== null) {
      breakdown[parseInt(m[1])] = parseInt(m[2].replace(/,/g, ""));
    }
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return total > 0 ? breakdown : null;
  } catch {
    return null;
  }
}

const results = [];
for (const v of raw.vendors) {
  process.stdout.write(`Scraping ${v.name}...`);
  const breakdown = await fetchG2Ratings(v.product_url);
  const totalFromSources = breakdown
    ? Object.values(breakdown).reduce((a, b) => a + b, 0)
    : v.reviews_count;
  results.push({
    ...v,
    rating_breakdown: breakdown,
    total_reviews_all_sources: totalFromSources,
  });
  console.log(breakdown ? ` ✓ (${totalFromSources} reviews)` : " – no data");
  await sleep(DELAY_MS);
}

writeFileSync("src/data/vendors.json", JSON.stringify({ vendors: results }, null, 2));
console.log("Done.");

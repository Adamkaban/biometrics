// scripts/scrape-pricing.mjs
import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("src/data/vendors.json", "utf-8"));
const DELAY_MS = 3000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parsePricingPage(html) {
  const result = {
    starting_price_usd: null,
    min_monthly_commitment_usd: null,
    free_trial_days: null,
    free_tier_verifications: null,
  };

  // Extract per-check prices: "$0.50 per verification", "$1.20/check"
  const perCheck = html.match(/\$(\d+(?:\.\d+)?)\s*(?:per|\/)\s*(?:verif|check|id|user)/i);
  if (perCheck) result.starting_price_usd = parseFloat(perCheck[1]);

  // Extract monthly flat prices: "$49/mo", "$199 per month"
  const monthly = html.match(/\$(\d[\d,]*)\s*(?:\/\s*mo|per\s*month)/i);
  if (monthly && !result.starting_price_usd) {
    result.starting_price_usd = parseInt(monthly[1].replace(/,/g, ""));
  }

  // Minimum monthly: "$500 minimum", "min. $1,000/mo"
  const minMatch = html.match(/min(?:imum)?\s*\.?\s*\$(\d[\d,]+)/i);
  if (minMatch) result.min_monthly_commitment_usd = parseInt(minMatch[1].replace(/,/g, ""));

  // Free trial: "14-day free trial", "30 days free"
  const trialDays = html.match(/(\d+)[-\s]day\s*free\s*trial/i);
  if (trialDays) result.free_trial_days = parseInt(trialDays[1]);

  // Free tier: "100 free verifications", "first 500 checks free"
  const freeTier = html.match(/(\d[\d,]*)\s*free\s*(?:verif|check|id|scan)/i);
  if (freeTier) result.free_tier_verifications = parseInt(freeTier[1].replace(/,/g, ""));

  return result;
}

async function scrapePricing(vendor) {
  const pricingPaths = ["/pricing", "/plans", "/pricing-plans", "/#pricing"];
  for (const path of pricingPaths) {
    try {
      const url = new URL(path, vendor.vendor_website).href;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const parsed = parsePricingPage(html);
      if (Object.values(parsed).some((v) => v !== null)) return parsed;
    } catch {
      continue;
    }
  }
  return { starting_price_usd: null, min_monthly_commitment_usd: null, free_trial_days: null, free_tier_verifications: null };
}

const results = [];
for (const v of raw.vendors) {
  process.stdout.write(`Scraping pricing: ${v.name}...`);
  const pricing = await scrapePricing(v);
  results.push({ ...v, ...pricing });
  const found = Object.entries(pricing).filter(([, val]) => val !== null).map(([k]) => k).join(", ");
  console.log(found ? ` ✓ (${found})` : " – no numeric data");
  await sleep(DELAY_MS);
}

writeFileSync("src/data/vendors.json", JSON.stringify({ vendors: results }, null, 2));
console.log("Done.");

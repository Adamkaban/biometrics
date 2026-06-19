// scripts/enrich-review-counts.mjs
// Scrapes review counts for vendors with reviews_count === 0.
// Strategy:
//   Step A: visit product_url (G2/Capterra/Gartner) via Firecrawl, extract total count
//   Step B: if still 0 (Capterra-only vendors), search G2 by vendor name via Firecrawl
//   Step C: sync from existing rating_breakdown sum
//
// Run: FIRECRAWL_API_KEY=xxx node scripts/enrich-review-counts.mjs
// Requires: npm install cloakbrowser playwright-core (for Capterra/Gartner fallback)

import { readFileSync, writeFileSync } from "fs";

const VENDORS_PATH = "src/data/vendors.json";
const raw = JSON.parse(readFileSync(VENDORS_PATH, "utf-8"));
const DELAY_MS = 1500;
const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!FIRECRAWL_KEY) {
  console.error("FIRECRAWL_API_KEY not set. Run: FIRECRAWL_API_KEY=xxx node scripts/enrich-review-counts.mjs");
  process.exit(1);
}

// --- Firecrawl scraper ---

async function firecrawlScrape(url, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIRECRAWL_KEY}`,
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        if ((resp.status === 408 || resp.status >= 500) && attempt < retries) {
          await sleep(3000 * attempt);
          continue;
        }
        console.error(`  [firecrawl ${resp.status}] ${err.substring(0, 100)}`);
        return null;
      }
      const data = await resp.json();
      return data.data?.markdown || null;
    } catch (e) {
      if (attempt < retries) { await sleep(3000 * attempt); continue; }
      console.error(`  [firecrawl err: ${e.message}]`);
      return null;
    }
  }
  return null;
}

// --- Count extractors ---

function extractCountFromMarkdown(md, vendorName) {
  if (!md) return 0;

  // "See all N VendorName reviews" — most reliable on G2 product pages
  const seeAll = md.match(/\[See all ([\d,]+) .{0,40}reviews?\]/i);
  if (seeAll) return parseInt(seeAll[1].replace(/,/g, ""));

  // "4/5\n(22)" pattern — second parenthesized number on G2 product page
  // Skip sponsored product (first), take number right after rating line
  const ratingBlock = md.match(/[1-5]\/5\s*\n+\(([\d,]+)\)/);
  if (ratingBlock) return parseInt(ratingBlock[1].replace(/,/g, ""));

  // "N ratings" or "N reviews" text (G2 search results)
  const ratingsText = md.match(/\b([\d,]+)\s+(?:ratings?|reviews?)\b/gi);
  if (ratingsText) {
    for (const t of ratingsText) {
      const n = parseInt(t.replace(/[^\d]/g, ""));
      if (n > 0) return n;
    }
  }

  // Capterra: "(N reviews)" or "N total reviews"
  const capRe = md.match(/\(([\d,]+)\s+reviews?\)/i) || md.match(/([\d,]+)\s+total\s+reviews?/i);
  if (capRe) return parseInt(capRe[1].replace(/,/g, ""));

  // JSON patterns in raw markdown
  const jsonPat = /"(?:reviewCount|totalReviews|numReviews|ratingsCount)":\s*(\d+)/;
  const jsonM = md.match(jsonPat);
  if (jsonM) return parseInt(jsonM[1]);

  return 0;
}

// --- G2 cross-platform search via Firecrawl ---

async function searchG2WithFirecrawl(vendorName) {
  // Try 1: direct slug URL
  const slug = vendorName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const directUrl = `https://www.g2.com/products/${slug}/reviews`;
  let md = await firecrawlScrape(directUrl);
  await sleep(DELAY_MS);
  let count = extractCountFromMarkdown(md, vendorName);
  if (count > 0) return { count, url: directUrl, via: "g2-direct" };

  // Try 2: G2 search page
  const searchUrl = `https://www.g2.com/search?query=${encodeURIComponent(vendorName)}`;
  md = await firecrawlScrape(searchUrl);
  await sleep(DELAY_MS);
  count = extractCountFromMarkdown(md, vendorName);
  if (count > 0) return { count, url: searchUrl, via: "g2-search" };

  return null;
}

// --- Count from G2/Capterra/Gartner primary URL ---

async function countFromProductUrl(url, vendorName) {
  const md = await firecrawlScrape(url);
  await sleep(DELAY_MS);
  return extractCountFromMarkdown(md, vendorName);
}

// --- Step C: sync from existing rating_breakdown ---

function countFromBreakdown(vendor) {
  if (!vendor.rating_breakdown) return 0;
  return Object.values(vendor.rating_breakdown).reduce((a, b) => a + (parseInt(b) || 0), 0);
}

// --- Main ---

const targets = raw.vendors.filter((v) => (v.reviews_count ?? 0) === 0);
console.log(`Found ${targets.length} vendors with reviews_count=0. Starting enrichment...\n`);

let updated = 0;

for (const v of raw.vendors) {
  if ((v.reviews_count ?? 0) !== 0) continue;

  const srcLabel = v.product_url?.includes("g2.com")
    ? "g2"
    : v.product_url?.includes("capterra.com")
    ? "capterra"
    : v.product_url?.includes("gartner.com")
    ? "gartner"
    : "?";
  process.stdout.write(`[${srcLabel}] ${v.name}: `);

  let count = 0;

  // Step C: breakdown sync (free, no network)
  count = countFromBreakdown(v);
  if (count > 0) {
    v.reviews_count = count;
    updated++;
    console.log(`${count} ✓ (from existing breakdown)`);
    continue;
  }

  // Step A: primary product_url (skip Capterra-only vendors — they genuinely have 0)
  const isCapterraOnly =
    v.product_url?.includes("capterra.com") &&
    !(v.all_sources || []).some((s) => s !== "capterra");

  if (v.product_url && !isCapterraOnly) {
    count = await countFromProductUrl(v.product_url, v.name);
    if (count > 0) {
      v.reviews_count = count;
      updated++;
      console.log(`0 → ${count} ✓ (primary)`);
      continue;
    }
    process.stdout.write("0 on primary, ");
  }

  // Step B: G2 cross-search
  const label = isCapterraOnly ? "capterra-only, searching G2... " : "searching G2... ";
  process.stdout.write(label);
  const found = await searchG2WithFirecrawl(v.name);

  if (found?.count > 0) {
    v.reviews_count = found.count;
    v.g2_url = found.url;
    updated++;
    console.log(`0 → ${found.count} ✓ (${found.via})`);
  } else {
    console.log("– no data");
  }
}

writeFileSync(VENDORS_PATH, JSON.stringify(raw, null, 2));
console.log(`\nDone. ${updated}/${targets.length} vendors updated.`);

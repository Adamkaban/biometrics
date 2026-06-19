// scripts/scrape-ratings.mjs
// Run: node scripts/scrape-ratings.mjs 2>&1 | tee scripts/logs/ratings-$(date +%Y%m%d).log
// Requires: npm install cloakbrowser playwright-core
import { readFileSync, writeFileSync } from "fs";
import { launch } from "cloakbrowser";

const raw = JSON.parse(readFileSync("src/data/vendors.json", "utf-8"));
const DELAY_MS = 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Try to extract star breakdown from any embedded JSON blobs in page HTML */
function extractFromJson(html) {
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Pattern: {"1":N,"2":N,"3":N,"4":N,"5":N} or {"5":N,...}
  const compactMatch = html.match(/\{(?:"[1-5]":\s*\d+,?\s*){3,5}\}/g);
  if (compactMatch) {
    for (const blob of compactMatch) {
      try {
        const obj = JSON.parse(blob);
        const keys = Object.keys(obj).filter((k) => /^[1-5]$/.test(k));
        if (keys.length >= 3) {
          let total = 0;
          for (const k of keys) { result[parseInt(k)] = parseInt(obj[k]); total += parseInt(obj[k]); }
          if (total > 0) return result;
        }
      } catch {}
    }
  }

  // Pattern: "star5Count":N or "fiveStar":N or "five_star":N
  const named = {
    5: html.match(/"(?:star5(?:Count)?|fiveStar|five_star|stars_5|rating5)":\s*(\d+)/)?.[1],
    4: html.match(/"(?:star4(?:Count)?|fourStar|four_star|stars_4|rating4)":\s*(\d+)/)?.[1],
    3: html.match(/"(?:star3(?:Count)?|threeStar|three_star|stars_3|rating3)":\s*(\d+)/)?.[1],
    2: html.match(/"(?:star2(?:Count)?|twoStar|two_star|stars_2|rating2)":\s*(\d+)/)?.[1],
    1: html.match(/"(?:star1(?:Count)?|oneStar|one_star|stars_1|rating1)":\s*(\d+)/)?.[1],
  };
  const namedTotal = Object.values(named).reduce((a, b) => a + (parseInt(b) || 0), 0);
  if (namedTotal > 0) {
    for (const [k, v] of Object.entries(named)) result[parseInt(k)] = parseInt(v) || 0;
    return result;
  }

  // Pattern: ratingBreakdown/ratingHistogram array [{stars:5,count:N},...]
  const arrayMatch = html.match(/"(?:ratingBreakdown|ratingHistogram|starBreakdown|reviewBreakdown)":\s*(\[[^\]]+\])/);
  if (arrayMatch) {
    try {
      const arr = JSON.parse(arrayMatch[1]);
      let total = 0;
      for (const item of arr) {
        const star = item.stars ?? item.star ?? item.rating ?? item.value;
        const count = item.count ?? item.reviews ?? item.total ?? item.reviewCount;
        if (star >= 1 && star <= 5 && count) { result[parseInt(star)] = parseInt(count); total += parseInt(count); }
      }
      if (total > 0) return result;
    } catch {}
  }

  return null;
}

async function fetchG2Ratings(page, productUrl) {
  if (!productUrl?.includes("g2.com")) return null;
  try {
    await page.goto(productUrl, { waitUntil: "networkidle", timeout: 30000 });

    const breakdown = await page.evaluate(() => {
      const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
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

    const html = await page.content();
    const fromJson = extractFromJson(html);
    if (fromJson) return fromJson;

    const starPattern = /data-value="([1-5])"\s[^>]*>[\s\S]*?(\d[\d,]*)\s*review/gi;
    let m;
    while ((m = starPattern.exec(html)) !== null) {
      breakdown[parseInt(m[1])] = parseInt(m[2].replace(/,/g, ""));
    }
    const total2 = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return total2 > 0 ? breakdown : null;
  } catch (e) {
    console.error(` [g2 err: ${e.message}]`);
    return null;
  }
}

async function fetchCapterraRatings(page, productUrl) {
  if (!productUrl?.includes("capterra.com")) return null;
  try {
    // Capterra reviews are on the product page itself
    await page.goto(productUrl, { waitUntil: "networkidle", timeout: 30000 });

    // DOM: Capterra rating bars — look for star label + count pairs
    const breakdown = await page.evaluate(() => {
      const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      // Capterra renders rating bars as rows with star number and review count
      // Selectors observed in 2024-2025 Capterra HTML
      const rows = document.querySelectorAll(
        "[class*='RatingBar'], [class*='rating-bar'], [data-testid*='rating-bar'], [class*='StarCount']"
      );
      rows.forEach((row) => {
        const text = row.textContent || "";
        const starMatch = text.match(/^(\d)\s*stars?/i) || row.closest("[data-star]")?.dataset;
        const countMatch = text.match(/(\d[\d,]+)/);
        if (starMatch && countMatch) {
          const star = parseInt(Array.isArray(starMatch) ? starMatch[1] : starMatch.star);
          if (star >= 1 && star <= 5)
            result[star] = parseInt(countMatch[1].replace(/,/g, ""));
        }
      });
      const total = Object.values(result).reduce((a, b) => a + b, 0);
      return total > 0 ? result : null;
    });

    if (breakdown) return breakdown;

    const html = await page.content();

    // Capterra embeds __NEXT_DATA__ or window.__data with review breakdown
    const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      const fromJson = extractFromJson(nextDataMatch[1]);
      if (fromJson) return fromJson;
    }

    // Generic JSON extraction from full HTML
    return extractFromJson(html);
  } catch (e) {
    console.error(` [capterra err: ${e.message}]`);
    return null;
  }
}

async function fetchGartnerRatings(page, productUrl) {
  if (!productUrl?.includes("gartner.com")) return null;
  try {
    await page.goto(productUrl, { waitUntil: "networkidle", timeout: 30000 });

    // DOM: Gartner Peer Insights rating histogram
    const breakdown = await page.evaluate(() => {
      const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      // Gartner uses table rows or list items for rating distribution
      const rows = document.querySelectorAll(
        "[class*='RatingBar'], [class*='rating-bar'], [data-testid*='star'], [class*='StarRating'], [class*='ratingRow']"
      );
      rows.forEach((row) => {
        const text = row.textContent || "";
        const nums = text.match(/\b([1-5])\b[\s\S]*?(\d[\d,]+)/);
        if (nums) {
          const star = parseInt(nums[1]);
          if (star >= 1 && star <= 5)
            result[star] = parseInt(nums[2].replace(/,/g, ""));
        }
      });
      const total = Object.values(result).reduce((a, b) => a + b, 0);
      return total > 0 ? result : null;
    });

    if (breakdown) return breakdown;

    const html = await page.content();

    // Gartner embeds Apollo/GraphQL state or window.__INITIAL_STATE__
    const stateMatch = html.match(/window\.__(?:INITIAL_STATE|APOLLO_STATE|DATA)__\s*=\s*(\{[\s\S]*?\});\s*(?:<\/script>|window\.)/);
    if (stateMatch) {
      const fromJson = extractFromJson(stateMatch[1]);
      if (fromJson) return fromJson;
    }

    return extractFromJson(html);
  } catch (e) {
    console.error(` [gartner err: ${e.message}]`);
    return null;
  }
}

async function fetchRatings(page, productUrl) {
  if (productUrl?.includes("g2.com")) return fetchG2Ratings(page, productUrl);
  if (productUrl?.includes("capterra.com")) return fetchCapterraRatings(page, productUrl);
  if (productUrl?.includes("gartner.com")) return fetchGartnerRatings(page, productUrl);
  return null;
}

const browser = await launch({ humanize: true });
const page = await browser.newPage();

const results = [];
for (const v of raw.vendors) {
  const source = v.product_url?.includes("g2.com")
    ? "g2"
    : v.product_url?.includes("capterra.com")
    ? "capterra"
    : v.product_url?.includes("gartner.com")
    ? "gartner"
    : "?";
  process.stdout.write(`[${source}] Scraping ${v.name}...`);
  const breakdown = await fetchRatings(page, v.product_url);
  const totalFromSources = breakdown
    ? Object.values(breakdown).reduce((a, b) => a + b, 0)
    : (v.total_reviews_all_sources ?? v.reviews_count);
  results.push({
    ...v,
    rating_breakdown: breakdown ?? v.rating_breakdown ?? null,
    total_reviews_all_sources: totalFromSources,
    reviews_count: Math.max(v.reviews_count ?? 0, totalFromSources ?? 0),
  });
  console.log(breakdown ? ` ✓ (${totalFromSources} reviews)` : " – no data");
  await sleep(DELAY_MS);
}

await browser.close();
writeFileSync("src/data/vendors.json", JSON.stringify({ vendors: results }, null, 2));

const hits = results.filter((v) => v.rating_breakdown !== null).length;
console.log(`Done. ${hits}/${results.length} vendors have rating breakdown.`);

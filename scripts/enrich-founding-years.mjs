#!/usr/bin/env node
// Cross-reference vendor founding years against Wikipedia API (free, no key)
// Reads company-data-issues.json + vendors.json
// Outputs scripts/founding-year-corrections.json + scripts/manual-review.csv

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const raw = JSON.parse(readFileSync(join(root, "src/data/vendors.json"), "utf8"));
const vendors = Array.isArray(raw) ? raw : raw.vendors ?? [];
const issues = JSON.parse(readFileSync(join(__dir, "company-data-issues.json"), "utf8"));

// Vendor name → Wikipedia search term overrides for tricky company names
const WIKI_OVERRIDES = {
  "entrust-idv-formerly-onfido": "Onfido",
  "entrust-identity-verification": "Entrust (company)",
  "1kosmos-platform": "1Kosmos",
  "mitek-systems": "Mitek Systems",
  "imageware-authenticate": "ImageWare Systems",
  "core-identity-verification-solutions": "CORE Identity",
  "luxand-facesdk": "Luxand",
  "deepidv": "DeepID",
  "biometric-time-attendance-system": null, // generic product name, skip
  "video-kyc-identity-verification-software": null, // generic, skip
  "biometric-attendance-system": null, // generic, skip
  "kyc-solution": null, // generic, skip
};

async function searchWikipedia(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation" || data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") return null;
    return data.extract ?? null;
  } catch {
    return null;
  }
}

function extractYear(text) {
  if (!text) return null;
  // Patterns: "founded in 2015", "incorporated in 2015", "established in 2015", "was founded in 2015"
  const patterns = [
    /\bfounded\s+in\s+(\d{4})\b/i,
    /\bincorporated\s+in\s+(\d{4})\b/i,
    /\bestablished\s+in\s+(\d{4})\b/i,
    /\bstarted\s+in\s+(\d{4})\b/i,
    /\bcreated\s+in\s+(\d{4})\b/i,
    /\blaunched\s+in\s+(\d{4})\b/i,
    // "is a ... company founded in 2015"
    /company\s+(?:founded|established)\s+in\s+(\d{4})\b/i,
    // Opening year pattern: "In 2015, [Company] was founded"
    /\bIn\s+(\d{4}),\s+\w+\s+was\s+founded/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const yr = parseInt(m[1]);
      if (yr >= 1970 && yr <= 2026) return yr;
    }
  }
  return null;
}

// Get all slugs to check: Cat A conflicts + top vendors by reviews
const conflictSlugs = new Set(issues.category_a_year_conflicts.map((c) => c.slug));
const topVendors = [...vendors].sort((a, b) => b.reviews_count - a.reviews_count).slice(0, 25);
const topSlugs = new Set(topVendors.map((v) => v.slug));
const slugsToCheck = [...new Set([...conflictSlugs, ...topSlugs])];

console.log(`Checking ${slugsToCheck.length} vendors against Wikipedia...`);
console.log("(Rate-limited: 1 request per 500ms)\n");

const corrections = [];
const manualReview = [];

for (const slug of slugsToCheck) {
  const vendor = vendors.find((v) => v.slug === slug);
  if (!vendor) continue;

  // Determine search term
  let searchTerm;
  if (slug in WIKI_OVERRIDES) {
    searchTerm = WIKI_OVERRIDES[slug];
  } else {
    searchTerm = vendor.name;
  }

  if (!searchTerm) {
    console.log(`  SKIP ${slug} (generic product name)`);
    continue;
  }

  const extract = await searchWikipedia(searchTerm);
  const wikiYear = extractYear(extract);

  const wy = vendor.website_data?.founded_year;
  const cy = vendor.company_data?.founded_year;
  const isConflict = conflictSlugs.has(slug);

  // Determine action
  let action = "none";
  let confidence = "low";
  let recommendation = "";
  let suggestedYear = null;

  if (wikiYear) {
    if (isConflict) {
      if (wikiYear === cy && wikiYear !== wy) {
        // Wikipedia agrees with company_data, disagrees with website_data
        action = "set_website_data_year";
        suggestedYear = wikiYear;
        confidence = "high";
        recommendation = `Wikipedia confirms ${wikiYear} (matches company_data). Update website_data.founded_year from ${wy} to ${wikiYear}.`;
      } else if (wikiYear === wy && wikiYear !== cy) {
        // Wikipedia agrees with website_data (already displayed correctly)
        action = "none_already_correct";
        confidence = "high";
        recommendation = `Wikipedia confirms ${wikiYear} (matches website_data — already displayed correctly). company_data.founded_year ${cy} is wrong but not shown.`;
      } else if (wikiYear !== wy && wikiYear !== cy) {
        // Wikipedia disagrees with both
        action = "manual_review";
        confidence = "low";
        recommendation = `Wikipedia says ${wikiYear}, website_data=${wy}, company_data=${cy}. All three disagree — manual review required.`;
      }
    } else {
      // Not a conflict, just verify top vendor
      if (wy && wikiYear !== wy) {
        action = "manual_review";
        confidence = "medium";
        recommendation = `Wikipedia says ${wikiYear}, currently showing ${wy}. Possible error.`;
      }
    }
  } else {
    if (isConflict) {
      action = "manual_review";
      confidence = "none";
      recommendation = `No Wikipedia data found for "${searchTerm}". Manual verification required for conflict: ${wy} vs ${cy}.`;
    }
  }

  const entry = {
    slug,
    name: vendor.name,
    search_term: searchTerm,
    website_data_year: wy ?? null,
    company_data_year: cy ?? null,
    wikipedia_year: wikiYear,
    action,
    suggested_year: suggestedYear,
    confidence,
    recommendation,
  };

  if (action === "set_website_data_year") {
    corrections.push(entry);
    console.log(`  ✓ CORRECT  ${slug}: ${wy} → ${wikiYear} (Wikipedia confirmed)`);
  } else if (action === "manual_review") {
    manualReview.push(entry);
    console.log(`  ? MANUAL   ${slug}: wiki=${wikiYear ?? "N/A"}, site=${wy}, co=${cy}`);
  } else if (action === "none_already_correct") {
    console.log(`  ✓ OK       ${slug}: ${wy} already correct (wiki=${wikiYear})`);
  } else {
    console.log(`  - SKIP     ${slug}: no conflict, year ${wy ?? "unknown"}`);
  }

  // Rate limit
  await new Promise((r) => setTimeout(r, 500));
}

// Write corrections JSON
const correctionsPath = join(__dir, "founding-year-corrections.json");
writeFileSync(correctionsPath, JSON.stringify(corrections, null, 2));
console.log(`\nWritten: ${correctionsPath} (${corrections.length} auto-correctable)`);

// Write manual review CSV
const csvLines = [
  "slug,name,displayed_year,company_data_year,wikipedia_year,suggested_year,confidence,notes",
  ...manualReview.map((e) =>
    [
      e.slug,
      `"${e.name}"`,
      e.website_data_year ?? "",
      e.company_data_year ?? "",
      e.wikipedia_year ?? "",
      e.suggested_year ?? "",
      e.confidence,
      `"${e.recommendation.replace(/"/g, "'")}"`,
    ].join(",")
  ),
];
const csvPath = join(__dir, "manual-review.csv");
writeFileSync(csvPath, csvLines.join("\n"));
console.log(`Written: ${csvPath} (${manualReview.length} need manual review)`);

console.log(`\n=== SUMMARY ===`);
console.log(`  Auto-correctable (high confidence): ${corrections.length}`);
console.log(`  Need manual review: ${manualReview.length}`);

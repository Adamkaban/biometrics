#!/usr/bin/env node
// Apply founding year corrections + hide implausible funding
// Reads: scripts/founding-year-corrections.json + scripts/company-data-issues.json
// Writes: src/data/vendors.json + src/data/vendors-normalized.json (with backups)

import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const vendorsPath = join(root, "src/data/vendors.json");
const normalizedPath = join(root, "src/data/vendors-normalized.json");

const raw = JSON.parse(readFileSync(vendorsPath, "utf8"));
const vendors = Array.isArray(raw) ? raw : raw.vendors ?? [];

const rawNorm = JSON.parse(readFileSync(normalizedPath, "utf8"));
const vendorsNorm = Array.isArray(rawNorm) ? rawNorm : rawNorm.vendors ?? [];

const corrections = JSON.parse(readFileSync(join(__dir, "founding-year-corrections.json"), "utf8"));
const issues = JSON.parse(readFileSync(join(__dir, "company-data-issues.json"), "utf8"));

// Backups
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupPath = join(root, `src/data/vendors.backup-${timestamp}.json`);
const backupNormPath = join(root, `src/data/vendors-normalized.backup-${timestamp}.json`);
copyFileSync(vendorsPath, backupPath);
copyFileSync(normalizedPath, backupNormPath);
console.log(`Backups: ${backupPath}\n        ${backupNormPath}\n`);

let yearFixed = 0;
let fundingHidden = 0;
const log = [];

// Helper: apply corrections to a given vendors array in-place
function applyToArray(arr, label) {
  let yf = 0, fh = 0;

  for (const corr of corrections) {
    const v = arr.find((x) => x.slug === corr.slug);
    if (!v) continue;

    if (corr.action === "set_website_data_year") {
      const old = v.website_data?.founded_year;
      if (!v.website_data) v.website_data = {};
      v.website_data._founded_year_original = old;
      v.website_data.founded_year = corr.suggested_year;
      if (label === "normalized") console.log(`  YEAR FIX  [${label}] ${corr.slug}: ${old} → ${corr.suggested_year}`);
      yf++;
    } else if (corr.action === "clear_company_data_year") {
      if (v.company_data) {
        v.company_data._founded_year_original = v.company_data.founded_year;
        delete v.company_data.founded_year;
      }
      yf++;
    }
  }

  for (const item of issues.category_b_implausible_funding) {
    const v = arr.find((x) => x.slug === item.slug);
    if (!v?.company_data) continue;
    if (v.company_data.funding_display === false) continue;
    v.company_data._funding_display_original = true;
    v.company_data.funding_display = false;
    if (label === "normalized") console.log(`  HIDE      [${label}] ${item.slug}: ${item.total_funding}`);
    fh++;
  }

  return { yf, fh };
}

// --- Step 1: Apply to vendors.json ---
console.log("Applying to vendors.json:");
const r1 = applyToArray(vendors, "raw");
log.push({ file: "vendors.json", year_fixes: r1.yf, funding_hidden: r1.fh });
yearFixed = r1.yf;
fundingHidden = r1.fh;

// --- Step 2: Apply to vendors-normalized.json ---
console.log("\nApplying to vendors-normalized.json:");
const r2 = applyToArray(vendorsNorm, "normalized");

// --- Step 3: Write both files back ---
const output = Array.isArray(raw) ? vendors : { ...raw, vendors };
writeFileSync(vendorsPath, JSON.stringify(output, null, 2));

const outputNorm = Array.isArray(rawNorm) ? vendorsNorm : { ...rawNorm, vendors: vendorsNorm };
writeFileSync(normalizedPath, JSON.stringify(outputNorm, null, 2));

// Write change log
const logPath = join(__dir, `corrections-applied-${timestamp}.json`);
writeFileSync(logPath, JSON.stringify({ applied_at: new Date().toISOString(), changes: log }, null, 2));

console.log(`\n=== DONE ===`);
console.log(`  Year fixes applied: ${yearFixed}`);
console.log(`  Funding hidden: ${fundingHidden}`);
console.log(`  Log: ${logPath}`);
console.log(`  Backup: ${backupPath}`);

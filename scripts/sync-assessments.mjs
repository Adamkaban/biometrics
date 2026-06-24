/**
 * Sync has_assessment field in vendors-normalized.json
 * by checking which vendors have an MDX file in src/content/assessments/.
 *
 * Run: node scripts/sync-assessments.mjs
 *      node scripts/sync-assessments.mjs --dry
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const NORMALIZED_PATH = resolve(ROOT, "src/data/vendors-normalized.json");
const ASSESSMENTS_DIR = resolve(ROOT, "src/content/assessments");

const DRY = process.argv.includes("--dry");

const assessmentSlugs = new Set(
  readdirSync(ASSESSMENTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""))
);

console.log(`Found ${assessmentSlugs.size} assessment files:`, [...assessmentSlugs].join(", "));

const data = JSON.parse(readFileSync(NORMALIZED_PATH, "utf-8"));
const vendors = data.vendors;

let changed = 0;
for (const vendor of vendors) {
  const hasAssessment = assessmentSlugs.has(vendor.slug);
  if (vendor.has_assessment !== hasAssessment) {
    console.log(`  ${vendor.slug}: ${vendor.has_assessment ?? "undefined"} → ${hasAssessment}`);
    vendor.has_assessment = hasAssessment;
    changed++;
  }
}

console.log(`\n${changed} vendor(s) updated.`);

if (DRY) {
  console.log("[DRY RUN] No files written.");
  process.exit(0);
}

if (changed === 0) {
  console.log("Nothing to write — already in sync.");
  process.exit(0);
}

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupPath = NORMALIZED_PATH.replace(".json", `.backup-${ts}.json`);
copyFileSync(NORMALIZED_PATH, backupPath);
console.log(`Backup: ${backupPath}`);

writeFileSync(NORMALIZED_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`Written: ${NORMALIZED_PATH}`);

#!/usr/bin/env node
/**
 * Build-time consistency gate for vendor data.
 *
 * Fails (exit 1) when vendor data would render contradicting UI:
 *  1. starting_price.raw contains newlines or double-spaces
 *  2. starting_price.amount does not match pricing_plans[0] parsed number
 *  3. top-level pricing string diverges from starting_price.raw (auto-derived channel is broken)
 *  4. company_data.funding_display=true but no funding_source_url provided (unverified funding)
 *  5. free_trial is present but empty (no days AND no verifications AND no note)
 *
 * Wire this into "npm run build" via package.json prebuild script.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src/data/vendors-normalized.json");

const data = JSON.parse(readFileSync(SRC, "utf-8"));

const errors = [];
const warnings = [];

function parseNum(str) {
  if (!str) return null;
  const m = str.match(/[$€£]?\s*([\d,]+\.?\d*)/);
  return m ? parseFloat(m[1].replace(/,/g, "")) : null;
}

for (const v of data.vendors) {
  const tag = `${v.slug}`;

  // 1. Whitespace in starting_price.raw
  if (v.starting_price?.raw && /\n|\s{2,}/.test(v.starting_price.raw)) {
    errors.push(`${tag}: starting_price.raw contains newlines/double-space — "${v.starting_price.raw.replace(/\n/g, "\\n")}"`);
  }

  // 2. Entry-tier price alignment
  const tier0 = v.website_data?.pricing_plans?.[0];
  const tier0Num = tier0?.price ? parseNum(tier0.price) : null;
  if (v.starting_price?.amount && tier0Num && Math.abs(v.starting_price.amount - tier0Num) > 0.01) {
    errors.push(
      `${tag}: starting_price.amount (${v.starting_price.amount}) diverges from pricing_plans[0].price ("${tier0.price}" parsed as ${tier0Num})`
    );
  }

  // 3. Auto-derived pricing string parity
  if (v.starting_price?.raw) {
    // pricing should include the raw (after stripping duplicate "from")
    const stripped = v.starting_price.raw.replace(/^\s*(from|starting at)\s+/i, "");
    const expected = `From ${stripped}`;
    if (v.pricing !== expected) {
      errors.push(
        `${tag}: pricing "${v.pricing}" should be "${expected}" (derived from starting_price). Rerun scripts/reconcile-vendor-data.mjs.`
      );
    }
  }

  // 4. Funding gate
  if (v.company_data?.funding_display && !v.company_data?.funding_source_url) {
    errors.push(
      `${tag}: company_data.funding_display=true but funding_source_url is empty — unverified funding data would render on sidebar`
    );
  }

  // 5. Empty free_trial structure
  if (v.free_trial && !v.free_trial.days && !v.free_trial.verifications && !v.free_trial.note) {
    warnings.push(`${tag}: has_free_trial=${v.has_free_trial} but free_trial has no details (days/verifications/note all empty)`);
  }
}

if (warnings.length) {
  console.log(`\n[audit-vendor-consistency] ${warnings.length} warnings:`);
  for (const w of warnings) console.log(`  ${w}`);
}

if (errors.length) {
  console.error(`\n[audit-vendor-consistency] ${errors.length} errors:`);
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\nFix errors before building. Run: node scripts/reconcile-vendor-data.mjs`);
  process.exit(1);
}

console.log(`\n[audit-vendor-consistency] OK — ${data.vendors.length} vendors pass consistency checks (${warnings.length} warnings).`);

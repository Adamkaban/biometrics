#!/usr/bin/env node
/**
 * Reconcile vendor data — single-source-of-truth pass.
 *
 * Rules applied:
 *  1. Normalize starting_price.raw (strip newlines, collapse whitespace)
 *  2. Auto-derive starting_price from website_data.pricing_plans[0] (entry tier is authoritative)
 *  3. Auto-derive top-level pricing + pricing_summary from starting_price.raw
 *  4. Set funding_display: false unless funding_source_url is present (blocks unverified funding)
 *  5. Vendor-specific overrides for cases with known real-world data (iDenfy free_trial format)
 *  6. Emit reconciliation report to scripts/reports/vendor-data-reconciliation.md
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src/data/vendors-normalized.json");
const BACKUP = join(ROOT, `src/data/vendors-normalized.backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
const REPORT_DIR = join(ROOT, "scripts/reports");
const REPORT = join(REPORT_DIR, "vendor-data-reconciliation.md");

const CURRENCY_SYMBOLS = { "$": "USD", "€": "EUR", "£": "GBP" };
const PERIOD_PATTERNS = [
  { rx: /per verification|per check|\/(verif|check)/i, period: "per_check" },
  { rx: /per user|\/user/i, period: "per_user" },
  { rx: /per month|\/mo|\/month/i, period: "monthly" },
  { rx: /per year|\/yr|\/year/i, period: "yearly" },
];

/** Parse "€1.25 per verification" → {amount, currency, period, raw} */
function parsePriceString(raw) {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const symbolMatch = cleaned.match(/[$€£]/);
  const currency = symbolMatch ? CURRENCY_SYMBOLS[symbolMatch[0]] : null;
  const numMatch = cleaned.match(/[$€£]?\s*([\d,]+\.?\d*)/);
  const amount = numMatch ? parseFloat(numMatch[1].replace(/,/g, "")) : null;
  const periodEntry = PERIOD_PATTERNS.find((p) => p.rx.test(cleaned));
  const period = periodEntry ? periodEntry.period : "per_check";
  if (amount == null || !currency) return null;
  return { amount, currency, period, raw: cleaned };
}

/** Convert starting_price to canonical display string for pricing / pricing_summary */
function priceDisplayFromStartingPrice(sp, vendor) {
  if (!sp) {
    return "Contact vendor for pricing";
  }
  // Strip leading "from" / "starting at" that already lives in raw to avoid "From from £15"
  const stripped = sp.raw.replace(/^\s*(from|starting at)\s+/i, "");
  return `From ${stripped}`;
}

/** Vendor-specific canonical facts we've verified out-of-band */
const VENDOR_OVERRIDES = {
  idenfy: {
    free_trial: {
      days: null,
      verifications: 500,
      requires_card: false,
      note: "500 free identity verifications, no credit card required",
    },
  },
  sumsub: {
    free_trial: {
      days: 14,
      verifications: 50,
      requires_card: false,
      note: "14-day free trial with 50 free checks",
    },
  },
  veriff: {
    free_trial: {
      days: 15,
      verifications: null,
      requires_card: false,
      note: "15-day free trial",
    },
  },
};

const raw = JSON.parse(readFileSync(SRC, "utf-8"));
writeFileSync(BACKUP, JSON.stringify(raw, null, 2));

const changes = [];
const flags = [];

for (const v of raw.vendors) {
  const before = JSON.parse(JSON.stringify(v));
  const vendorLog = [];

  // 1. Normalize existing starting_price.raw whitespace/newlines
  if (v.starting_price?.raw && /\s{2,}|\n/.test(v.starting_price.raw)) {
    const cleaned = v.starting_price.raw.replace(/\s+/g, " ").trim();
    vendorLog.push(`starting_price.raw whitespace cleanup: "${v.starting_price.raw.replace(/\n/g, "\\n")}" → "${cleaned}"`);
    v.starting_price.raw = cleaned;
  }

  // 2. Derive canonical starting_price from pricing_plans[0] (entry tier)
  const tier0 = v.website_data?.pricing_plans?.[0];
  if (tier0?.price) {
    const parsed = parsePriceString(tier0.price);
    if (parsed) {
      // Only overwrite when entry tier has a real numeric price (not "Contact Sales")
      if (!v.starting_price || Math.abs((v.starting_price.amount ?? 0) - parsed.amount) > 0.001) {
        vendorLog.push(
          `starting_price derived from tiers[0] "${tier0.name}": ${v.starting_price?.amount ?? "null"} ${v.starting_price?.currency ?? ""} → ${parsed.amount} ${parsed.currency}`
        );
        v.starting_price = parsed;
      }
    }
  }

  // 3. Auto-derive top-level pricing + pricing_summary from canonical starting_price
  const derivedPricing = priceDisplayFromStartingPrice(v.starting_price, v);
  if (v.pricing !== derivedPricing) {
    vendorLog.push(`pricing string: "${v.pricing}" → "${derivedPricing}"`);
    v.pricing = derivedPricing;
  }
  const derivedSummary = v.starting_price ? v.starting_price.raw : (v.value_tier === "enterprise" ? "Contact Sales" : "Contact Sales");
  if (v.pricing_summary !== derivedSummary) {
    vendorLog.push(`pricing_summary: "${v.pricing_summary}" → "${derivedSummary}"`);
    v.pricing_summary = derivedSummary;
  }

  // 4. free_trial normalization
  //    - If free_trial exists but days is undefined → coerce to null (keeps sidebar rendering graceful)
  if (v.free_trial && v.free_trial.days === undefined) {
    v.free_trial.days = null;
  }

  // 5. Vendor-specific overrides
  const override = VENDOR_OVERRIDES[v.slug];
  if (override) {
    for (const [key, value] of Object.entries(override)) {
      vendorLog.push(`override ${key}: ${JSON.stringify(v[key])} → ${JSON.stringify(value)}`);
      v[key] = value;
    }
  }

  // 6. Gate funding_display behind funding_source_url
  if (v.company_data) {
    if (v.company_data.funding_display === true && !v.company_data.funding_source_url) {
      vendorLog.push(`funding_display: true → false (no funding_source_url; hides "${v.company_data.total_funding} ${v.company_data.funding_stage}")`);
      v.company_data.funding_display = false;
    }
    // Ensure the field exists so future edits are easy
    if (!("funding_source_url" in v.company_data)) {
      v.company_data.funding_source_url = null;
    }
  }

  // 7. Flag remaining problems for manual review
  if (v.has_free_trial && (!v.free_trial || (v.free_trial.days == null && v.free_trial.verifications == null))) {
    flags.push({
      slug: v.slug,
      issue: "trial claimed but no days/verifications details — sidebar will show generic 'Free trial' badge only",
    });
  }
  const tier0Num = tier0?.price ? parsePriceString(tier0.price)?.amount : null;
  if (v.starting_price?.amount && tier0Num && Math.abs(v.starting_price.amount - tier0Num) > 0.01) {
    flags.push({
      slug: v.slug,
      issue: `starting_price.amount ${v.starting_price.amount} still diverges from tiers[0].price ${tier0.price}`,
    });
  }

  if (vendorLog.length) {
    changes.push({ slug: v.slug, name: v.name, changes: vendorLog });
  }
}

// Update the write timestamp
raw.last_reconciled_at = new Date().toISOString();

writeFileSync(SRC, JSON.stringify(raw, null, 2));

// Build report
mkdirSync(REPORT_DIR, { recursive: true });
const lines = [];
lines.push(`# Vendor Data Reconciliation Report`);
lines.push(``);
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(``);
lines.push(`- Source: \`src/data/vendors-normalized.json\``);
lines.push(`- Backup: \`${BACKUP.split("/").pop()}\``);
lines.push(`- Total vendors: ${raw.vendors.length}`);
lines.push(`- Vendors changed: ${changes.length}`);
lines.push(`- Manual-review flags: ${flags.length}`);
lines.push(``);
lines.push(`## Automatic changes`);
lines.push(``);
for (const c of changes) {
  lines.push(`### ${c.name} (\`${c.slug}\`)`);
  for (const change of c.changes) {
    lines.push(`- ${change}`);
  }
  lines.push(``);
}
lines.push(`## Manual review needed`);
lines.push(``);
if (flags.length === 0) {
  lines.push(`_None._`);
} else {
  for (const f of flags) {
    lines.push(`- **${f.slug}**: ${f.issue}`);
  }
}
writeFileSync(REPORT, lines.join("\n"));

console.log(`Reconciliation complete.`);
console.log(`  Changed: ${changes.length}/${raw.vendors.length}`);
console.log(`  Flags: ${flags.length}`);
console.log(`  Backup: ${BACKUP.split("/").pop()}`);
console.log(`  Report: scripts/reports/vendor-data-reconciliation.md`);

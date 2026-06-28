#!/usr/bin/env node
// Detect factual contradictions in vendor company data
// Outputs scripts/company-data-issues.json

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const raw = JSON.parse(readFileSync(join(root, "src/data/vendors.json"), "utf8"));
const vendors = Array.isArray(raw) ? raw : raw.vendors ?? [];

function parseFunding(str) {
  if (!str) return null;
  const m = str.match(/\$?([\d.]+)\s*([BbMmKk]?)/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "B") return num * 1000;
  if (unit === "M") return num;
  if (unit === "K") return num / 1000;
  return num;
}

const catA = []; // founded_year internal conflicts
const catB = []; // implausible funding/stage
const catC = []; // funding_display=true but no founded_year
const notes = [];

for (const v of vendors) {
  const wy = v.website_data?.founded_year;
  const cy = v.company_data?.founded_year;
  const slug = v.slug;
  const name = v.name;

  // Category A: year conflicts
  if (wy && cy && wy !== cy) {
    catA.push({
      slug,
      name,
      website_data_year: wy,
      company_data_year: cy,
      diff: Math.abs(wy - cy),
      displayed: wy, // template uses website_data.founded_year
    });
  }

  // Category B: implausible funding
  if (v.company_data?.funding_display && v.company_data?.total_funding) {
    const stage = (v.company_data.funding_stage ?? "").toLowerCase();
    const amountM = parseFunding(v.company_data.total_funding);
    const issues = [];

    if (stage.includes("seed") && amountM !== null && amountM > 15) {
      issues.push(`Seed round $${amountM}M > $15M threshold`);
    }
    if (stage.includes("series a") && amountM !== null && amountM < 2) {
      issues.push(`Series A $${amountM}M < $2M threshold`);
    }
    if (stage.includes("series b") && amountM !== null && amountM < 5) {
      issues.push(`Series B $${amountM}M < $5M threshold`);
    }
    if (stage.includes("series d") && amountM !== null && amountM < 10) {
      issues.push(`Series D $${amountM}M < $10M threshold`);
    }
    if (amountM !== null && amountM > 300 && stage.includes("private equity")) {
      const emp = v.company_data?.employee_count_range ?? v.website_data?.employee_count_range ?? "";
      if (emp && (emp.includes("51-200") || emp.includes("201-500"))) {
        issues.push(`$${amountM}M Private Equity for company with only ${emp} employees`);
      }
    }
    // IPO with small amount
    if (stage.includes("ipo") && amountM !== null && amountM < 20) {
      issues.push(`IPO with only $${amountM}M — unusual`);
    }

    if (issues.length > 0) {
      catB.push({
        slug,
        name,
        total_funding: v.company_data.total_funding,
        funding_stage: v.company_data.funding_stage,
        amount_m: amountM,
        issues,
        recommendation: "set funding_display=false until verified",
      });
    }
  }

  // Category C: funding shown but no founding year
  if (v.company_data?.funding_display && !wy && !cy) {
    catC.push({ slug, name, total_funding: v.company_data?.total_funding });
  }
}

// Sort Cat A by diff descending (biggest disagreement first)
catA.sort((a, b) => b.diff - a.diff);

const output = {
  generated_at: new Date().toISOString(),
  summary: {
    total_vendors: vendors.length,
    cat_a_year_conflicts: catA.length,
    cat_b_implausible_funding: catB.length,
    cat_c_no_year_with_funding: catC.length,
  },
  category_a_year_conflicts: catA,
  category_b_implausible_funding: catB,
  category_c_funding_no_year: catC,
};

const outPath = join(__dir, "company-data-issues.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Written: ${outPath}`);
console.log(`\nSummary:`);
console.log(`  Year conflicts (Cat A): ${catA.length}`);
console.log(`  Implausible funding (Cat B): ${catB.length}`);
console.log(`  Funding shown, no year (Cat C): ${catC.length}`);
console.log(`\nCat A conflicts:`);
for (const c of catA) {
  console.log(`  ${c.slug}: website=${c.website_data_year} vs company=${c.company_data_year} (displayed: ${c.displayed})`);
}
console.log(`\nCat B implausible funding:`);
for (const c of catB) {
  console.log(`  ${c.slug}: ${c.total_funding} ${c.funding_stage} — ${c.issues[0]}`);
}

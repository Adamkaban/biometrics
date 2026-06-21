/**
 * Cleanup hallucinated / conflicting pricing plans in vendors.json
 * and vendors-normalized.json based on verified live scraping.
 *
 * Run: node scripts/cleanup-pricing.mjs
 * Dry-run: node scripts/cleanup-pricing.mjs --dry
 *
 * Creates timestamped backups before writing anything.
 */

import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const VENDORS_PATH = resolve(ROOT, "src/data/vendors.json");
const NORMALIZED_PATH = resolve(ROOT, "src/data/vendors-normalized.json");
const DRY = process.argv.includes("--dry");

// ─────────────────────────────────────────────────────────────────
// CHANGE MANIFEST
// Each key = exact vendor `name` field in JSON files.
//
// Actions:
//   remove_by_name  — delete plans whose name matches any in `remove[]`
//                     (keeps all other plans intact, preserves features_included)
//   replace_all     — replace entire pricing_plans array with `plans`
//
// Optional `normalized` block = updates only in vendors-normalized.json
// ─────────────────────────────────────────────────────────────────
const CHANGES = {

  // ── Remove specific bad plans, keep verified ones ──

  "Sumsub": {
    action: "remove_by_name",
    remove: ["Basic Plan", "Custom Plan"],
    // Keeps: Basic $1.35, Compliance $1.85, Enterprise — all confirmed live
  },

  "Veriff": {
    action: "remove_by_name",
    remove: ["Basic Plan", "Pro Plan"],
    // Keeps: Essential $0.80, Plus $1.39, Premium $1.89, Enterprise — all confirmed live
  },

  "ComplyCube": {
    action: "remove_by_name",
    remove: ["Basic Plan", "Pro Plan", "Enterprise Plan", "Basic", "Pro", "Essential"],
    // Keeps: Starter $99/mo, Core $299/mo, Growth, Enterprise — confirmed live
  },

  "Shufti": {
    action: "remove_by_name",
    remove: [
      "Pay As You Go", "Monthly Subscription", "Enterprise Solutions",
      "Basic", "Pro",
      "Basic Plan", "Standard Plan", "Premium Plan",
    ],
    // Keeps: Free Forever $0, Essentials $0.95, Enterprise — confirmed live
  },

  "Identomat": {
    action: "remove_by_name",
    remove: ["Basic Plan", "Pro Plan", "Enterprise Plan", "Basic", "Pro", "Enterprise"],
    // Keeps: Free Trial, Essentials $0.45, Advanced $0.28, Custom — confirmed live
  },

  "Entrust IDV, formerly Onfido": {
    action: "remove_by_name",
    remove: ["Basic", "Pro", "Enterprise"],
    // Keeps: Basic Plan Contact, Standard Plan Contact, Enterprise Plan Contact
    // (the "$29/month" and "$79/month" plans are hallucinated)
  },

  // ── Replace all plans with verified live data ──

  "iDenfy": {
    action: "replace_all",
    plans: [
      {
        name: "Basic",
        price: "€1.25 per verification",
        features_included: [
          "ID verification",
          "Document surface analysis",
          "Face verification & matching",
          "Liveness detection",
          "Minimum commitment: €125/month",
        ],
      },
      {
        name: "Premium",
        price: "€1.20 per verification",
        features_included: [
          "Everything in Basic",
          "Discounts on extras",
          "Minimum commitment: €300/month",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom (from €0.50 at volume)",
        features_included: [
          "Account manager",
          "Business verification",
          "ISO 27001 and SOC II",
          "Cyber insurance",
          "Discounts on extras",
        ],
      },
    ],
    normalized: {
      pricing: "Starting at €1.20/verification",
      pricing_summary: "From €1.20/verification",
      pricing_model: "per_check",
      starting_price: {
        amount: 1.20,
        currency: "EUR",
        period: "per_check",
        raw: "€1.20 per verification",
      },
      min_monthly_commitment: {
        amount: 125,
        currency: "EUR",
        raw: "€125/mo minimum",
      },
    },
  },

  "Ondato": {
    action: "replace_all",
    plans: [
      {
        name: "Identity Verification",
        price: "€0.50–€1.40 per verification",
        features_included: [
          "AI-Based ID verification",
          "AML Screening",
          "Proof of Address Check",
          "KYC Specialist Check (add-on)",
          "Session Video Recording (add-on)",
        ],
      },
      {
        name: "Know Your Business",
        price: "From €600",
        features_included: ["Business verification"],
      },
      {
        name: "Age Verification",
        price: "From €0.01 per verification",
        features_included: ["Age verification"],
      },
      {
        name: "Enterprise",
        price: "Talk to sales",
        features_included: [],
      },
    ],
    normalized: {
      pricing_summary: "From €0.50/verification",
      pricing_model: "per_check",
      starting_price: {
        amount: 0.50,
        currency: "EUR",
        period: "per_check",
        raw: "€0.50–€1.40 per verification",
      },
    },
  },

  "Persona": {
    action: "replace_all",
    plans: [
      {
        name: "Essential",
        price: "Starting at $250/month",
        features_included: [
          "Templated identity verification services",
          "Platform automation features",
          "SOC 2 Type 2 infrastructure",
          "12-month minimum contract",
        ],
      },
      {
        name: "Growth",
        price: "Custom",
        features_included: [
          "Everything in Essential",
          "Graph access",
          "3rd-party Marketplace Apps",
          "Advanced security configuration",
          "Redaction and permissions",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom",
        features_included: [
          "Everything in Growth",
          "Custom multi-organization partitioning",
          "Custom multi-product pricing",
          "Dedicated support",
        ],
      },
    ],
    normalized: {
      pricing_summary: "From $250/month",
      pricing_model: "flat_monthly",
      starting_price: {
        amount: 250,
        currency: "USD",
        period: "monthly",
        raw: "Starting at $250/month (12-month minimum)",
      },
    },
  },

  "Trust Swiftly": {
    action: "replace_all",
    plans: [
      {
        name: "Starter",
        price: "$300/month",
        features_included: [
          "100 verifications/month",
          "1 admin seat",
          "No setup fees",
          "Hosted flows or API",
          "Immediate access",
        ],
      },
      {
        name: "Business",
        price: "$600/month",
        features_included: [
          "200 verifications/month",
          "Unlimited seats",
          "No setup fees",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: [
          "Government-grade identity verification",
          "High-volume deployments",
          "IAL3-ready",
        ],
      },
    ],
    // pricing_summary already "From $300/mo" — correct, no normalized update needed
  },

  "Ping Identity Platform": {
    action: "replace_all",
    plans: [
      {
        name: "Essential",
        price: "$35,000/year",
        features_included: ["SSO", "MFA", "Cloud-based identity solutions"],
      },
      {
        name: "Plus",
        price: "$50,000/year",
        features_included: [
          "Everything in Essential",
          "Advanced authentication policies",
          "Context-based MFA",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: ["PingOne Advanced Services", "Custom enterprise solutions"],
      },
    ],
    normalized: {
      pricing_summary: "From $35,000/year",
      pricing_model: "flat_yearly",
      starting_price: {
        amount: 35000,
        currency: "USD",
        period: "per_year",
        raw: "$35k/year",
      },
    },
  },

  "AU10TIX": {
    action: "replace_all",
    plans: [
      {
        name: "Basic KYC",
        price: "Contact sales",
        features_included: [
          "ID Verification",
          "Biometrics (Liveness & Face Match)",
          "Case Management Dashboard",
          "Full global coverage",
          "+180 Forgery detection tests",
          "Plug & Play — out-of-the-box workflows",
          "$500 monthly minimum",
        ],
      },
      {
        name: "Enhanced KYC",
        price: "Contact sales",
        features_included: [
          "Everything in Basic KYC",
          "Deepfake Detection",
          "Proof of Address",
          "Serial Fraud Detector",
          "Dynamic Workflows",
          "Manual Review",
          "AML Screening",
          "$500 monthly minimum",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: ["Custom multi-product pricing", "Dedicated support"],
      },
    ],
  },

  "KYC Solution": {
    action: "replace_all",
    plans: [
      {
        name: "Starter",
        price: "From €0.25 per verification",
        features_included: [
          "Up to ~5,000 checks/month",
          "Passport & ID verification",
          "Biometric face match + basic liveness",
          "Essential AML & sanctions screening",
          "Dashboard access + basic API",
          "No setup fee, no minimum commitment",
        ],
      },
      {
        name: "Growth",
        price: "From €0.18 per verification",
        features_included: [
          "5,000–50,000 checks/month",
          "230+ country document coverage",
          "Advanced biometrics & enhanced liveness",
          "AML, sanctions, PEP, media checks",
          "Full API + SDK",
          "Custom rules & workflows",
        ],
      },
      {
        name: "Scale",
        price: "From €0.14 per verification",
        features_included: [
          "Everything in Growth",
          "50,000+ checks/month",
          "Volume-based pricing",
        ],
      },
      {
        name: "Enterprise",
        price: "From €0.10 per verification",
        features_included: [
          "Fully negotiable",
          "No mandatory minimum commitment",
          "Custom bundles for KYC, AML, sanctions, PEP, biometrics",
        ],
      },
    ],
    // pricing_summary already "From €0.25/check", starting_price already correct EUR
  },

  "Amiqus": {
    action: "replace_all",
    plans: [
      {
        name: "Standard (Client Onboarding)",
        price: "From £15 per client",
        features_included: [
          "Minimum contract: £500/month",
          "Pre-built client journeys",
          "Custom templates",
          "Team task assignments",
          "Custom forms & branding",
        ],
      },
      {
        name: "Scale (Client Onboarding)",
        price: "From £10 per client",
        features_included: [
          "2,000+ clients/year typical",
          "Everything in Standard",
          "Bulk uploads",
          "API connectivity",
          "Unlimited custom forms",
          "Integrations with PMS",
        ],
      },
      {
        name: "Enterprise (Client Onboarding)",
        price: "Custom",
        features_included: [
          "10,000+ clients/year typical",
          "AML consultancy",
          "Bespoke migration & implementation",
          "Dedicated account manager",
        ],
      },
      {
        name: "Standard (Staff Onboarding)",
        price: "From £7.50 per candidate",
        features_included: [
          "Minimum contract: £500/month",
          "Right to Work check from £7.50",
          "BPSS screening from £20",
          "Automated referencing from £10",
        ],
      },
      {
        name: "Scale (Staff Onboarding)",
        price: "From £6 per candidate",
        features_included: [
          "1,250+ candidates/year typical",
          "Right to Work check from £6.75",
          "BPSS screening from £18",
          "CSV & JSON exports",
          "ATS integrations",
        ],
      },
      {
        name: "Enterprise (Staff Onboarding)",
        price: "Custom",
        features_included: [
          "10,000+ candidates/year typical",
          "SSO functionality",
          "AML consultancy",
          "Data hosting localisation",
        ],
      },
    ],
    // pricing_summary already "From £15/mo", starting_price already correct GBP
  },

  "ZipID": {
    action: "replace_all",
    plans: [
      {
        name: "Basic Queen Bee",
        price: "$7.50 per transaction",
        features_included: [
          "I-9 compliance workflow",
          "AI-powered ICE compliant OCR",
          "Remote, hybrid, in-person hires",
          "E-Verify redirect with auto-populated fields",
          "Downloadable I-9 PDF with IDs and selfie",
          "Audit-ready activity log",
          "Full encryption at rest and in transit",
        ],
      },
      {
        name: "Buzzing Hive",
        price: "$9.50 per transaction",
        features_included: [
          "Everything in Basic Queen Bee",
          "NIST-validated 1:1 biometric facial recognition (99.998% accuracy)",
          "Live selfie matched to government-issued ID at point of hire",
          "Liveness detection — prevents spoofing and deepfakes",
          "AI-powered fraud detection",
          "Identity confidence score",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: [],
      },
    ],
  },

  // ── Hallucinated plans — no public pricing confirmed ──

  "UltraPass": {
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact for pricing",
        features_included: [],
      },
    ],
  },

  "Biometric Time Attendance System": {
    // Website: idemia.com — enterprise identity company, confirmed no SaaS pricing
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact for pricing",
        features_included: [],
      },
    ],
  },

  "Jumio": {
    // Website: jumio.com — enterprise only, no self-serve plans
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: [],
      },
    ],
  },

  "SentiVeillance Cluster": {
    // Website aidoos.com is an AI workforce platform — wrong vendor mapping
    // Plans are entirely hallucinated
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact for pricing",
        features_included: [],
      },
    ],
  },

  "Data Zoo Flow": {
    // Website datazoo.com — no public pricing, custom solutions only
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact sales",
        features_included: ["Custom identity verification and fraud detection solutions"],
      },
    ],
  },

  "Experian Identity proofing": {
    // Enterprise B2B — no public pricing
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact for pricing",
        features_included: [],
      },
    ],
  },

  "Biometric Agreement": {
    // Website firmaautografa.com — no pricing page, contact only
    action: "replace_all",
    plans: [
      {
        name: "Enterprise",
        price: "Contact for pricing",
        features_included: [],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────
// APPLY CHANGES
// ─────────────────────────────────────────────────────────────────

function applyPlanChange(vendor, config) {
  const plans = vendor.website_data?.pricing_plans;
  const oldPlans = (plans ?? []).map((p) => `${p.name}: ${p.price}`).join(" | ");

  if (config.action === "remove_by_name") {
    const removeSet = new Set(config.remove);
    const newPlans = (plans ?? []).filter((p) => !removeSet.has(p.name));
    if (!vendor.website_data) vendor.website_data = {};
    vendor.website_data.pricing_plans = newPlans;
  } else if (config.action === "replace_all") {
    if (!vendor.website_data) vendor.website_data = {};
    vendor.website_data.pricing_plans = config.plans;
  }

  const newPlans = (vendor.website_data?.pricing_plans ?? [])
    .map((p) => `${p.name}: ${p.price}`)
    .join(" | ");

  return { oldPlans, newPlans };
}

function applyNormalizedFields(vendor, normalized) {
  const changes = [];
  for (const [key, value] of Object.entries(normalized)) {
    const old = JSON.stringify(vendor[key]);
    vendor[key] = value;
    changes.push(`  ${key}: ${old} → ${JSON.stringify(value)}`);
  }
  return changes;
}

function processFile(filePath, label, applyNormalized) {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  const vendors = raw.vendors;
  const report = [];

  for (const [vendorName, config] of Object.entries(CHANGES)) {
    const vendor = vendors.find((v) => v.name === vendorName);
    if (!vendor) {
      report.push(`[WARN] "${vendorName}" not found in ${label}`);
      continue;
    }

    const { oldPlans, newPlans } = applyPlanChange(vendor, config);
    report.push(`\n[${label}] ${vendorName}`);
    report.push(`  action: ${config.action}`);
    report.push(`  BEFORE: ${oldPlans || "(empty)"}`);
    report.push(`  AFTER:  ${newPlans || "(empty)"}`);

    if (applyNormalized && config.normalized) {
      const fieldChanges = applyNormalizedFields(vendor, config.normalized);
      fieldChanges.forEach((c) => report.push(c));
    }
  }

  return { raw, report };
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

if (!DRY) {
  const vBackup = VENDORS_PATH.replace(".json", `.backup-${ts}.json`);
  const nBackup = NORMALIZED_PATH.replace(".json", `.backup-${ts}.json`);
  copyFileSync(VENDORS_PATH, vBackup);
  copyFileSync(NORMALIZED_PATH, nBackup);
  console.log(`Backups created:\n  ${vBackup}\n  ${nBackup}\n`);
}

// Process vendors.json (plans only)
const { raw: vRaw, report: vReport } = processFile(VENDORS_PATH, "vendors.json", false);

// Process vendors-normalized.json (plans + normalized fields)
const { raw: nRaw, report: nReport } = processFile(NORMALIZED_PATH, "vendors-normalized.json", true);

// Print report
console.log("=== vendors.json changes ===");
vReport.forEach((l) => console.log(l));
console.log("\n=== vendors-normalized.json changes ===");
nReport.forEach((l) => console.log(l));

if (DRY) {
  console.log("\n[DRY RUN] No files written.");
} else {
  writeFileSync(VENDORS_PATH, JSON.stringify(vRaw, null, 2));
  writeFileSync(NORMALIZED_PATH, JSON.stringify(nRaw, null, 2));
  console.log("\nFiles written successfully.");
}

// Summary
const vendorCount = Object.keys(CHANGES).length;
const replaceCount = Object.values(CHANGES).filter((c) => c.action === "replace_all").length;
const removeCount = Object.values(CHANGES).filter((c) => c.action === "remove_by_name").length;
const normalizedCount = Object.values(CHANGES).filter((c) => c.normalized).length;
console.log(`\nSummary: ${vendorCount} vendors touched`);
console.log(`  replace_all: ${replaceCount}`);
console.log(`  remove_by_name: ${removeCount}`);
console.log(`  normalized field updates: ${normalizedCount}`);

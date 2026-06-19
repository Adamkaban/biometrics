// scripts/normalize-vendors.mjs
// Pure, deterministic normalizer.
// Input : scripts/data/vendors-enriched.json (from scrape-vendor-data.mjs)
// Output: src/data/vendors-normalized.json   (consumed by src/lib/vendors.ts)
//
// Run: node scripts/normalize-vendors.mjs

import { readFileSync, writeFileSync } from "fs";

const INPUT_FILE  = "scripts/data/vendors-enriched.json";
const OUTPUT_FILE = "src/data/vendors-normalized.json";

// ─── Canonical vocabularies ──────────────────────────────────────────────────

// Map every observed certification spelling → canonical key.
// Unmapped values fall into compliance_certifications_other.
const CERT_CANON = new Map([
  // SOC 2
  ["SOC 2",                "SOC 2"],
  ["SOC 2 Type II",        "SOC 2 Type II"],
  ["SOC2 Type II",         "SOC 2 Type II"],
  ["SOC 2 Type I",         "SOC 2 Type I"],
  // ISO
  ["ISO 27001",            "ISO 27001"],
  ["ISO 27701",            "ISO 27701"],
  ["ISO 9001",             "ISO 9001"],
  ["ISO 9001:2015",        "ISO 9001"],
  ["ISO 14001",            "ISO 14001"],
  ["ISO 30107-3",          "ISO 30107-3"],
  ["30107-3",              "ISO 30107-3"],
  ["ISO 30107-3 Level 1 & 2", "ISO 30107-3"],
  ["ISO/IEC 30107-3 Level 1", "iBeta PAD Level 1"],
  ["ISO/IEC 30107-3 Level 2", "iBeta PAD Level 2"],
  ["ISO Level 1",          "iBeta PAD Level 1"],
  ["ISO Level 2",          "iBeta PAD Level 2"],
  ["IBETA-ISO Level 1",    "iBeta PAD Level 1"],
  ["IBETA-ISO Level 2",    "iBeta PAD Level 2"],
  // iBeta
  ["iBeta",                "iBeta PAD"],
  ["iBeta PAD",            "iBeta PAD"],
  ["iBeta Level 2",        "iBeta PAD Level 2"],
  ["iBeta PAD Level 1",    "iBeta PAD Level 1"],
  ["iBeta PAD Level 2",    "iBeta PAD Level 2"],
  ["iBeta PAD, Level 1-5", "iBeta PAD Level 2"],
  // Regulatory
  ["GDPR",                 "GDPR"],
  ["GDPR Compliance",      "GDPR"],
  ["CCPA",                 "CCPA"],
  ["HIPAA",                "HIPAA"],
  ["PCI DSS",              "PCI DSS"],
  ["PCIDSS",               "PCI DSS"],
  ["PIPEDA",               "PIPEDA"],
  ["FedRAMP",              "FedRAMP"],
  ["eIDAS",                "eIDAS"],
  ["FIDO2",                "FIDO2"],
  ["Fido certified",       "FIDO2"],
  ["NIST",                 "NIST 800-63"],
  ["NIST 800-63 AAL2",     "NIST 800-63"],
  ["NIST 800-63 IAL2",     "NIST 800-63"],
  ["NIST IAL3",            "NIST 800-63"],
  ["NIST FRVT-PAD",        "NIST FRVT-PAD"],
  // Other recognised
  ["Privacy Shield",       "Privacy Shield"],
  ["Kantara",              "Kantara"],
  ["UK Cyber Essentials",  "Cyber Essentials"],
  ["Cyber Essentials",     "Cyber Essentials"],
  ["UK DiATF IDSP",        "UK DiATF"],
  ["UKDIATF",              "UK DiATF"],
  ["CSA STAR",             "CSA STAR"],
  ["WCAAG",                "WCAG"],
  ["Adobe Approved Trust List (AATL)", "Adobe AATL"],
  ["European Trusted List (EUTL)",     "EUTL"],
  ["Qualified Trust Service Provider", "QTSP"],
  ["IEEE 2410 Standard for Biometric Privacy", "IEEE 2410"],
  ["Certified compliant to IEEE 2410", "IEEE 2410"],
]);

// Compliance flag keys derived from canonical certs.
const CERT_TO_FLAG = {
  "SOC 2":              "soc2",
  "SOC 2 Type I":       "soc2",
  "SOC 2 Type II":      "soc2_type2",
  "ISO 27001":          "iso27001",
  "ISO 27701":          "iso27701",
  "ISO 30107-3":        "iso30107_3",
  "GDPR":               "gdpr",
  "CCPA":               "ccpa",
  "HIPAA":              "hipaa",
  "PCI DSS":            "pci_dss",
  "FedRAMP":            "fedramp",
  "eIDAS":              "eidas",
  "FIDO2":              "fido2",
  "NIST 800-63":        "nist_800_63",
  "iBeta PAD Level 1":  "ibeta_pad_l1",
  "iBeta PAD Level 2":  "ibeta_pad_l2",
  "PIPEDA":             "pipeda",
};

const COMPLIANCE_FLAG_KEYS = [
  "soc2", "soc2_type2", "iso27001", "iso27701", "iso30107_3",
  "gdpr", "ccpa", "hipaa", "pci_dss", "fedramp", "eidas",
  "fido2", "nist_800_63", "ibeta_pad_l1", "ibeta_pad_l2", "pipeda",
];

// Integrations — denoise + dedupe.
// Drop values: chat/IDE/marketing noise that isn't a real product integration.
const INTEGRATION_DROP = new Set([
  "Claude Code", "Cursor", "Copilot",
  "Discord", "Telegram", "Slack", "MS Teams", "Microsoft Teams",
  "Capgemini", "IBM", "Infosys", "Emerge Consultants", // consulting partners, not integrations
  "ATS", "PMS", "CRM integrations", "Banking APIs", "Third-party data services", "Internal systems",
  "Behavior and Transaction Monitoring integrations", "User-friendly APIs",
  "Job boards (20+ partner boards)", "Cloud", "Cloud-based", "Cloud Hosting",
  "Cloud services", "Cloud solutions", "Cloud Solutions", "Cloud Integration",
  "Cloud integration", "Cloud-based integration", "Google Cloud", "Google Cloud Platform",
  "AWS", "App Store", "Google Play",
]);

const INTEGRATION_CANON = new Map([
  // APIs
  ["API",                   "REST API"],
  ["REST API",              "REST API"],
  ["RESTful API",           "REST API"],
  ["Custom REST API",       "REST API"],
  ["Web API",               "REST API"],
  ["Face Web API",          "REST API"],
  ["GraphQL API",           "GraphQL API"],
  // SDKs
  ["Web SDK",               "Web SDK"],
  ["JavaScript SDK",        "Web SDK"],
  ["Web widget SDK",        "Web SDK"],
  ["iOS SDK",               "iOS SDK"],
  ["Swift SDK",             "iOS SDK"],
  ["Mobile SDK (iOS)",      "iOS SDK"],
  ["Android SDK",           "Android SDK"],
  ["Kotlin SDK",            "Android SDK"],
  ["Mobile SDK (Android)",  "Android SDK"],
  ["Mobile SDK",            "Mobile SDK"],
  ["Mobile SDK (iOS/Android)",        "Mobile SDK"],
  ["Mobile SDK for iOS and Android",  "Mobile SDK"],
  ["Java SDK",              "Java SDK"],
  ["Python SDK",            "Python SDK"],
  ["Flutter",               "Flutter"],
  ["React Native",          "React Native"],
  ["Xamarin",               "Xamarin"],
  ["Cordova/PhoneGap",      "Cordova/PhoneGap"],
  // Connectors / no-code
  ["Webhook",               "Webhook"],
  ["Webhooks",              "Webhook"],
  ["Zapier",                "Zapier"],
  ["Zapier integration",    "Zapier"],
  ["Make (Integromat)",     "Make"],
  ["No-code/Dashboard",     "No-code"],
  ["No-Code Journey Builder","No-code"],
  ["No-code automation",    "No-code"],
  ["No-code workflows",     "No-code"],
  ["iframe",                "iframe"],
  // Platforms
  ["Salesforce",            "Salesforce"],
  ["HubSpot",               "HubSpot"],
  ["Shopify",               "Shopify"],
  ["WooCommerce",           "WooCommerce"],
  ["WordPress",             "WordPress"],
  ["Magento",               "Magento"],
  ["Stripe",                "Stripe"],
  // Deployment
  ["On-premise",            "On-premise"],
  ["On-premise solutions",  "On-premise"],
  ["On-premise Installation","On-premise"],
  ["On-premise deployment", "On-premise"],
  ["On-premises Deployment","On-premise"],
  // Identity wallets / govt
  ["DigiLocker",            "DigiLocker"],
  ["Aadhaar Authentication","Aadhaar"],
  ["eNACH",                 "eNACH"],
  ["RDC",                   "RDC"],
]);

// Verification types are already pretty clean from the scraper. Pass-through map
// so that any future scraper additions can be canonicalised here.
const VERIFICATION_CANON = new Map([
  ["ID Verification",        "ID Verification"],
  ["Biometric Liveness",     "Biometric Liveness"],
  ["Face Recognition",       "Face Recognition"],
  ["AML/PEP Screening",      "AML/PEP Screening"],
  ["KYB",                    "KYB"],
  ["Transaction Monitoring", "Transaction Monitoring"],
  ["Database Check",         "Database Check"],
  ["eSignature",             "eSignature"],
  ["Address Verification",   "Address Verification"],
  ["Phone Verification",     "Phone Verification"],
  ["Email Verification",     "Email Verification"],
  ["Fingerprint",            "Fingerprint"],
  ["Voice Biometrics",       "Voice Biometrics"],
  ["NFC",                    "NFC"],
  ["Video KYC",              "Video KYC"],
]);

// HQ string → region tag.
const REGION_MAP = {
  // North America
  USA: "NA", "UNITED STATES": "NA", "United States": "NA", Canada: "NA", Mexico: "NA",
  // Europe (incl. UK)
  UK: "EU", "UNITED KINGDOM": "EU", "United Kingdom": "EU",
  Germany: "EU", Spain: "EU", Lithuania: "EU", Estonia: "EU", Latvia: "EU",
  Netherlands: "EU", France: "EU", Sweden: "EU", Switzerland: "EU",
  Ireland: "EU", Slovakia: "EU", Italy: "EU", Poland: "EU", Belgium: "EU",
  Denmark: "EU", Finland: "EU", Portugal: "EU", Austria: "EU",
  // APAC
  India: "APAC", Singapore: "APAC", Australia: "APAC", Japan: "APAC",
  China: "APAC", "Hong Kong": "APAC", Vietnam: "APAC", Indonesia: "APAC",
  Kazakhstan: "APAC", Korea: "APAC", "South Korea": "APAC", Philippines: "APAC",
  Malaysia: "APAC", Thailand: "APAC",
  // LATAM
  Brazil: "LATAM", Argentina: "LATAM", Colombia: "LATAM", Chile: "LATAM", Peru: "LATAM",
  // MENA
  "United Arab Emirates": "MENA", UAE: "MENA", Israel: "MENA",
  "Saudi Arabia": "MENA", Egypt: "MENA", Turkey: "MENA",
};

// US state codes → NA shortcut (covers "New York, NY", "San Francisco, CA").
const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function canonCerts(rawCerts = []) {
  const canon = new Set();
  const other = [];
  for (const raw of rawCerts) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
    if (CERT_CANON.has(trimmed)) {
      canon.add(CERT_CANON.get(trimmed));
    } else {
      // Case-insensitive fallback before dropping to "other"
      const ci = [...CERT_CANON.keys()].find(k => k.toLowerCase() === trimmed.toLowerCase());
      if (ci) canon.add(CERT_CANON.get(ci));
      else other.push(trimmed);
    }
  }
  return { canon: [...canon].sort(), other };
}

function canonIntegrations(rawList = []) {
  const out = new Set();
  for (const raw of rawList) {
    const trimmed = String(raw).trim();
    if (!trimmed || INTEGRATION_DROP.has(trimmed)) continue;
    if (INTEGRATION_CANON.has(trimmed)) {
      out.add(INTEGRATION_CANON.get(trimmed));
    } else {
      const ci = [...INTEGRATION_CANON.keys()].find(k => k.toLowerCase() === trimmed.toLowerCase());
      if (ci) out.add(INTEGRATION_CANON.get(ci));
      // Unmapped values are dropped silently — keeps the field clean.
    }
  }
  // If both ios_sdk + android_sdk present, also drop the generic "Mobile SDK".
  if (out.has("iOS SDK") && out.has("Android SDK")) out.delete("Mobile SDK");
  return [...out].sort();
}

function canonVerifications(rawList = []) {
  const out = new Set();
  for (const raw of rawList) {
    const trimmed = String(raw).trim();
    if (VERIFICATION_CANON.has(trimmed)) out.add(VERIFICATION_CANON.get(trimmed));
  }
  return [...out].sort();
}

function complianceFlags(canonCertList) {
  const flags = Object.fromEntries(COMPLIANCE_FLAG_KEYS.map(k => [k, false]));
  for (const cert of canonCertList) {
    const key = CERT_TO_FLAG[cert];
    if (key) flags[key] = true;
  }
  // SOC 2 Type II implies SOC 2.
  if (flags.soc2_type2) flags.soc2 = true;
  // iBeta L2 implies L1.
  if (flags.ibeta_pad_l2) flags.ibeta_pad_l1 = true;
  return flags;
}

function featureFlags(verifications) {
  const has = (k) => verifications.includes(k);
  return {
    has_id_verification:        has("ID Verification"),
    has_liveness:               has("Biometric Liveness") || has("Face Recognition"),
    has_aml:                    has("AML/PEP Screening"),
    has_kyb:                    has("KYB"),
    has_transaction_monitoring: has("Transaction Monitoring"),
    has_video_kyc:              has("Video KYC"),
    has_esignature:             has("eSignature"),
  };
}

function pricingModel(v) {
  if (v.pricing_model_normalized) return v.pricing_model_normalized;
  const old = v.pricing_model_type;
  if (old === "flat_rate") return "flat_monthly";
  if (old === "per_check" || old === "custom") return old;
  return "custom";
}

function valueTier(startingPrice, pm) {
  if (pm === "custom") return "enterprise";
  if (!startingPrice) return null;
  const amt = Number(startingPrice.amount);
  if (!Number.isFinite(amt)) return null;
  if (startingPrice.period === "per_check") {
    if (amt < 1)  return "budget";
    if (amt <= 5) return "mid";
    return "enterprise";
  }
  // monthly / yearly / per_user — treat as monthly-ish
  if (amt < 50)   return "budget";
  if (amt <= 500) return "mid";
  return "enterprise";
}

function pricingSummary(startingPrice, freeTier, pm) {
  if (startingPrice?.amount != null) {
    const currency = startingPrice.currency === "EUR" ? "€"
                   : startingPrice.currency === "GBP" ? "£" : "$";
    const amt = startingPrice.amount;
    const periodLabel = startingPrice.period === "per_check" ? "/check"
                      : startingPrice.period === "per_user"  ? "/user"
                      : startingPrice.period === "yearly"    ? "/yr"
                      : "/mo";
    return `From ${currency}${amt}${periodLabel}`;
  }
  if (freeTier) return "Free tier";
  if (pm === "freemium") return "Free tier";
  return "Contact Sales";
}

function regionFromHQ(hq) {
  if (!hq) return null;
  const s = String(hq).trim();
  if (/^global$/i.test(s) || /^n\/a$/i.test(s) || /^not (provided|specified)$/i.test(s)) return null;
  // Split on comma and try each segment from right (country usually last).
  const parts = s.split(",").map(p => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (REGION_MAP[p])                    return REGION_MAP[p];
    if (REGION_MAP[p.toUpperCase()])      return REGION_MAP[p.toUpperCase()];
    // Lookup by capitalised form ("usa" → "USA")
    const upper = p.toUpperCase();
    if (REGION_MAP[upper])                return REGION_MAP[upper];
    // US state code shortcut
    if (US_STATES.has(p) || US_STATES.has(p.toUpperCase())) return "NA";
  }
  return null;
}

function cleanCountriesCount(v) {
  const c = v.countries_count;
  if (c == null) return { countries_count: null, global_claim: false };

  // Detect synthetic fallback: scrape script writes 195 when text says "global"
  // but no numeric pattern matches. Look for a real numeric pattern in source.
  const supported = String(v.website_data?.supported_countries || "");
  const hasNumeric = /\d{2,3}\+?\s*countr/i.test(supported);

  if (c === 195 && !hasNumeric) {
    return { countries_count: null, global_claim: true };
  }
  return { countries_count: c, global_claim: c >= 100 };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const raw = JSON.parse(readFileSync(INPUT_FILE, "utf-8"));
const now = new Date().toISOString();

const normalized = raw.vendors.map((v) => {
  const verifications  = canonVerifications(v.verification_types);
  const integrations   = canonIntegrations(v.integration_methods || v.website_data?.integrations);
  const { canon: certs, other: certsOther } = canonCerts(
    v.compliance_certifications || v.website_data?.compliance_certifications
  );
  const cFlags         = complianceFlags(certs);
  const fFlags         = featureFlags(verifications);
  const pm             = pricingModel(v);
  const { countries_count, global_claim } = cleanCountriesCount(v);
  const tier           = valueTier(v.starting_price, pm);
  const summary        = pricingSummary(v.starting_price, v.free_tier, pm);

  // Strip debug noise from website_data / company_data.
  const wd = v.website_data ? { ...v.website_data } : undefined;
  if (wd) {
    delete wd._pages_scraped;
    delete wd._scraped_at;
    delete wd._rescraped_at;
  }
  const cd = v.company_data ? { ...v.company_data } : undefined;
  if (cd) {
    delete cd._searched_at;
  }

  return {
    // identity
    name: v.name,
    slug: v.slug,
    company: v.company,
    description: v.description,
    primary_category: v.categories?.[0] ?? null,
    categories: v.categories ?? [],
    // marketing
    featured: v.featured ?? false,
    affiliate_url: v.affiliate_url ?? null,
    vendor_website: v.vendor_website,
    product_url: v.product_url,
    source: v.source,
    all_sources: v.all_sources ?? [],
    source_url: v.source_url,
    // visual
    logo_url: v.logo_url,
    logo_path: v.logo_path,
    logo_source: v.logo_source,
    // ratings
    rating: v.rating,
    reviews_count: v.reviews_count,
    total_reviews_all_sources: v.total_reviews_all_sources,
    rating_breakdown: v.rating_breakdown ?? null,
    // pricing
    pricing: v.pricing, // raw scraped label, kept for backwards-compat
    pricing_model: pm,
    pricing_summary: summary,
    starting_price: v.starting_price ?? null,
    min_monthly_commitment: v.min_monthly_commitment ?? null,
    free_trial: v.free_trial ?? null,
    free_tier: v.free_tier ?? null,
    has_free_trial: !!(v.has_free_trial || v.free_trial),
    value_tier: tier,
    // capabilities
    verification_types: verifications,
    integration_methods: integrations,
    sdk_types: v.sdk_types ?? [], // keep alongside integration_methods for UI compat
    feature_flags: fFlags,
    // compliance
    compliance_certifications: certs,
    compliance_certifications_other: certsOther,
    compliance_flags: cFlags,
    // coverage
    countries_count,
    global_claim,
    documents_count: v.documents_count ?? null,
    languages_count: v.languages_count ?? null,
    // company / region
    website_data: wd,
    company_data: cd,
    region: regionFromHQ(wd?.headquarters),
    // meta
    last_normalized_at: now,
  };
});

writeFileSync(OUTPUT_FILE, JSON.stringify({ vendors: normalized }, null, 2));

// ─── Coverage report ─────────────────────────────────────────────────────────

const n = normalized.length;
const pct = (c) => `${c}/${n} (${Math.round((c / n) * 100)}%)`;
const count = (pred) => normalized.filter(pred).length;

console.log(`\nNormalized ${n} vendors → ${OUTPUT_FILE}\n`);
console.log(`Field coverage:`);
[
  ["pricing_model",                   count(v => !!v.pricing_model)],
  ["pricing_summary != Contact Sales", count(v => v.pricing_summary !== "Contact Sales")],
  ["starting_price",                  count(v => v.starting_price)],
  ["free_trial",                      count(v => v.free_trial)],
  ["free_tier",                       count(v => v.free_tier)],
  ["verification_types",              count(v => v.verification_types.length)],
  ["integration_methods",             count(v => v.integration_methods.length)],
  ["compliance_certifications",       count(v => v.compliance_certifications.length)],
  ["compliance_certifications_other", count(v => v.compliance_certifications_other.length)],
  ["countries_count (real)",          count(v => v.countries_count != null)],
  ["global_claim",                    count(v => v.global_claim)],
  ["region",                          count(v => v.region)],
  ["value_tier",                      count(v => v.value_tier)],
].forEach(([k, c]) => console.log(`  ${k.padEnd(34)} ${pct(c)}`));

const allCerts        = [...new Set(normalized.flatMap(v => v.compliance_certifications))].sort();
const allIntegrations = [...new Set(normalized.flatMap(v => v.integration_methods))].sort();
const allRegions      = [...new Set(normalized.map(v => v.region).filter(Boolean))].sort();
const allTiers        = [...new Set(normalized.map(v => v.value_tier).filter(Boolean))].sort();
const allPModels      = [...new Set(normalized.map(v => v.pricing_model).filter(Boolean))].sort();

console.log(`\nUnique values:`);
console.log(`  pricing_model        : ${allPModels.join(", ")}`);
console.log(`  value_tier           : ${allTiers.join(", ")}`);
console.log(`  region               : ${allRegions.join(", ")}`);
console.log(`  certifications (${allCerts.length}): ${allCerts.join(", ")}`);
console.log(`  integrations   (${allIntegrations.length}): ${allIntegrations.join(", ")}`);

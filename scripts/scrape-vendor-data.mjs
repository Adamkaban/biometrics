// scripts/scrape-vendor-data.mjs
// Enriches vendors.json with commercial, technical, and feature data from vendor websites.
// Run: node scripts/scrape-vendor-data.mjs 2>&1 | tee scripts/logs/vendor-data-$(date +%Y%m%d).log
// Add --debug to dump raw page text for first vendor (troubleshooting)
// Add --vendor=idenfy to process only one vendor by slug

import { readFileSync, writeFileSync, existsSync } from "fs";
import { launch } from "cloakbrowser";

const VENDORS_FILE = "src/data/vendors.json";
const OUTPUT_FILE = "scripts/data/vendors-enriched.json";
const PROGRESS_FILE = "scripts/data/enrichment-progress.json";
const DELAY_BETWEEN_VENDORS_MS = 4000;
const DELAY_BETWEEN_PAGES_MS = 1500;
const PAGE_TIMEOUT_MS = 20000;
const MAX_PAGES_PER_VENDOR = 5; // stop after N successful fetches

const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");
const ONLY_VENDOR = args.find((a) => a.startsWith("--vendor="))?.split("=")[1];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pages to try per vendor, in priority order.
// Pricing pages first (most valuable), then security/compliance, then features.
const PAGE_PATHS = [
  "/pricing",
  "/pricing-plans",
  "/plans",
  "/security",
  "/compliance",
  "/trust",
  "/certifications",
  "/features",
  "/platform",
  "/integrations",
  "/developers",
  "/", // homepage last
];

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractPricingModel(text) {
  // Per-check / per-verification (most specific — check first)
  if (/per[\s-]?(check|verification|scan|transaction|call)/i.test(text)) return "per_check";
  if (/\$[\d.]+\s*\/\s*(check|verification|scan|transaction)/i.test(text)) return "per_check";

  // Per user / per seat
  if (/per[\s-]?(user|seat|agent)\b/i.test(text)) return "per_user";
  if (/\$[\d.]+\s*\/\s*(user|seat)\b/i.test(text)) return "per_user";

  // Freemium (free forever tier exists)
  if (/(free\s+tier|free\s+plan|free\s+forever|always\s+free)/i.test(text)) return "freemium";

  // Flat monthly subscription with visible price
  if (/\$\d+\s*\/\s*(mo|month)\b/i.test(text)) return "flat_monthly";

  // Annual subscription
  if (/\$\d+\s*\/\s*(yr|year)\b/i.test(text)) return "flat_yearly";

  // Custom / contact sales only
  if (/(contact\s+(us|sales|team)|request\s+a\s+(demo|quote)|custom\s+pricing|enterprise\s+only|talk\s+to\s+(us|sales))/i.test(text)) return "custom";

  return null;
}

function detectCurrency(text) {
  // Detect dominant currency from page content
  const eurCount = (text.match(/€|EUR\b/g) || []).length;
  const gbpCount = (text.match(/£|GBP\b/g) || []).length;
  const usdCount = (text.match(/\$|USD\b/g) || []).length;
  if (eurCount > usdCount && eurCount >= 2) return "EUR";
  if (gbpCount > usdCount && gbpCount >= 2) return "GBP";
  return "USD";
}

function extractStartingPrice(text) {
  const currency = detectCurrency(text);
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "\\$";
  // Strip minimum commitment lines so they don't pollute starting price
  const stripped = text.replace(/minimum\s+commitment[^\n]*/gi, "");

  const patterns = [
    // Per-check first — most specific: "$1.35 / verif", "€0.50/check"
    {
      re: new RegExp(`${sym}(\\d+(?:[.,]\\d+)?)\\s*\\/\\s*(verif\\w*|check|scan|transaction|call)`, "i"),
      periodIdx: 2,
      forcePerCheck: true,
    },
    // "$N per verification"
    {
      re: new RegExp(`${sym}(\\d+(?:[.,]\\d+)?)\\s+per\\s+(verif\\w*|check|scan|transaction)`, "i"),
      periodIdx: 2,
      forcePerCheck: true,
    },
    // "from $49/mo", "starting at €0.50/check"
    {
      re: new RegExp(`(?:from|starting(?:\\s+at)?|starts?\\s+at|as\\s+low\\s+as)\\s*${sym}(\\d+(?:[.,]\\d+)?)\\s*\\/?\\s*(mo|month|yr|year|check|verif\\w*|scan|user)?`, "i"),
      periodIdx: 2,
    },
    // "$49/month" or "$49 per month"
    {
      re: new RegExp(`${sym}(\\d+(?:[.,]\\d+)?)\\s*(?:\\/\\s*|\\bper\\s+)(mo|month|yr|year|user)\\b`, "i"),
      periodIdx: 2,
    },
  ];

  for (const { re, periodIdx, forcePerCheck } of patterns) {
    const m = stripped.match(re);
    if (!m) continue;
    const amount = parseFloat(m[1].replace(",", "."));
    if (isNaN(amount)) continue;
    const rawPeriod = (m[periodIdx] || "").toLowerCase();
    const period = forcePerCheck
      ? "per_check"
      : rawPeriod.startsWith("mo")
      ? "monthly"
      : rawPeriod.startsWith("ye") || rawPeriod.startsWith("yr")
      ? "yearly"
      : rawPeriod.startsWith("verif") || ["check", "scan", "transaction"].includes(rawPeriod)
      ? "per_check"
      : rawPeriod === "user"
      ? "per_user"
      : "monthly";
    return { amount, currency, period, raw: m[0].trim() };
  }
  return null;
}

function extractMinCommitment(text) {
  const patterns = [
    /minimum[^.\n]{0,50}?\$(\d[\d,]*)/i,
    /\$(\d[\d,]*)[^.\n]{0,50}?minimum(?:\s+monthly)?\s+(?:fee|commitment|spend)/i,
    /min(?:imum)?\s+(?:monthly\s+)?(?:fee|spend|commitment)\s*[:\-–]?\s*\$(\d[\d,]*)/i,
    /(?:base|platform)\s+fee\s*[:\-–]?\s*\$(\d[\d,]*)\s*\/\s*(mo|month)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return { amount: parseInt(m[1].replace(/,/g, "")), currency: "USD", raw: m[0].trim() };
  }
  return null;
}

function extractFreeTrial(text) {
  const dayPatterns = [
    /(\d+)[\s-]*day\s+free\s+trial/i,
    /free\s+trial[^.\n]{0,30}(\d+)\s+days?/i,
    /try[^.\n]{0,20}free[^.\n]{0,20}(\d+)\s+days?/i,
    /(\d+)\s+days?\s+free(?:\s+trial)?/i,
    /free\s+for\s+(\d+)\s+days?/i,
  ];
  for (const re of dayPatterns) {
    const m = text.match(re);
    if (m) return { days: parseInt(m[1]) };
  }
  // "free trial" specifically — but NOT if it's a free tier/plan mention (those go to extractFreeTier)
  if (/\bfree\s+trial\b/i.test(text) && !/free\s+(tier|plan|forever)/i.test(text)) {
    return { days: null };
  }
  // "no credit card required" is a strong trial signal
  if (/no\s+credit\s+card\s+required/i.test(text)) {
    return { days: null };
  }
  return null;
}

function extractFreeTier(text) {
  const patterns = [
    // "100 free verifications/month"
    /(\d[\d,]*)\s*(?:free\s+)?(?:verifications?|checks?|scans?|calls?|API\s+calls?)\s*(?:per\s*month|monthly|\/\s*mo)\s*(?:for\s*)?free/i,
    // "free tier includes N verifications"
    /free\s+(?:tier|plan)[^.\n]{0,50}(\d[\d,]*)\s*(?:verifications?|checks?|scans?)/i,
    // "up to N verifications free"
    /up\s+to\s+(\d[\d,]*)\s*(?:verifications?|checks?|scans?)[^.\n]{0,30}free/i,
    // "N free verifications per month"
    /(\d[\d,]*)\s+free\s+(?:verifications?|checks?|scans?)\s+per\s+month/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return { amount: parseInt(m[1].replace(/,/g, "")), unit: "verifications/month" };
  }
  if (/(free\s+tier|free\s+plan|free\s+forever|always\s+free)/i.test(text)) {
    return { amount: null, unit: null };
  }
  return null;
}

function extractCertifications(text) {
  const certRules = [
    // More specific first (SOC 2 Type II before SOC 2)
    { key: "SOC 2 Type II",      re: /SOC[\s-]*2[\s,]*Type[\s-]*II/i },
    { key: "SOC 2 Type I",       re: /SOC[\s-]*2[\s,]*Type[\s-]*I\b/i },
    { key: "SOC 2",              re: /\bSOC[\s-]*2\b/i },
    { key: "ISO 27001",          re: /ISO[\s/]*(?:IEC[\s/]*)?27001/i },
    { key: "ISO 30107-3",        re: /ISO[\s/]*30107[-–]3/i },
    { key: "GDPR",               re: /\bGDPR\b/i },
    { key: "CCPA",               re: /\bCCPA\b/i },
    { key: "PCI DSS",            re: /PCI[\s-]*DSS/i },
    { key: "HIPAA",              re: /\bHIPAA\b/i },
    { key: "FedRAMP",            re: /\bFedRAMP\b/i },
    { key: "eIDAS",              re: /\beIDAS\b/i },
    { key: "FIDO2",              re: /\bFIDO[\s-]*2\b/i },
    { key: "NIST SP 800-63",      re: /NIST\s*SP[\s-]*800[-–]63/i },
    { key: "iBeta PAD Level 2",  re: /iBeta[^.\n]{0,30}Level[\s-]*2|PAD[^.\n]{0,20}Level[\s-]*2|Level[\s-]*2[^.\n]{0,20}iBeta/i },
    { key: "iBeta PAD Level 1",  re: /iBeta[^.\n]{0,30}Level[\s-]*1|PAD[^.\n]{0,20}Level[\s-]*1/i },
    { key: "WCAG 2.1",           re: /WCAG[\s-]*2\.1/i },
    { key: "DPDP",               re: /\bDPDP\b/i },  // India
    { key: "PIPEDA",             re: /\bPIPEDA\b/i }, // Canada
  ];

  const found = [];
  for (const { key, re } of certRules) {
    if (re.test(text)) found.push(key);
  }
  return found;
}

function extractIntegrations(text) {
  const integRules = [
    // API — broad fallback covers "API reference", "API docs", plain "REST API"
    { key: "REST API",            re: /REST(?:ful)?\s*API|\bAPI\s*(?:reference|docs?|documentation|endpoint|key)\b/i },
    { key: "GraphQL API",         re: /GraphQL/i },
    // SDKs — match "Web SDK", "JavaScript SDK", "JS SDK", "browser SDK"
    { key: "Web SDK",             re: /Web\s*SDK|JavaScript\s*SDK|JS\s*SDK|Browser\s*SDK/i },
    // iOS SDK — also catches "iOS integration", "iOS library", standalone "iOS" in SDK context
    { key: "iOS SDK",             re: /iOS\s*(?:SDK|library|integration|app\b)|Swift\s*SDK|\biOS\s+(?:and|&)\s+Android\b/i },
    // Android SDK — symmetric
    { key: "Android SDK",         re: /Android\s*(?:SDK|library|integration|app\b)|Kotlin\s*SDK|\bAndroid\s+(?:and|&)\s+iOS\b/i },
    { key: "Flutter",             re: /\bFlutter\b/i },
    { key: "React Native",        re: /React\s*Native/i },
    { key: "Xamarin",             re: /\bXamarin\b/i },
    { key: "Cordova/PhoneGap",    re: /Cordova|PhoneGap/i },
    { key: "No-code/Dashboard",   re: /no[\s-]code|low[\s-]code|dashboard[\s-]only|without\s*cod/i },
    { key: "Webhook",             re: /\bwebhook/i },
    { key: "Zapier",              re: /\bZapier\b/i },
    { key: "Make (Integromat)",   re: /Make\.com|\bIntegromat\b/i },
    { key: "Salesforce",          re: /\bSalesforce\b/i },
    { key: "iframe",              re: /\biframe\b/i },
  ];

  return integRules.filter(({ re }) => re.test(text)).map(({ key }) => key);
}

function extractVerificationTypes(text) {
  const typeRules = [
    { key: "ID Verification",          re: /identity\s*verif|ID\s*verif|document\s*(check|verif)|passport.*verif|driver.s\s*licen/i },
    { key: "Biometric Liveness",       re: /liveness\s*(detection|check)|face\s*liveness|selfie\s*(check|verif)|deepfake\s*(detect|protect)|anti[\s-]?spoof/i },
    { key: "Face Recognition",         re: /face\s*recognition|facial\s*recognition|face\s*match/i },
    { key: "AML/PEP Screening",        re: /\bAML\b|PEP\s*(screen|check|list)|sanctions?\s*(screen|check|list)|watchlist/i },
    { key: "KYB",                      re: /\bKYB\b|business\s*verif|company\s*verif|UBO\s*(check|verif)/i },
    { key: "Transaction Monitoring",   re: /transaction\s*monitor|fraud\s*(detect|prevent|monitor)/i },
    { key: "Database Check",           re: /database\s*(check|verif)|credit\s*(check|bureau)|background\s*check/i },
    { key: "eSignature",               re: /e[\s-]?sign(ature)?|digital\s*sign(ature)?/i },
    { key: "Address Verification",     re: /address\s*verif|proof\s*of\s*address/i },
    { key: "Phone Verification",       re: /phone\s*verif|SMS\s*verif|OTP\s*verif/i },
    { key: "Email Verification",       re: /email\s*verif/i },
    { key: "Fingerprint",              re: /fingerprint/i },
    { key: "Voice Biometrics",         re: /voice\s*(biometric|verif|recogn)/i },
    { key: "NFC",                      re: /\bNFC\b|near[\s-]field\s*comm/i },
    { key: "Video KYC",                re: /video\s*KYC|video[\s-]?based\s*KYC|video\s*interview/i },
  ];

  return typeRules.filter(({ re }) => re.test(text)).map(({ key }) => key);
}

function extractCoverage(text) {
  const result = {};

  const countryM = text.match(/(\d{2,3})\+?\s*countries/i);
  if (countryM) result.countries_count = parseInt(countryM[1]);

  // Also handle "195+" or "190+" before "countries"
  const coverageM = text.match(/(?:global\s+coverage|covers?|support(?:ing|s)?)\s+(?:over\s+)?(\d{2,3})\+?\s*countries/i);
  if (coverageM) result.countries_count = parseInt(coverageM[1]);

  const docM = text.match(/(\d{3,5})\+?\s*(?:document\s*types?|types\s*of\s*documents?|documents?)\b/i);
  if (docM) result.documents_count = parseInt(docM[1]);

  const langM = text.match(/(\d{1,3})\+?\s*languages?\b/i);
  if (langM) result.languages_count = parseInt(langM[1]);

  return Object.keys(result).length ? result : null;
}

// ─── Page fetcher ─────────────────────────────────────────────────────────────

async function fetchPageText(page, url) {
  try {
    const resp = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });
    if (!resp || resp.status() >= 400) return null;
    // Wait for JS frameworks (React/Vue/Next) to hydrate and render pricing/content
    await page.waitForTimeout(2500);
    const text = await page.evaluate(
      () => document.body?.innerText?.replace(/\s{3,}/g, "\n") || ""
    );
    return text.length > 200 ? text : null;
  } catch {
    return null;
  }
}

async function collectVendorPages(page, baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  let combinedText = "";
  let successCount = 0;
  let firstSuccess = true;

  for (const path of PAGE_PATHS) {
    const url = base + path;
    const text = await fetchPageText(page, url);
    if (text) {
      console.log(`    ${path} ✓ (${text.length} chars)`);
      if (DEBUG && firstSuccess) {
        console.log("\n[DEBUG] First page text (first 500 chars):\n" + text.slice(0, 500) + "\n");
        firstSuccess = false;
      }
      combinedText += "\n\n" + text;
      successCount++;
      // Delay only after successful fetches — skip delay on 404s
      if (successCount < MAX_PAGES_PER_VENDOR) await sleep(DELAY_BETWEEN_PAGES_MS);
      if (successCount >= MAX_PAGES_PER_VENDOR) break;
    } else {
      console.log(`    ${path} ✗`);
      // Short pause even on failure to avoid hammering DNS/firewall
      await sleep(300);
    }
  }

  return combinedText || null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const raw = JSON.parse(readFileSync(VENDORS_FILE, "utf-8"));

const progress = existsSync(PROGRESS_FILE)
  ? JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"))
  : {};

const browser = await launch({ humanize: true });
const page = await browser.newPage();

let done = 0;
let enrichedCount = 0;

for (const vendor of raw.vendors) {
  const slug = vendor.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (ONLY_VENDOR && slug !== ONLY_VENDOR) continue;

  if (progress[slug]?.done) {
    process.stdout.write(".");
    done++;
    continue;
  }

  const idx = raw.vendors.indexOf(vendor) + 1;
  console.log(`\n[${idx}/${raw.vendors.length}] ${vendor.name}`);
  console.log(`  url: ${vendor.vendor_website}`);

  if (!vendor.vendor_website) {
    console.log("  ⚠ no vendor_website — skip");
    progress[slug] = { done: true, skipped: "no_url" };
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    done++;
    continue;
  }

  const combinedText = await collectVendorPages(page, vendor.vendor_website);

  if (!combinedText) {
    console.log("  ⚠ no content extracted (bot wall or dead site)");
    progress[slug] = { done: true, skipped: "no_content" };
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    done++;
    await sleep(DELAY_BETWEEN_VENDORS_MS);
    continue;
  }

  // Run all extractors
  const pricing_model_normalized = extractPricingModel(combinedText);
  const starting_price = extractStartingPrice(combinedText);
  const min_monthly_commitment = extractMinCommitment(combinedText);
  const free_trial = extractFreeTrial(combinedText);
  const free_tier = extractFreeTier(combinedText);
  const newCerts = extractCertifications(combinedText);
  const newIntegrations = extractIntegrations(combinedText);
  const verification_types = extractVerificationTypes(combinedText);
  const coverage = extractCoverage(combinedText);

  // Merge certifications with existing (union, deduplicated)
  const existingCerts = vendor.compliance_certifications
    || vendor.website_data?.compliance_certifications
    || [];
  const compliance_certifications = [...new Set([...existingCerts, ...newCerts])];

  // Merge integrations with existing
  const existingInteg = vendor.integration_methods
    || vendor.website_data?.integrations
    || [];
  const integration_methods = [...new Set([...existingInteg, ...newIntegrations])];

  // Write new fields directly onto vendor (top-level)
  if (pricing_model_normalized) vendor.pricing_model_normalized = pricing_model_normalized;
  if (starting_price)           vendor.starting_price = starting_price;
  if (min_monthly_commitment)   vendor.min_monthly_commitment = min_monthly_commitment;
  if (free_trial)               vendor.free_trial = free_trial;
  if (free_tier)                vendor.free_tier = free_tier;
  if (compliance_certifications.length) vendor.compliance_certifications = compliance_certifications;
  if (integration_methods.length)       vendor.integration_methods = integration_methods;
  if (verification_types.length)        vendor.verification_types = verification_types;
  if (coverage?.countries_count)        vendor.countries_count = coverage.countries_count;
  if (coverage?.documents_count)        vendor.documents_count = coverage.documents_count;
  if (coverage?.languages_count)        vendor.languages_count = coverage.languages_count;

  // Log findings
  const findings = {
    pricing_model_normalized,
    starting_price: starting_price?.raw,
    min_monthly_commitment: min_monthly_commitment ? `$${min_monthly_commitment.amount}` : null,
    free_trial: free_trial ? (free_trial.days ? `${free_trial.days} days` : "yes") : null,
    free_tier: free_tier ? (free_tier.amount ? `${free_tier.amount} ${free_tier.unit}` : "yes") : null,
    certifications: newCerts.length ? newCerts.join(", ") : null,
    integrations: newIntegrations.length ? newIntegrations.join(", ") : null,
    verification_types: verification_types.length ? verification_types.join(", ") : null,
    coverage: coverage ? JSON.stringify(coverage) : null,
  };
  const found = Object.entries(findings).filter(([, v]) => v !== null);
  if (found.length) {
    found.forEach(([k, v]) => console.log(`  ${k}: ${v}`));
    enrichedCount++;
  } else {
    console.log("  (no structured data found — pricing likely 'Contact Sales')");
  }

  progress[slug] = { done: true };
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  // Incremental save to vendors.json after every vendor
  writeFileSync(OUTPUT_FILE, JSON.stringify({ vendors: raw.vendors }, null, 2));

  done++;
  await sleep(DELAY_BETWEEN_VENDORS_MS);
}

await browser.close();
writeFileSync(OUTPUT_FILE, JSON.stringify({ vendors: raw.vendors }, null, 2));

console.log(`\n─── Summary ──────────────────────────────────`);
console.log(`Processed : ${done}/${raw.vendors.length}`);
console.log(`Enriched  : ${enrichedCount} vendors had new data`);

// Coverage report
const v = raw.vendors;
const pct = (n) => Math.round((n / v.length) * 100) + "%";
console.log(`\nField coverage:`);
[
  ["pricing_model_normalized", v.filter((x) => x.pricing_model_normalized).length],
  ["starting_price",           v.filter((x) => x.starting_price).length],
  ["min_monthly_commitment",   v.filter((x) => x.min_monthly_commitment).length],
  ["free_trial",               v.filter((x) => x.free_trial).length],
  ["free_tier",                v.filter((x) => x.free_tier).length],
  ["compliance_certifications", v.filter((x) => x.compliance_certifications?.length).length],
  ["integration_methods",      v.filter((x) => x.integration_methods?.length).length],
  ["verification_types",       v.filter((x) => x.verification_types?.length).length],
  ["countries_count",          v.filter((x) => x.countries_count).length],
  ["documents_count",          v.filter((x) => x.documents_count).length],
].forEach(([f, n]) => console.log(`  ${f.padEnd(28)} ${n}/${v.length} (${pct(n)})`));

console.log(`\nOutput: ${OUTPUT_FILE}`);
console.log(`Progress: ${PROGRESS_FILE} (delete to re-run all)`);

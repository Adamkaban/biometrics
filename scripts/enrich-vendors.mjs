// scripts/enrich-vendors.mjs
import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("src/data/vendors.json", "utf-8"));

function extractComplianceFlags(certs = []) {
  const c = certs.join(" ");
  return {
    soc2: /soc\s*2/i.test(c),
    soc2_type2: /soc\s*2\s*(type\s*ii|type\s*2)/i.test(c),
    iso27001: /iso\s*27001/i.test(c),
    gdpr: /gdpr/i.test(c),
    hipaa: /hipaa/i.test(c),
    ibeta: /ibeta/i.test(c),
    pci_dss: /pci[-\s]?dss/i.test(c),
  };
}

function extractSdkTypes(integrations = [], techCaps = []) {
  const all = [...integrations, ...techCaps].join(" ");
  const types = [];
  if (/web\s*sdk/i.test(all)) types.push("web_sdk");
  if (/ios\s*sdk|mobile\s*sdk/i.test(all)) types.push("ios_sdk");
  if (/android\s*sdk|mobile\s*sdk/i.test(all)) types.push("android_sdk");
  if (/flutter/i.test(all)) types.push("flutter");
  if (/react\s*native/i.test(all)) types.push("react_native");
  if (/rest\s*api/i.test(all)) types.push("rest_api");
  if (/no[-\s]?code|dashboard|workflow/i.test(all)) types.push("no_code");
  return [...new Set(types)];
}

function extractFeatureFlags(vendor) {
  const all = [
    ...(vendor.categories || []),
    ...(vendor.website_data?.key_features || []),
    ...(vendor.website_data?.use_cases || []),
    ...(vendor.website_data?.products || []),
  ].join(" ");
  return {
    has_id_verification: /identity\s*verif|id\s*verif|document\s*verif/i.test(all),
    has_liveness: /liveness|biometric|deepfake/i.test(all),
    has_aml: /aml|pep\b|sanction|anti[-\s]?money/i.test(all),
    has_kyb: /kyb|business\s*verif/i.test(all),
    has_transaction_monitoring: /transaction\s*monitor|fraud\s*detect/i.test(all),
  };
}

function extractPricingModelType(vendor) {
  const plans = vendor.website_data?.pricing_plans || [];
  const prices = plans.map((p) => p.price).join(" ");
  const model = (vendor.website_data?.pricing_model || "").toLowerCase();
  if (/per\s*(check|verif|user|transaction|\$)/i.test(prices)) return "per_check";
  if (/\$\d+\s*\/\s*mo|\$\d+\s*per\s*month/i.test(prices)) return "flat_rate";
  if (/flat|subscription/i.test(model)) return "flat_rate";
  return "custom";
}

function extractCountriesCount(supported = "") {
  const match = supported.match(/(\d+)\+?\s*countr/i);
  if (match) return parseInt(match[1]);
  if (/global|worldwide|international/i.test(supported)) return 195;
  return null;
}

const enriched = raw.vendors.map((v) => ({
  ...v,
  pricing_model_type: extractPricingModelType(v),
  sdk_types: extractSdkTypes(
    v.website_data?.integrations,
    v.website_data?.tech_capabilities
  ),
  compliance_flags: extractComplianceFlags(v.website_data?.compliance_certifications),
  feature_flags: extractFeatureFlags(v),
  countries_count: extractCountriesCount(v.website_data?.supported_countries),
}));

writeFileSync(
  "src/data/vendors.json",
  JSON.stringify({ vendors: enriched }, null, 2)
);

console.log(`Enriched ${enriched.length} vendors`);

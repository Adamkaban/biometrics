import vendorsData from "../data/vendors-normalized.json";

export type ComplianceFlags = {
  soc2: boolean;
  soc2_type2: boolean;
  iso27001: boolean;
  iso27701: boolean;
  iso30107_3: boolean;
  gdpr: boolean;
  ccpa: boolean;
  hipaa: boolean;
  pci_dss: boolean;
  fedramp: boolean;
  eidas: boolean;
  fido2: boolean;
  nist_800_63: boolean;
  ibeta_pad_l1: boolean;
  ibeta_pad_l2: boolean;
  pipeda: boolean;
};

export type FeatureFlags = {
  has_id_verification: boolean;
  has_liveness: boolean;
  has_aml: boolean;
  has_kyb: boolean;
  has_transaction_monitoring: boolean;
  has_video_kyc: boolean;
  has_esignature: boolean;
};

export type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
} | null;

export type StartingPrice = {
  amount: number;
  currency: "USD" | "EUR" | "GBP";
  period: "monthly" | "yearly" | "per_check" | "per_user";
  raw: string;
};

export type PricingModel =
  | "per_check"
  | "per_user"
  | "flat_monthly"
  | "flat_yearly"
  | "freemium"
  | "custom";

export type ValueTier = "budget" | "mid" | "enterprise";
export type Region = "NA" | "EU" | "APAC" | "LATAM" | "MENA";

export type Vendor = {
  // identity
  name: string;
  slug: string;
  company: string;
  description: string;
  tagline?: string | null;
  best_for?: string | null;
  avoid_if?: string | null;
  primary_category: string | null;
  categories: string[];
  // marketing
  featured: boolean;
  affiliate_url: string | null;
  vendor_website: string;
  product_url: string;
  source: string;
  all_sources: string[];
  source_url?: string;
  // visual
  logo_url: string;
  logo_path?: string;
  logo_source?: string;
  // ratings
  rating: number;
  reviews_count: number;
  total_reviews_all_sources?: number;
  rating_breakdown?: RatingBreakdown;
  // pricing
  pricing: string;
  pricing_model: PricingModel;
  pricing_summary: string;
  starting_price: StartingPrice | null;
  min_monthly_commitment: { amount: number; currency: string; raw: string } | null;
  free_trial: {
    days?: number | null;
    verifications?: number | null;
    requires_card?: boolean;
    note?: string;
  } | null;
  free_tier: { amount: number | null; unit: string | null } | null;
  has_free_trial: boolean;
  value_tier: ValueTier | null;
  pricing_source?: "official" | "estimated";
  // capabilities
  verification_types: string[];
  integration_methods: string[];
  sdk_types: string[];
  feature_flags: FeatureFlags;
  // compliance
  compliance_certifications: string[];
  compliance_certifications_other: string[];
  compliance_flags: ComplianceFlags;
  // coverage
  countries_count: number | null;
  global_claim: boolean;
  documents_count: number | null;
  languages_count: number | null;
  // company / region
  website_data?: {
    pricing_plans?: Array<{
      name: string;
      price: string;
      features_included?: string[];
      monthly_cap?: number;
      overage_rate?: number;
    }>;
    key_features?: string[];
    integrations?: string[];
    tech_capabilities?: string[];
    compliance_certifications?: string[];
    target_industries?: string[];
    pricing_model?: string;
    supported_countries?: string;
    headquarters?: string;
    founded_year?: number;
    use_cases?: string[];
    products?: string[];
  };
  company_data?: {
    founded_year?: number;
    employee_count_range?: string;
    company_size_range?: string;
    total_funding?: string;
    funding_stage?: string;
    funding_display?: boolean;
    funding_source_url?: string | null;
  };
  region: Region | null;
  // editorial visuals
  screenshots?: Array<{
    src: string;
    alt: string;
    caption: string;
    claim?: string;
  }>;
  // meta
  last_normalized_at: string;
};

export const vendors: Vendor[] = (vendorsData as { vendors: Vendor[] }).vendors;

// All unique canonical categories
export const categories = [...new Set(vendors.flatMap(v => v.categories))].sort();

// Canonical category name → URL slug
export const CATEGORY_SLUGS: Record<string, string> = {
  "Biometric Authentication": "biometric-authentication",
  "KYC Compliance": "kyc-compliance",
  "Identity Verification": "identity-verification",
  "AML": "aml",
  "Fraud Prevention": "fraud-prevention",
};

// Compliance flag → human label (driven by expanded compliance_flags shape)
export const COMPLIANCE_LABELS: Record<keyof ComplianceFlags, string> = {
  soc2_type2: "SOC 2 Type II",
  soc2: "SOC 2",
  iso27001: "ISO 27001",
  iso27701: "ISO 27701",
  iso30107_3: "ISO 30107-3",
  gdpr: "GDPR",
  ccpa: "CCPA",
  hipaa: "HIPAA",
  pci_dss: "PCI DSS",
  fedramp: "FedRAMP",
  eidas: "eIDAS",
  fido2: "FIDO2",
  nist_800_63: "NIST 800-63",
  ibeta_pad_l2: "iBeta PAD Level 2",
  ibeta_pad_l1: "iBeta PAD Level 1",
  pipeda: "PIPEDA",
};

// Order shown on vendor card (top 3 picked from this list, most prestigious first)
export const CARD_COMPLIANCE_ORDER: Array<keyof ComplianceFlags> = [
  "soc2_type2", "iso27001", "eidas", "ibeta_pad_l2", "fedramp",
  "fido2", "iso30107_3", "hipaa", "pci_dss", "gdpr",
];

// Order shown on vendor profile (full grid)
export const PROFILE_COMPLIANCE_ORDER: Array<keyof ComplianceFlags> = [
  "soc2_type2", "soc2", "iso27001", "iso27701", "iso30107_3",
  "ibeta_pad_l2", "ibeta_pad_l1", "eidas", "fido2", "fedramp",
  "nist_800_63", "gdpr", "ccpa", "hipaa", "pipeda", "pci_dss",
];

export const REGION_LABELS: Record<Region, string> = {
  NA: "North America",
  EU: "Europe",
  APAC: "Asia-Pacific",
  LATAM: "Latin America",
  MENA: "Middle East",
};

export const VALUE_TIER_LABELS: Record<ValueTier, string> = {
  budget: "Budget",
  mid: "Mid-market",
  enterprise: "Enterprise",
};

// Price-tier facet — order = display order (cheapest first)
export const VALUE_TIER_FILTER_ORDER: ValueTier[] = ["budget", "mid", "enterprise"];
export const VALUE_TIER_GLYPH: Record<ValueTier, string> = {
  budget: "$",
  mid: "$$",
  enterprise: "$$$",
};

// Billing-model buckets — consolidate 6 raw pricing_model values into 4 buyer-facing options.
// Each bucket maps to the pricing_model strings it should match.
export type BillingBucketKey = "per_check" | "subscription" | "freemium" | "custom";
export const BILLING_BUCKETS: Record<BillingBucketKey, { label: string; matches: PricingModel[] }> = {
  per_check: { label: "Pay-per-verification", matches: ["per_check"] },
  subscription: { label: "Subscription", matches: ["flat_monthly", "flat_yearly", "per_user"] },
  freemium: { label: "Freemium", matches: ["freemium"] },
  custom: { label: "Contact sales", matches: ["custom"] },
};
export const BILLING_FILTER_ORDER: BillingBucketKey[] = ["per_check", "subscription", "freemium", "custom"];

export function getVendorBillingBucket(vendor: Vendor): BillingBucketKey | null {
  const model = vendor.pricing_model;
  for (const key of BILLING_FILTER_ORDER) {
    if (BILLING_BUCKETS[key].matches.includes(model)) return key;
  }
  return null;
}

// SDK / Integration facet — keys match normalized vendor.sdk_types
export const SDK_FILTER_LABELS: Record<string, string> = {
  web_sdk: "Web SDK",
  ios_sdk: "iOS SDK",
  android_sdk: "Android SDK",
  rest_api: "REST API",
  no_code: "No-Code",
};
export type SdkFilterKey = keyof typeof SDK_FILTER_LABELS;

// Compliance facet — subset of compliance_flags exposed as filters
export const FILTERABLE_COMPLIANCE: Array<keyof ComplianceFlags> = [
  "iso27001",
  "soc2_type2",
  "ibeta_pad_l2",
  "gdpr",
];

// Industry facet — normalize messy target_industries strings to fixed buckets
export const INDUSTRY_BUCKETS = {
  banking: {
    label: "Banking",
    match: ["banking", "banking & finance", "financial services", "finance", "financial"],
  },
  fintech: {
    label: "Fintech & Neobanks",
    match: ["fintech", "neobank"],
  },
  crypto: {
    label: "Crypto & Web3",
    match: ["crypto", "crypto & blockchain", "cryptocurrency", "blockchain", "web3"],
  },
  igaming: {
    label: "Gambling / iGaming",
    match: ["gambling", "igaming", "online gambling", "gaming"],
  },
  healthcare: {
    label: "Healthcare",
    match: ["healthcare"],
  },
  ecommerce: {
    label: "E-commerce",
    match: ["e-commerce", "ecommerce", "retail"],
  },
} as const;

export type IndustryBucketKey = keyof typeof INDUSTRY_BUCKETS;

export function getVendorIndustries(vendor: Vendor): IndustryBucketKey[] {
  const raw = (vendor.website_data?.target_industries ?? []).map((s) => s.toLowerCase());
  if (raw.length === 0) return [];
  return (Object.keys(INDUSTRY_BUCKETS) as IndustryBucketKey[]).filter((key) =>
    INDUSTRY_BUCKETS[key].match.some((m) => raw.some((r) => r.includes(m)))
  );
}

export function getActiveComplianceFlags(vendor: Vendor): Array<keyof ComplianceFlags> {
  return FILTERABLE_COMPLIANCE.filter((k) => vendor.compliance_flags?.[k]);
}

// Build a ListItem wrapping a SoftwareApplication entity — for ItemList rich-result eligibility.
// Per-item AggregateRating renders only when the vendor has rating data (avoids fake ratings).
export function buildSoftwareAppListItem(
  v: Vendor,
  position: number,
  siteUrl: string,
): Record<string, unknown> {
  const item: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: v.name,
    url: `${siteUrl}/vendors/${v.slug}`,
    applicationCategory: v.primary_category ?? v.categories[0] ?? "SecurityApplication",
    operatingSystem: "Web, iOS, Android",
  };
  if (v.logo_url) {
    item.image = v.logo_url.startsWith("http") ? v.logo_url : `${siteUrl}${v.logo_url}`;
  }
  if (v.description) {
    item.description = v.description.slice(0, 200);
  }
  if (hasRatingData(v)) {
    item.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: v.rating,
      reviewCount: v.reviews_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (v.starting_price?.amount) {
    item.offers = {
      "@type": "Offer",
      price: v.starting_price.amount,
      priceCurrency: v.starting_price.currency,
      url: `${siteUrl}/vendors/${v.slug}`,
    };
  }
  return { "@type": "ListItem", position, item };
}

export function buildItemListSchema(
  list: Vendor[],
  name: string,
  siteUrl: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: list.length,
    itemListElement: list.map((v, i) => buildSoftwareAppListItem(v, i + 1, siteUrl)),
  };
}

const FEATURE_FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  has_id_verification: "ID Verification",
  has_liveness: "Liveness",
  has_aml: "AML",
  has_kyb: "KYB",
  has_transaction_monitoring: "Tx Monitoring",
  has_video_kyc: "Video KYC",
  has_esignature: "eSignature",
};

// verification_types preferred (entity-rich strings) → fallback to feature_flags
export function getCapabilityLabels(vendor: Vendor, max = 3): string[] {
  if (vendor.verification_types?.length) {
    return vendor.verification_types.slice(0, max);
  }
  return (Object.entries(vendor.feature_flags) as Array<[keyof FeatureFlags, boolean]>)
    .filter(([, v]) => v)
    .slice(0, max)
    .map(([k]) => FEATURE_FLAG_LABELS[k]);
}

// "Global · Europe" / "120+ countries · NA" / "Europe" / null
export function getCoverageLabel(vendor: Vendor): string | null {
  const parts: string[] = [];
  if (vendor.global_claim) parts.push("Global");
  else if (vendor.countries_count) parts.push(`${vendor.countries_count}+ countries`);
  if (vendor.region) parts.push(REGION_LABELS[vendor.region]);
  return parts.length ? parts.join(" · ") : null;
}

export function getValueTierLabel(vendor: Vendor): string | null {
  return vendor.value_tier ? VALUE_TIER_LABELS[vendor.value_tier] : null;
}

const SOURCE_LABELS: Record<string, string> = {
  g2: "G2",
  gartner: "Gartner",
  capterra: "Capterra",
};

// "Source: Gartner" / "Aggregated from G2 & Capterra" / "Aggregated rating" (fallback)
export function getSourceAttribution(vendor: Vendor): string {
  const labels = (vendor.all_sources ?? [])
    .map(s => SOURCE_LABELS[s.toLowerCase()])
    .filter(Boolean);
  if (labels.length === 0) return "Aggregated rating";
  if (labels.length === 1) return `Source: ${labels[0]}`;
  if (labels.length === 2) return `Aggregated from ${labels[0]} & ${labels[1]}`;
  const last = labels[labels.length - 1];
  return `Aggregated from ${labels.slice(0, -1).join(", ")} & ${last}`;
}

export function hasRatingData(vendor: Vendor): boolean {
  return vendor.rating > 0 && vendor.reviews_count > 0;
}

export function getCategorySlug(name: string): string {
  return CATEGORY_SLUGS[name] ?? name.toLowerCase().replace(/\s+/g, "-");
}

export function getCategoryName(slug: string): string {
  return Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug)?.[0] ?? slug;
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return vendors.find(v => v.slug === slug);
}

export function getVendorsByCategory(categoryName: string): Vendor[] {
  return vendors
    .filter(v => v.categories.includes(categoryName))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
}

export function getOutboundUrl(vendor: Vendor): string {
  if (vendor.affiliate_url) return vendor.affiliate_url;
  return vendor.vendor_website;
}

// Canonical B2B compliance checklist for DecisionCard ✓/✗ row.
// Each entry maps a display label to the compliance_flags keys that satisfy it.
// SOC 2 is satisfied by either soc2 or soc2_type2.
export const DECISION_COMPLIANCE_CHECKLIST: Array<{
  label: string;
  keys: Array<keyof ComplianceFlags>;
}> = [
  { label: "GDPR", keys: ["gdpr"] },
  { label: "SOC 2", keys: ["soc2_type2", "soc2"] },
  { label: "ISO 27001", keys: ["iso27001"] },
  { label: "HIPAA", keys: ["hipaa"] },
  { label: "PCI DSS", keys: ["pci_dss"] },
  { label: "CCPA", keys: ["ccpa"] },
];

export function vendorMeetsCompliance(
  vendor: Vendor,
  keys: Array<keyof ComplianceFlags>,
): boolean {
  return keys.some((k) => vendor.compliance_flags?.[k]);
}

// value_tier → simple price band glyph for DecisionCard
export function getPriceBand(vendor: Vendor): string | null {
  switch (vendor.value_tier) {
    case "budget":
      return "$";
    case "mid":
      return "$$";
    case "enterprise":
      return "$$$";
    default:
      return null;
  }
}

/**
 * Canonical vendor-attribute read helpers.
 *
 * All render surfaces (DecisionCard, sidebar, VendorCard, homepage FAQ, blog inline)
 * MUST go through these — never read `vendor.pricing` / `vendor.pricing_summary` / etc
 * directly. This is the single-source-of-truth boundary that keeps every block on
 * every page in sync.
 */

// Primary price display — used everywhere a single-line price is shown.
// Reads starting_price.raw (authoritative) and falls back to pricing.
export function getVendorPriceDisplay(vendor: Vendor): string {
  if (vendor.starting_price?.raw) return vendor.starting_price.raw;
  if (vendor.pricing) return vendor.pricing;
  return "Contact for pricing";
}

export function getVendorPriceTiers(vendor: Vendor) {
  return vendor.website_data?.pricing_plans ?? [];
}

export function getVendorMinCommitment(vendor: Vendor): string | null {
  const mc = vendor.min_monthly_commitment;
  if (!mc) return null;
  return mc.raw ?? `${mc.currency === "USD" ? "$" : mc.currency === "EUR" ? "€" : mc.currency === "GBP" ? "£" : ""}${mc.amount}/mo`;
}

// Trial display — returns { label, detail } for two-line rendering, or null when no trial.
export function getVendorTrialDisplay(vendor: Vendor): { label: string; detail: string | null } | null {
  if (!vendor.has_free_trial) return null;
  const t = vendor.free_trial;
  if (!t) return { label: "Free trial available", detail: null };

  // Prefer explicit note when supplied (richest info)
  if (t.note) return { label: "Free trial", detail: t.note };

  const parts: string[] = [];
  if (t.verifications) parts.push(`${t.verifications} free verifications`);
  if (t.days) parts.push(`${t.days}-day trial`);
  if (parts.length === 0) return { label: "Free trial available", detail: null };
  return { label: "Free trial", detail: parts.join(" · ") };
}

export function getVendorFoundedYear(vendor: Vendor): number | null {
  return vendor.website_data?.founded_year ?? vendor.company_data?.founded_year ?? null;
}

// Funding display — returns "$30M Series B" or null when not verified / hidden.
export function getVendorFundingDisplay(vendor: Vendor): string | null {
  const c = vendor.company_data;
  if (!c || !c.funding_display) return null;
  if (!c.total_funding) return null;
  return c.funding_stage ? `${c.total_funding} ${c.funding_stage}` : c.total_funding;
}

// Compact starting amount for schema.org Offer / calculator / inline blog references.
export function getVendorStartingAmount(vendor: Vendor): { amount: number; currency: string } | null {
  if (!vendor.starting_price?.amount) return null;
  return { amount: vendor.starting_price.amount, currency: vendor.starting_price.currency };
}

// Pick up to N compliance flags from the given order that are true on the vendor.
export function pickComplianceFlags(
  vendor: Vendor,
  order: Array<keyof ComplianceFlags>,
  max = Infinity,
): Array<keyof ComplianceFlags> {
  const out: Array<keyof ComplianceFlags> = [];
  for (const k of order) {
    if (vendor.compliance_flags?.[k]) out.push(k);
    if (out.length >= max) break;
  }
  return out;
}

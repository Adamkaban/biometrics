import vendorsData from "../data/vendors.json";

export type ComplianceFlags = {
  soc2: boolean;
  soc2_type2: boolean;
  iso27001: boolean;
  gdpr: boolean;
  hipaa: boolean;
  ibeta: boolean;
  pci_dss: boolean;
};

export type FeatureFlags = {
  has_id_verification: boolean;
  has_liveness: boolean;
  has_aml: boolean;
  has_kyb: boolean;
  has_transaction_monitoring: boolean;
};

export type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
} | null;

export type Vendor = {
  name: string;
  company: string;
  description: string;
  rating: number;
  reviews_count: number;
  total_reviews_all_sources?: number;
  rating_breakdown?: RatingBreakdown;
  pricing: string;
  pricing_model_type?: "flat_rate" | "per_check" | "custom";
  starting_price_usd?: number | null;
  min_monthly_commitment_usd?: number | null;
  free_trial_days?: number | null;
  free_tier_verifications?: number | null;
  vendor_website: string;
  product_url: string;
  categories: string[];
  source: string;
  all_sources: string[];
  website_data: {
    pricing_plans: Array<{ name: string; price: string; features_included: string[] }>;
    key_features?: string[];
    integrations?: string[];
    tech_capabilities?: string[];
    compliance_certifications?: string[];
    target_industries?: string[];
    pricing_model?: string;
    supported_countries?: string;
    headquarters?: string;
    founded_year?: number;
  };
  company_data?: {
    employee_count_range?: string;
    total_funding?: string;
    funding_stage?: string;
    funding_display?: boolean;
  };
  sdk_types?: string[];
  compliance_flags?: ComplianceFlags;
  feature_flags?: FeatureFlags;
  countries_count?: number | null;
  slug: string;
  featured: boolean;
  affiliate_url: string | null;
  has_free_trial: boolean;
  logo_url: string;
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

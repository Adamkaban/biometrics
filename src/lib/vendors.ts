import vendorsData from "../data/vendors.json";

export type Vendor = {
  name: string;
  company: string;
  description: string;
  rating: number;
  reviews_count: number;
  pricing: string;
  vendor_website: string;
  product_url: string;
  categories: string[];
  source: string;
  all_sources: string[];
  website_data: { pricing_plans: Array<{ name: string; price: string; features_included: string[] }> };
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

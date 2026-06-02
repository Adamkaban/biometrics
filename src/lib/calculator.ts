const GBP_TO_USD = 1.27;

export type ParsedPrice =
  | { type: "per-check"; usd: number; monthlyMin?: number; approx?: true }
  | { type: "flat"; usd: number; label?: string }
  | { type: "free" }
  | { type: "custom"; label: string };

export function parsePrice(raw: string): ParsedPrice {
  const s = (raw ?? "").trim();

  // Sentinel / unknown data values → custom (no pricing info)
  if (!s || s === "null" || s === "N/A") {
    return { type: "custom", label: "Contact Sales" };
  }

  // Free / $0
  if (s === "Free" || s === "$0") {
    return { type: "free" };
  }

  // $0 / per check
  if (/^\$0\s*\/\s*per\s+check$/i.test(s)) {
    return { type: "free" };
  }

  // Custom / contact variants
  const customPatterns = [
    /contact/i,
    /custom/i,
    /request\s+pricing/i,
    /usage\s+based/i,
    /let\.s\s+(chat|talk)/i,
  ];
  if (customPatterns.some((p) => p.test(s))) {
    return { type: "custom", label: "Contact Sales" };
  }

  // GBP per candidate/client/check
  const gbpPerCheck = s.match(/£([\d.]+)\s+per\s+\w+/i);
  if (gbpPerCheck) {
    return {
      type: "per-check",
      usd: parseFloat(gbpPerCheck[1]) * GBP_TO_USD,
      approx: true,
    };
  }

  // Per-check with monthly minimum: "$0.80 per verification / $49 month min"
  const perCheckWithMin = s.match(
    /\$([\d.]+)\s*(?:per\s+verification|\/\s*per\s+check|\/\s*verification)\s*\/\s*\$([\d.]+)\s+month/i
  );
  if (perCheckWithMin) {
    return {
      type: "per-check",
      usd: parseFloat(perCheckWithMin[1]),
      monthlyMin: parseFloat(perCheckWithMin[2]),
    };
  }

  // Per-check without minimum
  const perCheck = s.match(
    /\$([\d.]+)\s*(?:per\s+(?:verification|check)|\/\s*(?:per\s+check|verification))/i
  );
  if (perCheck) {
    const usd = parseFloat(perCheck[1]);
    if (usd === 0) return { type: "free" };
    return { type: "per-check", usd };
  }

  // Per-user monthly
  const perUser = s.match(/\$([\d.]+)\s*\/\s*user\s*\/\s*mo/i);
  if (perUser) {
    return { type: "flat", usd: parseFloat(perUser[1]), label: "/user/month" };
  }

  // Flat monthly — /month, /mo, or standalone / mo
  const flatMonthly = s.match(/\$([\d.]+)\s*(?:\/\s*mo(?:nth)?|\/?\s*mo\b)/i);
  if (flatMonthly) {
    return { type: "flat", usd: parseFloat(flatMonthly[1]) };
  }

  // Bare dollar amount (e.g. "$19.99", "$49.99")
  const bareDollar = s.match(/^\$([\d.]+)$/);
  if (bareDollar) {
    const usd = parseFloat(bareDollar[1]);
    if (usd === 0) return { type: "free" };
    return { type: "flat", usd };
  }

  return { type: "custom", label: "Contact Sales" };
}

export interface VendorPricingInput {
  slug: string;
  name: string;
  logo_url: string;
  featured: boolean;
  has_assessment: boolean;
  has_free_trial: boolean;
  vendor_website: string;
  affiliate_url: string | null;
  plans: Array<{ name: string; price: string }>;
}

export type PricingResult =
  | { type: "calculated"; monthlyUSD: number; perVerification?: number; hasMinimum?: number; approx?: true }
  | { type: "flat"; usd: number; label?: string }
  | { type: "free" }
  | { type: "custom"; label: string };

export interface VendorResult extends VendorPricingInput {
  pricing: PricingResult;
}

export function calculateMonthlyCost(vendor: VendorPricingInput, volume: number): VendorResult {
  if (vendor.plans.length === 0) {
    return { ...vendor, pricing: { type: "custom", label: "Contact Sales" } };
  }

  const parsed = vendor.plans.map((p) => parsePrice(p.price));

  // Per-check plans — paid only (usd > 0), pick cheapest for given volume
  const perCheckPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "per-check" }> => p.type === "per-check" && p.usd > 0
  );
  if (perCheckPlans.length > 0) {
    const best = perCheckPlans.reduce((acc, p) => {
      const cost = Math.max(p.usd * volume, p.monthlyMin ?? 0);
      const accCost = Math.max(acc.usd * volume, acc.monthlyMin ?? 0);
      return cost < accCost ? p : acc;
    });
    const rawCost = best.usd * volume;
    const monthlyUSD = best.monthlyMin ? Math.max(rawCost, best.monthlyMin) : rawCost;
    return {
      ...vendor,
      pricing: {
        type: "calculated",
        monthlyUSD,
        perVerification: best.usd,
        ...(best.monthlyMin ? { hasMinimum: best.monthlyMin } : {}),
        ...(best.approx ? { approx: true } : {}),
      },
    };
  }

  // Flat plans — paid only (usd > 0), pick cheapest
  const flatPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "flat" }> => p.type === "flat" && p.usd > 0
  );
  if (flatPlans.length > 0) {
    const best = flatPlans.reduce((acc, p) => (p.usd < acc.usd ? p : acc));
    return { ...vendor, pricing: best };
  }

  // No paid plans — genuinely free if any free plan exists
  if (parsed.some((p) => p.type === "free")) {
    return { ...vendor, pricing: { type: "free" } };
  }

  // All custom
  return { ...vendor, pricing: { type: "custom", label: "Contact Sales" } };
}

export function sortVendorResults(results: VendorResult[]): VendorResult[] {
  // free=0, priced (calculated+flat)=1, custom=2
  const bucket = (r: VendorResult): number => {
    if (r.pricing.type === "free") return 0;
    if (r.pricing.type === "custom") return 2;
    return 1; // calculated + flat sorted together by USD
  };

  const cost = (r: VendorResult): number => {
    if (r.pricing.type === "calculated") return r.pricing.monthlyUSD;
    if (r.pricing.type === "flat") return r.pricing.usd;
    return 0;
  };

  return [...results].sort((a, b) => {
    const ba = bucket(a);
    const bb = bucket(b);
    if (ba !== bb) return ba - bb;
    return cost(a) - cost(b);
  });
}

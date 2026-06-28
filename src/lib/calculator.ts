const GBP_TO_USD = 1.27; // June 2026 — update if rate shifts >5%

export const LIVENESS_SURCHARGE_USD = 0.30;
export const AML_SURCHARGE_USD = 0.10;

export interface Addons {
  liveness: boolean;
  aml: boolean;
}

export type ParsedPrice =
  | { type: "per-check"; usd: number; monthlyMin?: number; approx?: true }
  | { type: "flat"; usd: number; label?: string; cap?: number; overage?: number }
  | { type: "free" }
  | { type: "custom"; label: string };

export function parsePrice(raw: string): ParsedPrice {
  const s = (raw ?? "").trim();

  if (!s || s === "null" || s === "N/A") {
    return { type: "custom", label: "Contact Sales" };
  }

  if (s === "Free" || s === "$0") {
    return { type: "free" };
  }

  if (/^\$0\s*\/\s*per\s+check$/i.test(s)) {
    return { type: "free" };
  }

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

  const gbpPerCheck = s.match(/£([\d.]+)\s+per\s+\w+/i);
  if (gbpPerCheck) {
    return {
      type: "per-check",
      usd: parseFloat(gbpPerCheck[1]) * GBP_TO_USD,
      approx: true,
    };
  }

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

  const perCheck = s.match(
    /\$([\d.]+)\s*(?:per\s+(?:verification|check)|\/\s*(?:per\s+check|verification))/i
  );
  if (perCheck) {
    const usd = parseFloat(perCheck[1]);
    if (usd === 0) return { type: "free" };
    return { type: "per-check", usd };
  }

  const perUser = s.match(/\$([\d.]+)\s*\/\s*user\s*\/\s*mo/i);
  if (perUser) {
    return { type: "flat", usd: parseFloat(perUser[1]), label: "/user/month" };
  }

  const flatMonthly = s.match(/\$([\d.]+)\s*(?:\/\s*mo(?:nth)?|\/?\s*mo\b)/i);
  if (flatMonthly) {
    return { type: "flat", usd: parseFloat(flatMonthly[1]) };
  }

  const bareDollar = s.match(/^\$([\d.]+)$/);
  if (bareDollar) {
    const usd = parseFloat(bareDollar[1]);
    if (usd === 0) return { type: "free" };
    return { type: "flat", usd };
  }

  return { type: "custom", label: "Contact Sales" };
}

export interface PlanInput {
  name: string;
  price: string;
  monthly_cap?: number;
  overage_rate?: number;
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
  plans: PlanInput[];
  min_monthly_commitment?: number | null;
  pricing_source?: "official" | "estimated";
  has_liveness?: boolean;
  has_aml?: boolean;
}

export type PricingResult =
  | {
      type: "calculated";
      monthlyUSD: number;
      perVerification?: number;
      hasMinimum?: number;
      approx?: true;
      cap?: number;
      overage?: number;
      overflowVolume?: number;
      addonSurcharge?: number;
    }
  | { type: "flat"; usd: number; label?: string }
  | { type: "free" }
  | { type: "custom"; label: string };

export interface VendorResult extends VendorPricingInput {
  pricing: PricingResult;
}

function effectivePerCheck(
  basePerCheck: number,
  addons: Addons,
  vendor: VendorPricingInput
): { perCheck: number; surcharge: number } {
  let surcharge = 0;
  if (addons.liveness && vendor.has_liveness !== false) surcharge += LIVENESS_SURCHARGE_USD;
  if (addons.aml && vendor.has_aml !== false) surcharge += AML_SURCHARGE_USD;
  return { perCheck: basePerCheck + surcharge, surcharge };
}

function addonsRequireUnsupportedFeature(addons: Addons, vendor: VendorPricingInput): string | null {
  if (addons.liveness && vendor.has_liveness === false) return "Liveness not supported";
  if (addons.aml && vendor.has_aml === false) return "AML not supported";
  return null;
}

export function calculateMonthlyCost(
  vendor: VendorPricingInput,
  volume: number,
  addons: Addons = { liveness: false, aml: false }
): VendorResult {
  if (vendor.plans.length === 0) {
    return { ...vendor, pricing: { type: "custom", label: "Contact Sales" } };
  }

  const unsupported = addonsRequireUnsupportedFeature(addons, vendor);
  if (unsupported) {
    return { ...vendor, pricing: { type: "custom", label: unsupported } };
  }

  const parsed = vendor.plans.map((p) => {
    const base = parsePrice(p.price);
    if (base.type === "flat" && (p.monthly_cap !== undefined || p.overage_rate !== undefined)) {
      return { ...base, cap: p.monthly_cap, overage: p.overage_rate };
    }
    return base;
  });

  const perCheckPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "per-check" }> => p.type === "per-check" && p.usd > 0
  );

  if (perCheckPlans.length > 0) {
    const evaluate = (p: Extract<ParsedPrice, { type: "per-check" }>) => {
      const { perCheck, surcharge } = effectivePerCheck(p.usd, addons, vendor);
      const floor = vendor.min_monthly_commitment ?? p.monthlyMin ?? 0;
      const monthly = Math.max(perCheck * volume, floor);
      return { plan: p, perCheck, surcharge, floor, monthly };
    };

    const best = perCheckPlans.map(evaluate).reduce((acc, cur) => (cur.monthly < acc.monthly ? cur : acc));
    const hasMinimum = vendor.min_monthly_commitment ?? best.plan.monthlyMin;

    return {
      ...vendor,
      pricing: {
        type: "calculated",
        monthlyUSD: best.monthly,
        perVerification: best.perCheck,
        ...(hasMinimum ? { hasMinimum } : {}),
        ...(best.plan.approx ? { approx: true as const } : {}),
        ...(best.surcharge > 0 ? { addonSurcharge: best.surcharge } : {}),
      },
    };
  }

  const flatPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "flat" }> => p.type === "flat" && p.usd > 0
  );

  if (flatPlans.length > 0) {
    const evaluate = (p: Extract<ParsedPrice, { type: "flat" }>) => {
      if (p.cap !== undefined && volume > p.cap) {
        if (p.overage === undefined || p.overage <= 0) {
          return { plan: p, monthly: Number.POSITIVE_INFINITY, exceeded: true };
        }
        return {
          plan: p,
          monthly: p.usd + (volume - p.cap) * p.overage,
          exceeded: false,
        };
      }
      return { plan: p, monthly: p.usd, exceeded: false };
    };

    const evaluated = flatPlans.map(evaluate);
    const reachable = evaluated.filter((e) => !e.exceeded);

    if (reachable.length === 0) {
      return { ...vendor, pricing: { type: "custom", label: "Plan cap exceeded" } };
    }

    const best = reachable.reduce((acc, cur) => (cur.monthly < acc.monthly ? cur : acc));
    const p = best.plan;

    if (p.cap !== undefined && p.overage !== undefined && volume > p.cap) {
      return {
        ...vendor,
        pricing: {
          type: "calculated",
          monthlyUSD: best.monthly,
          cap: p.cap,
          overage: p.overage,
          overflowVolume: volume - p.cap,
        },
      };
    }

    return { ...vendor, pricing: { type: "flat", usd: p.usd, ...(p.label ? { label: p.label } : {}) } };
  }

  if (parsed.some((p) => p.type === "free")) {
    return { ...vendor, pricing: { type: "free" } };
  }

  return { ...vendor, pricing: { type: "custom", label: "Contact Sales" } };
}

export function sortVendorResults(results: VendorResult[]): VendorResult[] {
  const bucket = (r: VendorResult): number => {
    if (r.pricing.type === "free") return 0;
    if (r.pricing.type === "custom") return 2;
    return 1;
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

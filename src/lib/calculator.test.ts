import { describe, it, expect } from "vitest";
import { parsePrice, calculateMonthlyCost, sortVendorResults, type VendorPricingInput, type VendorResult } from "./calculator";

describe("parsePrice", () => {
  it("parses per-verification USD", () => {
    expect(parsePrice("$0.55 per verification")).toEqual({
      type: "per-check",
      usd: 0.55,
    });
  });

  it("parses per-check with slash format", () => {
    expect(parsePrice("$0.28 / verification")).toEqual({
      type: "per-check",
      usd: 0.28,
    });
  });

  it("parses per-check with monthly minimum", () => {
    expect(parsePrice("$0.80 per verification / $49 month min")).toEqual({
      type: "per-check",
      usd: 0.80,
      monthlyMin: 49,
    });
  });

  it("parses per-check with minimum variant", () => {
    expect(parsePrice("$1.39 per verification / $99 month min")).toEqual({
      type: "per-check",
      usd: 1.39,
      monthlyMin: 99,
    });
  });

  it("parses / per check format", () => {
    expect(parsePrice("$0.95 / per check")).toEqual({
      type: "per-check",
      usd: 0.95,
    });
  });

  it("treats $0 / per check as free", () => {
    expect(parsePrice("$0 / per check")).toEqual({ type: "free" });
  });

  it("parses flat monthly /month", () => {
    expect(parsePrice("$199/month")).toEqual({ type: "flat", usd: 199 });
  });

  it("parses flat monthly /mo", () => {
    expect(parsePrice("$99/mo")).toEqual({ type: "flat", usd: 99 });
  });

  it("treats ambiguous /mo without per-check keyword as flat", () => {
    expect(parsePrice("$0.45 / mo")).toEqual({ type: "flat", usd: 0.45 });
  });

  it("parses per-user monthly", () => {
    expect(parsePrice("$50/user/month")).toEqual({
      type: "flat",
      usd: 50,
      label: "/user/month",
    });
  });

  it("parses GBP per candidate", () => {
    const result = parsePrice("from £6 per candidate");
    expect(result.type).toBe("per-check");
    if (result.type === "per-check") {
      expect(result.usd).toBeCloseTo(7.62, 1);
      expect(result.approx).toBe(true);
    }
  });

  it("parses Free string", () => {
    expect(parsePrice("Free")).toEqual({ type: "free" });
  });

  it("parses $0 as free", () => {
    expect(parsePrice("$0")).toEqual({ type: "free" });
  });

  it("parses Contact sales as custom", () => {
    expect(parsePrice("Contact sales")).toEqual({
      type: "custom",
      label: "Contact Sales",
    });
  });

  it("parses Custom pricing as custom", () => {
    expect(parsePrice("Custom pricing")).toEqual({
      type: "custom",
      label: "Contact Sales",
    });
  });

  it("parses null string as custom", () => {
    expect(parsePrice("null")).toEqual({ type: "custom", label: "Contact Sales" });
  });

  it("parses N/A as custom", () => {
    expect(parsePrice("N/A")).toEqual({ type: "custom", label: "Contact Sales" });
  });
});

function makeVendor(overrides: Partial<VendorPricingInput> = {}): VendorPricingInput {
  return {
    slug: "test-vendor",
    name: "Test Vendor",
    logo_url: "",
    featured: false,
    has_assessment: false,
    has_free_trial: false,
    vendor_website: "https://example.com",
    affiliate_url: null,
    plans: [],
    ...overrides,
  };
}

describe("calculateMonthlyCost", () => {
  it("calculates per-check cost", () => {
    const vendor = makeVendor({ plans: [{ name: "Basic", price: "$0.55 per verification" }] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "calculated", monthlyUSD: 5500, perVerification: 0.55 });
  });

  it("applies monthly minimum when volume cost is lower", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.80 per verification / $49 month min" }],
    });
    const result = calculateMonthlyCost(vendor, 10); // 10 × $0.80 = $8, min is $49
    expect(result.pricing).toEqual({
      type: "calculated",
      monthlyUSD: 49,
      perVerification: 0.80,
      hasMinimum: 49,
    });
  });

  it("uses volume cost when it exceeds minimum", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.80 per verification / $49 month min" }],
    });
    const result = calculateMonthlyCost(vendor, 1000); // 1000 × $0.80 = $800
    expect(result.pricing).toEqual({
      type: "calculated",
      monthlyUSD: 800,
      perVerification: 0.80,
      hasMinimum: 49,
    });
  });

  it("returns free when all plans are free", () => {
    const vendor = makeVendor({ plans: [{ name: "Free", price: "Free" }] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "free" });
  });

  it("returns flat when only flat plans exist", () => {
    const vendor = makeVendor({ plans: [{ name: "Pro", price: "$199/month" }] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "flat", usd: 199 });
  });

  it("returns custom when only custom plans exist", () => {
    const vendor = makeVendor({ plans: [{ name: "Ent", price: "Contact sales" }] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "custom", label: "Contact Sales" });
  });

  it("picks cheapest per-check plan when multiple exist", () => {
    const vendor = makeVendor({
      plans: [
        { name: "A", price: "$1.50 per verification" },
        { name: "B", price: "$0.55 per verification" },
      ],
    });
    const result = calculateMonthlyCost(vendor, 1000);
    expect(result.pricing).toMatchObject({ type: "calculated", perVerification: 0.55 });
  });

  it("ignores free tier when paid per-check plans exist", () => {
    const vendor = makeVendor({
      plans: [
        { name: "Free Forever", price: "$0 / per check" },
        { name: "Essentials", price: "$0.95 / per check" },
      ],
    });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toMatchObject({ type: "calculated", monthlyUSD: 9500, perVerification: 0.95 });
  });

  it("ignores free tier when paid flat plans exist", () => {
    const vendor = makeVendor({
      plans: [
        { name: "Starter", price: "$0" },
        { name: "Pro", price: "$199/month" },
      ],
    });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "flat", usd: 199 });
  });

  it("no plans returns custom", () => {
    const vendor = makeVendor({ plans: [] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "custom", label: "Contact Sales" });
  });

  it("applies vendor min_monthly_commitment to per-check plans", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.05 per verification" }],
      min_monthly_commitment: 149,
    });
    const result = calculateMonthlyCost(vendor, 166);
    expect(result.pricing).toMatchObject({
      type: "calculated",
      monthlyUSD: 149,
      hasMinimum: 149,
    });
  });

  it("uses volume cost when above vendor min_monthly_commitment", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.05 per verification" }],
      min_monthly_commitment: 149,
    });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toMatchObject({
      type: "calculated",
      monthlyUSD: 500,
      hasMinimum: 149,
    });
  });

  it("applies flat plan cap + overage at high volume", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$10/mo", monthly_cap: 50, overage_rate: 1.5 }],
    });
    const result = calculateMonthlyCost(vendor, 200);
    expect(result.pricing).toMatchObject({
      type: "calculated",
      monthlyUSD: 10 + 150 * 1.5,
      cap: 50,
      overage: 1.5,
      overflowVolume: 150,
    });
  });

  it("returns Plan cap exceeded when flat plan has cap but no overage rate", () => {
    const vendor = makeVendor({
      plans: [{ name: "Tiny", price: "$7.50/mo", monthly_cap: 10 }],
    });
    const result = calculateMonthlyCost(vendor, 1000);
    expect(result.pricing).toEqual({ type: "custom", label: "Plan cap exceeded" });
  });

  it("keeps flat plan price when volume is within cap", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$10/mo", monthly_cap: 50, overage_rate: 1.5 }],
    });
    const result = calculateMonthlyCost(vendor, 40);
    expect(result.pricing).toEqual({ type: "flat", usd: 10 });
  });

  it("adds liveness surcharge to per-check vendors that support liveness", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.05 per verification" }],
      has_liveness: true,
    });
    const result = calculateMonthlyCost(vendor, 1000, { liveness: true, aml: false });
    expect(result.pricing).toMatchObject({
      type: "calculated",
      perVerification: 0.35,
      monthlyUSD: 350,
      addonSurcharge: 0.30,
    });
  });

  it("adds combined liveness + AML surcharge", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.50 per verification" }],
      has_liveness: true,
      has_aml: true,
    });
    const result = calculateMonthlyCost(vendor, 1000, { liveness: true, aml: true });
    expect(result.pricing).toMatchObject({
      type: "calculated",
      perVerification: 0.90,
      monthlyUSD: 900,
      addonSurcharge: 0.40,
    });
  });

  it("marks vendor unsupported when addon required but capability missing", () => {
    const vendor = makeVendor({
      plans: [{ name: "Basic", price: "$0.50 per verification" }],
      has_liveness: false,
    });
    const result = calculateMonthlyCost(vendor, 1000, { liveness: true, aml: false });
    expect(result.pricing).toEqual({ type: "custom", label: "Liveness not supported" });
  });
});

describe("sortVendorResults", () => {
  it("puts free first, custom last, sorted by monthlyUSD in between", () => {
    const results: VendorResult[] = [
      { ...makeVendor({ slug: "b" }), pricing: { type: "calculated", monthlyUSD: 200, perVerification: 0.02 } },
      { ...makeVendor({ slug: "c" }), pricing: { type: "custom", label: "Contact Sales" } },
      { ...makeVendor({ slug: "a" }), pricing: { type: "free" } },
      { ...makeVendor({ slug: "d" }), pricing: { type: "calculated", monthlyUSD: 50, perVerification: 0.005 } },
      { ...makeVendor({ slug: "e" }), pricing: { type: "flat", usd: 99 } },
    ];
    const sorted = sortVendorResults(results);
    expect(sorted[0].slug).toBe("a");           // free first
    expect(sorted[sorted.length - 1].slug).toBe("c"); // custom last
    expect(sorted[1].slug).toBe("d");           // $50 before $99
    expect(sorted[2].slug).toBe("e");           // $99 before $200
    expect(sorted[3].slug).toBe("b");           // $200 last calculable
  });
});

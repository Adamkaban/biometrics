# KYC Cost Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive KYC pricing calculator at `/tools/kyc-cost-calculator` that takes monthly verification volume and returns estimated monthly costs across 24 KYC vendors, sorted by price.

**Architecture:** Pure calculation logic in `src/lib/calculator.ts` (testable), React island `KYCCalculator.tsx` (client:load) wired from `src/pages/tools/kyc-cost-calculator.astro`. Astro page derives `has_assessment` at build time via `getCollection('assessments')` — no changes to vendors.ts or Vendor type needed.

**Tech Stack:** Astro 5, React 19, TypeScript, Tailwind v4, Vitest (new — no test runner exists yet), Geist font, @phosphor-icons/react

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `package.json` | Modify | Add vitest dev dependency + test script |
| `vitest.config.ts` | Create | Vitest config for TypeScript |
| `src/lib/calculator.ts` | Create | Price parsing + cost calculation logic |
| `src/lib/calculator.test.ts` | Create | Tests for calculator.ts |
| `src/components/calculator/KYCCalculator.tsx` | Create | Main React island |
| `src/components/calculator/VolumeInput.tsx` | Create | Slider + number input + preset buttons |
| `src/components/calculator/ResultsTable.tsx` | Create | Sorted vendor results table |
| `src/components/calculator/VendorRow.tsx` | Create | Single vendor result row |
| `src/pages/tools/kyc-cost-calculator.astro` | Create | SEO page wrapper |

---

## Task 1: Install Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add test script to package.json**

Open `package.json`, find the `"scripts"` section, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Verify vitest works**

```bash
npm test
```

Expected output: `No test files found` (exits 0 — vitest doesn't fail on empty test suite).

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: calculator.ts — Types and Price Parsing

**Files:**
- Create: `src/lib/calculator.ts`
- Create: `src/lib/calculator.test.ts`

- [ ] **Step 1: Write failing tests for `parsePrice`**

Create `src/lib/calculator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parsePrice } from "./calculator";

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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: All tests fail with `Cannot find module './calculator'`

- [ ] **Step 3: Implement types and `parsePrice` in calculator.ts**

Create `src/lib/calculator.ts`:

```typescript
const GBP_TO_USD = 1.27;

export type ParsedPrice =
  | { type: "per-check"; usd: number; monthlyMin?: number; approx?: true }
  | { type: "flat"; usd: number; label?: string }
  | { type: "free" }
  | { type: "custom"; label: string };

export function parsePrice(raw: string): ParsedPrice {
  const s = (raw ?? "").trim();

  // Free / $0
  if (!s || s === "null" || s === "N/A" || s === "Free" || s === "$0") {
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
    /let.s\s+(chat|talk)/i,
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: All 17 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculator.ts src/lib/calculator.test.ts
git commit -m "feat: add calculator.ts price parser with tests"
```

---

## Task 3: calculator.ts — Cost Calculation

**Files:**
- Modify: `src/lib/calculator.ts`
- Modify: `src/lib/calculator.test.ts`

- [ ] **Step 1: Add failing tests for `calculateMonthlyCost` and `sortVendorResults`**

Append to `src/lib/calculator.test.ts`:

```typescript
import { calculateMonthlyCost, sortVendorResults, type VendorPricingInput, type VendorResult } from "./calculator";

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

  it("no plans returns custom", () => {
    const vendor = makeVendor({ plans: [] });
    const result = calculateMonthlyCost(vendor, 10000);
    expect(result.pricing).toEqual({ type: "custom", label: "Contact Sales" });
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: Fails with `calculateMonthlyCost is not exported`

- [ ] **Step 3: Add types and functions to calculator.ts**

Append to `src/lib/calculator.ts`:

```typescript
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

  // Free tier — any free plan
  if (parsed.some((p) => p.type === "free")) {
    return { ...vendor, pricing: { type: "free" } };
  }

  // Per-check plans — pick cheapest for given volume
  const perCheckPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "per-check" }> => p.type === "per-check"
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

  // Flat plans — pick cheapest
  const flatPlans = parsed.filter(
    (p): p is Extract<ParsedPrice, { type: "flat" }> => p.type === "flat"
  );
  if (flatPlans.length > 0) {
    const best = flatPlans.reduce((acc, p) => (p.usd < acc.usd ? p : acc));
    return { ...vendor, pricing: best };
  }

  // All custom
  return { ...vendor, pricing: { type: "custom", label: "Contact Sales" } };
}

export function sortVendorResults(results: VendorResult[]): VendorResult[] {
  const order = (r: VendorResult): number => {
    if (r.pricing.type === "free") return 0;
    if (r.pricing.type === "calculated") return 1;
    if (r.pricing.type === "flat") return 2;
    return 3; // custom
  };

  const cost = (r: VendorResult): number => {
    if (r.pricing.type === "calculated") return r.pricing.monthlyUSD;
    if (r.pricing.type === "flat") return r.pricing.usd;
    return 0;
  };

  return [...results].sort((a, b) => {
    const oa = order(a);
    const ob = order(b);
    if (oa !== ob) return oa - ob;
    return cost(a) - cost(b);
  });
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculator.ts src/lib/calculator.test.ts
git commit -m "feat: add cost calculation and sort logic to calculator.ts"
```

---

## Task 4: VolumeInput Component

**Files:**
- Create: `src/components/calculator/VolumeInput.tsx`

- [ ] **Step 1: Create VolumeInput.tsx**

```tsx
const PRESETS = [
  { label: "500", value: 500 },
  { label: "2K", value: 2000 },
  { label: "10K", value: 10000 },
  { label: "50K", value: 50000 },
  { label: "100K", value: 100000 },
];

// Logarithmic slider: map 0–100 range to 100–1,000,000
function sliderToVolume(slider: number): number {
  return Math.round(Math.pow(10, 2 + (slider / 100) * 4));
}

function volumeToSlider(volume: number): number {
  return Math.round(((Math.log10(volume) - 2) / 4) * 100);
}

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeInput({ value, onChange }: Props) {
  const sliderValue = volumeToSlider(Math.max(100, Math.min(1_000_000, value)));

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(sliderToVolume(Number(e.target.value)));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
    if (!isNaN(n)) onChange(Math.max(100, Math.min(1_000_000, n)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Monthly verifications
        </label>
        <input
          type="text"
          value={value.toLocaleString("en-US")}
          onChange={handleInput}
          className="w-32 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-right font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Number of monthly verifications"
        />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={sliderValue}
        onChange={handleSlider}
        className="w-full accent-blue-600"
        aria-label="Monthly verifications slider"
      />

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === p.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calculator/VolumeInput.tsx
git commit -m "feat: add VolumeInput component with logarithmic slider"
```

---

## Task 5: VendorRow Component

**Files:**
- Create: `src/components/calculator/VendorRow.tsx`

- [ ] **Step 1: Create VendorRow.tsx**

```tsx
import type { VendorResult, PricingResult } from "../../lib/calculator";

function formatCost(pricing: PricingResult): { primary: string; secondary?: string } {
  switch (pricing.type) {
    case "free":
      return { primary: "Free" };
    case "calculated": {
      const usd = pricing.monthlyUSD;
      const primary =
        usd >= 1000
          ? `$${(usd / 1000).toFixed(1)}K/mo`
          : `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`;
      const secondary = pricing.perVerification
        ? `$${pricing.perVerification}/check${pricing.approx ? " (~USD)" : ""}`
        : undefined;
      return { primary, secondary };
    }
    case "flat": {
      const label = pricing.label ?? "/mo";
      return {
        primary: `$${pricing.usd}${label}`,
        secondary: "flat rate",
      };
    }
    case "custom":
      return { primary: pricing.label };
  }
}

interface Props {
  result: VendorResult;
}

export function VendorRow({ result }: Props) {
  const { primary, secondary } = formatCost(result.pricing);
  const isCustom = result.pricing.type === "custom";

  const actionHref = result.has_assessment
    ? `/vendors/${result.slug}`
    : result.affiliate_url ?? result.vendor_website;

  const actionLabel = result.has_assessment ? "View Review" : "Visit Website";
  const isExternal = !result.has_assessment;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        result.featured
          ? "border-blue-200 bg-blue-50/50 dark:border-blue-600/30 dark:bg-blue-950/10"
          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      }`}
    >
      {/* Logo */}
      <div className="shrink-0 w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        {result.logo_url ? (
          <img src={result.logo_url} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
        ) : (
          <span className="text-xs font-semibold text-zinc-500 uppercase">
            {result.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {result.name}
          </span>
          {result.has_free_trial && (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5">
              Free Trial
            </span>
          )}
          {result.featured && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5">
              Featured
            </span>
          )}
        </div>
        {secondary && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{secondary}</p>
        )}
      </div>

      {/* Cost */}
      <div className="text-right shrink-0">
        <span
          className={`font-mono text-sm font-semibold ${
            result.pricing.type === "free"
              ? "text-emerald-600 dark:text-emerald-400"
              : isCustom
              ? "text-zinc-400"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {primary}
        </span>
      </div>

      {/* Action */}
      <a
        href={actionHref}
        {...(isExternal ? { rel: "nofollow noopener", target: "_blank" } : {})}
        className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
      >
        {actionLabel}
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calculator/VendorRow.tsx
git commit -m "feat: add VendorRow component"
```

---

## Task 6: ResultsTable Component

**Files:**
- Create: `src/components/calculator/ResultsTable.tsx`

- [ ] **Step 1: Create ResultsTable.tsx**

```tsx
import { useState } from "react";
import type { VendorResult } from "../../lib/calculator";
import { VendorRow } from "./VendorRow";

interface Props {
  results: VendorResult[];
}

export function ResultsTable({ results }: Props) {
  const [customExpanded, setCustomExpanded] = useState(false);

  const calculable = results.filter(
    (r) => r.pricing.type !== "custom"
  );
  const custom = results.filter((r) => r.pricing.type === "custom");

  return (
    <div className="space-y-2">
      {calculable.map((r) => (
        <VendorRow key={r.slug} result={r} />
      ))}

      {custom.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setCustomExpanded((v) => !v)}
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${customExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            {custom.length} vendor{custom.length !== 1 ? "s" : ""} require custom pricing
          </button>

          {customExpanded && (
            <div className="mt-2 space-y-2">
              {custom.map((r) => (
                <VendorRow key={r.slug} result={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calculator/ResultsTable.tsx
git commit -m "feat: add ResultsTable with collapsible custom pricing section"
```

---

## Task 7: KYCCalculator Main Island

**Files:**
- Create: `src/components/calculator/KYCCalculator.tsx`

- [ ] **Step 1: Create KYCCalculator.tsx**

```tsx
import { useState, useMemo } from "react";
import { calculateMonthlyCost, sortVendorResults, type VendorPricingInput } from "../../lib/calculator";
import { VolumeInput } from "./VolumeInput";
import { ResultsTable } from "./ResultsTable";

interface Props {
  vendors: VendorPricingInput[];
}

export function KYCCalculator({ vendors }: Props) {
  const [volume, setVolume] = useState(10_000);

  const results = useMemo(
    () => sortVendorResults(vendors.map((v) => calculateMonthlyCost(v, volume))),
    [vendors, volume]
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-6 space-y-6">
      <VolumeInput value={volume} onChange={setVolume} />
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <ResultsTable results={results} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calculator/KYCCalculator.tsx
git commit -m "feat: add KYCCalculator main island"
```

---

## Task 8: Astro Page

**Files:**
- Create: `src/pages/tools/kyc-cost-calculator.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/tools/kyc-cost-calculator.astro`:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getCollection } from "astro:content";
import { vendors, getVendorsByCategory } from "../../lib/vendors";
import { KYCCalculator } from "../../components/calculator/KYCCalculator";
import type { VendorPricingInput } from "../../lib/calculator";

const kycVendors = getVendorsByCategory("KYC Compliance");
const assessments = await getCollection("assessments");
const assessmentSlugs = new Set(assessments.map((a) => a.slug));

const calculatorVendors: VendorPricingInput[] = kycVendors.map((v) => ({
  slug: v.slug,
  name: v.name,
  logo_url: v.logo_url ?? "",
  featured: v.featured,
  has_assessment: assessmentSlugs.has(v.slug),
  has_free_trial: v.has_free_trial,
  vendor_website: v.vendor_website,
  affiliate_url: v.affiliate_url,
  plans: (v.website_data?.pricing_plans ?? []).map((p) => ({
    name: p.name,
    price: p.price,
  })),
}));

const title = "KYC Cost Calculator 2026 | PrimeBiometry";
const description =
  "Compare monthly KYC verification costs across 24 vendors. Enter your verification volume and see real pricing from iDenfy, Veriff, Jumio and more.";
const canonical = "https://primebiometry.com/tools/kyc-cost-calculator";

const schema = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KYC Verification Cost Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://primebiometry.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://primebiometry.com/tools" },
      { "@type": "ListItem", position: 3, name: "KYC Cost Calculator" },
    ],
  },
]);
---

<BaseLayout {title} {description} {canonical}>
  <script type="application/ld+json" set:html={schema} slot="head" />

  <main class="max-w-3xl mx-auto px-4 py-12">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
      <ol class="flex items-center gap-2">
        <li><a href="/" class="hover:text-zinc-700 dark:hover:text-zinc-200">Home</a></li>
        <li aria-hidden="true">/</li>
        <li>Tools</li>
        <li aria-hidden="true">/</li>
        <li class="text-zinc-900 dark:text-zinc-100">KYC Cost Calculator</li>
      </ol>
    </nav>

    <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
      KYC Verification Cost Calculator 2026
    </h1>
    <p class="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[65ch] mb-8">
      Enter your expected monthly verification volume to compare estimated costs across
      {calculatorVendors.length} KYC vendors. Prices are sourced from published pricing pages
      and updated June 2026.
    </p>

    <KYCCalculator vendors={calculatorVendors} client:load />

    <section class="mt-12 space-y-4">
      <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        How to read these estimates
      </h2>
      <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2 max-w-[65ch]">
        <p>
          <strong class="text-zinc-900 dark:text-zinc-100">Per-verification pricing</strong> scales with
          your volume — ideal for early-stage companies with unpredictable throughput. Some vendors
          set a monthly minimum even on per-check plans.
        </p>
        <p>
          <strong class="text-zinc-900 dark:text-zinc-100">Flat-rate pricing</strong> does not change
          with volume — better for high-throughput scenarios where you can predict monthly usage.
        </p>
        <p>
          <strong class="text-zinc-900 dark:text-zinc-100">GBP prices</strong> are converted at
          approximately £1 = $1.27 USD and marked as approximate.
        </p>
        <p class="text-xs text-zinc-400 mt-4">
          Estimates based on published pricing. Actual costs may vary. Last updated June 2026.
        </p>
      </div>
    </section>

    <section class="mt-10 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
      <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Compare full KYC features
      </h2>
      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Pricing is one factor. See how vendors compare on compliance coverage, integration
        complexity, and real-world performance.
      </p>
      <div class="flex flex-col sm:flex-row gap-3">
        <a
          href="/categories/kyc-compliance"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Browse KYC vendors
        </a>
        <a
          href="/blog/kyc-pricing-guide-2026"
          class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          KYC pricing guide 2026
        </a>
      </div>
    </section>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Check that BaseLayout accepts a `head` slot**

```bash
grep -n "slot.*head\|head.*slot" /Users/usara/Desktop/Проекты/Сайты/PrimeBiometry/src/layouts/BaseLayout.astro
```

If no `head` slot exists, replace the schema injection with an inline `<script>` tag directly in the page body or add the slot to BaseLayout. Look at how existing pages inject schema (grep for `application/ld+json` in `src/pages/`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/kyc-cost-calculator.astro
git commit -m "feat: add /tools/kyc-cost-calculator page"
```

---

## Task 9: Build and Verify

**Files:** None

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors. Watch for:
- Missing imports
- Type errors in `VendorPricingInput` usage (especially `affiliate_url: string | null` vs `string`)
- Slot injection issues in BaseLayout

Fix any errors before proceeding.

- [ ] **Step 2: Run preview and manually verify**

```bash
npm run preview
```

Open `http://localhost:4321/tools/kyc-cost-calculator` in browser. Verify:
- Page renders with H1, breadcrumb, slider
- Moving slider updates vendor costs in real-time
- Preset buttons (500, 2K, 10K...) update slider and costs
- Free tier vendors show emerald "Free" cost
- Custom pricing vendors are collapsed, expandable
- "View Review" links go to `/vendors/[slug]`
- "Visit Website" links have `rel="nofollow noopener"`
- Mobile: layout readable at 375px width

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: KYC cost calculator — complete implementation"
```

---

## Self-Review Notes

- `has_assessment` derived via `getCollection('assessments')` — no Vendor type change needed
- `affiliate_url: string | null` in Vendor matches `VendorPricingInput` interface
- `logo_url: string` in Vendor — empty string handled with fallback initial in VendorRow
- Price parser covers all 44 unique price strings found in KYC vendor data
- Sort: free → calculated → flat → custom (spec requirement met)
- Featured vendors highlight via `border-blue-200` (design.md pattern)
- Breadcrumb rendered physically (seo.md requirement: "also render physically at top of page")
- Internal links: vendor rows → `/vendors/[slug]`, CTA → `/categories/kyc-compliance`, guide → `/blog/kyc-pricing-guide-2026`

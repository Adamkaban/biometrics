
# KYC Cost Calculator — Design Spec

**Date:** 2026-06-02
**Status:** Approved
**URL:** `/tools/kyc-cost-calculator`

---

## Overview

Interactive React island on a standalone Astro page. User enters monthly verification volume → sees estimated cost across 24 KYC vendors sorted by price. No email gate. Free access.

**Goal:** Capture pricing-intent traffic (`kyc verification cost calculator`, `kyc pricing comparison 2026`). Drives affiliate clicks from results table.

---

## Architecture

```
src/pages/tools/kyc-cost-calculator.astro   — SEO wrapper, schema, static content
src/components/calculator/KYCCalculator.tsx  — React island (client:load)
src/components/calculator/VolumeInput.tsx    — slider + number input + presets
src/components/calculator/ResultsTable.tsx   — sorted vendor results
src/components/calculator/VendorRow.tsx      — single vendor result row
src/lib/calculator.ts                        — pure pricing parse + calculation logic
```

**Data flow:**
1. Build time: `kyc-cost-calculator.astro` uses `src/lib/vendors.ts` (existing) to load vendor data. Filter `categories.includes("KYC Compliance")`, derive `has_assessment` by checking if assessment MDX exists (already handled in vendors.ts), extract `website_data.pricing_plans`, serialize as prop
2. Runtime: slider change → `calculator.ts` recalculates all vendors → React state update → table re-renders

---

## Data Layer (`src/lib/calculator.ts`)

### Vendor input type
```typescript
interface VendorPricingInput {
  slug: string
  name: string
  logo_url?: string        // Google favicon URL (available for 60/68 vendors)
  featured: boolean
  has_assessment: boolean
  has_free_trial: boolean  // true for 19/24 KYC vendors — show badge in row
  vendor_website: string
  affiliate_url?: string
  plans: Array<{ name: string; price: string }>
}
```

### Price string patterns (from real data)
| Pattern | Example | Strategy |
|---|---|---|
| Per-verification USD | `$0.55 per verification` | `price × volume` |
| Per-verification with minimum | `$0.80 per verification / $49 month min` | `max(price × volume, min)` |
| Per-check USD | `$0.95 / per check` | `price × volume` |
| Flat monthly USD | `$199/month`, `$99/mo`, `$0.45 / mo` | Show as-is, tag `flat` (ambiguous `/mo` suffix without "per verification" keyword → treat as flat) |
| Per-user monthly | `$50/user/month` | Show as-is, tag `flat` |
| GBP per-verification | `from £10 per client` | Convert at 1.27 hardcoded, tag `~USD (approx)` |
| Free / $0 | `Free`, `$0`, `$0 / per check` | Show as "Free tier", sort first |
| Custom / Contact | `Contact sales`, `Custom pricing`, `Let's Chat` | Group at bottom, tag `custom` |
| Unknown | `null`, `N/A`, `Usage Based` | Same as custom |

### Calculation output type
```typescript
type PricingResult =
  | { type: 'calculated'; monthlyUSD: number; perVerification?: number; hasMinimum?: number }
  | { type: 'flat'; monthlyUSD: number; label: string }
  | { type: 'free' }
  | { type: 'custom'; label: string }  // "Contact Sales", "Request Pricing", etc.
  | { type: 'approx'; monthlyUSD: number; note: string }  // GBP conversions
```

### Best plan selection
When vendor has multiple plans: pick the plan whose per-verification price × volume is lowest, but still >= monthly minimum. If no plan fits, use lowest-cost plan.

---

## UI Components

### VolumeInput
- Range slider: 100 – 1,000,000 (logarithmic scale)
- Number input: sync with slider
- Preset buttons: `500` / `2K` / `10K` / `50K` / `100K`
- Default: `10,000`
- Label: "Monthly verifications"

### ResultsTable
Sort order:
1. `type: 'free'` — pinned first, emerald badge "Free tier"
2. `type: 'calculated'` + `type: 'approx'` — ascending by `monthlyUSD`
3. `type: 'flat'` — ascending by `monthlyUSD`
4. `type: 'custom'` — collapsed section "X vendors require custom pricing", expandable

Featured vendors: `border-blue-200 bg-blue-50/50` highlight (existing catalog style), no position change in sort order.

### VendorRow
Columns: [Logo] Vendor name | Estimated monthly | Per verification | Badges | Action button

**Logo:** `logo_url` → `<img>` 20×20, fallback to vendor initial letter in zinc-200 circle if missing.

**Badges (after vendor name):**
- `has_free_trial: true` → emerald badge "Free Trial"
- `featured: true` → blue badge "Featured"

Action button logic:
- `has_assessment: true` → `[View Review]` → `/vendors/[slug]`
- `has_assessment: false` + `affiliate_url` → `[Visit Website]` → `/go/[slug]` (rel="nofollow noopener")
- `has_assessment: false`, no affiliate → `[Visit Website]` → `vendor_website` (rel="nofollow noopener")

---

## SEO

**Title:** `KYC Cost Calculator 2026 | PrimeBiometry` (40 chars)

**Meta description:** `Compare monthly KYC verification costs across 24 vendors. Enter your verification volume and see real pricing from iDenfy, Veriff, Jumio and more.` (152 chars)

**H1:** `KYC Verification Cost Calculator 2026`

**Schema (JSON-LD):**
```json
[
  {
    "@type": "SoftwareApplication",
    "name": "KYC Verification Cost Calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  },
  {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://primebiometry.com" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://primebiometry.com/tools" },
      { "@type": "ListItem", "position": 3, "name": "KYC Cost Calculator" }
    ]
  }
]
```

**Internal links:**
- Each vendor row → `/vendors/[slug]` (organic links to vendor pages)
- CTA block below table → `/categories/kyc-compliance`
- Static text section → `/blog/kyc-pricing-guide-2026`

**Robots:** `index, follow`. Include in sitemap.

---

## Page Structure (static sections outside React island)

```
[Breadcrumb: Home / Tools / KYC Cost Calculator]
[H1]
[Lead paragraph: ~100 words, include primary keyword naturally]

[KYCCalculator React island]

[H2: How to read these estimates]
[~150 words: explains flat vs per-verification, custom pricing, GBP note]
[Disclaimer: "Estimates based on published pricing. Actual costs may vary. Last updated June 2026."]

[H2: Compare full KYC features]
[CTA → /categories/kyc-compliance]
[Related: link to /blog/kyc-pricing-guide-2026]
```

---

## Out of Scope (v1)

- Email gate / lead capture
- Compliance filters (GDPR/HIPAA/SOC2)
- Export to PDF
- Vendor comparison checkboxes
- Non-KYC categories (Identity Verification, Biometric Auth)

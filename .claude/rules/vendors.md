# Vendor Data Rules — PrimeBiometry

## Source File

`src/data/vendors.json` — 69 vendors enriched with pricing plans.
Original scrape: G2 (27) + Gartner (20) + Capterra (30), deduplicated to 69 unique.

## Vendor Object Shape

```typescript
{
  name: string                  // "iDenfy"
  company: string               // "iDenfy"
  description: string           // SCRAPED — do not publish verbatim, see content.md
  rating: number                // aggregated from source
  reviews_count: number
  pricing: string               // short string e.g. "Starting at $0.55"
  vendor_website: string        // canonical vendor URL
  product_url: string           // G2/Gartner/Capterra listing URL
  categories: string[]          // ["Biometric Authentication", "KYC Compliance", ...]
  source: string                // primary source
  all_sources: string[]         // all sources where vendor appears
  website_data: {
    pricing_plans: Array<{
      name: string
      price: string
      features_included: string[]
    }>
  }
  // Fields to ADD when building the site:
  slug?: string                 // auto-generated: lowercase name, spaces→hyphens
  featured?: boolean            // paid placement flag, default false
  affiliate_url?: string        // "/go/[slug]" if affiliate deal exists
  has_assessment?: boolean      // true when src/content/assessments/[slug].mdx exists
}
```

## Slug Generation

```
iDenfy → idenfy
ComplyCube → complycube
Jumio Corporation → jumio-corporation
```

Rule: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

## Affiliate Redirect Pattern

All affiliate/outbound links go through `/go/[slug]`.
- Page `/go/[slug]` is a server-side redirect (Cloudflare Worker or Astro middleware)
- Target URL stored in `vendor.affiliate_url` or falls back to `vendor.vendor_website`
- `/go/*` must be excluded from sitemap and blocked in robots.txt
- All `/go/` links must have `rel="nofollow noopener"`

## Featured Vendors

`featured: true` vendors get:
- Highlighted card in catalog (border, badge "Featured")
- Top position in category page (above non-featured, sorted by rating)
- "Get Quote" button on vendor profile → lead capture form
- "Sponsored" badge is NOT shown on featured — they are curated partners, not ads

If `featured: false` (default): show "Visit Website" button → direct link to vendor_website.

## Vendor Page Data Flow

```
vendors.json (data)
  +
src/content/assessments/[slug].mdx (editorial)
  =
/vendors/[slug] (published page)
```

If assessment MDX does not exist for a vendor: do not publish that vendor page yet.
Phase 1 exception: can publish with a placeholder assessment for top 20 vendors only.

## Categories Mapping

Categories in the data → URL slugs:

| Category string            | URL slug                  |
|----------------------------|---------------------------|
| Biometric Authentication   | biometric-authentication  |
| KYC Compliance             | kyc-compliance            |
| Identity Verification      | identity-verification     |
| AML                        | aml                       |
| Fraud Prevention           | fraud-prevention          |

A vendor can belong to multiple categories. Category pages list all vendors in that category.
Primary category = first item in `vendor.categories[]`.

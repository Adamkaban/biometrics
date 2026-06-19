# SEO Rules — PrimeBiometry

HCU penalizes thin aggregators. AI Overviews own informational queries — target comparison and transactional intent only.

## Technical SEO

### Performance
- PageSpeed 90+ on all pages
- Hero images: `loading="eager"` (LCP). All others: `loading="lazy"` + `decoding="async"`

### Images (every `<img>` and `<Image>`)
- Always `alt` + `title` — mirror same value on both
- Format: what image shows + primary page keyword, max ~125 chars
  - Vendor logo: `"Veriff logo — identity verification software"`
  - Blog cover: `"KYC compliance checklist for fintech startups 2026"`
- Empty `alt=""` only for purely decorative icons with adjacent text label. Never omit `title`.

### Indexability
- Default: `<meta name="robots" content="index, follow">`
- `/go/[slug]`: `noindex, nofollow` + `robots.txt Disallow: /go/`
- `lang="en"` on `<html>`
- Canonical: always HTTPS, no trailing slash

### Meta Tags
- **Title:** max 60 chars total (`" | PrimeBiometry"` = 16 → ~44 for topic)
  - Format: `[Topic] [Year] | PrimeBiometry` — e.g. `Veriff Review 2026 | PrimeBiometry`
- **Description:** max 155 chars. Primary keyword in first 100 chars. No clickbait.

### Headings
- H1: exactly one per page = primary keyword. No level skipping.
- Vendor: `[Name] Review 2026: Pricing, Features & Alternatives`
- Category: `Best [Category] Software 2026: Compare [N] Tools`
- Blog: H1 matches title tag

## Schema (JSON-LD only, never microdata)

| Page type    | Required schema |
|--------------|-----------------|
| Homepage     | `Organization` + `WebSite` + `SiteLinksSearchBox` |
| Vendor page  | `SoftwareApplication` + `AggregateRating` + `FAQPage` + `BreadcrumbList` |
| Vendor index | `ItemList` + `BreadcrumbList` |
| Category     | `ItemList` + `BreadcrumbList` |
| Blog post    | `Article` + `Person` + `BreadcrumbList` + `FAQPage` (if FAQ exists) |
| Blog index   | `BreadcrumbList` |
| Methodology  | `Article` + `BreadcrumbList` |
| All pages    | `BreadcrumbList` — render physically on page, not schema-only |

`Person` url: `https://primebiometry.com/about`

## Footer Required Pages
`/about` · `/methodology` · `/contact` · `/privacy` · `/terms` · `/blog`

## Target Keywords (priority order)
1. **Comparison** — `veriff vs jumio`, `idenfy vs onfido 2026`
2. **Transactional** — `best KYC solution for crypto exchange`
3. **Pricing** — `idenfy pricing 2026`, `veriff cost per verification`
4. **Compliance** — `biometric authentication HIPAA compliant`, `KYC AML software GDPR`
5. **Feature-specific** — `passive liveness detection software`, `face recognition API`

## Internal Linking
- Every vendor page → primary category page
- Every category page → 2-3 related blog posts
- Every blog post → 3-5 vendor pages + 1 category page
- Homepage → featured vendors + latest blog posts + all categories

Clusters: Identity Verification · KYC Compliance · Biometric Authentication · AML / Fraud Prevention

## URL Structure
```
/vendors/[slug]      lowercase, hyphens, no special chars
/categories/[slug]   kyc-compliance, identity-verification, biometric-authentication
/blog/[slug]         descriptive, keyword-rich, year when relevant
/go/[slug]           noindex, nofollow, excluded from sitemap
```
Never change URLs after publish — redirects lose link equity.

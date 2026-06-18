# SEO Rules — PrimeBiometry

## Context

HCU penalizes thin aggregator sites republishing G2/Gartner/Capterra without original value. AI Overviews dominate informational queries — target comparison and transactional intent.

---

## Technical SEO Checklist

### Performance
- **PageSpeed Insights 90+** on all pages
- Hero images: `<Image loading="eager">` for LCP
- All other images: `loading="lazy"` + `decoding="async"`

### Image Alt Text (required on every `<img>` and `<Image>`)
- **Never omit `alt`** — empty `alt=""` only for purely decorative images (icons with adjacent text label)
- **Descriptive + keyword-rich:** what image shows + primary keyword for the page
  - Vendor logo: `alt="Veriff logo — identity verification software"`
  - Screenshot: `alt="Veriff dashboard showing liveness detection result"`
  - Blog image: `alt="KYC compliance checklist for fintech startups 2026"`
  - Category page: `alt="Best KYC software comparison table 2026"`
- **Max ~125 characters** — no "image of" / "photo of" prefixes — no keyword stuffing

### Indexability
- **Default robots meta:** `<meta name="robots" content="index, follow">`
- `/go/[slug]` pages: `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` — `Disallow: /go/`
- `HTML lang="en"` on `<html>`
- **Canonical tags** — always HTTPS. Vendor pages: `<link rel="canonical" href="https://primebiometry.com/vendors/[slug]">`

### Sitemap
- `@astrojs/sitemap` — auto-generate. Exclude `/go/*`. Submit to GSC after deploy.

### Meta Tags
- **Title:** max 60 chars total. Format: `[Vendor/Topic] [Action/Year] | PrimeBiometry`
  - Suffix `" | PrimeBiometry"` = 16 chars → ~44 chars for topic
  - Example: `Veriff Review 2026 | PrimeBiometry` (35 ✓)
- **Description:** max 155 chars. Primary keyword in first 100 chars. Benefit or differentiator. No clickbait.

### Heading Structure
- **H1: exactly one per page** = primary keyword
- H2–H6: no skipping levels
- Vendor page H1: `[Vendor Name] Review 2026: Pricing, Features & Alternatives`
- Category page H1: `Best [Category] Software 2026: Compare [N] Tools`
- Blog post H1: matches title tag

---

## Schema Requirements

JSON-LD only. Never microdata.

| Page type    | Required schema                                                               |
|--------------|-------------------------------------------------------------------------------|
| Homepage     | `Organization` + `WebSite` + `SiteLinksSearchBox`                            |
| Vendor page  | `SoftwareApplication` + `AggregateRating` + `FAQPage` + `BreadcrumbList`     |
| Vendor index | `ItemList` + `BreadcrumbList`                                                 |
| Category     | `ItemList` + `BreadcrumbList`                                                 |
| Blog post    | `Article` + `Person` (author) + `BreadcrumbList` + `FAQPage` (if FAQ exists) |
| Blog index   | `BreadcrumbList`                                                              |
| Methodology  | `Article` + `BreadcrumbList`                                                  |
| All pages    | `BreadcrumbList` — render physically on page, not just in schema              |

Author `Person` url: `https://primebiometry.com/about`. If `/authors/[slug]` pages added later, update accordingly.

---

## Footer Required Pages

`/about` · `/methodology` · `/contact` · `/privacy` · `/terms` · `/blog`

---

## Target Keyword Types (priority order)

1. **Comparison** — `veriff vs jumio`, `idenfy vs onfido 2026`
2. **Transactional** — `best KYC solution for crypto exchange`
3. **Pricing** — `idenfy pricing 2026`, `veriff cost per verification`
4. **Compliance** — `biometric authentication HIPAA compliant`, `KYC AML software GDPR`
5. **Feature-specific** — `passive liveness detection software`, `face recognition API`

Avoid broad informational queries — AI Overviews own them.

---

## Topical Authority Clusters

Clusters: Identity Verification · KYC Compliance · Biometric Authentication · AML / Fraud Prevention

Each cluster = category page + vendor pages + 1-2 blog posts. Blog posts link to vendor + category pages. Category pages link back to blog posts.

---

## Internal Linking Rules

- Every vendor page → primary category page
- Every category page → 2-3 related blog posts
- Every blog post → 3-5 vendor pages + 1 category page
- Homepage → featured vendors + latest blog posts + all categories

---

## URL Structure

```
/vendors/[slug]      lowercase, hyphens, no special chars
/categories/[slug]   kyc-compliance, identity-verification, biometric-authentication
/blog/[slug]         descriptive, keyword-rich, year when relevant
/go/[slug]           noindex, nofollow, excluded from sitemap
```

Never change URLs after publish — redirects lose link equity.

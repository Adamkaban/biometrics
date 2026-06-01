# SEO Rules — PrimeBiometry

## Google 2026 Context

HCU (Helpful Content Update) actively penalizes thin aggregator sites that republish
data from G2/Gartner/Capterra without original value. Every page must add genuine analysis
on top of scraped data. AI Overviews dominate informational queries — target comparison
and transactional intent instead.

---

## Technical SEO Checklist

### Performance
- **PageSpeed Insights 90+** on all pages
- Astro static + Cloudflare CDN = strong baseline; don't break it with heavy client JS
- Hero images: use Astro `<Image>` component with `loading="eager"` for LCP
- All other images: `loading="lazy"` + `decoding="async"`
- **Raster images (photos, screenshots, OG images) → WebP** — Astro `<Image>` converts automatically
- **Logos, icons, illustrations → SVG** preferred (scalable, no quality loss, small file size)
- **PNG** allowed when transparency needed and SVG not available (e.g. vendor logos without SVG source)
- Never ship unoptimized JPEG for photos
- `will-change: transform` only on elements that actually animate

### Indexability
- **Default robots meta on every page:** `<meta name="robots" content="index, follow">`
- Exception: `/go/[slug]` pages get `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` — `Disallow: /go/`
- `HTML lang="en"` on `<html>` — site is English-only, targeting global English-speaking B2B market
- **Canonical tags** — always HTTPS, always present. Required on vendor pages that appear in multiple categories.
  Format: `<link rel="canonical" href="https://primebiometry.com/vendors/[slug]">`

### Sitemap
- `@astrojs/sitemap` — auto-generate `sitemap.xml`
- Include: all pages EXCEPT `/go/*`
- Submit to Google Search Console after deploy

### Redirects
- www → non-www: configured in Cloudflare Pages settings
- HTTP → HTTPS: enforced by Cloudflare automatically
- Verify both redirects resolve with 301 (not 302)

### Meta Tags
- **Title:** max 44 characters WITHOUT spaces
  - Format: `[Vendor/Topic] [Action/Year] | PrimeBiometry`
  - Example: `Veriff Review 2026 | PrimeBiometry` (34 without spaces ✓)
  - Example: `Best KYC Software 2026 | PrimeBiometry` (34 without spaces ✓)
- **Description:** max 220 characters
  - Include primary keyword naturally in first 120 chars
  - Include a benefit or differentiator
  - No clickbait

### Heading Structure
- **H1: exactly one per page**
- H2–H6: nested correctly, no skipping levels (no H2 → H4)
- H1 = primary keyword target for the page
- Vendor page H1: `[Vendor Name] Review 2026: Pricing, Features & Alternatives`
- Category page H1: `Best [Category] Software 2026: Compare [N] Tools`
- Blog post H1: matches title tag

---

## Schema Requirements

Use JSON-LD format everywhere. Never microdata.

| Page type       | Required schema                                                                  |
|-----------------|----------------------------------------------------------------------------------|
| Homepage        | `Organization` + `WebSite` + `SiteLinksSearchBox`                               |
| Vendor page     | `SoftwareApplication` + `AggregateRating` + `FAQPage` + `BreadcrumbList`        |
| Category page   | `ItemList` + `BreadcrumbList`                                                    |
| Blog post       | `Article` + `Person` (author) + `BreadcrumbList`                                |
| Methodology     | `Article` + `BreadcrumbList`                                                     |
| All pages       | `BreadcrumbList` (also render physically at top of page, not just in schema)     |

**Author schema** (`Person`) on blog posts:
```json
{
  "@type": "Person",
  "name": "[Author Name]",
  "jobTitle": "Senior Security Analyst",
  "url": "https://primebiometry.com/authors/[slug]"
}
```

**Organization schema** on homepage:
```json
{
  "@type": "Organization",
  "name": "PrimeBiometry",
  "url": "https://primebiometry.com",
  "description": "Independent comparison of biometric authentication and identity verification software"
}
```

---

## Footer Required Pages

Every page footer must link to:
- `/about` — About PrimeBiometry + team
- `/methodology` — How we evaluate vendors (E-E-A-T signal)
- `/contact` — Contact form or email
- `/privacy` — Privacy Policy (required for GDPR compliance + AdSense/affiliate)
- `/blog` — Blog index

---

## Target Keyword Types (priority order)

1. **Comparison** — `veriff vs jumio`, `idenfy vs onfido 2026`
2. **Transactional** — `best KYC solution for crypto exchange`, `biometric auth for healthcare`
3. **Pricing** — `idenfy pricing 2026`, `veriff cost per verification`
4. **Compliance** — `biometric authentication HIPAA compliant`, `KYC AML software GDPR`
5. **Feature-specific** — `passive liveness detection software`, `face recognition API`

Avoid broad informational queries (`what is biometric authentication`) — AI Overviews own these.

---

## Topical Authority Clusters

Each cluster = pillar category page + vendor pages + 1-2 blog posts.

Clusters from the data:
- Identity Verification
- KYC Compliance
- Biometric Authentication
- AML / Fraud Prevention

Blog posts must link to relevant vendor pages and category pages.
Category pages must link to blog posts. Do not break this internal link architecture.

---

## Internal Linking Rules

- Every vendor page → link to its primary category page
- Every category page → link to 2-3 related blog posts
- Every blog post → link to 3-5 relevant vendor pages + 1 category page
- Homepage → featured vendors + latest blog posts + all categories

---

## URL Structure

```
/vendors/[slug]           → lowercase, hyphens, no special chars
/categories/[slug]        → kyc-compliance, identity-verification, biometric-authentication
/blog/[slug]              → descriptive, keyword-rich, year when relevant
/go/[slug]                → noindex, nofollow, excluded from sitemap
```

Never change URLs after publish — redirects lose link equity.

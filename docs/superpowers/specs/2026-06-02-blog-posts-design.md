# Blog Posts Design Spec — PrimeBiometry

**Date:** 2026-06-02  
**Author:** James Whitfield  
**Approach:** Parallel sub-agents (A)

---

## Scope

1. `/src/pages/blog/[slug].astro` — new blog post page template
2. `src/content/config.ts` — add optional `faqItems` field to blog collection
3. Five MDX files in `/src/content/blog/`

---

## 1. Blog Post Template: `[slug].astro`

### Data Sources
- Reads post from `getCollection("blog")` via `getStaticPaths`
- Renders MDX content via `render(post)` from `astro:content`

### Schemas (JSON-LD, passed to BaseLayout `schema` prop as array)
- `Article` — headline, description, datePublished, dateModified, author (Person), publisher (Organization)
- `BreadcrumbList` — Home > Blog > [Post Title]
- `FAQPage` — rendered if `post.data.faqItems` is present and non-empty

### Layout Structure
```
<BaseLayout title description canonicalUrl schema>
  <article max-w-3xl mx-auto px-4 py-16>
    <nav> Breadcrumb: Home / Blog / Title </nav>

    <header>
      category chip | date (font-mono)
      <h1> post title </h1>
      description text
      byline: "By James Whitfield · KYC & Identity Verification Analyst · Updated [date]"
      [affiliate disclosure banner — yellow/amber tone, small text]
    </header>

    <div class="prose prose-zinc dark:prose-invert prose-lg max-w-none mt-12">
      <Content />
    </div>

    <footer>
      [author bio block — border-t, James Whitfield name, title, bio, link to /methodology]
      [CTA: "Browse all KYC software →" /vendors, "Back to Blog →" /blog]
    </footer>
  </article>
</BaseLayout>
```

### Affiliate Disclosure
Per content rules: must appear at the **top** of content, before the article body.  
Text: "Some links in this article may be affiliate links. PrimeBiometry earns a commission at no extra cost to you. This does not influence our editorial ratings."  
Style: `text-xs text-zinc-500 border-l-2 border-amber-400 pl-3 py-1 mb-8`

### Author Bio
James Whitfield — KYC & Identity Verification Analyst  
Bio: "James Whitfield founded PrimeBiometry to help compliance managers and IT teams cut through vendor marketing. He has evaluated 60+ identity verification platforms across fintech, banking, and crypto verticals."  
Link: `/methodology` — "Our evaluation methodology →"

---

## 2. Config Schema Update

Add to blog collection in `src/content/config.ts`:
```typescript
faqItems: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
```

---

## 3. Five Blog Posts (MDX)

### Publication Schedule
| Post | File | pubDate | category |
|------|------|---------|----------|
| KYC/AML Compliance Checklist | `kyc-aml-compliance-checklist-fintech-2026.mdx` | 2026-06-02 | KYC Compliance |
| Best KYC & AML Software 2026 | `best-kyc-aml-software-2026.mdx` | 2026-06-09 | KYC Software |
| KYC Pricing Guide 2026 | `kyc-pricing-guide-2026.mdx` | 2026-06-16 | Pricing |
| Veriff vs Jumio 2026 | `veriff-vs-jumio-2026.mdx` | 2026-06-23 | Comparison |
| Best KYC for Crypto 2026 | `best-kyc-software-crypto-2026.mdx` | 2026-06-30 | Crypto KYC |

### Frontmatter Shape (per post)
```yaml
---
title: [from brief — exact title tag text]
description: [from brief — meta description, max 220 chars]
author: James Whitfield
pubDate: 2026-06-XX
updatedDate: 2026-06-XX
category: [see table above]
featured: false
faqItems:
  - q: "Question text"
    a: "Answer text"
---
```

### Content Requirements Per Post

#### Post 1 — KYC/AML Compliance Checklist (4,000–5,000 words)
- Primary: `kyc compliance` (590/mo). Secondary: `kyc aml software`, `kyc compliance checklist`
- Target: compliance officers in fintech, Head of Legal preparing for audit
- Structure: KYC vs AML difference > Regulatory requirements (FinCEN/FCA/EBA/MAS) > Full checklist (CIP, CDD, EDD, Transaction Monitoring, SAR, Records, Training, Software) > Software selection bridge > Common mistakes > FAQ
- Internal links: → best-kyc-aml-software-2026, → kyc-pricing-guide-2026, → best-kyc-software-crypto-2026
- CTA: "Download PDF checklist" (Tally form) + "See KYC software →"
- Differentiator: Actionable checkboxes, AMLD6/MiCA/FinCEN 2024 citations, jurisdiction-specific tables

#### Post 2 — Best KYC & AML Software 2026 (4,500–5,500 words)
- Primary: `kyc software` (720/mo, CPC $56). Secondary: `kyc aml software`, `best kyc software`
- Target: compliance managers, CTO fintech, Head of Risk in bank
- Vendors to cover: Sumsub, Veriff, Jumio, Onfido (Entrust IDV), iDenfy, ComplyCube, Persona, Stripe Identity, Shufti Pro, Socure, Acuant, AU10TIX
- Structure: What is KYC/AML software > Evaluation criteria > Quick comparison table (12 vendors × 8 features) > Reviews per vendor (H3) > Decision framework (by stage/industry/geo) > Pricing overview preview > FAQ
- Real data from vendors.json: ratings (Veriff 4.4, iDenfy 4.9, Sumsub 4.6, ComplyCube 5.0, Ondato 4.8)
- Internal links: → kyc-pricing-guide-2026, → veriff-vs-jumio-2026, → best-kyc-software-crypto-2026

#### Post 3 — KYC Pricing Guide 2026 (2,500–3,000 words)
- Primary: `kyc pricing` (110/mo, CPC $33). Secondary: `onfido pricing`, `jumio pricing`, `veriff pricing`
- Target: CFO/CTO in vendor evaluation, just received a quote, needs comparison
- Real pricing from vendors.json: Veriff $0.80–$1.89/verification, iDenfy $1.35/verification, Sumsub $0.05–$1.35/verification, Ondato from $49/month
- Structure: Pricing models explained (pay-as-you-go, subscription, enterprise) > Hidden costs > Comparison table > Per-vendor breakdowns (8 vendors) > Cost calculation formula > When to negotiate > FAQ
- CTA: "Get custom pricing estimate" (Tally form)
- Differentiator: Actual price points (not "contact for pricing"), calculation formula with examples

#### Post 4 — Veriff vs Jumio 2026 (2,800–3,500 words)
- Primary: `veriff vs jumio` (10/mo, $0 CPC = no PPC competition, ultra-intent)
- Target: compliance/risk manager with both vendors on shortlist, ready to buy
- Real data: Veriff rating 4.4 (60 reviews), Jumio no G2 reviews in our data
- Structure: TL;DR table (8 criteria, Winner/Tie) > Veriff overview > Jumio overview > Feature-by-feature (docs, liveness, AML, API, certs, integrations, support) > Pricing > User reviews > When to choose each > Alternatives > Verdict > FAQ
- Internal links: → best-kyc-aml-software-2026, → kyc-pricing-guide-2026
- Differentiator: Clear verdict ("Veriff wins for X, Jumio for Y"), real certification data, non-neutral conclusion

#### Post 5 — Best KYC for Crypto 2026 (3,000–4,000 words)
- Primary: `kyc for crypto` (50/mo, CPC $41). Secondary: `kyc software`, `crypto kyc compliance`
- Target: CTO or compliance lead at crypto exchange, DeFi protocol, NFT marketplace
- Vendors: Sumsub, Veriff, Shufti Pro, iDenfy, Ondato, Stripe Identity
- Structure: KYC requirements for crypto 2026 (FATF Travel Rule, VASP, sanctions, jurisdictions) > What to look for > Best tools (6 vendors) > Pricing comparison > Implementation without killing UX > FAQ
- Internal links: → best-kyc-aml-software-2026, → kyc-pricing-guide-2026, → kyc-aml-compliance-checklist-fintech-2026
- Differentiator: Specific regulatory requirements (FATF Travel Rule, MiCA Article 68), VASP coverage table

### E-E-A-T Signals in Every Post
- Author byline at top: "James Whitfield, KYC & Identity Verification Analyst"
- "Last updated: [date]" visible near top
- Methodology link in author bio
- Original analysis, not vendor copy
- Real pricing numbers from vendors.json
- Specific regulatory citations (FinCEN, FCA, AMLD6, FATF)
- "Best For" / "Avoid If" editorial judgments
- TL;DR at top for B2B skim readers
- Internal linking to other posts and vendor pages

### Vendor Page Internal Links (per post)
Link to `/vendors/[slug]` for: veriff, jumio, sumsub, idenfy, complycube, persona, ondato, shufti, au10tix  
Link to `/categories/kyc-compliance`, `/categories/identity-verification`

---

## SEO Validation Checklist

- [ ] Title tag ≤ 44 chars without spaces
- [ ] Meta description ≤ 220 chars
- [ ] One H1 per page (in template header)
- [ ] No heading level skips in MDX content
- [ ] Canonical URL set: `https://primebiometry.com/blog/[slug]`
- [ ] Article + BreadcrumbList + FAQPage schemas present
- [ ] Author Person schema with jobTitle
- [ ] Affiliate disclosure at top of content
- [ ] All vendor links use `/vendors/[slug]` internal paths
- [ ] All `/go/` outbound links have `rel="nofollow noopener"`

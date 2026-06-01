# Content Rules — PrimeBiometry

## E-E-A-T Requirements

Every piece of content must demonstrate Experience, Expertise, Authoritativeness, Trustworthiness.

- **Methodology page** (`/methodology`) must exist and explain evaluation criteria
- **Blog posts** must have a named author with title/credentials (e.g., "Senior Security Analyst")
- **Vendor pages** must show "Last updated: YYYY-MM-DD" — B2B buyers care about freshness
- **Assessment sections** must include original analysis, not summaries of G2 reviews

## Vendor Assessments (src/content/assessments/[slug].mdx)

Each assessment file provides the original editorial layer for a vendor page.
Required sections:

```mdx
---
vendor: idenfy
lastUpdated: 2026-06-01
author: [Author Name]
---

## PrimeBiometry Assessment

[2-3 sentences of original editorial summary — what makes this vendor distinctive]

### Best For
[Specific use case + company type, e.g., "Fintech startups needing fast KYC onboarding with <500 verifications/month"]

### Avoid If
[Honest limitation, e.g., "Enterprise with complex multi-jurisdiction requirements — pricing scales unfavorably"]

### Compliance Coverage
[Table or list: GDPR ✓/✗, CCPA ✓/✗, SOC2 ✓/✗, ISO 27001 ✓/✗, HIPAA ✓/✗]

### Integration Complexity
[Low / Medium / High — with brief reason: "REST API + webhooks, SDK available for iOS/Android/Web"]

### Pricing Analysis
[Original analysis of pricing tiers — not just repeating the numbers, but what they mean for different buyer sizes]

## FAQ
[3-5 questions with answers — use FAQPage schema]
```

Never copy vendor descriptions verbatim from G2, Gartner, or Capterra. Rewrite completely.
The description in vendors.json is scraped source material, not publishable content.

## Blog Post Structure

```
Title: [Primary keyword] — specific and concrete
Meta description: 150-160 chars, include keyword
Author: [Name], [Title]
Date published + Last updated

H1: matches title
H2: main sections (3-6)
H3: subsections

Required elements:
- Quick summary / TL;DR at top (B2B buyers skim)
- Comparison table if post compares vendors
- Internal links to 3-5 vendor pages
- Internal link to relevant category page
- CTA: "Compare [category] vendors" → /categories/[slug]
- FAQ section at bottom (for FAQPage schema)
- Author bio at bottom
```

## Blog Content Priorities (Phase 2)

Launch with these post types first — highest ROI:
1. `[Vendor A] vs [Vendor B]` comparison posts (comparison intent, low AI Overview risk)
2. `Best [category] software for [use case]` (transactional intent)
3. `[Vendor] pricing: complete guide 2026` (pricing intent)
4. Compliance guides: `KYC compliance checklist for fintech` (authoritative long-form)

## What NOT To Do

- Do not write generic "What is biometric authentication" posts — AI Overviews dominate
- Do not list vendor features without editorial judgment ("Best For" / "Avoid If")
- Do not publish a vendor page without an assessment MDX file — bare JSON data = thin content
- Do not use star ratings without context — always explain what the score means
- Do not add sponsored/affiliate disclosure in the footer only — it must be at the top of the content

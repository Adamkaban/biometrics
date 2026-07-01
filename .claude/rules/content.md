# Content Rules — PrimeBiometry

## E-E-A-T Requirements

Every piece of content must demonstrate Experience, Expertise, Authoritativeness, Trustworthiness.

- **Methodology page** (`/methodology`) must exist and explain evaluation criteria
- **Blog posts** must have a named author with title/credentials (e.g., "Senior Security Analyst")
- **Vendor pages** must show "Last updated: YYYY-MM-DD" — B2B buyers care about freshness
- **Assessment sections** must include original analysis, not summaries of G2 reviews

## Vendor Assessments (src/content/assessments/[slug].mdx)

The vendor page renders a **DecisionCard** above the fold from frontmatter alone (verdict + bestFor + avoidIf + integrationComplexity + compliance/price auto-pulled from `vendors.json`). The MDX body is **narrative-only** — contextual depth for buyers who scrolled past the decision tool. Do NOT repeat Best For / Avoid If / compliance table / integration complexity inside the MDX body — those duplicate the DecisionCard.

### Frontmatter (structured decision data)

```yaml
---
vendor: idenfy
lastUpdated: 2026-06-01
author: [Author Name]
metaTitle: "[Vendor] [Year]: [hook]"           # optional
metaDescription: "[150-160 chars]"             # optional
verdict: "[1-2 sentences. Editorial verdict — what makes this vendor distinctive or risky. Renders above the fold in DecisionCard.]"
bestFor: "[Named segment + size + jurisdiction. 'Fintech, 500-5000 verifications/month, EU' beats 'great for fintech'.]"
avoidIf: "[Specific honest tradeoff. Not 'not for everyone'.]"
integrationComplexity: Low | Medium | High
hasFreeTrialVerified: true                     # optional
scoreBreakdown:                                # optional, methodology 2.0
  compliance: 20
  integration: 24
  marketCoverage: 5
  pricingTransparency: 5
  userSentiment: 15
  total: 69
  scoredAt: 2026-06-18
  methodologyVersion: "2.0"
---
```

Writing guidelines:
- `verdict`: max 320 chars. Lead with non-obvious judgment. Not marketing copy.
- `bestFor`: segment + size + geography. Scanner-friendly.
- `avoidIf`: a specific named tradeoff.

Compliance ✓/✗ row, price band, price label all auto-render from `vendors.json` (`compliance_flags`, `value_tier`, `starting_price`). Do NOT duplicate these in frontmatter or body.

### Body MDX (narrative-only)

The body is the editorial depth layer. Keep these sections only:

```mdx
## PrimeBiometry Assessment

[3-5 sentences of original editorial framing — vendor positioning, history, distinctive engineering, or market context the DecisionCard cannot convey.]

## Pricing Analysis

[Original analysis of pricing tiers — what numbers mean for different buyer sizes. Negotiation leverage. Hidden costs. One-line deltas vs 2-3 named competitors.]

## FAQ

**[Question 1]?**
[Answer 1]

**[Question 2]?**
[Answer 2]

[3-5 Q&A pairs. FAQPage schema auto-generates from frontmatter — keep these genuinely answerable, not keyword stuffing.]
```

**Removed H3 sections** (now structured in frontmatter / DecisionCard — do NOT add these inside MDX body):
- ~~### Best For~~
- ~~### Avoid If~~
- ~~### Compliance Coverage~~
- ~~### Integration Complexity~~

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

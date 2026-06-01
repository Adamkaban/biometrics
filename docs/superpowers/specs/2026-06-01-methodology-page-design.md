# /methodology Page — Full Rewrite Design

**Date:** 2026-06-01  
**Author:** James Whitfield (site author)  
**Goal:** Replace thin methodology page (~300 words) with SEO-optimized, E-E-A-T-rich authority page (~1,400–1,600 words). Primary purpose: branded trust signal for Google. Not targeting informational queries.

---

## Approach

Approach B — Process-first with sub-criteria scoring rubric.

Lead with evaluation process steps, then detailed scoring criteria (each criterion broken into sub-factors with specific verification methods), then data sources with limitations, "What We Don't Cover" honesty section, update cadence, full independence policy, FAQ (with FAQPage schema), author bio block.

---

## SEO Metadata

| Field | Value |
|-------|-------|
| `<title>` | `How We Evaluate Vendors 2026 \| PrimeBiometry` |
| `<meta description>` | `Our scoring methodology for biometric authentication and identity verification vendors: five weighted criteria, data sources, and evaluation process.` (161 chars) |
| `canonicalUrl` | `https://primebiometry.com/methodology` |
| `robots` | `index, follow` (default) |

Title char count (no spaces): 39 chars ✓ (limit 44)

---

## Schema

`@graph` array with three types:

```json
[
  {
    "@type": "Article",
    "headline": "How We Evaluate Biometric Software Vendors",
    "datePublished": "2026-01-15",
    "dateModified": "2026-06-01",
    "author": {
      "@type": "Person",
      "name": "James Whitfield",
      "jobTitle": "Senior Identity Verification Analyst",
      "url": "https://primebiometry.com/about",
      "sameAs": [
        "https://www.linkedin.com/in/james-whitfield",
        "https://x.com/jwhitfield"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "PrimeBiometry",
      "url": "https://primebiometry.com"
    }
  },
  {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://primebiometry.com" },
      { "@type": "ListItem", "position": 2, "name": "Methodology", "item": "https://primebiometry.com/methodology" }
    ]
  },
  {
    "@type": "FAQPage",
    "mainEntity": [
      // answer text for each question comes from the "Section 7 — FAQ" content in this spec.
      // Implementer: copy answer prose verbatim from FAQ section into each acceptedAnswer.text field.
      { "@type": "Question", "name": "Do featured vendors get higher scores?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q1 answer in Section 7]" } },
      { "@type": "Question", "name": "How often are scores updated?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q2 answer in Section 7]" } },
      { "@type": "Question", "name": "Can vendors request re-evaluation?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q3 answer in Section 7]" } },
      { "@type": "Question", "name": "How is the 25% compliance weight calculated?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q4 answer in Section 7]" } },
      { "@type": "Question", "name": "Does PrimeBiometry accept payment for assessments?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q5 answer in Section 7]" } },
      { "@type": "Question", "name": "How do I report incorrect vendor information?", "acceptedAnswer": { "@type": "Answer", "text": "[see FAQ Q6 answer in Section 7]" } }
    ]
  }
]
```

---

## Page Structure

### Breadcrumb
Visible nav: Home / Methodology  
Matches BreadcrumbList schema above.

---

### H1 Block
```
H1: "How We Evaluate Biometric Software Vendors"
Byline: James Whitfield · Senior Identity Verification Analyst
Dates: Published January 2026 · Updated June 2026
Summary: 2 sentences — what this page explains + independence statement
```

---

### Section 1 — Evaluation Process (H2)

4-step numbered flow showing how a vendor goes from candidate to published score:

1. **Candidate screening** — Inclusion criteria: must have publicly accessible product documentation, minimum 10 user reviews across G2/Gartner/Capterra, active vendor website. Vendors are identified via category research and user submissions.
2. **Data collection** — Researcher checks: vendor documentation and API reference, pricing page (or direct outreach for unlisted pricing), public compliance certificates (SOC 2 report URL, ISO 27001 certificate, GDPR DPA template), review aggregation from G2/Gartner/Capterra, sandbox availability check.
3. **Scoring** — Each vendor scored against 5 weighted criteria (detailed in Section 2). Scores are numerical; sub-criteria within each criterion contribute to the criterion total. No rounding until final score.
4. **Publication + monitoring** — Assessment published with `lastUpdated` date. Re-review triggered by: quarterly pricing check, semi-annual compliance cert check, major product release (vendor announcement or press coverage), or user-submitted corrections.

---

### Section 2 — Scoring Criteria (H2)

Intro: "Five criteria, each with a defined weight. Sub-criteria within each criterion are scored individually and summed."

**Criterion cards with sub-criteria breakdown:**

#### Compliance Coverage — 25%
Sub-criteria (5 pts each, 25 pts total):
- GDPR: valid DPA template available on vendor website or on request
- SOC 2 Type II: public audit report URL or third-party attestation dated within 24 months
- ISO 27001: certificate with scope statement, dated within 3 years
- CCPA: data processing addendum or explicit CCPA compliance statement in privacy policy
- HIPAA: BAA availability + at least one documented healthcare customer reference

#### Integration Depth — 25%
Sub-criteria (5 pts each, 25 pts total):
- REST API: public API reference with endpoint documentation and authentication model
- SDKs: at least one native SDK (iOS, Android, or Web) with published documentation
- Webhooks: event-driven callback support documented with payload schema
- Sandbox environment: free trial or developer sandbox accessible without sales call
- Documentation quality: API reference completeness, changelog, error code reference

#### Pricing Transparency — 20%
Sub-criteria (4 items × 5 pts = 20 pts total):
- Published tiers: pricing page with at least one publicly listed tier
- Per-verification pricing: cost-per-check model or volume pricing table visible
- Free tier or trial: sandbox access, free verification quota, or no-commitment trial
- Minimum commitment: contract term or minimum spend disclosed (or explicitly stated as none)

#### Market Coverage — 20%
Sub-criteria (5 pts each, 20 pts total):
- Geographic reach: documented coverage of 50+ countries
- Document types: supports passports, national IDs, and driver's licenses as minimum
- Language support: SDK or interface available in 3+ languages
- Liveness detection: at least one active or passive liveness method documented

#### User Sentiment — 10%
Sub-criteria:
- Aggregated rating ≥ 4.0 across review platforms = full 10 pts
- 3.5–3.9 = 7 pts
- 3.0–3.4 = 4 pts
- < 3.0 = 1 pt
- Minimum 10 reviews required; fewer = not scored, noted in assessment

---

### Section 3 — Data Sources (H2)

Each source listed with what it's used for AND known limitations:

1. **Vendor documentation** — API references, pricing pages, feature lists. Limitation: vendor-controlled; may be incomplete or outdated.
2. **Vendor pricing pages** — Direct outreach used when pricing is not published. Limitation: custom quotes may not reflect typical pricing.
3. **Public compliance certificates** — SOC 2 reports, ISO certificates, GDPR DPA templates. Limitation: we verify existence, not scope depth.
4. **G2, Gartner Peer Insights, Capterra** — Used for aggregated rating only. Minimum 10 reviews threshold. Vendor-curated testimonials excluded. Limitation: review populations vary by platform.
5. **Sandbox / trial environments** — Checked for availability; not used for functional testing. Limitation: we do not perform hands-on API testing or evaluate accuracy benchmarks.

---

### Section 4 — What We Don't Cover (H2)

Honesty section — 4 explicit limitations:

1. **Accuracy benchmarks** — We do not run liveness detection or facial recognition accuracy tests. We do not have access to proprietary benchmark data. If accuracy is critical, request vendor test reports.
2. **Pricing negotiation outcomes** — Listed pricing is what's publicly available or quoted. Actual enterprise pricing may differ significantly.
3. **Live product demos** — We do not request or conduct vendor demos. Assessments are based on public documentation only.
4. **Post-integration support quality** — We assess documentation and SDK availability, not real-world support responsiveness or SLA fulfillment.

---

### Section 5 — Update Cadence (H2)

Grid kept from current page, expand slightly:

| Frequency | What's updated |
|-----------|----------------|
| Quarterly | Pricing tiers and plan changes |
| Semi-annual | Compliance certification expiry checks |
| Annual | Full methodology review and weight recalibration |
| Ad-hoc | Major product releases, acquisitions, user-reported corrections |

Note: `lastUpdated` date on each vendor assessment reflects when that specific assessment was reviewed.

---

### Section 6 — Independence Policy (H2)

Full section (promoted from callout box):

- Revenue sources: affiliate links (`/go/[slug]` redirects) and featured vendor placements
- Featured placements: labeled "Featured", positioned above organic results in category pages, do not affect scoring criteria or editorial conclusions
- Affiliate links: `rel="nofollow noopener"` on all `/go/*` links, disclosed at page top where present
- Editorial firewall: scores are calculated before any commercial relationship is established with a vendor
- Disputes: vendors may submit factual corrections to `support@primebiometry.com`; editorial conclusions are not adjusted based on vendor preference

---

### Section 7 — FAQ (H2)

6 questions with answers. These populate both the visible FAQ and the FAQPage schema:

1. **Do featured vendors get higher scores?** No. Featured placement is a separate commercial arrangement. All vendors are scored against the same five criteria regardless of featured status. Scores are calculated before featured status is assigned.

2. **How often are scores updated?** Pricing is reviewed quarterly. Compliance certifications are checked semi-annually. Full re-evaluations happen annually or when a major product change is announced.

3. **Can vendors request a re-evaluation?** Yes. Vendors can submit documentation updates to `support@primebiometry.com`. We review submissions and update assessments if the data changes a sub-criterion score. Editorial conclusions are not adjusted on request.

4. **How is the 25% compliance weight calculated?** Compliance Coverage is scored out of 25 points using five sub-criteria (GDPR, SOC 2, ISO 27001, CCPA, HIPAA) worth 5 points each. The final percentage score is then weighted at 25% of the overall vendor score.

5. **Does PrimeBiometry accept payment for assessments?** No. Featured placements are paid, but they affect only positioning in category listings. Assessment scores and editorial copy are not available for purchase.

6. **How do I report incorrect vendor information?** Email `support@primebiometry.com` with the vendor name, the field that's incorrect, and a source link. We investigate and update within 5 business days.

---

### Author Bio Block (H2: "About the Analyst")

Same content as about.astro author section, condensed:

- Photo: `/images/authors/author.webp`
- Name: James Whitfield
- Title: Senior Identity Verification Analyst
- Credentials: CISSP, CIAM
- Bio: 1 paragraph (10+ years evaluating identity verification and access management for financial services, fintech, and healthcare; prior compliance consultant; 200+ vendors evaluated)
- Link: "Full profile →" → `/about`
- Social: LinkedIn, X

---

## Internal Links

- "View all vendors" → `/vendors`
- "Identity Verification vendors" → `/categories/identity-verification`
- "KYC Compliance vendors" → `/categories/kyc-compliance`
- "Contact us" → `/contact` (for corrections)
- "About James Whitfield" → `/about`

---

## Score Total Sanity Check

| Criterion | Weight |
|-----------|--------|
| Compliance Coverage | 25 pts |
| Integration Depth | 25 pts |
| Pricing Transparency | 20 pts |
| Market Coverage | 20 pts |
| User Sentiment | 10 pts |
| **Total** | **100 pts** |

---

## Implementation Notes

- File: `src/pages/methodology.astro`
- Full rewrite — delete existing content, keep BaseLayout import
- No new components needed — use patterns already in about.astro and existing pages
- Author photo already exists at `/images/authors/author.webp`
- No new dependencies

---

## What This Achieves

| E-E-A-T signal | How addressed |
|----------------|---------------|
| Experience | 4-step evaluation process, specific data sources with limitations, explicit "what we don't cover" |
| Expertise | Author credentials (CISSP, CIAM), sub-criteria scoring rubric with verification methods |
| Authoritativeness | FAQPage schema, detailed scoring rubric hard to dismiss as thin, link to /about |
| Trustworthiness | Independence policy as full section, honest limitations, affiliate disclosure at page level |

# /methodology Page — Full Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace thin methodology.astro (~300 words) with a fully SEO-optimized, E-E-A-T-rich authority page (~1,400–1,600 words) including a sub-criteria scoring rubric, evaluation process, data sources with limitations, honesty section, FAQ with FAQPage schema, and author bio.

**Architecture:** Single-file rewrite of `src/pages/methodology.astro`. All data lives as TypeScript arrays in the frontmatter — no new components, no new files. The FAQPage schema is generated dynamically from the same `faqs` array used to render the visible FAQ section. BaseLayout handles title/description/schema injection via SEOHead.

**Tech Stack:** Astro 5, Tailwind v4, TypeScript. No React islands — pure Astro template.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/pages/methodology.astro` | Complete rewrite — all content, schema, and layout |

No new files. No new dependencies.

---

## Task 1: Write frontmatter — data arrays and schema object

**Files:**
- Modify: `src/pages/methodology.astro` (replace entire file content with the new frontmatter)

This task writes only the `---` frontmatter block. The HTML template comes in later tasks. After this task the file is incomplete (no HTML), so the dev server will error — that is expected and resolved in Task 2.

- [ ] **Step 1: Replace the entire file with this frontmatter**

Open `src/pages/methodology.astro` and replace all content with:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";

const faqs = [
  {
    q: "Do featured vendors get higher scores?",
    a: "No. Featured placement is a separate commercial arrangement. All vendors are scored against the same five criteria regardless of featured status. Scores are calculated before featured status is assigned.",
  },
  {
    q: "How often are scores updated?",
    a: "Pricing is reviewed quarterly. Compliance certifications are checked semi-annually. Full re-evaluations happen annually or when a major product change is announced.",
  },
  {
    q: "Can vendors request a re-evaluation?",
    a: "Yes. Vendors can submit documentation updates to support@primebiometry.com. We review submissions and update assessments if the data changes a sub-criterion score. Editorial conclusions are not adjusted on request.",
  },
  {
    q: "How is the 25% compliance weight calculated?",
    a: "Compliance Coverage is scored out of 25 points using five sub-criteria (GDPR, SOC 2, ISO 27001, CCPA, HIPAA) worth 5 points each. The final percentage score is then weighted at 25% of the overall vendor score.",
  },
  {
    q: "Does PrimeBiometry accept payment for assessments?",
    a: "No. Featured placements are paid, but they affect only positioning in category listings. Assessment scores and editorial copy are not available for purchase.",
  },
  {
    q: "How do I report incorrect vendor information?",
    a: "Email support@primebiometry.com with the vendor name, the field that is incorrect, and a source link. We investigate and update within 5 business days.",
  },
];

const criteria = [
  {
    weight: "25%",
    pts: "25 pts",
    name: "Compliance Coverage",
    description: "Verified against public compliance documents, not vendor self-attestation.",
    subcriteria: [
      { label: "GDPR", detail: "Valid DPA template available on vendor website or on request", pts: 5 },
      { label: "SOC 2 Type II", detail: "Public audit report URL or third-party attestation dated within 24 months", pts: 5 },
      { label: "ISO 27001", detail: "Certificate with scope statement, dated within 3 years", pts: 5 },
      { label: "CCPA", detail: "Data processing addendum or explicit CCPA compliance statement in privacy policy", pts: 5 },
      { label: "HIPAA", detail: "BAA availability + at least one documented healthcare customer reference", pts: 5 },
    ],
  },
  {
    weight: "25%",
    pts: "25 pts",
    name: "Integration Depth",
    description: "Assessed from public API documentation and developer resources only.",
    subcriteria: [
      { label: "REST API", detail: "Public API reference with endpoint documentation and authentication model", pts: 5 },
      { label: "SDKs", detail: "At least one native SDK (iOS, Android, or Web) with published documentation", pts: 5 },
      { label: "Webhooks", detail: "Event-driven callback support documented with payload schema", pts: 5 },
      { label: "Sandbox", detail: "Free trial or developer sandbox accessible without a sales call", pts: 5 },
      { label: "Docs quality", detail: "API reference completeness, changelog, and error code reference", pts: 5 },
    ],
  },
  {
    weight: "20%",
    pts: "20 pts",
    name: "Pricing Transparency",
    description: "Published or directly quoted pricing only — no confidential enterprise figures.",
    subcriteria: [
      { label: "Published tiers", detail: "Pricing page with at least one publicly listed tier", pts: 5 },
      { label: "Per-verification pricing", detail: "Cost-per-check model or volume pricing table visible", pts: 5 },
      { label: "Free tier or trial", detail: "Sandbox access, free verification quota, or no-commitment trial", pts: 5 },
      { label: "Minimum commitment", detail: "Contract term or minimum spend disclosed (or explicitly stated as none)", pts: 5 },
    ],
  },
  {
    weight: "20%",
    pts: "20 pts",
    name: "Market Coverage",
    description: "Geographic reach, supported document types, and liveness detection capabilities.",
    subcriteria: [
      { label: "Geographic reach", detail: "Documented coverage of 50+ countries", pts: 5 },
      { label: "Document types", detail: "Supports passports, national IDs, and driver's licenses as a minimum", pts: 5 },
      { label: "Language support", detail: "SDK or interface available in 3+ languages", pts: 5 },
      { label: "Liveness detection", detail: "At least one active or passive liveness method documented", pts: 5 },
    ],
  },
  {
    weight: "10%",
    pts: "10 pts",
    name: "User Sentiment",
    description: "Aggregated from G2, Gartner Peer Insights, and Capterra. Minimum 10 reviews required.",
    subcriteria: [
      { label: "Rating 4.0+", detail: "Full 10 pts", pts: 10 },
      { label: "Rating 3.5–3.9", detail: "7 pts", pts: 7 },
      { label: "Rating 3.0–3.4", detail: "4 pts", pts: 4 },
      { label: "Rating below 3.0", detail: "1 pt", pts: 1 },
    ],
  },
];

const processSteps = [
  {
    n: "01",
    title: "Candidate Screening",
    detail:
      "Vendor must have publicly accessible product documentation, a minimum of 10 user reviews across G2, Gartner Peer Insights, or Capterra, and an active website. Vendors are identified through category research and user submissions.",
  },
  {
    n: "02",
    title: "Data Collection",
    detail:
      "Researcher checks: vendor API reference and documentation, pricing page (or direct email outreach for unlisted pricing), public compliance certificates, review aggregation from G2 / Gartner / Capterra, and sandbox or trial availability.",
  },
  {
    n: "03",
    title: "Scoring",
    detail:
      "Each vendor is scored against five weighted criteria using sub-criteria. Scores are numeric; sub-criteria within each criterion are summed to produce the criterion total. No rounding until the final score.",
  },
  {
    n: "04",
    title: "Publication and Monitoring",
    detail:
      "Assessment is published with a lastUpdated date. Re-review is triggered by: quarterly pricing checks, semi-annual compliance certificate checks, major product releases, or user-submitted corrections.",
  },
];

const sources = [
  {
    n: "01",
    label: "Vendor documentation",
    use: "API references, pricing pages, feature lists.",
    limit: "Vendor-controlled; may be incomplete or outdated.",
  },
  {
    n: "02",
    label: "Vendor pricing pages",
    use: "Direct outreach used when pricing is not published.",
    limit: "Custom quotes may not reflect typical pricing.",
  },
  {
    n: "03",
    label: "Public compliance certificates",
    use: "SOC 2 reports, ISO certificates, GDPR DPA templates.",
    limit: "We verify existence, not scope depth.",
  },
  {
    n: "04",
    label: "G2, Gartner Peer Insights, Capterra",
    use: "Aggregated rating only. Minimum 10 reviews threshold. Vendor-curated testimonials excluded.",
    limit: "Review populations vary by platform.",
  },
  {
    n: "05",
    label: "Sandbox / trial environments",
    use: "Checked for availability only.",
    limit: "We do not perform hands-on API testing or evaluate accuracy benchmarks.",
  },
];

const limitations = [
  {
    title: "Accuracy benchmarks",
    detail:
      "We do not run liveness detection or facial recognition accuracy tests. We do not have access to proprietary benchmark data. If accuracy is critical, request vendor test reports directly.",
  },
  {
    title: "Pricing negotiation outcomes",
    detail:
      "Listed pricing is what is publicly available or directly quoted. Actual enterprise pricing may differ significantly after negotiation.",
  },
  {
    title: "Live product demos",
    detail:
      "We do not request or conduct vendor demos. Assessments are based on public documentation only.",
  },
  {
    title: "Post-integration support quality",
    detail:
      "We assess documentation and SDK availability, not real-world support responsiveness or SLA fulfillment.",
  },
];

const cadence = [
  { freq: "Quarterly", what: "Pricing tiers and plan changes" },
  { freq: "Semi-annual", what: "Compliance certification expiry checks" },
  { freq: "Annual", what: "Full methodology review and weight recalibration" },
  { freq: "Ad-hoc", what: "Major product releases, acquisitions, user-reported corrections" },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "How We Evaluate Biometric Software Vendors",
      description:
        "Our scoring methodology for biometric authentication and identity verification vendors: five weighted criteria, data sources, and evaluation process.",
      url: "https://primebiometry.com/methodology",
      datePublished: "2026-01-15",
      dateModified: "2026-06-01",
      author: {
        "@type": "Person",
        name: "James Whitfield",
        jobTitle: "Senior Identity Verification Analyst",
        url: "https://primebiometry.com/about",
        sameAs: [
          "https://www.linkedin.com/in/james-whitfield",
          "https://x.com/jwhitfield",
        ],
      },
      publisher: {
        "@type": "Organization",
        name: "PrimeBiometry",
        url: "https://primebiometry.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://primebiometry.com" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Methodology",
          item: "https://primebiometry.com/methodology",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};
---
```

- [ ] **Step 2: Verify file saved correctly**

```bash
grep -c "@type" src/pages/methodology.astro
```

Expected output: a number ≥ 10 (multiple schema @type strings in the object).

---

## Task 2: Write HTML — breadcrumb, header, evaluation process section

**Files:**
- Modify: `src/pages/methodology.astro` (append HTML after the `---` frontmatter)

After this task the page renders in dev server with the first three sections visible.

- [ ] **Step 1: Append the BaseLayout wrapper, breadcrumb, header, and evaluation process section**

Append everything below the closing `---` of the frontmatter:

```astro

<BaseLayout
  title="How We Evaluate Vendors 2026 | PrimeBiometry"
  description="Our scoring methodology for biometric authentication and identity verification vendors: five weighted criteria, data sources, and evaluation process."
  canonicalUrl="https://primebiometry.com/methodology"
  schema={schema}
>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">

    <!-- Breadcrumb -->
    <nav class="mb-10" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <li><a href="/" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Home</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-zinc-600 dark:text-zinc-300" aria-current="page">Methodology</li>
      </ol>
    </nav>

    <!-- Header -->
    <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
      How We Evaluate Biometric Software Vendors
    </h1>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-xs text-zinc-400 dark:text-zinc-500">
      <span>By <a href="/about" class="text-zinc-600 dark:text-zinc-300 hover:underline">James Whitfield</a>, Senior Identity Verification Analyst</span>
      <span>Published January 2026</span>
      <span>Updated June 2026</span>
    </div>
    <p class="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[65ch] mb-12">
      This page documents how PrimeBiometry scores biometric authentication and identity verification vendors. All vendors are evaluated against the same five weighted criteria. Featured placements do not affect scores.
    </p>

    <!-- Section 1: Evaluation Process -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Evaluation Process</h2>
      <div class="space-y-5">
        {processSteps.map((step) => (
          <div class="flex gap-4">
            <span class="shrink-0 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{step.n}</span>
            <div>
              <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{step.title}</p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
```

- [ ] **Step 2: Start dev server and verify page loads**

```bash
npm run dev
```

Navigate to `http://localhost:4321/methodology`. Expected: page renders with H1 "How We Evaluate Biometric Software Vendors" and 4 numbered process steps. No build errors in terminal.

---

## Task 3: Write HTML — scoring criteria section

**Files:**
- Modify: `src/pages/methodology.astro` (append after evaluation process section)

This is the largest section — criterion cards with sub-criteria breakdown table inside each card.

- [ ] **Step 1: Append the scoring criteria section**

Add this after the closing `</section>` of the evaluation process section:

```astro
    <!-- Section 2: Scoring Criteria -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">Scoring Criteria</h2>
      <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        Five criteria, each with a defined weight. Sub-criteria within each criterion are scored individually and summed. Total possible score: 100 points.
      </p>
      <div class="space-y-4">
        {criteria.map((c) => (
          <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div class="flex items-center gap-3 mb-1">
              <span class="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{c.weight}</span>
              <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</h3>
              <span class="ml-auto font-mono text-xs text-zinc-400 dark:text-zinc-500">{c.pts}</span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{c.description}</p>
            <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
              {c.subcriteria.map((sub) => (
                <div class="flex items-start gap-2 py-1.5 text-xs">
                  <span class="shrink-0 font-semibold text-zinc-700 dark:text-zinc-300 w-36">{sub.label}</span>
                  <span class="text-zinc-500 dark:text-zinc-400 flex-1">{sub.detail}</span>
                  <span class="shrink-0 font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">{sub.pts}pt</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
```

- [ ] **Step 2: Check in browser**

Verify 5 criterion cards render at `http://localhost:4321/methodology`. Each card should show weight badge (e.g., "25%"), criterion name, "25 pts" on the right, description text, and sub-criteria rows with point values. The Compliance Coverage card should have 5 rows; User Sentiment should have 4 rows.

---

## Task 4: Write HTML — data sources, what we don't cover, update cadence

**Files:**
- Modify: `src/pages/methodology.astro` (append after scoring criteria section)

- [ ] **Step 1: Append data sources, limitations, and cadence sections**

Add this after the scoring criteria `</section>`:

```astro
    <!-- Section 3: Data Sources -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Data Sources</h2>
      <div class="space-y-5">
        {sources.map((s) => (
          <div class="flex gap-4">
            <span class="shrink-0 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{s.n}</span>
            <div>
              <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">{s.label}</p>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 mb-0.5">{s.use}</p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Limitation: {s.limit}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <!-- Section 4: What We Don't Cover -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">What We Don't Cover</h2>
      <div class="space-y-3">
        {limitations.map((l) => (
          <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{l.title}</p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{l.detail}</p>
          </div>
        ))}
      </div>
    </section>

    <!-- Section 5: Update Cadence -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Update Cadence</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cadence.map((item) => (
          <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <p class="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mb-1">{item.freq}</p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">{item.what}</p>
          </div>
        ))}
      </div>
      <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
        The <code class="font-mono">lastUpdated</code> date on each vendor assessment reflects when that specific assessment was reviewed, not this methodology page.
      </p>
    </section>
```

- [ ] **Step 2: Verify in browser**

At `http://localhost:4321/methodology` scroll down past scoring criteria. Expected: 5 numbered data sources (each with use + limitation text), 4 limitation cards, 2x2 cadence grid. No layout breaks.

---

## Task 5: Write HTML — independence policy, FAQ, author bio, internal links, close layout

**Files:**
- Modify: `src/pages/methodology.astro` (append final sections + close BaseLayout)

- [ ] **Step 1: Append independence policy, FAQ, author bio, internal links, and close the layout**

Add this after the update cadence `</section>`:

```astro
    <!-- Section 6: Independence Policy -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">Independence Policy</h2>
      <div class="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[65ch]">
        <p>PrimeBiometry earns revenue through affiliate links and featured vendor placements.</p>
        <p>
          <strong class="text-zinc-800 dark:text-zinc-200">Featured placements</strong> are labeled "Featured" and positioned above organic results in category pages. They do not affect scoring criteria or editorial conclusions. Featured status is assigned after scoring is complete.
        </p>
        <p>
          <strong class="text-zinc-800 dark:text-zinc-200">Affiliate links</strong> use <code class="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">/go/[slug]</code> redirects with <code class="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">rel="nofollow noopener"</code>. Affiliate relationships do not influence assessment scores.
        </p>
        <p>
          <strong class="text-zinc-800 dark:text-zinc-200">Disputes:</strong> Vendors may submit factual corrections to{" "}
          <a href="mailto:support@primebiometry.com" class="text-blue-600 dark:text-blue-400 hover:underline">
            support@primebiometry.com
          </a>. Editorial conclusions are not adjusted based on vendor preference.
        </p>
      </div>
    </section>

    <!-- Section 7: FAQ -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Frequently Asked Questions</h2>
      <div class="space-y-4">
        {faqs.map((faq) => (
          <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{faq.q}</p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>

    <!-- Author bio -->
    <section class="border-t border-zinc-200 dark:border-zinc-800 pt-14 mb-14">
      <h2 class="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-8">About the Analyst</h2>
      <div class="flex flex-col sm:flex-row gap-6 items-start">
        <div class="shrink-0">
          <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
            <img
              src="/images/authors/author.webp"
              alt="James Whitfield"
              width="64"
              height="64"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <div>
          <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">James Whitfield</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Senior Identity Verification Analyst · CISSP, CIAM</p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[60ch]">
            James has spent 10+ years evaluating identity verification and access management systems for financial services, fintech, and healthcare organizations. He has evaluated over 200 vendors across identity verification, biometric authentication, and fraud prevention.
          </p>
          <a href="/about" class="mt-3 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Full profile
          </a>
        </div>
      </div>
    </section>

    <!-- Internal links -->
    <nav aria-label="Explore vendors" class="border-t border-zinc-200 dark:border-zinc-800 pt-10">
      <p class="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-4">Explore vendors</p>
      <div class="flex flex-wrap gap-3">
        <a href="/vendors" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          All vendors
        </a>
        <a href="/categories/identity-verification" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          Identity Verification
        </a>
        <a href="/categories/kyc-compliance" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          KYC Compliance
        </a>
        <a href="/categories/biometric-authentication" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          Biometric Authentication
        </a>
        <a href="/contact" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          Report an error
        </a>
      </div>
    </nav>

  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify complete page in browser**

At `http://localhost:4321/methodology`, scroll through the entire page. Verify:
- Independence Policy section renders with inline code styling on `/go/[slug]`
- FAQ section shows 6 question/answer pairs
- Author bio shows photo (circular, 64×64), name, credentials, bio paragraph, "Full profile" link
- "Explore vendors" nav shows 5 pill links at bottom

---

## Task 6: Build verification and schema check

**Files:**
- No changes — verification only

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build completes with no errors. Check for any TypeScript errors about the `schema` prop — if `BaseLayout` complains about `@graph` being an array, the existing type `Record<string, unknown> | Array<Record<string, unknown>>` in BaseLayout.astro already supports it.

- [ ] **Step 2: Verify FAQPage schema is in the HTML output**

```bash
grep -c "FAQPage" dist/methodology/index.html
```

Expected: `1` — the FAQPage schema object is present in the built output.

- [ ] **Step 3: Verify Article schema sameAs is present**

```bash
grep "sameAs" dist/methodology/index.html
```

Expected: output contains `"sameAs"` with LinkedIn and X URLs.

- [ ] **Step 4: Verify title tag**

```bash
grep "<title>" dist/methodology/index.html
```

Expected: `<title>How We Evaluate Vendors 2026 | PrimeBiometry</title>`

- [ ] **Step 5: Verify word count target (~1400+ words)**

```bash
cat dist/methodology/index.html | sed 's/<[^>]*>//g' | tr -s ' \n\t' '\n' | wc -w
```

Expected: ≥ 1400 words in the rendered HTML text content.

- [ ] **Step 6: Commit**

```bash
git add src/pages/methodology.astro
git commit -m "feat: rewrite /methodology with scoring rubric, FAQ schema, and E-E-A-T signals"
```

---

## Self-Review Notes

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| Title: "How We Evaluate Vendors 2026 \| PrimeBiometry" | Task 2 |
| H1: "How We Evaluate Biometric Software Vendors" | Task 2 |
| Article schema + sameAs | Task 1 |
| BreadcrumbList schema | Task 1 |
| FAQPage schema (dynamically from faqs array) | Task 1 |
| Breadcrumb visible nav | Task 2 |
| Author byline + dates | Task 2 |
| 4-step evaluation process | Task 2 |
| 5 criterion cards with sub-criteria breakdown | Task 3 |
| 5 data sources with limitations | Task 4 |
| "What We Don't Cover" (4 limitations) | Task 4 |
| Update cadence grid | Task 4 |
| Independence policy as full section | Task 5 |
| FAQ visible (6 questions) | Task 5 |
| Author bio block | Task 5 |
| Internal links nav | Task 5 |
| Build passes | Task 6 |
| FAQPage in built HTML | Task 6 |

All spec requirements covered. No placeholders. No TBDs.

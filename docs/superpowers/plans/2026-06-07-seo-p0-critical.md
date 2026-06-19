# SEO P0 — Critical Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 critical issues that actively break trust, social sharing, mobile usability, and HCU compliance.

**Architecture:** All fixes are in existing files. One new file (`llms.txt`). No new components needed.

**Tech Stack:** Astro 5 SSG, `src/content/` MDX, `src/pages/`, `public/`

**Time estimate:** ~1 hour

---

## Task P0-1: Author Identity — "Creig Vand" → "James Whitfield"

**Why critical:** Google E-E-A-T entity graph cannot resolve an author with two different names sharing one LinkedIn profile. Breaks author authority on all 68 vendor pages + all blog posts.

**Files:**
- Modify: `src/content/assessments/*.mdx` (68 files via sed)
- Modify: `src/pages/about.astro` (5 places)

- [ ] **Step 1: Bulk replace in all 68 assessment MDX files**

```bash
cd /Users/usara/Desktop/Проекты/Сайты/PrimeBiometry
sed -i '' 's/^author: Creig Vand$/author: James Whitfield/' src/content/assessments/*.mdx
```

Verify:
```bash
grep -rn "Creig Vand" src/content/assessments/
# Expected: no output
```

- [ ] **Step 2: Fix Person schema name in about.astro (line ~53)**

```ts
// Old:
      name: "Creig Vand",
// New:
      name: "James Whitfield",
```

- [ ] **Step 3: Fix displayed H3 (line ~234)**

```astro
<!-- Old: -->
<h3 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Creig Vand</h3>
<!-- New: -->
<h3 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">James Whitfield</h3>
```

- [ ] **Step 4: Fix author photo alt text (line ~223)**

```astro
<!-- Old: -->
alt="Creig Vand, Senior Identity Verification Analyst at PrimeBiometry"
<!-- New: -->
alt="James Whitfield, Senior Identity Verification Analyst at PrimeBiometry"
```

- [ ] **Step 5: Fix social link aria-labels (lines ~245, ~254)**

```astro
<!-- Old line ~245: -->
aria-label="Creig Vand on LinkedIn"
<!-- New: -->
aria-label="James Whitfield on LinkedIn"

<!-- Old line ~254: -->
aria-label="Creig Vand on X"
<!-- New: -->
aria-label="James Whitfield on X"
```

- [ ] **Step 6: Verify no Creig Vand anywhere**

```bash
grep -rn "Creig Vand" src/
# Expected: no output
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/about.astro src/content/assessments/
git commit -m "fix: unify author identity to James Whitfield across all pages and assessments"
```

---

## Task P0-2: Vendors Catalog — Mobile Sidebar Broken

**Why critical:** `w-64 shrink-0` sidebar + `flex` row = horizontal overflow on every mobile viewport. The primary catalog page is unusable on mobile. Google uses mobile-first indexing.

**Files:**
- Modify: `src/pages/vendors/index.astro` (lines 61–62)

- [ ] **Step 1: Fix sidebar to collapse on mobile**

```astro
<!-- Old lines 61–62: -->
    <div class="flex gap-8 items-start">
      <aside class="w-64 shrink-0">

<!-- New: -->
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <aside class="w-full lg:w-64 shrink-0">
```

- [ ] **Step 2: Build and test on mobile viewport**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321/vendors` in browser → DevTools → toggle device toolbar → iPhone 375px. Verify:
- No horizontal scroll
- Vendor grid is visible
- Filters are accessible (they collapse into the `lg:hidden` flow — just stack below on mobile, which is fine for now)

- [ ] **Step 3: Commit**

```bash
git add src/pages/vendors/index.astro
git commit -m "fix: mobile sidebar layout on vendors catalog — flex-col on mobile, row on lg+"
```

---

## Task P0-3: Blog Post Fixes — OG Image + picture.png Fallback

**Why critical:**
1. All 5 blog posts show the generic site OG image on LinkedIn/Slack shares — the per-post `ogImage` is never passed to `<head>`
2. Article schema has `"image": "https://primebiometry.com/picture.png"` — this file doesn't exist → schema validation failure in Google's Rich Results Test

**Files:**
- Modify: `src/pages/blog/[slug].astro` (lines 46, 93–98, 145–154)

- [ ] **Step 1: Fix picture.png fallback in Article schema (line 46)**

```ts
// Old:
    : "https://primebiometry.com/picture.png",
// New:
    : "https://primebiometry.com/ogImage.webp",
```

- [ ] **Step 2: Pass ogImage to BaseLayout (lines 93–98)**

```astro
<!-- Old: -->
<BaseLayout
  title={post.data.title}
  description={post.data.description}
  canonicalUrl={canonicalUrl}
  schema={schemas}
>

<!-- New: -->
<BaseLayout
  title={post.data.title}
  description={post.data.description}
  canonicalUrl={canonicalUrl}
  ogImage={post.data.ogImage ? `https://primebiometry.com${post.data.ogImage}` : undefined}
  schema={schemas}
>
```

- [ ] **Step 3: Add fetchpriority="high" to hero image (line 150)**

```astro
<!-- Old: -->
          loading="eager"
          decoding="async"
<!-- New: -->
          loading="eager"
          fetchpriority="high"
          decoding="async"
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep 'og:image' dist/blog/veriff-vs-jumio-2026/index.html
# Expected: content="/images/blog/veriff-vs-jumio-2026.webp" (NOT /ogImage.webp)
grep 'picture.png' dist/blog/veriff-vs-jumio-2026/index.html
# Expected: no output
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "fix: pass blog post ogImage to <head>, fix picture.png schema fallback, add fetchpriority to LCP image"
```

---

## Task P0-4: Vendor Meta Descriptions — Replace Scraped Copy

**Why critical:** All 68 vendor pages use `vendor.description` (scraped from G2/Gartner/Capterra) as the SERP meta description. HCU actively penalizes this pattern. Also a duplicate content signal since this text exists on G2/Capterra.

**Files:**
- Modify: `src/content/config.ts` (add optional field)
- Modify: `src/pages/vendors/[slug].astro` (line 41)

- [ ] **Step 1: Add optional metaDescription field to assessments schema**

In `src/content/config.ts`, add to the assessments schema after `author: z.string()`:
```ts
    metaDescription: z.string().optional(),
```

- [ ] **Step 2: Fix meta description fallback in vendor page (line 41)**

```ts
// Old (line 41):
const metaDescription = trimToWordBoundary(vendor.description, 160);

// New:
const metaDescription = entry.data.metaDescription
  ?? trimToWordBoundary(
      `${vendor.name}: ${entry.data.bestFor}. Rating: ${vendor.rating}/5. ${vendor.pricing}.`,
      155
    );
```

This immediately gives all 68 pages editorial meta descriptions from assessment data. Any vendor with a custom `metaDescription:` in their MDX frontmatter will use that instead.

- [ ] **Step 3: Build and spot-check**

```bash
npm run build 2>&1 | tail -5
grep 'name="description"' dist/vendors/veriff/index.html
# Expected: starts with "Veriff: [bestFor text]" — NOT scraped vendor copy
grep 'name="description"' dist/vendors/idenfy/index.html
# Expected: starts with "iDenfy: ..." from assessment bestFor field
```

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/pages/vendors/[slug].astro
git commit -m "fix: replace scraped vendor meta descriptions with editorial copy from assessment bestFor field"
```

---

## Task P0-5: Create llms.txt

**Why critical:** Perplexity, ChatGPT (browsing mode), and Claude fetch `/llms.txt` during discovery sessions. Missing = site invisible to AI-assisted B2B research.

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Create the file**

Create `public/llms.txt`:
```
# PrimeBiometry

> Independent comparison of biometric authentication, identity verification, and KYC/AML software for IT directors, security officers, and compliance teams.

## Site Purpose

PrimeBiometry evaluates 69+ identity verification and biometric authentication vendors using a transparent 5-criteria scoring methodology (Compliance Coverage 25%, Integration Depth 25%, Pricing Transparency 20%, Market Coverage 20%, User Sentiment 10%). All vendor scores are independent of commercial relationships.

## Key Pages

- /methodology — Scoring criteria, data sources, and editorial independence policy
- /vendors — Full directory of 69+ vendors with pricing and assessments
- /categories/kyc-compliance — KYC compliance software comparison
- /categories/identity-verification — Identity verification software comparison
- /categories/biometric-authentication — Biometric authentication software comparison
- /categories/fraud-prevention — Fraud prevention software comparison
- /categories/aml — AML software comparison

## High-Value Comparisons

- /blog/veriff-vs-jumio-2026 — Veriff vs Jumio: pricing, liveness detection, API quality
- /blog/best-kyc-aml-software-2026 — Top 12 KYC/AML platforms compared
- /blog/kyc-pricing-guide-2026 — KYC software pricing breakdown 2026
- /blog/best-kyc-software-crypto-2026 — Best KYC software for crypto exchanges

## Contact

support@primebiometry.com
```

- [ ] **Step 2: Verify after build**

```bash
npm run build 2>&1 | tail -3
ls dist/llms.txt
# Expected: file exists
```

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat: add llms.txt for AI crawler guidance (ChatGPT, Perplexity, Claude)"
```

---

## Task P0-6: Cloudflare WAF Check — Manual

**Why critical:** GEO agent found every fetch to the live site returned HTTP 403. If Cloudflare "Bot Fight Mode" is enabled, it blocks all automated user-agents — including GPTBot, PerplexityBot, ClaudeBot — before they read robots.txt. All other GEO fixes are irrelevant if crawlers are blocked at the network layer.

**This is a dashboard check, not a code change.**

- [ ] **Step 1: Check Cloudflare Bot Fight Mode**

Go to: dash.cloudflare.com → primebiometry.com → Security → Bots

Check: Is "Bot Fight Mode" enabled?
- If **OFF**: no action needed
- If **ON (free tier)**: this blocks ALL automated traffic including AI crawlers → turn OFF or switch to "Allow verified bots"
- If **Super Bot Fight Mode (Pro)**: verified bots (GPTBot, PerplexityBot, etc.) are allowed by default → no action needed

- [ ] **Step 2: Check WAF Custom Rules**

Go to: Security → WAF → Custom Rules

Look for any rule with conditions like:
- `User-Agent contains "bot"`
- `User-Agent contains "GPT"` or `"Perplexity"` or `"Claude"`
- `cf.bot_management.score lt 30` with action "Block"

If any such rule exists, add an exception for verified AI crawlers or adjust the threshold.

- [ ] **Step 3: Verify after change**

```bash
curl -sI https://primebiometry.com/llms.txt
# Expected: HTTP/2 200
curl -sI https://primebiometry.com/ -A "GPTBot/1.0"
# Expected: HTTP/2 200 (not 403)
```

---

## Final P0 Check

- [ ] **Run full build**

```bash
npm run build
# Expected: exit 0, no errors
```

- [ ] **Verify no Creig Vand in built output**

```bash
grep -r "Creig Vand" dist/ | wc -l
# Expected: 0
```

- [ ] **Push to main (CF Pages auto-deploys)**

```bash
git push origin main
```

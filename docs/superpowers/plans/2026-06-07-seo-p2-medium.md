# SEO P2 — Medium Priority Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Performance optimizations, minor schema polish, UX improvements that accumulate into measurable ranking gains.

**Prerequisite:** P0 and P1 plans completed first.

**Architecture:** All changes in existing files. No new files.

**Tech Stack:** Astro 5 SSG, Tailwind v4, `public/_headers`, `src/styles/global.css`

**Time estimate:** ~1 hour

---

## Task P2-1: Font Preload + Preconnect for Vendor Logos

**Why:** Browser discovers Geist font only after downloading + parsing the 58KB CSS bundle. Delays FCP 200–400ms. Preconnect for `google.com` eliminates DNS+TLS penalty on the 68 favicon requests (vendor cards).

**Files:**
- Modify: `src/components/seo/SEOHead.astro`

- [ ] **Step 1: Find the built Geist woff2 filename**

```bash
npm run build 2>&1 | tail -3
ls dist/_astro/ | grep "geist-latin-wght-normal"
# Note the exact filename hash, e.g. geist-latin-wght-normal.BgDaEnEv.woff2
```

- [ ] **Step 2: Add preload and preconnect to SEOHead.astro**

Add these two lines at the very top of the `<head>` content in SEOHead.astro (before the stylesheet link):
```html
<link
  rel="preload"
  href="/_astro/geist-latin-wght-normal.BgDaEnEv.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
<link rel="preconnect" href="https://www.google.com" crossorigin />
```

Replace `BgDaEnEv` with the actual hash from Step 1.

**Note:** The hash changes on rebuild if the CSS bundle changes. This is acceptable — it only affects the preload hint, not the actual font loading. The font will still load, just without the preload hint on the next deploy until updated.

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep 'rel="preload"' dist/index.html
# Expected: <link rel="preload" href="/_astro/geist-latin-wght-normal...woff2" as="font" ...>
grep 'rel="preconnect"' dist/index.html
# Expected: <link rel="preconnect" href="https://www.google.com" ...>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/seo/SEOHead.astro
git commit -m "perf: add Geist font preload hint, add preconnect for Google favicon API"
```

---

## Task P2-2: Cache-Control Headers for Static Assets

**Why:** Cloudflare Pages serves `/_astro/*` assets with `Cache-Control: public, max-age=0, must-revalidate` by default. On every return visit, the browser revalidates the 58KB CSS, 182KB React runtime, and woff2 fonts — even though they have content-hashed names and never change. `immutable` eliminates all these round-trips.

**Files:**
- Modify: `public/_headers`

- [ ] **Step 1: Add cache rules to public/_headers**

Append these blocks at the end of `public/_headers`:
```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=2592000

/favicon.*
  Cache-Control: public, max-age=86400
```

`immutable` is safe for `/_astro/*` because Astro generates content-hashed filenames — a new build produces new filenames, old files are never modified in place.

- [ ] **Step 2: Verify headers file is valid**

```bash
cat public/_headers
# Verify: no duplicate blocks, correct indentation (2-space indent for header values)
```

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add public/_headers
git commit -m "perf: add immutable Cache-Control for hashed /_astro/* assets, cache images and favicons"
```

---

## Task P2-3: Defer React Hydration — client:idle and client:visible

**Why:** `client:load` on HeroSearch and VendorFilters triggers React hydration synchronously on page load. The 182KB React runtime competes with FCP. Neither component needs to be interactive before the main thread is free.

**Files:**
- Modify: `src/pages/index.astro` (line 96)
- Modify: `src/pages/vendors/index.astro` (line 68)

- [ ] **Step 1: Change HeroSearch to client:idle (index.astro line 96)**

```astro
<!-- Old: -->
      client:load

<!-- New: -->
      client:idle
```

`client:idle` = hydrate when browser's main thread is idle (after LCP, after layout). Search bar doesn't need to be interactive during initial paint.

- [ ] **Step 2: Change VendorFilters to client:visible (vendors/index.astro line 68)**

```astro
<!-- Old: -->
            client:load

<!-- New: -->
            client:visible
```

`client:visible` = hydrate when the sidebar enters the viewport. On mobile (after P0 fix, sidebar stacks below the grid), this fires after scroll — the React runtime doesn't even load until needed.

- [ ] **Step 3: Build and verify functionality**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321` — search bar should still work (autocomplete activates after idle, typically <500ms after load). Open `http://localhost:4321/vendors` — filters should activate when sidebar is visible.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/vendors/index.astro
git commit -m "perf: defer React hydration — HeroSearch client:idle, VendorFilters client:visible"
```

---

## Task P2-4: About Page Stats + text-rendering Scope

**Why:**
1. About page stat shows "200+ Assessments reviewed" — only 68 vendors exist. Quality Raters check these numbers against observable evidence.
2. `text-rendering: optimizeLegibility` on `html` element runs ligature calculation on ALL text site-wide (68 vendor card names, all body copy, etc.). Should only apply to headings.

**Files:**
- Modify: `src/pages/about.astro` (line 8)
- Modify: `src/styles/global.css` (line 31)

- [ ] **Step 1: Fix stat (about.astro line 8)**

```ts
// Old:
  { value: "200+", label: "Assessments reviewed" },
// New:
  { value: "68+", label: "Vendors assessed" },
```

- [ ] **Step 2: Move text-rendering to headings only (global.css line 31)**

Remove `text-rendering: optimizeLegibility;` from the `html { }` block.

Add after the `html { }` block closes:
```css
h1, h2, h3 {
  text-rendering: optimizeLegibility;
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep '200+\|Assessments reviewed' dist/about/index.html
# Expected: "68+" or "Vendors assessed" — not "200+"
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/styles/global.css
git commit -m "fix: correct about page vendor count stat, scope text-rendering optimizeLegibility to headings only"
```

---

## Task P2-5: Vendor Sidebar Logo — Fix loading="lazy" Above Fold

**Why:** The vendor logo in the sidebar is sticky and visible on first paint (above fold on desktop). `loading="lazy"` delays its fetch unnecessarily — the browser skips fetching it until it's "needed" even though it's already visible.

**Files:**
- Modify: `src/pages/vendors/[slug].astro` (line ~281)

- [ ] **Step 1: Change loading attribute**

Find the img element for the vendor logo in the sidebar. The current code (around line 281):
```bash
grep -n "logo_url\|loading=" src/pages/vendors/[slug].astro 2>/dev/null || \
grep -rn "logo_url\|loading=" src/pages/vendors/ | head -10
```

Change:
```astro
<!-- Old: -->
                  loading="lazy"
<!-- New: -->
                  loading="eager"
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/vendors/[slug].astro
git commit -m "perf: fix vendor sidebar logo loading=eager — image is above fold, lazy delays render"
```

---

## Task P2-6: OG Image — Add Dimension Meta Tags

**Why:** Neither `og:image:width` nor `og:image:height` is declared. Social crawlers must fetch the image to determine dimensions before building the preview. Adding dimension hints speeds up social unfurling and prevents cropping issues on some platforms.

Also: the site's default `ogImage.webp` is 1424×752px instead of the standard 1200×630. Twitter crops to 2:1 ratio from center, which may cut the image poorly at 1424×752 (ratio is 1.89:1, close enough but non-standard).

**Files:**
- Modify: `src/components/seo/SEOHead.astro` (after line 48)

- [ ] **Step 1: Add OG image dimension meta tags**

After the `og:image` meta tag (line 48), add:
```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/webp" />
```

- [ ] **Step 2: Regenerate ogImage.webp at 1200×630 (manual)**

The current `public/ogImage.webp` is 1424×752px. Regenerate it at exactly 1200×630. This is a manual design task — open the source file in Figma/Canva/Photoshop, resize canvas to 1200×630, export as WebP.

Until regenerated, the dimension meta tags will be slightly inaccurate (declaring 1200×630 for a 1424×752 image). This is acceptable short-term — dimension hints help even if approximate. Update the meta values to `1424` and `752` as a temporary measure if preferred.

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -3
grep 'og:image:width\|og:image:height' dist/index.html
# Expected: content="1200" and content="630"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/seo/SEOHead.astro
git commit -m "feat: add og:image dimension meta tags for faster social unfurling"
```

---

## Final P2 Check

- [ ] **Full build passes cleanly**

```bash
npm run build
# Expected: exit 0, no errors
```

- [ ] **Push to main**

```bash
git push origin main
```

---

## Deferred — Editorial Work (Out of Scope for Code Plans)

These require human writing time and are not code changes:

| Item | Impact | Notes |
|------|--------|-------|
| Write `metaDescription:` fields in top 20 vendor MDX files | High | Code infra added in P0. Add descriptions over time. |
| Write editorial "Top Picks" section for category pages | Very High | KYC + Identity Verification categories first |
| Write "best biometric authentication software 2026" blog post | High | Closes topical gap between site name and editorial content |
| Fix Integration Complexity: Jumio/Persona "Low" → "Medium" | Medium | Jumio + Persona assessments, 1 field each |
| Register site in Google Search Console + submit sitemap | Medium | Manual dashboard action at search.google.com/search-console |
| Create LinkedIn company page for PrimeBiometry | Low | Needed for `sameAs` in Organization schema |

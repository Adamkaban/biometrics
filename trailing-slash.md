# Trailing Slash — Project Rule

## Decision: No trailing slash

Canonical URLs on this site have NO trailing slash:
- ✓ `https://primebiometry.com/vendors`
- ✗ `https://primebiometry.com/vendors/`

## What to do at project start (Astro + Cloudflare Pages)

1. Set in `astro.config.mjs`:
   ```js
   trailingSlash: "never"
   ```

2. All hardcoded `canonicalUrl` values — no trailing slash.

3. All dynamic canonicals built from `Astro.url.pathname` or `siteConfig.seo.siteUrl` — verify no trailing slash appended.

4. Before first deploy — check with Detailed Chrome extension (`detailed.com/extension`) on `localhost:4321`. Canonical must be green (not "Canonicalised").

## Do NOT add `_redirects` to fix this on Cloudflare Pages

Cloudflare Pages redirects `/vendors` → `/vendors/` internally. Adding `_redirects` with `/vendors/` → `/vendors` creates an infinite redirect loop (`ERR_TOO_MANY_REDIRECTS`).

## Current state of this project

Canonicals use trailing slash — matches what CF Pages serves at HTTP 200.

SEO audit (2026-06-03) showed all 80+ pages marked non-indexable because canonical pointed
to no-slash URLs that CF Pages 307-redirects. Canonical → 307 = broken canonical chain.

Fixed by updating all `canonicalUrl` values to use trailing slash (e.g. `/vendors/veriff/`).
Homepage `https://primebiometry.com` exempt — root URL is correct without slash.

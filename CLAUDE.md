# PrimeBiometry — Project Rules

## What This Is

Biometric software comparison site at primebiometry.com. Vendor directory + editorial blog. B2B buyers: IT directors, security officers, compliance teams.

## Monetization

- **Affiliate** — `/go/[slug]` redirects with tracking
- **Featured placements** — `featured: true` vendors: badge, top position in category, "Get Quote" button → lead form → email

## Tech Stack

- Astro 5.18, static SSG (`output: "static"`), Cloudflare Pages + Workers
- Tailwind v4 (`@tailwindcss/vite`), React 19 (islands only), TypeScript 6
- No database — JSON + MDX only

## Commands

```bash
npm run dev
npm run build
npm run preview
npx wrangler deploy   # manual deploy (fallback only — CF Pages auto-deploys on push)
```

## Key Files

- `src/data/vendors.json` — 69 vendors with pricing
- `src/content/blog/` — MDX blog posts
- `src/content/assessments/` — MDX editorial assessments per vendor slug

## Site Structure

```
/vendors/[slug]     Vendor profile (JSON + MDX assessment)
/categories/[slug]  Vendors by category
/blog/[slug]        Blog post
/go/[slug]          Affiliate redirect (noindex, excluded from sitemap)
```

## Current Phase

**Phase 2:** Assessments for top 20 vendors + 4-6 blog posts + lead capture form + /go/ redirects
**Phase 3:** Vendor outreach for affiliate deals, sell featured placements at 500+ uniques/month

## Rules

- UI/frontend → `.claude/rules/design.md`
- SEO → `.claude/rules/seo.md`
- Content/blog → `.claude/rules/content.md`
- Vendors/data → `.claude/rules/vendors.md`
- Dev issues, npm installs → `.claude/rules/dev.md`
- Deploy → `.claude/rules/deploy.md` | Audit → agent `reviewer` | Write content → agent `writer`
- Never re-read `astro.config.mjs`, `site.config.ts` more than once per session
- Run `npm run build` at end of task, not mid-task

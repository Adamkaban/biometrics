# Design Rules — PrimeBiometry

## Dials
DESIGN_VARIANCE: 6 | MOTION_INTENSITY: 3 | VISUAL_DENSITY: 6

## Stack
Astro 5 + Tailwind v4 (`@tailwindcss/vite`) + `geist` (Vercel package, Variable font) + @phosphor-icons/react (strokeWidth 1.5) + Motion micro-interactions only.

Import Geist in `src/styles/global.css` via `@fontsource-variable/geist` + `@fontsource-variable/geist-mono` (Variable axis). The Vercel `geist` npm package is Next.js-only — NOT compatible with Astro.
Tailwind tokens live in `@theme { ... }` block in global.css — NOT in tailwind.config. No PostCSS config. No @astrojs/tailwind integration.

## Theme
Light primary. Dark via `prefers-color-scheme`. One theme per page, no section inversions.

## Colors
- Base: zinc-50 bg / zinc-900 text (light) | zinc-950 bg / zinc-100 text (dark)
- Accent: blue-600 (#2563EB) — one accent, locked everywhere
- Borders: zinc-200 / zinc-700 dark
- Featured vendor: `border-blue-200 bg-blue-50/50` light | `border-blue-600/30 bg-blue-950/10` dark
- Status: emerald-600 positive / amber-500 neutral / red-500 error

## Typography
- Font: Geist Sans. NOT Inter.
- H1: `text-4xl md:text-5xl font-semibold tracking-tight`
- Body: `text-base text-zinc-600 leading-relaxed max-w-[65ch]`
- Numbers (prices, ratings): `font-mono`
- Caps labels: `text-xs uppercase tracking-wide` — max 1 per 3 sections

## Layout Decisions
- Homepage hero: search bar + category chips. NOT split hero.
- Catalog: left sidebar filters (`w-64`) + `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Filter state in URL params (`?category=kyc&rating=4`) for SEO
- Vendor page: 2-col 70/30, sticky sidebar with pricing + CTA
- Featured label: "Featured" or "Sponsored". Never "Verified Partner".
- Corner radius: cards `rounded-lg`, buttons `rounded-md`, badges `rounded-full` — one system

## Forbidden
No em-dash (—). No Inter. No 3 equal feature cards. No dark primary. No compliance tables (no data yet). No AI purple gradients. No centered homepage hero. No scroll cue labels.

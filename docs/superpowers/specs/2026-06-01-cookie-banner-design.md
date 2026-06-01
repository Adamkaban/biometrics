# Cookie Banner Design

**Date:** 2026-06-01  
**Status:** Approved

## Summary

Single-button cookie notice banner for PrimeBiometry. Shows once per browser, dismissed via localStorage.

## Component

`src/components/layout/CookieBanner.astro` — added to `BaseLayout.astro` before `</body>`.

## Behavior

- Renders with `hidden` class by default (no flash)
- Inline `<script is:inline>` on load: checks `localStorage.pb_cookie_consent` — if absent, removes `hidden`
- Click "Got it" → sets `localStorage.pb_cookie_consent = 'accepted'` → hides banner
- No external dependencies, no React island

## Visual

- `fixed bottom-0 inset-x-0` full-width bar
- Light: `bg-white border-t border-zinc-200 shadow-sm`
- Dark: `bg-zinc-900 border-zinc-700`
- Content row: text left + button right, padded like `container-page`
- Text: `text-sm text-zinc-600` — "We use cookies to improve your experience. See our [Privacy Policy](/privacy)."
- Button: `bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 text-sm font-medium`

## Files Changed

- `src/components/layout/CookieBanner.astro` — new file
- `src/layouts/BaseLayout.astro` — import + `<CookieBanner />` before `</body>`

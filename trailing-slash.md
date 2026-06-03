# Trailing Slash — Project State

## Current state (2026-06-03) — RESOLVED

`trailingSlash: "never"` is active in `astro.config.mjs`.

Astro generates flat files (`vendors/veriff.html`) instead of directory-based (`vendors/veriff/index.html`).
CF Pages serves `/vendors/veriff` → **200** directly. No CF internal 307 redirects.

All canonical URLs and internal hrefs use **no trailing slash** throughout the codebase.

`public/_redirects` handles inbound trailing-slash URLs from old indexed pages:
```
/vendors/:slug/ → /vendors/:slug  (301)
/blog/:slug/ → /blog/:slug        (301)
... etc.
```

No redirect loops — loops only occurred when `index.html` files existed (CF 307 no-slash→slash).
With flat files, CF has no reason to add trailing slash, so `_redirects` is safe.

## Do NOT revert to directory-based output

If `trailingSlash` is removed or set to `"always"/"ignore"`:
1. Astro goes back to `slug/index.html` output
2. CF internal 307 returns for all no-slash requests
3. `_redirects` `/x/` → `/x` would create infinite loops — must delete `_redirects` first
4. All canonical and href changes must be reverted to trailing-slash variants

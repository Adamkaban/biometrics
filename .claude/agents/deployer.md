---
name: deployer
description: Verify build and deployment status for primebiometry.com. Use after git push or when checking if site is live and healthy.
model: claude-haiku-4-5-20251001
tools:
  - Bash
---

## Model
claude-haiku

## Tools
Bash only

## Purpose
Verify build and deployment after git push.
Deploy = CF native Git integration (Workers Assets). No GitHub Actions.

## Tasks

1. Run `npm run build` — confirm no errors
2. Check git status — confirm branch is clean and pushed
3. Check latest CF deploy via gh if available:
   `gh run list --limit 3` (may be empty — CF deploys via its own pipeline)
4. Verify these URLs return 200:
   - primebiometry.com/
   - primebiometry.com/vendors/
   - primebiometry.com/blog/
   - primebiometry.com/methodology/
   - primebiometry.com/sitemap.xml
   - primebiometry.com/robots.txt
5. Verify www redirect:
   `curl -I https://www.primebiometry.com/` → expect 301 to non-www https
6. Verify http redirect:
   `curl -I http://primebiometry.com/` → expect 301 to https
7. Verify /go/ pages are noindex:
   `curl -s https://primebiometry.com/go/idenfy/ | grep -i "noindex"` → must contain noindex
8. Verify /go/ is blocked in robots.txt:
   `curl -s https://primebiometry.com/robots.txt | grep -i "go"` → must contain `Disallow: /go/`

## CF Gotchas (check if deploy fails)

- `_redirects` must NOT contain absolute URLs — Workers Assets rejects them
- www→non-www and http→https handled by CF Redirect Rules, NOT `_redirects`
- Stale build cache: CF Dashboard → Build → Build cache → Clear Cache
- AI Crawl Control may auto-enable and overwrite robots.txt — keep disabled in CF Dashboard
- `/go/` pages are static Astro pages with meta refresh redirect — NOT server-side 301s
  (static site cannot do server-side redirects; meta refresh is correct for SSG)

## Output Format

| Check | Result | OK? |
|-------|--------|-----|
| build | no errors | ✅ |
| git | clean, pushed | ✅ |
| primebiometry.com/ | 200 | ✅ |
| primebiometry.com/vendors/ | 200 | ✅ |
| www redirect | 301 → non-www | ✅ |
| http redirect | 301 → https | ✅ |
| /go/idenfy/ noindex | found | ✅ |
| robots.txt /go/ blocked | found | ✅ |

## Rules

- Execute immediately, do NOT plan
- Report errors with exact message
- One task = one completed result

# Deploy Rules — PrimeBiometry

## How Deployment Works

**CF Pages auto-deploys on every push to `main`.**
No manual deploy needed for normal workflow. Push code → CF Pages builds and deploys automatically.

CF Pages project: `biometrics` (at dash.cloudflare.com under Perfectmaxim@proton.me's account)
GitHub repo: `Adamkaban/biometrics`

## Build Configuration (in CF Pages dashboard)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Path: `/`
- `wrangler.toml` in project root — required for `npx wrangler deploy` to work

## wrangler.toml

```toml
name = "biometrics"
compatibility_date = "2024-09-23"

[assets]
directory = "dist"
```

**Never delete `wrangler.toml`** — CF Pages deploy command (`npx wrangler deploy`) requires it. Without it all deploys fail silently.

## Manual Deploy (fallback only)

If CF Pages is broken and you must deploy manually:

```bash
npm run build
npx wrangler deploy
```

Must be logged in: `npx wrangler login` (use Perfectmaxim@proton.me account).

## Trailing Slash Setup

- Astro: `trailingSlash: "never"` + `build: { format: "file" }` → flat `.html` files
- `public/_redirects` strips trailing slashes: `/vendors/:slug/ → /vendors/:slug 301`
- Canonical tags: no trailing slash (via `Astro.url.pathname`)
- **Do not change this setup** — it eliminates the "canonical points to redirect" Ahrefs error

## What NOT To Do

- Do not add a GitHub Actions workflow for deployment — CF Pages handles it natively
- Do not run `npx wrangler pages deploy dist` — project uses Workers Assets (`npx wrangler deploy`)
- Do not remove `wrangler.toml`
- Do not add `trailingSlash: "always"` in Astro config

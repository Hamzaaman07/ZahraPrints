# Deploy prompt — Zahra Prints on Cloudflare Pages

Paste everything below the line into a Claude Code session opened on this repo.

---

Deploy this repo to **Cloudflare Pages** so that every push to GitHub rebuilds
the site and serves it over HTTPS, with a separate preview URL per branch.

## Repo state — read this before you start

This repo currently contains **only brand assets**, not a site:

- `scripts/build_logo.py` — generates the logo SVGs
- `assets/fonts/PlayfairDisplay-{500,700}.ttf`
- `public/brand/*.svg` — four transparent-background logo files
- `EtsyListingsDownload.csv` and `reviews.json` — product and review data

There is no `package.json`, no Vite app, no `src/`. Check this yourself with
`ls` before assuming otherwise. If the app is still missing, do Step 0. If a
working Vite app is already present, skip straight to Step 1.

## Step 0 — scaffold the app (only if it isn't there)

Build the catalog storefront described in `lovablemasterprompt.md`: Vite +
React + TypeScript + Tailwind + shadcn/ui + React Router, with
`scripts/build-data.ts` converting the CSV into `src/data/products.json`.

If that full build is too much for one pass, build a **minimal but real**
version first so there is something deployable, and say clearly that you did:

- `npm create vite@latest . -- --template react-ts`
- Home, Shop, and Product routes wired through React Router
- products read from the generated `src/data/products.json`, never hardcoded
- the logo pulled from `/brand/logo-full-on-dark.svg`
- `npm run build` must succeed and emit `dist/`

Do not wire up the deploy until `npm run build` passes locally. A green
pipeline that ships a broken bundle is worse than no pipeline.

## Step 1 — SPA routing and headers

React Router needs a catch-all or `/shop` will 404 on refresh. Cloudflare Pages
reads these from the build output, and Vite copies `public/` to `dist/`, so
they belong in `public/`.

`public/_redirects`:

```
/*    /index.html   200
```

`public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/brand/*
  Cache-Control: public, max-age=604800

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Also move `public/brand/README.md` to `docs/brand.md` — everything under
`public/` gets published to the CDN, and that file should not be.

## Step 2 — pin the toolchain

Write `.nvmrc` with `22`, and confirm `package.json` has:

```json
"scripts": {
  "build": "npm run build:data && vite build",
  "build:data": "tsx scripts/build-data.ts",
  "preview": "vite preview"
}
```

The data build must run before `vite build`, so `products.json` exists at
bundle time rather than being fetched at runtime.

## Step 3 — the deploy workflow

Create `.github/workflows/deploy.yml`. This deploys on every push to `main`
and on every pull request, giving each branch its own preview URL.

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: ["**"]
  pull_request:

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Deploy
        id: deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >-
            pages deploy dist
            --project-name=zahra-prints
            --branch=${{ github.head_ref || github.ref_name }}

      - name: Show URL
        run: echo "${{ steps.deploy.outputs.deployment-url }}"
```

## Step 4 — what you cannot do, and I must

Stop here and tell me these steps in plain language. Do not invent values, do
not commit any token, and do not claim the site is live before I have done
this and a run has actually gone green.

1. Create the Pages project once. Either I run it locally:
   `npx wrangler@latest pages project create zahra-prints --production-branch main`
   or you tell me to create it in the Cloudflare dashboard.
2. Get my **Account ID** from the Cloudflare dashboard sidebar.
3. Create an **API token** at Cloudflare → My Profile → API Tokens, with the
   permission `Account → Cloudflare Pages → Edit`.
4. Add both to GitHub → repo Settings → Secrets and variables → Actions, named
   exactly `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Step 5 — verify, don't assume

After I confirm the secrets are in place, push and then actually check:

- the workflow run succeeded — report the real conclusion, not an assumption
- production is live at `https://zahra-prints.pages.dev`
- the branch preview resolves at
  `https://<branch>.zahra-prints.pages.dev` (branch names are lowercased and
  non-alphanumerics become hyphens)
- deep links work: load `/shop` directly and refresh it, confirming the
  `_redirects` catch-all is being applied
- the logo loads from `/brand/logo-full-on-dark.svg`

If any check fails, fix it and re-verify. Report what you actually observed,
including failures — a red run reported as green costs me more time than the
failure itself.

## Notes

- Cloudflare now steers new projects toward Workers static assets, but Pages
  gives per-branch preview URLs with no extra config, which is exactly what
  this site needs. Pages remains fully supported.
- HTTPS and the certificate are automatic on `*.pages.dev`; there is nothing
  to configure.
- For a custom domain later: Pages project → Custom domains → add the domain.
  That needs my dashboard access, so tell me rather than attempting it.
- Etsy CDN image URLs (`i.etsystatic.com`) are hotlinked and temporary. Keep
  the data layer able to swap them for local optimized assets later.

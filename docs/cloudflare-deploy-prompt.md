# Deploy prompt — Zahra Prints on Cloudflare

Paste everything below the line into a Claude Code session opened on this repo.

---

Set up continuous deployment for this repo to Cloudflare, so every push builds
and every branch gets its own HTTPS preview URL. I will do the dashboard
clicking; you do the repo work and the verification.

## Step 1 — confirm what this repo actually is

Do not guess the deploy target from the framework name. Read the real build
output and tell me what you find:

```
npm ci
npm run build
find dist -type f | sort
```

Then check for SSR/Worker artifacts specifically — `dist/_worker.js`,
`functions/`, `dist/server/`, `.output/server`, a generated `wrangler.json`, or
any Nitro/adapter package in `package.json`. Report whether this is a Worker
(SSR) or plain static assets, and say which file made you conclude that.

Expected, as of writing: Vite 8 + React 19 + TypeScript + Tailwind v4 + React
Router, npm with `package-lock.json`, build command `npm run build` (which runs
`build:data` → `tsc --noEmit` → `vite build`), output `dist/`, **pure static, no
SSR**. If what you find differs, trust your finding over this paragraph and tell
me it changed.

## Step 2 — confirm the repo is already deploy-ready

These should already exist. Verify rather than assume, and only create what is
genuinely missing:

- `.nvmrc` containing `22`
- `public/_redirects` containing `/*    /index.html   200` — without it, React
  Router deep links like `/shop` 404 on refresh
- `public/_headers` — immutable caching for `/assets/*`, plus `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`
- both of the above present in `dist/` after a build (Vite copies `public/`)

Confirm `npm run build`, `npm run typecheck`, and `npm run lint` all pass.

## Step 3 — give me the dashboard values

Print the exact values for **Workers & Pages → Create → Pages → Connect to
Git**, as a table I can paste from. Include: framework preset, build command,
deploy command (or that it must be left empty), build output directory, root
directory, production branch, and the `NODE_VERSION` environment variable.

Then tell me, in one line, where to enable preview builds for **all
non-production branches**, so every branch gets its own URL before anything
touches `main`.

Do not invent an account ID, project name, API token, or URL. If you need one,
ask me.

## Step 4 — verify it for real, once I say it is connected

This is the part that matters. When I tell you the first deployment ran:

- Ask me for the deployment URL and the build log.
- Fetch the production URL and assert on **what actually rendered** — real DOM
  text and `img.naturalWidth` (0 means the image failed even though the element
  exists). Do not conclude it works because the build was green.
- Load a deep link (`/shop`) **directly** and reload it, to prove the
  `_redirects` catch-all is actually applied. This is the single most likely
  thing to be silently broken.
- Confirm the branch preview URL resolves. Branch names are lowercased with
  non-alphanumerics replaced by hyphens.
- Confirm `/brand/logo-horizontal-on-dark.svg` returns 200.

If any check fails, fix it and re-verify. If a measurement says nothing changed,
treat it as broken until you have specifically proved otherwise — do not
explain a null result away as caching or a slow edge.

Say plainly what you could not verify from your environment. You have no
Cloudflare credentials, so anything about the account, the build runner, or
billing is outside what you can check — tell me rather than guessing.

## Step 5 — if the first build fails

Ask me for the build log and fix the cause. Most likely candidates, in order:

1. Node version — the runner defaulting to 18 or 20 breaks Vite 8. `NODE_VERSION=22`.
2. `npm ci` failing because `package-lock.json` is out of sync with `package.json`.
3. The build output directory set to something other than `dist`.

Do not paper over a failure by disabling the typecheck in `npm run build`.

## Alternative, only if I ask for it: deploy from GitHub Actions instead

If I would rather not use the dashboard Git integration, set up
`.github/workflows/deploy.yml` using `cloudflare/wrangler-action@v3` with
`command: pages deploy dist --project-name=zahra-prints --branch=${{ github.head_ref || github.ref_name }}`,
`actions/setup-node@v4` with `node-version-file: .nvmrc`, and a
`concurrency` group keyed on `github.ref`.

That route needs me to add `CLOUDFLARE_API_TOKEN` (permission: Account →
Cloudflare Pages → Edit) and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets,
and to create the project once with
`npx wrangler pages project create zahra-prints --production-branch main`.
Never commit a token, and never print one back to me.

## Working rules for this task

- Work on a branch, never commit straight to `main`.
- Run typecheck, lint, and build before pushing.
- Open a PR whose test plan says what you actually verified, not what you assume.
- After I merge, run `git log origin/main..origin/<branch>` and confirm it is
  empty before telling me anything is live.
- Record anything non-obvious in `CLAUDE.md` — especially gotchas that cost real
  time and how to correctly verify the tricky parts.

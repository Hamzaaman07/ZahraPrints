# Zahra Prints — working notes

Catalog storefront for an existing Etsy clothing brand (Arabic-calligraphy
streetwear). Tagline: *Quality on Wallahi.*

**The site never processes payments.** Every product links out to Etsy. No cart,
no login, no backend, no database. Anything that implies checkout on-site is a
bug.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build:data` | Regenerates `src/data/*.json` from `data/`. Prints a full audit report. |
| `npm run dev` | `build:data` then Vite dev server |
| `npm run build` | `build:data` → `tsc --noEmit` → `vite build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |

Node 22 (`.nvmrc`). Stack: Vite 8 + React 19 + TypeScript + Tailwind v4 +
React Router. Tailwind v4 is configured via `@tailwindcss/vite` and the
`@theme` block in `src/index.css` — there is **no `tailwind.config.js`**, and
adding one will not do what you expect.

## Data pipeline

```
data/EtsyListingsDownload.csv  ─┐
                                ├─ scripts/build-data.ts ─→ src/data/products.json
data/reviews.json             ─┘                          └─→ src/data/reviews.json
```

`src/data/*.json` is **generated and committed**. Never hand-edit it; edit the
converter and rerun. It is committed so `typecheck`/`lint` work on a fresh
clone without a build step.

### Product schema

```ts
{ id, title, price, category, images[], blurb, specs{}, tags[], colors[], sizes[], etsyUrl }
```

`blurb` is an addition beyond the original brief — see "DESCRIPTION" below.

### Category derivation — the ordering is load-bearing

Rules are evaluated in order, first match wins, all patterns word-anchored:

1. `compression` — `\bcompression\b`
2. `outerwear` — `jacket | zip-up | quarter-zip | windbreaker | puffer`
3. `hoodies` — `hoodie | sweatshirt | crewneck | pullover | sweater`
4. `pants` — `sweatpants | sweats | joggers | pants | shorts`
5. `tees` — `t-shirt | tee | shirt | polo`

**Two traps cost real time here.** A bare `/sweats/` matches "**Sweats**hirt",
and a bare `/shirt/` matches "Sweat**shirt**" — so 19 of 57 titles match more
than one keyword. Word boundaries fix both: `\bsweats\b` does not match
"Sweatshirt". Without them, hoodies leak into `pants` and `tees`.

One title uses bare "Sweats" ("Vintage Arabic Baggy Sweats Quick Dry
Mesh-Lined"), so the `\bsweats\b` alternative must stay in the `pants` rule or
that row falls through to no category at all.

`outerwear` sits **above** `hoodies` deliberately. All three outerwear items
also contain "hoodie" or "sweatshirt"; putting `hoodies` first empties the
category entirely. The debatable one is "Sun Fade Raw Edge Quarter-Zip
Sweatshirt" — currently outerwear. Move `quarter-zip` out of rule 2 if that
should read as a hoodie.

Result: tees 20, hoodies 16, pants 14, compression 4, outerwear 3 = 57.

### DESCRIPTION is *mostly* a spec sheet

The brief describes it as newline-separated `Key: Value` pairs. It is — but
**56 of 57 rows also carry marketing prose**, and 5 rows are prose only with no
spec block at all. Prose sits above the pairs in 55 rows, interleaved in 1.

So the parser splits it: recognised keys → `specs`, everything else → `blurb`.
Unrecognised `Key: Value` lines go to `blurb` too, not `specs` — otherwise
marketing bullets like `Premium Quality: ...` land in the spec table. The
converter prints every unrecognised key it saw; check that output when the
export is refreshed.

Source-data quirks folded into `SPEC_KEYS`:
- `Fabric Strench` — a **typo in the export** (3 rows), mapped to `Fabric Stretch`
- `Material` / `Weight` / `Thickness` / `Stretch` — older rows' names for the
  `Fabric *` keys, normalised

**5 products have zero specs** (pure-prose listings). The product page must
handle an empty spec table without collapsing — render the `blurb` instead.

### Variations

Header casing is inconsistent across rows: `Primary color`, `Color`, `color`,
and `size` / `Size`. Both variation slots are probed **by name,
case-insensitively** — never assume slot 1 is colour. Matching on exact case
silently drops colours.

**1 product has no colours and no sizes at all** ("Arabic Paint Splatter
Hoodie" — both variation slots empty in the export). Swatch and size UI must
tolerate empty arrays.

Sizes across the catalog are exactly: S, M, L, XL, 2XL, 3XL. 31 distinct colours.

### Reviews

31 raw entries → **28 kept**. Dropped: 2 with empty `message`, 1 near-duplicate
sharing an `order_id` (Jaccard word overlap ≥ 0.6; the longer text is kept).

**Rating discrepancy, decide deliberately:** the raw average across all 31 is
**4.97** (what Etsy displays). The average of the 28 with written text is
**4.96**, because all three dropped entries were 5-star. Showing 4.97 as the
aggregate while rendering 28 cards is truthful to the shop; showing 4.96 is
truthful to the cards on screen. Pick one and keep it consistent.

### etsyUrl is not in the export

Emitted as `""` for every product. **TODO:** the product page must fall back to
the shop homepage while it is blank. These get filled in later.

## Assets

`data/logo.png` referenced in the brief **does not exist**. The logo has twice
arrived as an image pasted inline in chat, which this environment renders to the
model but never writes to disk — so it cannot be traced or colour-sampled. It
was rebuilt as vector from visual inspection instead. To supply the real file,
commit it to the repo (or attach it as a file upload rather than pasting it);
then the leaf shapes can be retraced and the palette sampled from real pixels. `scripts/build_logo.py`
generates four transparent-background SVGs into `public/brand/`: full lockup and
standalone mark, each in a light-surface (umber) and dark-surface (sand)
variant. The wreath is constructed from one sprig rotated 45° eight times, so
the eightfold symmetry is exact. Rerun with `python3 scripts/build_logo.py`
(needs `fonttools`).

Product imagery is hotlinked from `i.etsystatic.com` and is **temporary**. Keep
the data layer able to swap `images[]` for local optimized assets later.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `--color-ink` | `#0B0A08` | near-black ground |
| `--color-amber` | `#F5B324` | rosette gold, primary accent |
| `--color-gold` | `#DFA31B` | deeper gold, hairlines and hover |
| `--color-umber` | `#8A5A12` | wordmark brown, secondary surfaces |
| `--color-ember` | `#C2571A` | **CTAs only** — never decoration |
| `--color-sand` | `#EFE4D2` | warm bone, primary text on dark |

Dark-first. `--color-ember` is reserved so the primary action never blends into
ornament; using it anywhere else breaks that contract.

## Constraints that must keep holding

**Arabic script — typeset it, never draw it.** Never render Arabic as SVG
paths, traced letterforms, or generated imagery; generated Arabic is reliably
broken (disconnected letterforms, wrong contextual shaping) and for a sacred
phrase that is offensive, not cosmetic. Always real Unicode in a real Arabic
face (Amiri, Reem Kufi, Aref Ruqaa, Scheherazade New), wrapped in
`<span lang="ar" dir="rtl">`. No stretching, skewing, mirroring, or fake
kashida. Approved phrases only: بسم الله, الحمد لله, رحمة, زهراء — ask before
adding any other.

**Islamic geometry — construct it, don't approximate it.** Girih tiling from
the five equal-edge tiles; strapwork crosses each edge at its midpoint at 54°;
draw the straps, never the tile scaffolding. Generate as SVG from tile
definitions so correctness follows from construction. No clip art, icon fonts,
emoji, or stock "arabesque" assets.

The strongest calligraphy on this site is in the product photography. Let the
imagery carry it rather than generating ornament that competes.

## Verification

Assert on **rendered output**, not intermediate state. Checking a JS variable
proves nothing about what the browser painted.

The working loop: `npm run build`, serve `dist/`, drive it with Playwright,
assert on real DOM text and on `img.naturalWidth` (0 means the image failed to
load even though the element exists). Python Playwright is available and
Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — do not
run `playwright install`.

If a measurement says nothing changed, treat it as broken until proven
otherwise. Don't explain a null result away as a stale frame or a slow
environment without specifically proving that's the cause.

### Gotcha: `pkill -f` kills the tool shell

`pkill -f "vite preview"` matches the **agent's own shell**, because the
pattern string appears in that shell's command line. The invocation dies
mid-way with exit 144 and later commands silently never run. Start and stop
dev servers from inside a single script (Python `subprocess`) instead of
backgrounding them and pkill-ing by pattern.

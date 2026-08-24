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

## Pages

```
src/App.tsx            layout shell + routes
src/routes/            Home, Shop, Product, Reviews, About, NotFound
src/lib/catalog.ts     typed catalogue access, filtering, sorting, swatches
src/lib/seo.ts         per-page title/description/OG, no helmet dependency
```

Home and About carry the heavy motion; Shop and Product stay deliberately
cheap, because that is where people actually browse and buy. `About` is
`lazy()`-imported.

**Shop's category filter is seeded from `?category=`**, and `App.tsx` keys the
route on the query string so arriving with a different category remounts and
re-seeds. That avoids a state-sync effect — React lint rightly rejects
`setState` inside an effect for this.

**Product resets its gallery during render**, not in an effect
(`if (gallery.id !== id) setGallery(...)`). An effect would paint the previous
product's photos for a frame first.

Three data facts the UI must keep tolerating, all real in the export: one
product has **no colours and no sizes**, five have **no specs** (the page shows
the blurb and a pointer to Etsy instead), and `etsyUrl` is empty for every
product so `etsyLink()` falls back to the shop homepage.

## The girih generator (the site's signature element)

```
scripts/girih/tiles.ts      five tile definitions, vertices derived from angles
scripts/girih/strapwork.ts  54° straps, by construction
scripts/girih/tiling.ts     edge-matched placement + overlap rejection
scripts/build-girih.ts      → src/data/girih.json (rings of path data)
```

`npm run verify:girih` runs all three verifiers. They assert on measured
geometry, not on intent: every tile closes, every edge is length 100, measured
angles match the table, every strap meets its edge at exactly 54°, every strap
endpoint lands on an edge midpoint, every midpoint carries exactly two straps,
and placement never distorts or duplicates a tile.

**The strap pairing rule is the subtle part.** Straps weave over and under one
another, so an intersection is *not* automatically where a strap stops. Pairing
rays by "nearest intersection" is wrong and fails loudly — it starves the
pentagon to zero straps and gives the decagon a ring of short chords instead of
a ten-pointed star. The correct rule: a ray ends where it either reaches another
edge midpoint (a straight strap) or meets a partner **symmetrically**, both
having travelled the same distance, which is a mirror line of the tile. Every
nearer intersection is a crossing it passes straight through. Corners must also
be tested to fall strictly inside the tile, or the non-convex bowtie pairs
through its own waist.

**Grow the patch in two phases, not greedily.** A single greedy pass looks
wrong: the first decagon that fits wins, after which decagons rarely fit again,
so the field fills with elongated hexagons (4 decagons to 193 hexagons) and the
ten-pointed stars end up sparse and scattered — it reads as messy. Historical
girih is regular because the decagons sit on a network of their own. So
`growNetwork()` lays decagons edge-to-edge first and lets overlap rejection
space them: neighbours 36° apart collide, neighbours 72° apart clear (centre gap
361.8 against a circumdiameter of 323.6), giving the classic ring of five. Phase
two fills the gaps. That flips the mix to roughly 51 decagons / 75 bowties and
the star grid becomes even.

**Straps render as interlaced double-line bands**, which is how drawn girih
reads. Each ring is stroked thick in the band colour, then re-stroked thinner in
the ground colour on top, leaving two parallel edges — no extra path data. All
thick passes must be emitted before any thin pass, or a later band paints over
an earlier one's inner line. `GirihField` therefore renders two groups, not one
pass per ring, and its `ground` prop must match the surface behind it.

Tile outlines are scaffolding and are **never** emitted — only straps.
`scripts/girih/preview-tiles.ts` and `preview-field.ts` draw the scaffolding for
inspection; those outputs go to a scratch dir, never to `public/`.

## The carved screen (WebGL hero)

`src/components/GirihScreen.tsx` extrudes the same verified strap segments into
solid bars — one `InstancedMesh` carries every bar across every layer, so ~3,900
bars cost one draw call. Layers sit at increasing depth rotated by multiples of
36°, the tiling's own symmetry step, so camera movement slides them into real
parallax. Lighting uses drei `Lightformer`s inside `<Environment>` rather than an
HDR file, so there is nothing external to fetch and it survives a strict CSP.

`useImmersive()` returns three tiers. `prefers-reduced-motion` gives **off** (flat
SVG field only) — that is a stated preference, honoured on every screen size.
Phones get **low**: same screen, 2 layers instead of 4, lower dpr, no bloom.
Wider screens get **high**.

The 3D chunk is `lazy()`-imported and the tier starts at "off", so a phone under
reduced motion never downloads three.js at all. Keep it that way: main bundle is
~105 KB gzipped, the screen chunk ~276 KB.

The flat `GirihField` always paints underneath at low opacity, so the hero is
never empty while the chunk loads.

## Fonts are self-hosted

`public/fonts/` holds Playfair Display and Jost (variable, latin subset) and
Amiri subset to the four approved Arabic phrases — 84 KB total. Regenerate with
`bash scripts/fetch-fonts.sh` (needs `fonttools` and `brotli`).

Self-hosted rather than linked from Google because it removes two extra DNS+TLS
handshakes on the critical path for a phone-heavy audience, and because the site
then renders correctly on networks that cannot reach `fonts.googleapis.com`.

The Amiri subset keeps `init`, `medi`, `fina`, `rlig` and `ccmp`, which is what
makes contextual shaping work. **Subsetting without those features produces
disconnected letterforms** — exactly the failure the Arabic rules exist to
prevent. If a phrase is ever added, update `PHRASES` in `scripts/fetch-fonts.sh`
*and* `APPROVED` in `src/components/Arabic.tsx`, then rerun.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `--color-ink` | `#0B0A08` | near-black ground |
| `--color-amber` | `#F5B324` | rosette gold, primary accent |
| `--color-gold` | `#DFA31B` | deeper gold, hairlines and hover |
| `--color-umber` | `#8A5A12` | wordmark brown, secondary surfaces |
| `--color-ember` | `#C85D1E` | **CTA fill only** — never decoration |
| `--color-sand` | `#EFE4D2` | warm bone, primary text on dark |

Dark-first. `--color-ember` is reserved so the primary action never blends into
ornament; using it anywhere else breaks that contract.

**Two contrast constraints, measured not guessed** (see `docs/design-direction.md`):

- Ember was moved from the brief's `#C2571A` to `#C85D1E`. At the original value
  the Buy-on-Etsy button fails AA both ways — sand on it 3.57:1, ink on it
  4.40:1, against a 4.5:1 requirement. The CTA is **ember fill with ink text**,
  4.75:1.
- **`--color-umber` must never carry text on dark.** 3.35:1 on ink, below AA.
  It is a surface and hairline colour only. On light grounds (the wordmark) it
  is fine.
- `--color-sand` at 72% (`#AFA79A`) is the dimmed body text, still 8.31:1.

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

### Gotcha: `document.fonts.check()` lies when no `@font-face` exists

`document.fonts.check('16px Amiri')` returns **true** when there is no matching
`@font-face` rule at all — it reports "a font can render this", not "your webfont
loaded". It reported success while the Google Fonts stylesheet was failing with
`ERR_CONNECTION_RESET` and `document.fonts` was completely empty.

Verify a webfont actually loaded by checking `[...document.fonts]` is non-empty
with `status === "loaded"`, **and** by measuring: render the same string in the
target family and in a generic fallback and confirm the widths differ. Identical
widths mean you are still looking at the fallback.

### Gotcha: you cannot read a WebGL canvas back with `drawImage`

Sampling a WebGL canvas via `drawImage`/`getImageData`/`toDataURL` returns
**fully transparent black** unless the context was created with
`preserveDrawingBuffer: true` — the drawing buffer is cleared once the frame is
composited. This reported `litPixels: 0, maxAlpha: 0` on a scene that was
rendering perfectly, which reads exactly like a broken renderer.

Measure the **composited screenshot** instead: `page.screenshot()` then sample
the PNG. To prove the camera actually responds to input, screenshot the
**canvas element** (not the page) before and after, and diff the pixels — an
element screenshot travels with the element, so page scroll doesn't pollute the
comparison. Scrolling the page and clipping a fixed region measures the page
moving, not the camera.

Chromium needs `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`
to render WebGL headless here.

### Gotcha: `pathLength` is an SVG attribute, not a CSS property

Setting `pathLength: 1` in a CSS rule does nothing. It has to be the attribute
`pathLength={1}` on the `<path>`. Without it, `stroke-dasharray: 1` leaves a
one-unit dash on a path thousands of units long and the draw-in silently fails
while looking like it should work.

### Gotcha: `pkill -f` kills the tool shell

`pkill -f "vite preview"` matches the **agent's own shell**, because the
pattern string appears in that shell's command line. The invocation dies
mid-way with exit 144 and later commands silently never run. Start and stop
dev servers from inside a single script (Python `subprocess`) instead of
backgrounding them and pkill-ing by pattern.

# Master Build Prompt — Zahra Prints Catalog Site

Paste everything below the line into Claude Code (or Lovable) as your first message,
with `EtsyListingsDownload.csv`, `reviews.json`, and the logo PNG in the project folder.

---

Build a **catalog storefront** for **Zahra Prints**, an existing Etsy clothing brand.
Tagline: *"Quality on Wallahi."* This site does NOT process payments — every product
links out to Etsy for checkout. No cart, no login, no backend.

## Brand Identity

The logo is in the project folder: a gold/amber leafy rosette encircling a brown serif
**Z**, above a brown serif wordmark reading ZAHRA PRINTS, with the amber tagline
QUALITY ON WALLAHI beneath.

**Derive the palette from the logo** — build as CSS custom properties in `index.css`:
- `--ink: #0B0A08` — near-black, primary background
- `--amber: #F5B324` — the rosette gold, primary accent
- `--gold: #DFA31B` — deeper gold, hover states and hairlines
- `--umber: #8A5A12` — the wordmark brown, secondary surfaces
- `--ember: #C2571A` — burnt orange, reserved for CTAs only so they stand apart
- `--sand: #EFE4D2` — warm bone, primary text on dark

Dark-first: sand text on near-black, amber for accents and gold hairline detail, ember
strictly for "Buy on Etsy" buttons so the primary action never blends into decoration.

The logo PNG has a white background — extract or mask it to transparent before placing
it on dark surfaces. If a clean mask isn't achievable, rebuild the rosette as SVG.

**Typography** — a warm serif display face for headings that echoes the wordmark
(Cormorant Garamond, Playfair Display, or similar with real contrast), paired with a
clean geometric sans for body and UI. Tight tracking on headings, generous size.

## Cultural Accuracy — Read This Carefully

Do **not** invent, improvise, or approximate Arabic or Islamic visual elements. Two
separate rules apply, and they are not the same rule.

### Geometry — construct it properly

Islamic geometric pattern is a rule-based system, so implement the actual system rather
than drawing something that "looks Middle Eastern."

Use **girih tiling**. The five tiles, all with equal-length edges:
- Regular decagon, interior angles 144°
- Elongated hexagon, angles 72°/144°/144°/72°/144°/144°
- Bowtie (non-convex hexagon), angles 72°/72°/216°/72°/72°/216°
- Rhombus, angles 72°/108°
- Regular pentagon, angles 108°

Strapwork lines cross each edge at its **midpoint**, at **54°** to the edge. Draw the
straps, not the tile outlines — the tiles are scaffolding and must not be visible in the
final render. All angles are multiples of 36°, derived from tenfold symmetry.

Also acceptable, constructed to spec: **khatim** eight-point stars from two overlapped
squares at 45°, and **hexagonal/twelvefold** star rosettes built on a 30°/60° grid.

Generate these programmatically as SVG from the tile definitions, so the geometry is
correct by construction. Do not hand-wave paths that approximate the look. Do not use
clip art, icon fonts, emoji, or stock "arabesque" assets.

Reference material worth consulting before writing the generator: Eric Broug's
*Islamic Geometric Patterns*, and the Lu & Steinhardt girih tiling paper (Science, 2007).

### Arabic script — never draw it, always typeset it

AI-generated Arabic is reliably broken: disconnected letterforms, wrong contextual
shaping, invalid ligatures, meaningless strings. When the text is a sacred phrase, a
garbled render is not a cosmetic bug — it is offensive, and this brand's customers will
notice immediately.

Therefore:
- **Never** render Arabic as SVG paths, traced letterforms, or generated imagery.
- **Always** use real Unicode Arabic text in a real Arabic typeface. Load from Google
  Fonts: **Amiri** (naskh, for body/quotes), **Reem Kufi** (geometric kufi, for display),
  **Aref Ruqaa** (ruqaa, for ornamental headings), or **Scheherazade New**.
- Wrap all Arabic in `<span lang="ar" dir="rtl">` so shaping and bidi work correctly.
- Do not invent phrases. Use only these, or ask the shop owner before adding any other:
  - `بسم الله` — Bismillah
  - `الحمد لله` — Alhamdulillah
  - `رحمة` — Rahma (mercy)
  - `زهراء` — Zahra (the brand name)
- Do not stretch, skew, mirror, or distort Arabic text. No fake kashida stretching.
- Keep decorative Arabic minimal and purposeful. Sparse and correct beats abundant.

**The best calligraphy on this site is already in the product photography.** The garments
carry real designs — let the imagery do that work rather than generating competing
ornament around it.

## Data Architecture

Read the real data from the project folder rather than hardcoding anything.

**`EtsyListingsDownload.csv`** — 57 listings. Columns: TITLE, DESCRIPTION, PRICE,
CURRENCY_CODE, QUANTITY, TAGS, MATERIALS, IMAGE1–IMAGE10, VARIATION 1 TYPE/NAME/VALUES,
VARIATION 2 TYPE/NAME/VALUES, SKU.

Write a build-time script (`scripts/build-data.ts`) that converts it to
`src/data/products.json` with this shape:

```json
{
  "id": "slug-from-title",
  "title": "Full product title",
  "price": 69.99,
  "category": "hoodies",
  "images": ["url1", "url2"],
  "specs": { "Fabric": "85% cotton, 15% polyester" },
  "tags": ["arabic_calligraphy"],
  "colors": ["Black", "Dark Brown"],
  "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
  "etsyUrl": ""
}
```

Conversion rules:
- **DESCRIPTION is a spec sheet, not prose.** Every row is newline-separated `Key: Value`
  pairs — Gender, Model, Fabric, Fabric Weight, Fabric Thickness, Care Instructions,
  Features, Print Size. Parse into the `specs` object and render as a two-column table
  with gold hairline dividers. Never dump it as a paragraph.
- Derive `category` from title keywords: hoodie/sweatshirt → `hoodies`, shirt/tee →
  `tees`, pants/joggers/sweats → `pants`, compression → `compression`, jacket/zip →
  `outerwear`. Check `compression` before `tees` so compression shirts route correctly.
- IMAGE1–IMAGE10 → `images`, dropping empties. Products have 5–10 images each.
- `VARIATION 1 VALUES` is comma-separated colors (1–6 per product). Note the column
  header casing is inconsistent across rows (`Primary color`, `Color`, `color`) — match
  case-insensitively. `VARIATION 2 VALUES` is sizes, typically `S,M,L,XL,2XL,3XL`.
- TAGS are comma-separated with underscores — split and humanize for display.
- `etsyUrl` is **not in the CSV**. Emit it as an empty string and have the product page
  fall back to the shop's Etsy homepage when it's blank. Leave a clear TODO — these get
  filled in later.

**`reviews.json`** — 31 reviews, fields `reviewer`, `date_reviewed` (MM/DD/YYYY),
`star_rating`, `message`. Average is 4.97. **Filter out entries with an empty `message`**,
and de-duplicate near-identical reviews sharing an `order_id`.

Design against real constraints: titles run up to 140 characters and must truncate to two
lines cleanly; prices range $34.99–$89.99; all product images are portrait.

## Pages

**Home** — Hero with the logo mark, brand name, tagline, and one ember CTA. Animated
girih strapwork as a low-opacity background layer. Featured products (6, staggered
reveal). Brand story band. Category tiles. Review highlights. Footer.

**Shop** (`/shop`) — Responsive 2/3/4-column grid. Sticky filter rail: category, color,
size, price. Sort by price and newest. Cards swap to the second image on hover with a
gold hairline frame, title clamped to two lines, price in amber. Client-side only.

**Product** (`/product/:id`) — Gallery with thumbnail rail and lightbox zoom. Title,
price, color swatches, size pills (display-only — checkout is on Etsy). Large ember
**"Buy on Etsy"** button, unmistakably the primary action, sticky on mobile. Below: the
spec table, tag pills, and a same-category "You may also like" row.

**Reviews** (`/reviews`) — Large amber aggregate rating, star row, total count. Masonry
grid of review cards. Link out to Etsy for the full set.

**About** (`/about`) — Brand story, the meaning behind the designs, craftsmanship.
Editorial layout: large type, generous whitespace, girih dividers, full-bleed imagery.

## Motion & Technical

One optional WebGL moment on the homepage hero only — a slowly rotating girih-derived
polyhedron in amber against near-black, with gentle mouse parallax, using
`@react-three/fiber`. Static SVG fallback on mobile and under `prefers-reduced-motion`.
**Do not** put WebGL on grid or detail pages: 57 products at up to 10 images each means
performance matters more than spectacle, and most of this audience arrives on a phone.

Get the immersive feel elsewhere from CSS and Framer Motion: scroll reveals, magnetic
hover, marquee bands, image parallax, smooth scroll.

- Vite + React + TypeScript + Tailwind + shadcn/ui + React Router
- Responsive; verify the grid at 375px, 768px, 1440px
- Lazy-load images with explicit aspect ratios to prevent layout shift
- Etsy links: `target="_blank" rel="noopener noreferrer"`
- Semantic HTML, alt text everywhere, keyboard-navigable filters, visible focus states
- Respect `prefers-reduced-motion` throughout
- SEO: per-page titles, meta descriptions, Open Graph tags
- Etsy CDN image URLs (`i.etsystatic.com`) are temporary — structure the data layer so
  they can be swapped for local optimized assets later

Build the complete site in one pass. Prioritize a distinctive, culturally accurate visual
identity over generic e-commerce templates.

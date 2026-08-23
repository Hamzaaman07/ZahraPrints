# Design direction — Phase 2

Awaiting approval. No components built yet.

## 1. Palette

Dark-first, pinned to the logo. Contrast ratios are computed, not estimated.

### Brand tokens

| Token | Hex | On `--ink` | Role |
| --- | --- | --- | --- |
| `--ink` | `#0B0A08` | — | primary ground |
| `--sand` | `#EFE4D2` | 15.74:1 | primary text |
| `--amber` | `#F5B324` | 10.70:1 | primary accent, prices, aggregate rating |
| `--gold` | `#DFA31B` | 8.85:1 | hairlines, hover, strapwork |
| `--umber` | `#8A5A12` | 3.35:1 | **surfaces and rules only — never text** |
| `--ember` | `#C85D1E` | 4.93:1 | **CTA fill only** |

### Two findings that change the spec

**`--ember` is moved from `#C2571A` to `#C85D1E`.** At the original value the
Buy-on-Etsy button fails AA in both directions — sand on it is 3.57:1, ink on it
is 4.40:1, and AA normal text needs 4.5:1. The nudged value gives **ink text on
ember at 4.75:1**, which passes, while staying visibly the same burnt orange.
The button is therefore **ember fill, ink text** — which also reads as more
decisive than a washy tinted label.

**`--umber` can never carry text on dark.** At 3.35:1 it is below AA for normal
text. It is a surface and hairline colour: card grounds, table rules, inactive
borders. The wordmark uses it on *light* backgrounds only.

### Derived neutrals

| Token | Value | Role |
| --- | --- | --- |
| `--ink-raised` | `#14120E` | cards, filter rail, raised surfaces |
| `--ink-sunken` | `#070604` | header, footer, wells |
| `--sand-dim` | `#AFA79A` (sand @ 72%) | secondary text — 8.31:1, still AA |
| `--hairline` | `rgba(223,163,27,0.22)` | the gold rule that runs everywhere |

No shadows. No gradients. No glow. Depth comes from hairlines and ground shifts
only — which is what makes the one bold element land.

## 2. Typography

Three roles, **two Latin families**. Both are variable fonts, so this is two
files, not six — most of this audience arrives on a phone, and a third display
family would cost more than it returns.

**Display — Playfair Display (500, 700).**
The logo wordmark is *literally* set in it: `scripts/build_logo.py` outlines
Playfair to draw ZAHRA PRINTS, so headings and the logo are the same letterforms
rather than a near-match that reads as a mistake.

**Body and UI — Jost (400, 500, 600).**
A geometric Futura descendant whose wide, even caps echo the letterspaced
QUALITY ON WALLAHI, giving the tagline a family relationship with the interface;
it stays warm where Inter and Space Grotesk go cold and technical.

**Utility — Jost, uppercase, 0.18em tracking, 500.**
Filter labels, size pills, category names, spec-table keys and the price row;
using a register of the body face rather than a third family keeps the
letterspaced-caps motif consistent and costs zero extra bytes.

**Arabic — Amiri (400), for the four approved phrases only.**
A real naskh face, loaded subset. Arabic is always live Unicode in
`<span lang="ar" dir="rtl">`, never drawn — see CLAUDE.md.

### Type scale

Modular, ratio **1.333** (perfect fourth), fluid at the top end.

| Step | Size | Use |
| --- | --- | --- |
| `--fs-hero` | `clamp(3.5rem, 11vw, 8.5rem)` | hero wordmark |
| `--fs-1` | `clamp(2.6rem, 5.5vw, 4.2rem)` | section heads |
| `--fs-2` | `2.37rem` | sub-heads |
| `--fs-3` | `1.78rem` | product title, large |
| `--fs-4` | `1.33rem` | lead paragraphs |
| `--fs-5` | `1rem` | body |
| `--fs-6` | `0.833rem` | utility caps, labels |

Display sits at `-0.02em` tracking and `0.95` line-height. Body at `1.6`.

## 3. Layout concept

**Asymmetric editorial, not centred e-commerce.** The default shape for this
brief — centred hero, three-up card grid, testimonial band — is the thing to
avoid on the free axes. So: content sits on an off-centre spine, sections
deliberately break alignment with each other, and product runs stagger
vertically rather than marching in a even row. All product images are portrait,
which makes vertical offset natural instead of forced.

Discipline: one accent per section, hairlines instead of boxes, and generous
dead space so the one bold element has room to be bold.

### Homepage wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ ◈ ZAHRA PRINTS       SHOP  REVIEWS  ABOUT        [ Etsy ↗ ]     │ sticky · ink-sunken · gold hairline
├════════════════════════════════════════════════════════════════┤
│▓▓▓▓▓▓▓▓▓▓▓ ONE continuous girih strapwork field ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓┌──────────────────────────────────┐▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓│  ◈                               │▓▓▓  the field is CLEARED│
│▓▓▓│  Z A H R A                       │▓▓▓  behind the type,    │
│▓▓▓│  P R I N T S                     │▓▓▓  not dimmed under it │
│▓▓▓│  Quality on Wallahi              │▓▓▓  — a window cut in a │
│▓▓▓│  ▐ SHOP THE COLLECTION ▌         │▓▓▓  carved screen       │
│▓▓▓└──────────────────────────────────┘▓▓▓                      │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
├────────────────────────────────────────────────────────────────┤
│  FEATURED                                          01 — 06     │
│                                                                │
│   ┌────────┐                  ┌────────┐                       │
│   │        │   ┌────────┐     │        │    staggered run:     │
│   │  4:5   │   │        │     │  4:5   │    alternating y-off  │
│   │        │   │  4:5   │     │        │    breaks the grid    │
│   └────────┘   │        │     └────────┘    rhythm on purpose  │
│   Title two…   └────────┘     Title two…                       │
│   $69.99       Title two…     $54.99                           │
│                $34.99                                          │
├────────────────────────────────────────────────────────────────┤
│         ╱╲  strapwork divider — cut from the same field         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Made for people who     │  رحمة                              │ Amiri, one word,
│   wear what they mean.    │  Rahma — mercy.                    │ the only Arabic
│   ~54ch of story, set     │                                    │ on the page
│   at --fs-4               │                                    │
├────────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │ 36° notched
│  │HOODIE│ │ TEES │ │PANTS │ │COMPR.│ │OUTER │  corners — the   │ corners, gold
│  │  16  │ │  20  │ │  14  │ │  4   │ │  3   │  geometry at     │ hairline
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  small scale     │
├────────────────────────────────────────────────────────────────┤
│   4.97 ★★★★★                "Quality on wallahi, this hoodie…" │
│   ─────                     — Ricardo                          │
│   28 written reviews        "Thick soft hoodie. Good quality."  │
│   [ read all ]              — dina                             │
├════════════════════════════════════════════════════════════════┤
│ ◈ ZAHRA PRINTS · horizontal lockup    shop · reviews · about    │
│ Checkout happens on Etsy.                                       │
└────────────────────────────────────────────────────────────────┘
```

Breakpoints: 375 / 768 / 1440. The stagger flattens to a single column at 375
and to two columns at 768; the hero window goes full-width with the field
bleeding top and bottom only.

## 4. Signature element — **the carved ground**

**One continuous girih strapwork field, generated once at page scale, that every
section is a window onto.**

Not a repeating background tile. A single field is generated from the five girih
tile definitions — decagon, elongated hexagon, bowtie, rhombus, pentagon, all
equal-edged — with strapwork crossing each edge at its midpoint at 54°, straps
extended to their intersections, and the tile scaffolding discarded before
render. Correctness follows from construction, per Phase 3.

What makes it memorable rather than wallpaper:

- **It is one object.** Sections reveal different regions of the same field, so
  scrolling reads as travelling across a single carved screen rather than past
  repeated motifs. Nothing else on the site can be screenshotted and mistaken
  for another store.
- **It draws itself in.** On the hero, `stroke-dashoffset` runs the straps in
  over ~2.4s on load, so the tenfold symmetry is *revealed as a construction*
  — the geometry teaches itself.
- **The hero type is a hole in it,** not a layer on top: the field is cleared
  behind the lockup, echoing a jali screen with an opening.
- **It propagates down in scale.** Product-card frames and category tiles take
  36°/54° notched corners from the same angle vocabulary, so the geometry
  reaches the UI without adding ornament that competes with the garment
  photography.

Everything else stays flat and hairline-ruled. That is the trade: all the
boldness is spent here.

Reduced motion: no draw-in, no parallax, static field at the same opacity.

## Decisions taken on the open questions

- **Aggregate rating shows 4.97** — the true average across all 31 Etsy reviews
  — with "28 written reviews" as a separate, honest count beneath it. Showing
  4.96 would understate the shop because all three filtered entries were 5-star.
- **`blurb` stays** in the schema. It is real brand copy; the product page runs
  it above the spec table, and it is the only content the 5 spec-less listings
  have.

## Flagged early: the WebGL moment probably doesn't earn its place

Phase 5 permits one WebGL polyhedron on the hero. It would compete directly with
the carved-ground draw-in for the same attention in the same viewport, and it
costs `@react-three/fiber` on a page whose audience is mostly on phones. My
recommendation is to cut it and let the strapwork field be the hero moment.
Raising it now rather than at Phase 5 so the work isn't done twice.

# Zahra Prints — logo assets

All four files are pure vector on a **transparent background**: no `<image>`, no
`<rect>` backdrop, no `<text>`, and no webfont dependency. Type is baked to real
outlines, so they render identically everywhere — browser, Illustrator, Figma,
Cricut, a print shop's RIP.

| File | Use |
| --- | --- |
| `logo-full.svg` | Full lockup, brown wordmark — for light surfaces |
| `logo-full-on-dark.svg` | Full lockup, sand wordmark — for the near-black site |
| `logo-mark.svg` | Wreath + Z only, brown monogram — light surfaces |
| `logo-mark-on-dark.svg` | Wreath + Z only, sand monogram — favicon, nav, social avatar |

Colours are the brand tokens: amber `#F5B324`, gold `#DFA31B`, umber `#8A5A12`,
sand `#EFE4D2`.

## How these were made

`scripts/build_logo.py` generates them. Rerun after any edit:

```
pip install fonttools
python3 scripts/build_logo.py
```

The wreath is **constructed, not traced** — one sprig is defined once and
rotated 45° eight times, so the eightfold symmetry is exact and the silhouette
stays clean at any size. Adjust `LEAVES`, `DOTS`, `STEM_R`, and `STEM_DIP` at
the top of the script to reshape it; everything re-derives from those.

Wordmark and tagline are set in Playfair Display (`assets/fonts/`) and converted
to outlines at build time. `solve_tracking()` computes the letterspacing needed
to hit an exact run width, which is how the lockup keeps the original's wide,
editorial proportions.

## Note on fidelity

The source logo reached the session as a pasted image rather than a file, so
there was no raster to auto-trace. These are a clean-room rebuild measured
against the original: the proportions, palette, eightfold wreath, centred serif
Z, and letterspaced wordmark all match, but individual leaf curves are newly
drawn rather than traced. If you drop the original PNG into the repo, the leaf
shapes can be retraced against it for an exact match.

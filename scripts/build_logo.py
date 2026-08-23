#!/usr/bin/env python3
"""
Rebuild the Zahra Prints logo as clean, transparent-background SVG.

The mark is constructed geometrically (8-fold rotational symmetry, one sprig
definition rotated 45 degrees at a time) rather than traced, so the wreath is
correct by construction and stays crisp at any size.

Type is converted to real outlines from the bundled Playfair Display files, so
the finished SVGs carry no font dependency at all.

    python3 scripts/build_logo.py

Outputs into public/brand/.
"""

from __future__ import annotations

import math
import os
from typing import List, Tuple

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

# --------------------------------------------------------------------------
# Brand palette (from the master brief)
# --------------------------------------------------------------------------
AMBER = "#F5B324"   # rosette gold, primary accent
GOLD = "#DFA31B"    # deeper gold, depth + hairlines
UMBER = "#8A5A12"   # wordmark brown
SAND = "#EFE4D2"    # warm bone, for use on dark surfaces

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
OUT_DIR = os.path.join(ROOT, "public", "brand")

# --------------------------------------------------------------------------
# Mark geometry
# --------------------------------------------------------------------------
CX = CY = 200.0        # mark is authored on a 400x400 canvas
SPRIGS = 8             # eightfold symmetry
STEM_R = 118.0         # where each stem springs from
STEM_SPAN = 23.0       # half-width of a stem arc, in degrees
STEM_DIP = 89.0        # control radius; pulls the stem inward into a scallop


def polar(r: float, deg: float) -> Tuple[float, float]:
    """Point at radius r and angle deg, measured clockwise from straight up."""
    t = math.radians(deg)
    return CX + r * math.sin(t), CY - r * math.cos(t)


def fmt(*vals: float) -> str:
    return " ".join(f"{v:.2f}" for v in vals)


def leaf_points(base: Tuple[float, float], deg: float, length: float,
                width: float, curl: float) -> List[Tuple[float, float]]:
    """
    Map a leaf outline from local (lateral, along-stem) space into canvas space.

    The leaf grows from `base` in direction `deg`. `curl` drifts the outline
    sideways in proportion to the square of the distance travelled, which hooks
    the tip over and keeps the shape from reading as a plain symmetric almond.
    """
    a = math.radians(deg)
    ux, uy = math.cos(a), math.sin(a)      # lateral axis
    vx, vy = math.sin(a), -math.cos(a)     # growth axis
    bx, by = base

    def pt(u: float, v: float) -> Tuple[float, float]:
        u += curl * width * (v / length) ** 2
        return bx + u * ux + v * vx, by + u * uy + v * vy

    L, W = length, width
    return [
        pt(0.0, 0.0),                                    # base
        pt(W * 0.86, L * 0.16), pt(W * 1.04, L * 0.58),  # outward edge
        pt(0.0, L),                                      # tip
        pt(-W * 0.94, L * 0.62), pt(-W * 0.74, L * 0.17),  # return edge
        pt(0.0, L * 0.10), pt(curl * W * 0.28, L * 0.52),  # vein start / ctrl
        pt(curl * W * 0.82, L * 0.84),                   # vein end
    ]


def leaf_path(base, deg, length, width, curl) -> str:
    p = leaf_points(base, deg, length, width, curl)
    return (
        f"M {fmt(*p[0])} C {fmt(*p[1])} {fmt(*p[2])} {fmt(*p[3])} "
        f"C {fmt(*p[4])} {fmt(*p[5])} {fmt(*p[0])} Z"
    )


def vein_path(base, deg, length, width, curl) -> str:
    p = leaf_points(base, deg, length, width, curl)
    return f"M {fmt(*p[6])} Q {fmt(*p[7])} {fmt(*p[8])}"


# Each entry is one leaf on the sprig: (base_r, base_deg, direction_deg,
# length, width, curl, fill). Directions are relative to the sprig axis, so the
# whole arrangement pinwheels the same way the original mark does.
LEAVES = [
    (112.0, -5.0, -25.0, 84.0, 27.0, 0.55, AMBER),   # dominant outward leaf
    (110.0, 11.0, 34.0, 60.0, 21.0, -0.45, GOLD),    # smaller outward leaf
    (120.0, -19.0, -6.0, 40.0, 14.0, 0.40, GOLD),    # filler, leans back
    (104.0, 19.0, 179.0, 23.0, 10.0, 0.35, AMBER),   # inward leaf
]

DOTS = [
    (97.0, -17.0, 5.4, GOLD),
    (127.0, 25.0, 4.0, AMBER),
]


def sprig() -> str:
    """One repeating unit of the wreath, drawn along the straight-up axis."""
    out: List[str] = []

    start = polar(STEM_R, -STEM_SPAN)
    ctrl = polar(STEM_DIP, 0.0)
    end = polar(STEM_R, STEM_SPAN)
    out.append(
        f'    <path d="M {fmt(*start)} Q {fmt(*ctrl)} {fmt(*end)}" '
        f'fill="none" stroke="{GOLD}" stroke-width="6" stroke-linecap="round"/>'
    )

    for base_r, base_deg, dir_deg, length, width, curl, fill in LEAVES:
        base = polar(base_r, base_deg)
        out.append(
            f'    <path d="{leaf_path(base, dir_deg, length, width, curl)}" fill="{fill}"/>'
        )
        out.append(
            f'    <path d="{vein_path(base, dir_deg, length, width, curl)}" fill="none" '
            f'stroke="{UMBER}" stroke-width="{width * 0.11:.2f}" '
            f'stroke-linecap="round" opacity="0.30"/>'
        )

    for r, deg, rad, fill in DOTS:
        x, y = polar(r, deg)
        out.append(f'    <circle cx="{x:.2f}" cy="{y:.2f}" r="{rad}" fill="{fill}"/>')

    return "\n".join(out)


def wreath(indent: str = "  ") -> str:
    unit = sprig()
    parts = []
    for i in range(SPRIGS):
        angle = i * (360.0 / SPRIGS)
        parts.append(
            f'{indent}<g transform="rotate({angle:.0f} {CX:.0f} {CY:.0f})">\n'
            f"{unit}\n{indent}</g>"
        )
    return "\n".join(parts)


# --------------------------------------------------------------------------
# Type -> outlines
# --------------------------------------------------------------------------
class TypeSetter:
    def __init__(self, path: str):
        self.font = TTFont(path)
        self.upem = self.font["head"].unitsPerEm
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.hmtx = self.font["hmtx"]
        cap = getattr(self.font["OS/2"], "sCapHeight", 0)
        self.cap_height = cap or self._measure_cap()

    def _measure_cap(self) -> float:
        from fontTools.pens.boundsPen import BoundsPen
        pen = BoundsPen(self.glyphs)
        self.glyphs[self.cmap[ord("H")]].draw(pen)
        return pen.bounds[3]

    def _name(self, ch: str) -> str:
        return self.cmap[ord(ch)]

    def advance(self, ch: str) -> float:
        return self.hmtx[self._name(ch)][0]

    def run_width(self, text: str, size: float, tracking: float,
                  word_extra: float = 0.0) -> float:
        s = size / self.cap_height
        w = sum(self.advance(c) * s for c in text)
        w += word_extra * text.count(" ")
        return w + tracking * max(len(text) - 1, 0)

    def solve_tracking(self, text: str, size: float, target_width: float,
                       word_extra: float = 0.0) -> float:
        """Letterspacing that makes the run measure exactly `target_width`."""
        gaps = max(len(text) - 1, 1)
        return (target_width - self.run_width(text, size, 0.0, word_extra)) / gaps

    def outlines(self, text: str, size: float, tracking: float,
                 x: float, baseline: float, anchor: str = "middle",
                 word_extra: float = 0.0) -> str:
        """Return one path `d` covering the whole run, drawn as real contours."""
        s = size / self.cap_height
        if anchor == "middle":
            x -= self.run_width(text, size, tracking, word_extra) / 2.0

        d: List[str] = []
        pen_x = x
        for ch in text:
            adv = self.advance(ch) * s
            if not ch.isspace():
                svg_pen = SVGPathPen(self.glyphs, ntos=lambda v: f"{v:.2f}")
                # Font space is y-up; flip it and drop the glyph on the baseline.
                tpen = TransformPen(svg_pen, (s, 0, 0, -s, pen_x, baseline))
                self.glyphs[self._name(ch)].draw(tpen)
                seg = svg_pen.getCommands()
                if seg:
                    d.append(seg)
            pen_x += adv + tracking + (word_extra if ch == " " else 0.0)
        return " ".join(d)


# --------------------------------------------------------------------------
# Document assembly
# --------------------------------------------------------------------------
HEADER = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" '
    'height="{h}" fill="none" role="img" aria-labelledby="{tid}">\n'
    "  <title id=\"{tid}\">{title}</title>\n"
)


def document(vb: str, w: float, h: float, tid: str, title: str, body: str) -> str:
    head = HEADER.format(vb=vb, w=f"{w:g}", h=f"{h:g}", tid=tid, title=title)
    return head + body + "\n</svg>\n"


def build() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    bold = TypeSetter(os.path.join(FONT_DIR, "PlayfairDisplay-700.ttf"))
    medium = TypeSetter(os.path.join(FONT_DIR, "PlayfairDisplay-500.ttf"))

    # --- the mark on its own -------------------------------------------------
    z_d = bold.outlines("Z", size=74.0, tracking=0.0, x=CX, baseline=CY + 37.0)
    mark_body = wreath() + f'\n  <path d="{z_d}" fill="{UMBER}"/>'
    mark = document("0 0 400 400", 400, 400, "zp-mark",
                    "Zahra Prints monogram", mark_body)
    write("logo-mark.svg", mark)

    # A version whose monogram reads on near-black surfaces.
    write("logo-mark-on-dark.svg",
          mark.replace(f'"{z_d}" fill="{UMBER}"', f'"{z_d}" fill="{SAND}"')
              .replace("zp-mark", "zp-mark-dark"))

    # --- full lockup ---------------------------------------------------------
    # 1200x690 keeps the proportions of the original artwork. The measurements
    # below are taken off it: the wordmark is deliberately far wider than the
    # mark, which is what gives the lockup its horizontal, editorial stance.
    mark_scale = 0.76
    mark_x = 600 - (400 * mark_scale) / 2
    mark_y = 95

    word_size, word_width, word_gap = 85.0, 1085.0, 26.0
    word_track = bold.solve_tracking("ZAHRA PRINTS", word_size, word_width, word_gap)
    word_d = bold.outlines("ZAHRA PRINTS", size=word_size, tracking=word_track,
                           x=600.0, baseline=525.0, word_extra=word_gap)

    tag_size, tag_width, tag_gap = 30.0, 915.0, 14.0
    tag_track = medium.solve_tracking("QUALITY ON WALLAHI", tag_size, tag_width, tag_gap)
    tag_d = medium.outlines("QUALITY ON WALLAHI", size=tag_size, tracking=tag_track,
                            x=600.0, baseline=582.0, word_extra=tag_gap)
    print(f"  wordmark tracking {word_track:.1f}px  ·  tagline tracking {tag_track:.1f}px")

    def lockup(word_fill: str, tid: str) -> str:
        body = (
            f'  <g transform="translate({mark_x:.2f} {mark_y:.2f}) '
            f'scale({mark_scale})">\n{wreath("    ")}\n'
            f'    <path d="{z_d}" fill="{word_fill}"/>\n  </g>\n'
            f'  <path d="{word_d}" fill="{word_fill}"/>\n'
            f'  <path d="{tag_d}" fill="{AMBER}"/>'
        )
        return document("0 0 1200 690", 1200, 690, tid,
                        "Zahra Prints — Quality on Wallahi", body)

    write("logo-full.svg", lockup(UMBER, "zp-full"))
    write("logo-full-on-dark.svg", lockup(SAND, "zp-full-dark"))


def write(name: str, svg: str) -> None:
    path = os.path.join(OUT_DIR, name)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(svg)
    print(f"{name:28} {len(svg.encode('utf-8')) / 1024:6.1f} KB")


if __name__ == "__main__":
    build()

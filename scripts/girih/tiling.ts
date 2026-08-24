/**
 * Edge-matched tiling.
 *
 * Because all five tiles share one edge length, a tile can be seated against
 * any existing free edge by a single rotation plus translation. Nothing is
 * positioned by hand: a placement is accepted only if the transformed tile
 * overlaps nothing already placed, so the patch is valid by construction.
 */
import type { TileName, Vec } from "./tiles.js";
import { add, len, mid, rotate, sub, tileVertices } from "./tiles.js";
import { strapsFor } from "./strapwork.js";
import type { Strap } from "./strapwork.js";

export interface Placed {
  name: TileName;
  verts: Vec[];
}

const angleOf = (v: Vec) => Math.atan2(v[1], v[0]);

export function centroid(verts: Vec[]): Vec {
  const s = verts.reduce<Vec>((a, v) => add(a, v), [0, 0]);
  return [s[0] / verts.length, s[1] / verts.length];
}

/**
 * Seat `name` so that its edge `edgeIndex` lands on the segment B->A. Passing
 * the target edge reversed puts the new tile on the far side of it.
 */
function seat(name: TileName, edgeIndex: number, A: Vec, B: Vec): Placed {
  const local = tileVertices(name);
  const a = local[edgeIndex];
  const b = local[(edgeIndex + 1) % local.length];
  const deg = ((angleOf(sub(A, B)) - angleOf(sub(b, a))) * 180) / Math.PI;
  const rotated = local.map((p) => rotate(p, deg));
  const shift = sub(B, rotated[edgeIndex]);
  return { name, verts: rotated.map((p) => add(p, shift)) };
}

function pointInPolygon([x, y]: Vec, verts: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const [xi, yi] = verts[i], [xj, yj] = verts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Pull a point slightly toward the centroid so shared edges don't read as overlap. */
const inset = (p: Vec, c: Vec): Vec => [p[0] + (c[0] - p[0]) * 0.02, p[1] + (c[1] - p[1]) * 0.02];

function overlaps(candidate: Placed, placed: Placed[]): boolean {
  const cc = centroid(candidate.verts);
  const probes = [cc, ...candidate.verts.map((v) => inset(v, cc)),
                  ...candidate.verts.map((v, i) => inset(mid(v, candidate.verts[(i + 1) % candidate.verts.length]), cc))];
  for (const tile of placed) {
    const tc = centroid(tile.verts);
    if (probes.some((p) => pointInPolygon(p, tile.verts))) return true;
    const back = [tc, ...tile.verts.map((v) => inset(v, tc))];
    if (back.some((p) => pointInPolygon(p, candidate.verts))) return true;
  }
  return false;
}

const key = ([x, y]: Vec) => `${x.toFixed(4)},${y.toFixed(4)}`;
const edgeKey = (a: Vec, b: Vec) => [key(a), key(b)].sort().join("|");

/**
 * Grow the patch in two phases.
 *
 * Growing greedily in one pass looks wrong: the first decagon that fits wins,
 * after which decagons rarely fit again, so the field fills with elongated
 * hexagons and the ten-pointed stars end up sparse and scattered. Historical
 * girih reads regular because the decagons sit on a network of their own.
 *
 * So phase one lays decagons edge-to-edge and lets overlap rejection space
 * them: neighbours 36° apart collide, neighbours 72° apart clear (centre gap
 * 361.8 against a circumdiameter of 323.6), which yields the classic ring of
 * five. Phase two fills whatever is left between them.
 */
export function growNetwork(maxTiles: number, radius: number): Placed[] {
  const placed: Placed[] = [{ name: "decagon", verts: tileVertices("decagon") }];

  // Phase 1 — the decagon network.
  for (let i = 0; i < placed.length && placed.length < maxTiles; i++) {
    const tile = placed[i];
    if (tile.name !== "decagon") continue;
    tile.verts.forEach((v, e) => {
      const w = tile.verts[(e + 1) % tile.verts.length];
      if (len(centroid([v, w])) > radius) return;
      for (let k = 0; k < 10; k++) {
        const cand = seat("decagon", k, v, w);
        if (len(centroid(cand.verts)) > radius) continue;
        if (!overlaps(cand, placed)) { placed.push(cand); break; }
      }
    });
  }

  // Phase 2 — fill the gaps, smallest-first so thin slots still close.
  const fillers: TileName[] = ["bowtie", "hexagon", "pentagon", "rhombus"];
  for (let pass = 0; pass < 12; pass++) {
    const before = placed.length;
    for (let i = 0; i < placed.length && placed.length < maxTiles; i++) {
      const tile = placed[i];
      tile.verts.forEach((v, e) => {
        const w = tile.verts[(e + 1) % tile.verts.length];
        if (len(centroid([v, w])) > radius) return;
        for (const name of fillers) {
          const n = tileVertices(name).length;
          let done = false;
          for (let k = 0; k < n && !done; k++) {
            const cand = seat(name, k, v, w);
            if (len(centroid(cand.verts)) > radius) continue;
            if (!overlaps(cand, placed)) { placed.push(cand); done = true; }
          }
          if (done) break;
        }
      });
    }
    if (placed.length === before) break;
  }
  return placed;
}

/** Grow a patch outward from a seed tile, largest tiles first. */
export function growTiling(seed: TileName, maxTiles: number, radius: number): Placed[] {
  const order: TileName[] = ["decagon", "hexagon", "bowtie", "pentagon", "rhombus"];
  const placed: Placed[] = [{ name: seed, verts: tileVertices(seed) }];
  const used = new Set<string>();
  const frontier: Array<{ a: Vec; b: Vec }> = [];

  const pushEdges = (t: Placed) => {
    t.verts.forEach((v, i) => {
      const w = t.verts[(i + 1) % t.verts.length];
      const k = edgeKey(v, w);
      if (used.has(k)) return;
      used.add(k);
      frontier.push({ a: v, b: w });
    });
  };
  pushEdges(placed[0]);

  while (frontier.length && placed.length < maxTiles) {
    const { a, b } = frontier.shift()!;
    if (len(centroid([a, b])) > radius) continue;

    for (const name of order) {
      const n = tileVertices(name).length;
      let seated: Placed | null = null;
      for (let e = 0; e < n && !seated; e++) {
        const cand = seat(name, e, a, b);
        if (!overlaps(cand, placed)) seated = cand;
      }
      if (seated) { placed.push(seated); pushEdges(seated); break; }
    }
  }
  return placed;
}

/** All straps from a patch, in world coordinates, deduped across shared edges. */
export function strapsOf(placed: Placed[]): Strap[] {
  const out: Strap[] = [];
  const seen = new Set<string>();
  for (const tile of placed) {
    const local = tileVertices(tile.name);
    const c = centroid(tile.verts);
    const lc = centroid(local);
    const deg = ((angleOf(sub(tile.verts[0], c)) - angleOf(sub(local[0], lc))) * 180) / Math.PI;
    for (const s of strapsFor(local)) {
      const pts = s.points.map((p) => add(rotate(sub(p, lc), deg), c));
      const k = pts.map(key).join(">");
      const rk = [...pts].reverse().map(key).join(">");
      if (seen.has(k) || seen.has(rk)) continue;
      seen.add(k);
      out.push({ points: pts });
    }
  }
  return out;
}

/**
 * Strapwork by construction (the "polygons in contact" method).
 *
 * At the midpoint of every tile edge, two strap lines cross at 54° to that
 * edge. Inside a tile each line runs on until it either reaches another edge
 * midpoint, or turns where it meets a partner line symmetrically.
 *
 * The tile outlines are scaffolding. Only the straps are ever emitted.
 */
import type { Vec } from "./tiles.js";
import { add, len, mid, norm, rotate, scale, signedArea, sub } from "./tiles.js";

/** The defining angle of girih strapwork. */
export const STRAP_ANGLE = 54;

export interface Ray {
  origin: Vec;
  dir: Vec;
  edgeIndex: number;
}

/** A strap runs midpoint -> [optional corner] -> midpoint. */
export interface Strap {
  points: Vec[];
}

/** Two inward rays per edge midpoint, each at STRAP_ANGLE to the edge. */
export function raysFor(verts: Vec[]): Ray[] {
  const ccw = signedArea(verts) > 0;
  const rays: Ray[] = [];

  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const edge = norm(sub(b, a));
    // With CCW winding the interior is left of the edge direction, so both
    // +54° and +126° point inward, leaning opposite ways along the edge.
    const turns = ccw ? [STRAP_ANGLE, 180 - STRAP_ANGLE] : [-STRAP_ANGLE, STRAP_ANGLE - 180];
    for (const t of turns) rays.push({ origin: mid(a, b), dir: rotate(edge, t), edgeIndex: i });
  }
  return rays;
}

function intersect(p: Ray, q: Ray): { point: Vec; t: number; u: number } | null {
  const [px, py] = p.origin, [dx, dy] = p.dir;
  const [qx, qy] = q.origin, [ex, ey] = q.dir;
  const denom = dx * ey - dy * ex;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((qx - px) * ey - (qy - py) * ex) / denom;
  const u = ((qx - px) * dy - (qy - py) * dx) / denom;
  if (t < 1e-6 || u < 1e-6) return null;
  return { point: add(p.origin, scale(p.dir, t)), t, u };
}

/** Ray casting, so it stays correct on the non-convex bowtie. */
export function pointInPolygon([x, y]: Vec, verts: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const [xi, yi] = verts[i], [xj, yj] = verts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Where each ray ends.
 *
 * Straps weave over and under one another, so an intersection is not by itself
 * a stopping point. A ray ends only when it
 *   (a) arrives at another edge midpoint — a straight strap, no corner; or
 *   (b) meets a partner ray symmetrically, both having run the same distance,
 *       which is a mirror line of the tile and therefore a genuine corner.
 * Everything nearer than that is a crossing it passes straight through.
 *
 * Using symmetry rather than "nearest hit" is what makes the decagon resolve
 * into a ten-pointed star instead of a ring of short chords.
 */
function terminusFor(rays: Ray[], i: number, verts: Vec[], mids: Vec[]) {
  const ray = rays[i];
  let best: { t: number; point: Vec; partner: number | null } | null = null;

  // (a) straight run to another midpoint
  mids.forEach((m, k) => {
    if (k === ray.edgeIndex) return;
    const delta = sub(m, ray.origin);
    const t = len(delta);
    if (t < 1e-6) return;
    if (len(sub(norm(delta), ray.dir)) > 1e-6) return; // not along this ray
    if (!best || t < best.t - 1e-9) best = { t, point: m, partner: null };
  });

  // (b) symmetric corner, which must fall strictly inside the tile
  for (let j = 0; j < rays.length; j++) {
    if (j === i || rays[j].edgeIndex === ray.edgeIndex) continue;
    const hit = intersect(ray, rays[j]);
    if (!hit || Math.abs(hit.t - hit.u) > 1e-6) continue;
    if (!pointInPolygon(hit.point, verts)) continue;
    if (!best || hit.t < best.t - 1e-9) best = { t: hit.t, point: hit.point, partner: j };
  }
  return best as { t: number; point: Vec; partner: number | null } | null;
}

export function strapsFor(verts: Vec[]): Strap[] {
  const rays = raysFor(verts);
  const mids = verts.map((p, i) => mid(p, verts[(i + 1) % verts.length]));
  const ends = rays.map((_, i) => terminusFor(rays, i, verts, mids));
  const straps: Strap[] = [];
  const seen = new Set<string>();

  ends.forEach((end, i) => {
    if (!end) return;
    if (end.partner === null) {
      // Straight strap between two midpoints; dedupe the mirrored traversal.
      const key = [ray_key(rays[i].origin), ray_key(end.point)].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      straps.push({ points: [rays[i].origin, end.point] });
    } else if (end.partner > i) {
      straps.push({ points: [rays[i].origin, end.point, rays[end.partner].origin] });
    }
  });
  return straps;
}

const ray_key = ([x, y]: Vec) => `${x.toFixed(6)},${y.toFixed(6)}`;

/** Angle between a strap's first leg and the edge it springs from. */
export function measureStrapAngle(verts: Vec[], strap: Strap): number {
  const [start, next] = strap.points;
  let bestAngle = NaN, bestDist = Infinity;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i], b = verts[(i + 1) % verts.length];
    const d = len(sub(mid(a, b), start));
    if (d < bestDist) {
      bestDist = d;
      const edge = norm(sub(b, a));
      const leg = norm(sub(next, start));
      const dot = Math.max(-1, Math.min(1, edge[0] * leg[0] + edge[1] * leg[1]));
      const deg = (Math.acos(dot) * 180) / Math.PI;
      bestAngle = Math.min(deg, 180 - deg);
    }
  }
  return bestAngle;
}

/**
 * The five girih tiles.
 *
 * All five share one edge length. Every interior angle is a multiple of 36°,
 * which is what makes the set close up under tenfold symmetry. Vertices are
 * *derived* from the angle sequences by walking the boundary — they are never
 * typed in as coordinates, so a wrong angle fails loudly at build time instead
 * of quietly drawing something that merely looks plausible.
 */

export type Vec = readonly [number, number];
export type TileName = "decagon" | "hexagon" | "bowtie" | "rhombus" | "pentagon";

/** Shared edge length for every tile. */
export const EDGE = 100;

/** Interior angles, in order, walking each tile counter-clockwise. */
export const TILE_ANGLES: Record<TileName, readonly number[]> = {
  decagon: [144, 144, 144, 144, 144, 144, 144, 144, 144, 144],
  hexagon: [72, 144, 144, 72, 144, 144],
  bowtie: [72, 72, 216, 72, 72, 216],
  rhombus: [72, 108, 72, 108],
  pentagon: [108, 108, 108, 108, 108],
};

const rad = (deg: number) => (deg * Math.PI) / 180;

export function rotate([x, y]: Vec, deg: number): Vec {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [x * c - y * s, x * s + y * c];
}

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const mid = (a: Vec, b: Vec): Vec => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
export const len = (a: Vec): number => Math.hypot(a[0], a[1]);
export const norm = (a: Vec): Vec => scale(a, 1 / len(a));

/**
 * Walk the boundary: step one edge, turn by the exterior angle, repeat. A
 * polygon closes only if its exterior angles sum to 360°, so this doubles as a
 * check on the angle table.
 */
export function tileVertices(name: TileName): Vec[] {
  const interior = TILE_ANGLES[name];
  const verts: Vec[] = [];
  let point: Vec = [0, 0];
  let heading = 0;

  for (let i = 0; i < interior.length; i++) {
    verts.push(point);
    point = add(point, rotate([EDGE, 0], heading));
    // Exterior angle at the vertex we just arrived at.
    heading += 180 - interior[(i + 1) % interior.length];
  }

  const gap = len(sub(point, verts[0]));
  if (gap > 1e-6) {
    throw new Error(`${name} does not close: endpoint is ${gap.toFixed(4)} from start`);
  }
  return centre(verts);
}

/** Recentre on the centroid so tiles rotate about themselves. */
function centre(verts: Vec[]): Vec[] {
  const c = verts.reduce<Vec>((a, v) => add(a, v), [0, 0]);
  const o = scale(c, 1 / verts.length);
  return verts.map((v) => sub(v, o));
}

/** Signed area; positive means counter-clockwise. Strapwork needs the winding. */
export function signedArea(verts: Vec[]): number {
  let sum = 0;
  for (let i = 0; i < verts.length; i++) {
    const [x1, y1] = verts[i];
    const [x2, y2] = verts[(i + 1) % verts.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

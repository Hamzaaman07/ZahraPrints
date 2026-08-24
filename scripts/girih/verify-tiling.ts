import { growNetwork, centroid, strapsOf } from "./tiling.js";
import { tileVertices, sub, len, EDGE } from "./tiles.js";
import type { Vec } from "./tiles.js";

import { checker } from "./assert.js";
const { check, done } = checker();

const patch = growNetwork(400, 900);
const counts: Record<string, number> = {};
for (const t of patch) counts[t.name] = (counts[t.name] ?? 0) + 1;
console.log(`placed ${patch.length} tiles:`, counts);

// 1. Every placed tile keeps the shared edge length.
let worstEdge = 0;
for (const t of patch) {
  for (let i = 0; i < t.verts.length; i++) {
    worstEdge = Math.max(worstEdge, Math.abs(len(sub(t.verts[(i + 1) % t.verts.length], t.verts[i])) - EDGE));
  }
}
check(worstEdge < 1e-6, `all edges still ${EDGE} (max drift ${worstEdge.toExponential(1)}) OK`,
      `edge length drifted by ${worstEdge}`);

// 2. Placement must not have distorted any tile: vertex count and area preserved.
const area = (v: Vec[]) => Math.abs(v.reduce((s, p, i) =>
  s + p[0] * v[(i + 1) % v.length][1] - v[(i + 1) % v.length][0] * p[1], 0) / 2);
let worstArea = 0;
for (const t of patch) worstArea = Math.max(worstArea, Math.abs(area(t.verts) - area(tileVertices(t.name))));
check(worstArea < 1e-6, "every tile congruent to its definition OK", `area drift ${worstArea}`);

// 3. No two tiles share a centroid (no duplicate placement).
const seen = new Set<string>();
let dupes = 0;
for (const t of patch) {
  const k = centroid(t.verts).map((n) => n.toFixed(3)).join(",");
  if (seen.has(k)) dupes++;
  seen.add(k);
}
check(dupes === 0, "no duplicate placements OK", `${dupes} duplicate tiles`);

// 4. Straps must be shared, not doubled, where tiles meet.
const straps = strapsOf(patch);
console.log(`  ${straps.length} straps emitted from ${patch.length} tiles`);
const strapKeys = new Set(straps.map((s) => s.points.map((p) => p.map((n) => n.toFixed(3)).join()).join(">")));
check(strapKeys.size === straps.length, "no duplicate straps OK", "duplicate straps emitted");

done("TILING");

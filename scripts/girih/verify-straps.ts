import { TILE_ANGLES, tileVertices, mid, sub, len } from "./tiles.js";
import type { TileName } from "./tiles.js";
import { strapsFor, measureStrapAngle, raysFor, STRAP_ANGLE } from "./strapwork.js";

import { checker } from "./assert.js";
const { check, done } = checker();

for (const name of Object.keys(TILE_ANGLES) as TileName[]) {
  const v = tileVertices(name);
  const rays = raysFor(v);
  const straps = strapsFor(v);
  console.log(`\n${name}: ${v.length} edges -> ${rays.length} rays -> ${straps.length} straps`);

  // 1. Every strap must meet its edge at exactly 54 degrees.
  let worst = 0;
  for (const s of straps) worst = Math.max(worst, Math.abs(measureStrapAngle(v, s) - STRAP_ANGLE));
  check(worst < 1e-6, `every strap meets its edge at ${STRAP_ANGLE}° (max error ${worst.toExponential(1)}) OK`,
        `strap/edge angle off by up to ${worst.toFixed(6)}°`);

  // 2. Strap endpoints must sit exactly on edge midpoints.
  const mids = v.map((p, i) => mid(p, v[(i + 1) % v.length]));
  let offMid = 0;
  for (const s of straps) for (const end of [s.points[0], s.points[s.points.length - 1]]) {
    if (Math.min(...mids.map((m) => len(sub(m, end)))) > 1e-9) offMid++;
  }
  check(offMid === 0, "all strap endpoints land on edge midpoints OK",
        `${offMid} strap endpoints are not on a midpoint`);

  // 3. Each midpoint should be used by exactly two straps (the crossing X).
  const usage = mids.map((m) =>
    straps.filter((s) => [s.points[0], s.points[s.points.length - 1]].some((e) => len(sub(m, e)) < 1e-9)).length);
  check(usage.every((u) => u === 2), "every midpoint carries exactly 2 straps OK",
        `midpoint strap counts: ${usage.join(",")}`);
}

done("STRAPWORK");

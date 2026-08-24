import { TILE_ANGLES, tileVertices, signedArea, sub, len, EDGE } from "./tiles.js";
import type { TileName } from "./tiles.js";

const rad = (d: number) => (d * Math.PI) / 180;
import { checker } from "./assert.js";
const { check, fail, done } = checker();

for (const name of Object.keys(TILE_ANGLES) as TileName[]) {
  const angles = TILE_ANGLES[name];
  const v = tileVertices(name);
  console.log(`\n${name} (${v.length} vertices)`);

  const sum = angles.reduce((a, b) => a + b, 0);
  const expected = (angles.length - 2) * 180;
  check(sum === expected, `interior sum ${sum}° = (n-2)·180° OK`,
        `interior sum ${sum}°, expected ${expected}°`);

  if (angles.every((a) => a % 36 === 0)) console.log("  every angle a multiple of 36° OK");
  else fail("angle not a multiple of 36°");

  // Edge lengths, measured back off the derived vertices.
  const edges = v.map((p, i) => len(sub(v[(i + 1) % v.length], p)));
  const spread = Math.max(...edges) - Math.min(...edges);
  check(spread < 1e-9, `all ${edges.length} edges equal (${edges[0].toFixed(4)}) OK`,
        `edge lengths differ by ${spread}`);
  if (Math.abs(edges[0] - EDGE) > 1e-9) fail(`edge length ${edges[0]}, expected ${EDGE}`);

  // Re-measure the interior angles from the coordinates.
  let angleOk = true;
  for (let i = 0; i < v.length; i++) {
    const prev = v[(i - 1 + v.length) % v.length], next = v[(i + 1) % v.length];
    const a = sub(prev, v[i]), b = sub(next, v[i]);
    let deg = (Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])) * 180 / Math.PI;
    while (deg < 0) deg += 360;
    const want = angles[i];
    // Reflex vertices read as the explement when measured this way.
    if (Math.abs(deg - want) > 1e-6 && Math.abs(360 - deg - want) > 1e-6) {
      fail(`vertex ${i} measures ${deg.toFixed(3)}°, table says ${want}°`); angleOk = false;
    }
  }
  if (angleOk) console.log("  measured angles match the table OK");

  console.log(`  winding ${signedArea(v) > 0 ? "CCW" : "CW"}`);
}

// The decagon's circumradius has a closed form; check the walk against it.
const decR = EDGE / (2 * Math.sin(rad(18)));
const measured = len(tileVertices("decagon")[0]);
check(Math.abs(decR - measured) < 1e-9,
      `\ndecagon circumradius ${measured.toFixed(4)} matches s/(2·sin18°) OK`,
      `decagon circumradius ${measured}, expected ${decR}`);

done("TILE");

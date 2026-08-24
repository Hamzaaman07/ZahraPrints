import fs from "node:fs";
import { growTiling, strapsOf } from "./tiling.js";
const SP="/tmp/claude-0/-home-user-ZahraPrints/1f5ada78-b56a-588a-a9a7-595deee242b3/scratchpad";
const patch = growTiling("decagon", 90, 620);
const d = (pts: readonly (readonly [number,number])[]) =>
  "M " + pts.map((p) => p.map((n) => n.toFixed(2)).join(" ")).join(" L ");
const scaffold = patch.map((t) => d(t.verts) + " Z").join(" ");
const straps = strapsOf(patch).map((s) => d(s.points)).join(" ");
const svg = (body: string) =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-750 -750 1500 1500" width="900" height="900">
<rect x="-750" y="-750" width="1500" height="1500" fill="#0B0A08"/>${body}</svg>`;
fs.writeFileSync(`${SP}/field-scaffold.svg`, svg(
  `<path d="${scaffold}" fill="none" stroke="#8A5A12" stroke-width="1.4" opacity="0.75"/>
   <path d="${straps}" fill="none" stroke="#F5B324" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`));
fs.writeFileSync(`${SP}/field-straps.svg`, svg(
  `<path d="${straps}" fill="none" stroke="#F5B324" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`));
console.log(`${patch.length} tiles`);

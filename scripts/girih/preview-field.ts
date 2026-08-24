import fs from "node:fs";
import { growNetwork, strapsOf } from "./tiling.js";
const SP="/tmp/claude-0/-home-user-ZahraPrints/1f5ada78-b56a-588a-a9a7-595deee242b3/scratchpad";
const patch = growNetwork(900, 1250);
const d = (pts: readonly (readonly [number,number])[]) =>
  "M " + pts.map((p) => p.map((n) => n.toFixed(2)).join(" ")).join(" L ");
const straps = strapsOf(patch).map((s) => d(s.points)).join(" ");
const scaffold = patch.map((t) => d(t.verts) + " Z").join(" ");

/* Interlaced bands: stroke the straps thick in gold, then re-stroke thinner in
   the ground colour on top. What survives is two parallel gold edges — the
   classic drawn-band look — with no extra path data. */
const band = (bg: string, w = 15, inner = 9) => `
  <path d="${straps}" fill="none" stroke="#C9962B" stroke-width="${w}"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${straps}" fill="none" stroke="${bg}" stroke-width="${inner}"
        stroke-linecap="round" stroke-linejoin="round"/>`;

const svg = (w: number, body: string, bg: string) =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-700 -420 1400 840" width="${w}" height="${w*0.6}">
<rect x="-700" y="-420" width="1400" height="840" fill="${bg}"/>${body}</svg>`;

fs.writeFileSync(`${SP}/net-scaffold.svg`, svg(1000,
  `<path d="${scaffold}" fill="none" stroke="#8A5A12" stroke-width="1.2" opacity="0.6"/>` + band("#0B0A08"), "#0B0A08"));
fs.writeFileSync(`${SP}/net-dark.svg`, svg(1000, band("#0B0A08"), "#0B0A08"));
fs.writeFileSync(`${SP}/net-light.svg`, svg(1000, band("#FFFFFF"), "#FFFFFF"));
const tally: Record<string,number> = {};
for (const t of patch) tally[t.name] = (tally[t.name] ?? 0) + 1;
console.log(patch.length, "tiles", tally);

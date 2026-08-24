import fs from "node:fs";
import { TILE_ANGLES, tileVertices } from "./tiles.js";
import type { TileName, Vec } from "./tiles.js";
import { strapsFor } from "./strapwork.js";

const cells = (Object.keys(TILE_ANGLES) as TileName[]).map((name, i) => {
  const v = tileVertices(name);
  const straps = strapsFor(v);
  const outline = "M " + v.map((p: Vec) => p.map((n) => n.toFixed(2)).join(" ")).join(" L ") + " Z";
  const strapPaths = straps
    .map((s) => "M " + s.points.map((p) => p.map((n) => n.toFixed(2)).join(" ")).join(" L "))
    .join(" ");
  return `
  <g transform="translate(${i * 420 + 210} 220)">
    <path d="${outline}" fill="none" stroke="#8A5A12" stroke-width="1.5"
          stroke-dasharray="5 5" opacity="0.55"/>
    <path d="${strapPaths}" fill="none" stroke="#F5B324" stroke-width="6"
          stroke-linecap="round" stroke-linejoin="round"/>
    <text x="0" y="185" fill="#EFE4D2" font-family="monospace" font-size="17"
          text-anchor="middle">${name} · ${straps.length} straps</text>
  </g>`;
}).join("");

fs.writeFileSync("/tmp/claude-0/-home-user-ZahraPrints/1f5ada78-b56a-588a-a9a7-595deee242b3/scratchpad/tiles.svg",
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2100 440" width="2100" height="440">
  <rect width="2100" height="440" fill="#0B0A08"/>${cells}
</svg>`);
console.log("dashed = tile scaffolding (preview only, never shipped); solid = straps");

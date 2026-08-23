/**
 * Converts the raw Etsy export in data/ into typed JSON the app imports at
 * build time. Run via `npm run build:data` (the `build` and `dev` scripts do
 * this for you). Output in src/data/ is generated — never hand-edit it.
 *
 * Everything here is driven by what the real export actually contains; see
 * CLAUDE.md for the surprises that shaped these rules.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "data");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  images: string[];
  /** Marketing prose that sits above the spec pairs in DESCRIPTION. */
  blurb: string;
  specs: Record<string, string>;
  tags: string[];
  colors: string[];
  sizes: string[];
  /** TODO: not present in the Etsy export. Falls back to the shop homepage. */
  etsyUrl: string;
}

export interface Review {
  reviewer: string;
  date: string; // ISO yyyy-mm-dd
  rating: number;
  message: string;
}

export type Category = "hoodies" | "tees" | "pants" | "compression" | "outerwear";

// ---------------------------------------------------------------------------
// Category derivation
//
// Order is load-bearing and the patterns are word-anchored. Two real traps in
// this export: a bare /sweats/ matches "Sweatshirt", and a bare /shirt/ matches
// "Sweatshirt" too, so 19 of 57 titles match more than one keyword. Word
// boundaries plus this ordering resolve every row; see CLAUDE.md.
// ---------------------------------------------------------------------------
const CATEGORY_RULES: ReadonlyArray<readonly [Category, RegExp]> = [
  ["compression", /\bcompression\b/i],
  ["outerwear", /\b(jacket|zip[-\s]?up|quarter[-\s]?zip|windbreaker|puffer)\b/i],
  ["hoodies", /\b(hoodie|hoodies|sweatshirt|crewneck|pullover|sweater)\b/i],
  ["pants", /\b(sweatpants|sweats|joggers|pants|shorts)\b/i],
  ["tees", /\b(t[-\s]?shirt|tee|tees|shirt|polo)\b/i],
];

function categorize(title: string): Category | null {
  return CATEGORY_RULES.find(([, re]) => re.test(title))?.[0] ?? null;
}

// ---------------------------------------------------------------------------
// Spec sheet parsing
//
// DESCRIPTION is mostly newline-separated `Key: Value`, but 56 of 57 rows also
// carry marketing prose, almost always above the pairs. Unrecognised keys are
// treated as prose rather than silently promoted to specs, so a line like
// "Premium Quality: ..." doesn't end up in the spec table.
// ---------------------------------------------------------------------------
const SPEC_KEYS: Record<string, string> = {
  gender: "Gender",
  model: "Model",
  fit: "Fit",
  style: "Style",
  season: "Season",
  fabric: "Fabric",
  material: "Fabric",
  "fabric weight": "Fabric Weight",
  weight: "Fabric Weight",
  "fabric thickness": "Fabric Thickness",
  thickness: "Fabric Thickness",
  "fabric stretch": "Fabric Stretch",
  "fabric strench": "Fabric Stretch", // typo present in the source export
  stretch: "Fabric Stretch",
  "care instructions": "Care Instructions",
  features: "Features",
  "print size": "Print Size",
  notes: "Notes",
};

/** Order the spec table renders in, regardless of source order. */
const SPEC_ORDER = [
  "Gender", "Model", "Fit", "Style", "Season", "Fabric", "Fabric Weight",
  "Fabric Thickness", "Fabric Stretch", "Print Size", "Features",
  "Care Instructions", "Notes",
];

function parseDescription(raw: string, unknownKeys: Set<string>) {
  const specs: Record<string, string> = {};
  const prose: string[] = [];

  for (const line of (raw ?? "").split(/\r?\n/)) {
    const text = line.trim();
    if (!text) continue;
    const match = text.match(/^([^:]{1,40}):\s*(.+)$/);
    const canonical = match ? SPEC_KEYS[match[1].trim().toLowerCase()] : undefined;
    if (match && canonical) {
      if (!specs[canonical]) specs[canonical] = match[2].trim();
    } else {
      if (match) unknownKeys.add(match[1].trim());
      prose.push(text);
    }
  }

  const ordered: Record<string, string> = {};
  for (const key of SPEC_ORDER) if (specs[key]) ordered[key] = specs[key];
  return { specs: ordered, blurb: prose.join("\n\n") };
}

// ---------------------------------------------------------------------------
// Variations
//
// Header casing is inconsistent across rows ("Primary color" / "Color" /
// "color", "size" / "Size"), and both slots must be probed by name rather than
// assumed by position.
// ---------------------------------------------------------------------------
function splitValues(raw: string): string[] {
  return (raw ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function variations(row: Record<string, string>) {
  let colors: string[] = [];
  let sizes: string[] = [];

  for (const slot of [1, 2]) {
    const name = (row[`VARIATION ${slot} NAME`] ?? "").trim().toLowerCase();
    const values = splitValues(row[`VARIATION ${slot} VALUES`]);
    if (!name || values.length === 0) continue;
    if (/colou?r/.test(name)) colors = values;
    else if (/size/.test(name)) sizes = values;
  }
  return { colors, sizes };
}

// ---------------------------------------------------------------------------
// Misc field helpers
// ---------------------------------------------------------------------------
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‐-―]/g, "-") // unicode dashes used in these titles
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

function humanizeTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const tag of (raw ?? "").split(",")) {
    const clean = tag.trim().replace(/_+/g, " ").replace(/\s+/g, " ").toLowerCase();
    if (clean) seen.add(clean);
  }
  return [...seen];
}

function images(row: Record<string, string>): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const url = (row[`IMAGE${i}`] ?? "").trim();
    if (url) out.push(url);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
interface RawReview {
  reviewer: string;
  date_reviewed: string;
  star_rating: number;
  message: string;
  order_id: number;
}

/** Jaccard overlap of word sets; 1 means identical wording. */
function similarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean));
  const [x, y] = [words(a), words(b)];
  if (x.size === 0 || y.size === 0) return 0;
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / (x.size + y.size - shared);
}

const NEAR_DUPLICATE = 0.6;

function buildReviews(raw: RawReview[]) {
  const withText = raw.filter((r) => (r.message ?? "").trim());
  const kept: RawReview[] = [];
  let dropped = 0;

  for (const review of withText) {
    const twin = kept.find(
      (k) => k.order_id === review.order_id &&
        similarity(k.message, review.message) >= NEAR_DUPLICATE,
    );
    if (!twin) kept.push(review);
    else {
      dropped++;
      // Keep whichever telling is fuller.
      if (review.message.length > twin.message.length) twin.message = review.message;
    }
  }

  const reviews: Review[] = kept.map((r) => {
    const [m, d, y] = r.date_reviewed.split("/");
    return {
      reviewer: r.reviewer,
      date: `${y}-${m}-${d}`,
      rating: r.star_rating,
      message: r.message.replace(/\r\n/g, "\n").trim(),
    };
  });
  reviews.sort((a, b) => b.date.localeCompare(a.date));

  return { reviews, emptyDropped: withText.length - raw.length, dupesDropped: dropped, rawCount: raw.length };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
function main() {
  const csv = fs.readFileSync(path.join(ROOT, "data", "EtsyListingsDownload.csv"), "utf8");
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.error("CSV parse errors:", parsed.errors.slice(0, 5));
    process.exit(1);
  }

  const problems: string[] = [];
  const unknownKeys = new Set<string>();
  const usedIds = new Set<string>();
  const products: Product[] = [];

  for (const row of parsed.data) {
    const title = (row.TITLE ?? "").trim();
    if (!title) { problems.push("row with empty TITLE — skipped"); continue; }

    const category = categorize(title);
    if (!category) { problems.push(`no category matched: ${title.slice(0, 60)}`); continue; }

    const price = Number.parseFloat(row.PRICE);
    if (!Number.isFinite(price)) problems.push(`unparseable PRICE on: ${title.slice(0, 50)}`);
    if ((row.CURRENCY_CODE ?? "").trim() !== "USD") {
      problems.push(`non-USD currency on: ${title.slice(0, 50)}`);
    }

    let id = slugify(title);
    for (let n = 2; usedIds.has(id); n++) id = `${slugify(title)}-${n}`;
    usedIds.add(id);

    const { specs, blurb } = parseDescription(row.DESCRIPTION, unknownKeys);
    const { colors, sizes } = variations(row);
    const imgs = images(row);

    if (imgs.length === 0) problems.push(`no images: ${title.slice(0, 50)}`);
    if (colors.length === 0) problems.push(`no colors: ${title.slice(0, 50)}`);
    if (sizes.length === 0) problems.push(`no sizes: ${title.slice(0, 50)}`);
    if (Object.keys(specs).length === 0) problems.push(`no specs parsed: ${title.slice(0, 50)}`);

    products.push({
      id, title, price: Number.isFinite(price) ? price : 0, category,
      images: imgs, blurb, specs, tags: humanizeTags(row.TAGS), colors, sizes,
      etsyUrl: "", // TODO: fill per-product Etsy listing URLs when available
    });
  }

  const rawReviews: RawReview[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data", "reviews.json"), "utf8"),
  );
  const { reviews, dupesDropped, rawCount } = buildReviews(rawReviews);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "products.json"), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "reviews.json"), JSON.stringify(reviews, null, 2));

  report(products, reviews, { problems, unknownKeys, dupesDropped, rawCount, rawRows: parsed.data.length });
}

function report(
  products: Product[],
  reviews: Review[],
  meta: { problems: string[]; unknownKeys: Set<string>; dupesDropped: number; rawCount: number; rawRows: number },
) {
  const line = (s = "") => console.log(s);
  const tally = <T extends string>(vals: T[]) =>
    vals.reduce<Record<string, number>>((a, v) => ((a[v] = (a[v] ?? 0) + 1), a), {});

  line("\n─── products ".padEnd(60, "─"));
  line(`rows in CSV: ${meta.rawRows}   →   products emitted: ${products.length}`);

  line("\ncategories:");
  for (const [cat, n] of Object.entries(tally(products.map((p) => p.category))).sort((a, b) => b[1] - a[1])) {
    line(`  ${cat.padEnd(13)} ${String(n).padStart(3)}  ${"█".repeat(n)}`);
  }

  const prices = products.map((p) => p.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  line(`\nprice range: $${prices[0].toFixed(2)} – $${prices.at(-1)!.toFixed(2)}   median $${median.toFixed(2)}`);

  line("\nimages per product:");
  const imgTally = tally(products.map((p) => String(p.images.length)));
  for (const n of Object.keys(imgTally).map(Number).sort((a, b) => a - b)) {
    line(`  ${String(n).padStart(2)} images  ${String(imgTally[n]).padStart(3)}  ${"█".repeat(imgTally[n])}`);
  }
  line(`  total image URLs: ${products.reduce((n, p) => n + p.images.length, 0)}`);

  const colorCounts = products.map((p) => p.colors.length);
  const sizeCounts = products.map((p) => p.sizes.length);
  line(`\ncolors per product: ${Math.min(...colorCounts)}–${Math.max(...colorCounts)}`);
  line(`sizes per product:  ${Math.min(...sizeCounts)}–${Math.max(...sizeCounts)}`);
  line(`distinct colors: ${new Set(products.flatMap((p) => p.colors)).size}`);
  line(`distinct sizes:  ${[...new Set(products.flatMap((p) => p.sizes))].join(", ")}`);
  line(`distinct tags:   ${new Set(products.flatMap((p) => p.tags)).size}`);
  line(`longest title:   ${Math.max(...products.map((p) => p.title.length))} chars`);
  line(`products with prose blurb: ${products.filter((p) => p.blurb).length}`);

  line("\n─── reviews ".padEnd(60, "─"));
  const avg = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
  line(`raw entries: ${meta.rawCount}  →  kept: ${reviews.length}`);
  line(`  dropped (empty message): ${meta.rawCount - reviews.length - meta.dupesDropped}`);
  line(`  dropped (near-duplicate on same order_id): ${meta.dupesDropped}`);
  line(`average rating of kept reviews: ${avg.toFixed(2)}`);
  line(`star spread: ${JSON.stringify(tally(reviews.map((r) => String(r.rating))))}`);
  line(`date range: ${reviews.at(-1)!.date} → ${reviews[0].date}`);

  line("\n─── rule violations ".padEnd(60, "─"));
  if (meta.unknownKeys.size) {
    line(`unrecognised "Key: Value" lines routed to blurb instead of specs:`);
    for (const k of meta.unknownKeys) line(`  · ${k}`);
  }
  if (meta.problems.length === 0) line("none");
  else for (const p of meta.problems) line(`  ! ${p}`);
  line();
}

main();

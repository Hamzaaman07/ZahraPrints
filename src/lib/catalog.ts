/**
 * Typed access to the generated catalogue, plus the filtering and sorting the
 * shop needs. Everything here is pure and client-side — the site has no backend
 * and never handles checkout.
 */
import productsJson from "../data/products.json";
import reviewsJson from "../data/reviews.json";

export type Category = "hoodies" | "tees" | "pants" | "compression" | "outerwear";

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  images: string[];
  blurb: string;
  specs: Record<string, string>;
  tags: string[];
  colors: string[];
  sizes: string[];
  etsyUrl: string;
}

export interface Review {
  reviewer: string;
  date: string;
  rating: number;
  message: string;
}

export const products = productsJson as Product[];
export const reviews = reviewsJson as Review[];

/** TODO: per-product Etsy URLs are absent from the export; fall back to the shop. */
export const ETSY_SHOP = "https://www.etsy.com/shop/ZahraPrints";
export const etsyLink = (p: Product) => p.etsyUrl || ETSY_SHOP;

/**
 * Etsy shows 4.97 across all 31 reviews. Three were filtered out here (two had
 * no message, one duplicated another on the same order) and all three were
 * 5-star, so averaging only what is on screen would understate the shop. We
 * show Etsy's figure and state the written-review count separately.
 */
export const RATING = { average: 4.97, totalOnEtsy: 31, written: reviews.length };

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "hoodies", label: "Hoodies", blurb: "Heavyweight fleece, drop shoulder" },
  { id: "tees", label: "Tees", blurb: "Boxy cuts, washed cotton" },
  { id: "pants", label: "Pants", blurb: "Baggy, raw edge, built to last" },
  { id: "compression", label: "Compression", blurb: "Made for the gym" },
  { id: "outerwear", label: "Outerwear", blurb: "Zip-ups and jackets" },
];

export const countBy = (cat: Category) => products.filter((p) => p.category === cat).length;

export const PRICE_RANGE: [number, number] = [
  Math.floor(Math.min(...products.map((p) => p.price))),
  Math.ceil(Math.max(...products.map((p) => p.price))),
];

/** Colour names arrive inconsistently cased ("Gray green" / "Gray Green"). */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export const allColors = [...new Map(products.flatMap((p) => p.colors).map((c) => [norm(c), c])).values()]
  .sort((a, b) => a.localeCompare(b));

export const allSizes = ["S", "M", "L", "XL", "2XL", "3XL"].filter((s) =>
  products.some((p) => p.sizes.includes(s)),
);

/** Approximate swatch fills. Unknown names fall back to a neutral. */
const SWATCHES: Record<string, string> = {
  apricot: "#E8B98A", "ash purple": "#8E8397", black: "#141210", blue: "#2F5AA8",
  brown: "#6B4A2F", coffee: "#4A3627", "colorful blue": "#2D6BC4",
  "cream apricot": "#EBD3B4", "dark blue": "#1E3A6B", "dark brown": "#3A2A1C",
  "dark gray": "#3D3D3D", "gray apricot": "#C4A88F", "gray blue": "#6C7F98",
  "gray green": "#7E8A76", "grayish green": "#808C7C", "haze gray": "#9A9A94",
  khaki: "#A89060", "khaki ash": "#8E8264", "light gray": "#C6C6C2",
  "light pink": "#E8C2C6", "light purple": "#B9A6C9", "mild apricot": "#E4C4A0",
  "navy blue": "#1B2A4A", red: "#B32B2B", "royal blue": "#2A4FA8",
  "ume purple": "#6E4A63", "washed black": "#2A2724", "washed cement gray": "#8C8A85",
  white: "#F2EFE8", "wine red": "#6E2230",
};
export const swatch = (name: string) => SWATCHES[norm(name)] ?? "#6B655C";

export interface Filters {
  categories: Category[];
  colors: string[];
  sizes: string[];
  maxPrice: number;
}

export type SortKey = "featured" | "price-asc" | "price-desc";

export const emptyFilters = (): Filters => ({
  categories: [], colors: [], sizes: [], maxPrice: PRICE_RANGE[1],
});

export function applyFilters(list: Product[], f: Filters, sort: SortKey): Product[] {
  const out = list.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.colors.length && !p.colors.some((c) => f.colors.map(norm).includes(norm(c)))) return false;
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    if (p.price > f.maxPrice) return false;
    return true;
  });
  if (sort === "price-asc") return [...out].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...out].sort((a, b) => b.price - a.price);
  return out;
}

export const byId = (id: string) => products.find((p) => p.id === id);

export const related = (p: Product, n = 4) =>
  products.filter((o) => o.category === p.category && o.id !== p.id).slice(0, n);

export const money = (n: number) => `$${n.toFixed(2)}`;

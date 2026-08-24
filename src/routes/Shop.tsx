import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useSeo } from "../lib/seo";
import {
  applyFilters, allColors, allSizes, CATEGORIES, countBy, emptyFilters,
  PRICE_RANGE, products, swatch, money, type Category, type Filters, type SortKey,
} from "../lib/catalog";

const toggle = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export function Shop() {
  const [params] = useSearchParams();

  /* Seeded from the URL so the homepage category tiles deep-link correctly.
     App.tsx keys this route on the query string, so arriving with a different
     ?category= remounts and re-seeds rather than needing a sync effect. */
  const [filters, setFilters] = useState<Filters>(() => {
    const wanted = params.get("category");
    const base = emptyFilters();
    if (wanted && CATEGORIES.some((c) => c.id === wanted)) {
      base.categories = [wanted as Category];
    }
    return base;
  });
  const [sort, setSort] = useState<SortKey>("featured");
  const [openPanel, setOpenPanel] = useState(false);

  useSeo(
    "Shop — Zahra Prints",
    `All ${products.length} pieces: hoodies, tees, pants, compression and outerwear, ${money(PRICE_RANGE[0])}–${money(PRICE_RANGE[1])}. Checkout on Etsy.`,
  );

  const visible = useMemo(() => applyFilters(products, filters, sort), [filters, sort]);
  const active =
    filters.categories.length + filters.colors.length + filters.sizes.length +
    (filters.maxPrice < PRICE_RANGE[1] ? 1 : 0);

  const clear = () => setFilters(emptyFilters());

  const legend = "mb-3 font-ui text-[0.68rem] uppercase tracking-[0.24em] text-sand/45";
  const chip = (on: boolean) =>
    `border px-3 py-1.5 font-ui text-xs transition-colors focus-visible:outline
     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
       on ? "border-amber bg-amber/12 text-amber" : "border-gold/25 text-sand/70 hover:border-gold/55"
     }`;

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
      <header className="mb-10">
        <h1 className="font-display text-[length:var(--text-1)] tracking-[-0.02em]">Shop</h1>
        <p className="mt-2 font-ui text-sm text-sand/60">
          {visible.length} of {products.length} pieces. Every order is placed on Etsy.
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
        <button type="button" onClick={() => setOpenPanel((v) => !v)} aria-expanded={openPanel}
          aria-controls="filters"
          className="border border-gold/35 px-4 py-2 font-ui text-[0.72rem] uppercase tracking-[0.2em] text-sand">
          Filters{active ? ` (${active})` : ""}
        </button>
        <SortSelect sort={sort} setSort={setSort} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside id="filters" className={`${openPanel ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
            <div className="mb-8 hidden lg:block"><SortSelect sort={sort} setSort={setSort} /></div>

            <fieldset className="mb-8">
              <legend className={legend}>Category</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.id} type="button"
                    aria-pressed={filters.categories.includes(c.id)}
                    onClick={() => setFilters((f) => ({ ...f, categories: toggle(f.categories, c.id) }))}
                    className={chip(filters.categories.includes(c.id))}>
                    {c.label} <span className="text-sand/40">{countBy(c.id)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-8">
              <legend className={legend}>Size</legend>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((s) => (
                  <button key={s} type="button" aria-pressed={filters.sizes.includes(s)}
                    onClick={() => setFilters((f) => ({ ...f, sizes: toggle(f.sizes, s) }))}
                    className={chip(filters.sizes.includes(s))}>{s}</button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-8">
              <legend className={legend}>Colour</legend>
              <div className="flex flex-wrap gap-2">
                {allColors.map((c) => {
                  const on = filters.colors.includes(c);
                  return (
                    <button key={c} type="button" aria-pressed={on} title={c}
                      onClick={() => setFilters((f) => ({ ...f, colors: toggle(f.colors, c) }))}
                      className={`h-7 w-7 rounded-full border-2 transition-transform
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-amber ${on ? "border-amber scale-110" : "border-sand/20 hover:scale-110"}`}
                      style={{ background: swatch(c) }}>
                      <span className="sr-only">{c}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mb-8">
              <legend className={legend}>Max price — {money(filters.maxPrice)}</legend>
              <input type="range" min={PRICE_RANGE[0]} max={PRICE_RANGE[1]} step={1}
                value={filters.maxPrice} aria-label="Maximum price"
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                className="w-full accent-[var(--color-amber)]" />
            </fieldset>

            {active > 0 && (
              <button type="button" onClick={clear}
                className="font-ui text-[0.72rem] uppercase tracking-[0.2em] text-amber hover:underline">
                Clear all ({active})
              </button>
            )}
          </div>
        </aside>

        <section aria-live="polite">
          {visible.length === 0 ? (
            <p className="py-24 text-center font-ui text-sand/60">
              Nothing matches those filters.{" "}
              <button onClick={clear} className="text-amber hover:underline">Clear them</button>.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 4} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SortSelect({ sort, setSort }: { sort: SortKey; setSort: (s: SortKey) => void }) {
  return (
    <label className="flex items-center gap-2 font-ui text-[0.72rem] uppercase tracking-[0.2em] text-sand/50">
      Sort
      <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
        className="border border-gold/25 bg-ink px-3 py-2 font-ui text-xs normal-case tracking-normal
                   text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber">
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}

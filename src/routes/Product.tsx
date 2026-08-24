import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useSeo } from "../lib/seo";
import { byId, etsyLink, money, related } from "../lib/catalog";
import { swatch } from "../lib/catalog";
import { NotFound } from "./NotFound";

export function Product() {
  const { id = "" } = useParams();
  const product = byId(id);
  /* Adjusting state during render is the documented way to reset when a prop
     changes; an effect would paint the previous product's gallery first. */
  const [gallery, setGallery] = useState({ id, active: 0, zoom: false });
  if (gallery.id !== id) setGallery({ id, active: 0, zoom: false });
  const { active, zoom } = gallery;
  const setActive = (i: number) => setGallery((g) => ({ ...g, active: i }));
  const setZoom = (v: boolean) => setGallery((g) => ({ ...g, zoom: v }));

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoom]);

  const specs = product ? Object.entries(product.specs) : [];
  useSeo(
    product ? `${product.title.slice(0, 70)} — Zahra Prints` : "Not found — Zahra Prints",
    product ? (product.blurb.split("\n")[0] || product.title).slice(0, 160) : "",
    product?.images[0],
  );

  if (!product) return <NotFound />;
  const siblings = related(product);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
      <nav aria-label="Breadcrumb" className="mb-8 font-ui text-[0.72rem] uppercase tracking-[0.2em] text-sand/45">
        <Link to="/shop" className="hover:text-amber">Shop</Link>
        <span className="px-2">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-amber">{product.category}</Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex gap-4">
          <ul className="hidden w-20 shrink-0 space-y-3 md:block" aria-label="Product images">
            {product.images.map((src, i) => (
              <li key={src}>
                <button type="button" onClick={() => setActive(i)} aria-current={i === active}
                  className={`block aspect-[4/5] w-full overflow-hidden border transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-amber ${i === active ? "border-amber" : "border-transparent hover:border-gold/45"}`}>
                  <img src={src} alt={`${product.title} — view ${i + 1}`} width={160} height={200}
                       loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => setZoom(true)}
            className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-ink-raised
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-amber">
            <img src={product.images[active]} alt={product.title} width={1000} height={1250}
                 loading="eager" decoding="async" className="h-full w-full object-cover" />
            <span className="sr-only">Enlarge image</span>
          </button>
        </div>

        <div>
          <h1 className="font-display text-[length:var(--text-2)] leading-tight tracking-[-0.01em]">
            {product.title}
          </h1>
          <p className="mt-4 font-ui text-2xl text-amber">{money(product.price)}</p>

          {product.colors.length > 0 && (
            <section className="mt-9" aria-labelledby="colours-h">
              <h2 id="colours-h" className="font-ui text-[0.68rem] uppercase tracking-[0.24em] text-sand/45">
                {product.colors.length} colour{product.colors.length > 1 ? "s" : ""}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <li key={c} className="flex items-center gap-2 border border-gold/22 px-3 py-1.5">
                    <span className="h-4 w-4 rounded-full border border-sand/25"
                          style={{ background: swatch(c) }} aria-hidden="true" />
                    <span className="font-ui text-xs text-sand/75">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.sizes.length > 0 && (
            <section className="mt-8" aria-labelledby="sizes-h">
              <h2 id="sizes-h" className="font-ui text-[0.68rem] uppercase tracking-[0.24em] text-sand/45">
                Sizes
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <li key={s} className="border border-gold/22 px-4 py-2 font-ui text-xs text-sand/75">{s}</li>
                ))}
              </ul>
              <p className="mt-3 font-ui text-xs text-sand/45">
                Pick your size on Etsy — sizes are shown here for reference.
              </p>
            </section>
          )}

          <a href={etsyLink(product)} target="_blank" rel="noopener noreferrer"
            className="mt-10 hidden w-full bg-ember px-8 py-5 text-center font-ui text-sm font-semibold
                       uppercase tracking-[0.18em] text-ink transition hover:bg-amber md:block
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                       focus-visible:outline-amber">
            Buy on Etsy ↗
          </a>

          {product.blurb && (
            <div className="mt-10 space-y-4">
              {product.blurb.split("\n\n").slice(0, 4).map((para, i) => (
                <p key={i} className="font-ui leading-relaxed text-sand/72">{para}</p>
              ))}
            </div>
          )}

          {specs.length > 0 ? (
            <section className="mt-10" aria-labelledby="specs-h">
              <h2 id="specs-h" className="font-ui text-[0.68rem] uppercase tracking-[0.24em] text-sand/45">
                Details
              </h2>
              <dl className="mt-4 border-t border-gold/18">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-gold/18 py-3">
                    <dt className="font-ui text-xs uppercase tracking-[0.14em] text-sand/45">{k}</dt>
                    <dd className="font-ui text-sm leading-relaxed text-sand/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <p className="mt-10 border-t border-gold/18 pt-4 font-ui text-sm text-sand/45">
              This listing does not carry a spec sheet. Full details are on Etsy.
            </p>
          )}

          {product.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {product.tags.slice(0, 12).map((t) => (
                <li key={t} className="border border-gold/15 px-2.5 py-1 font-ui text-[0.68rem] text-sand/45">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-24" aria-labelledby="alike-h">
          <h2 id="alike-h" className="mb-8 font-display text-[length:var(--text-3)]">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {siblings.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Sticky buy bar on mobile, where the button above has scrolled away. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-ink/95 p-3 backdrop-blur md:hidden">
        <a href={etsyLink(product)} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-ember px-6 py-4 font-ui text-sm
                     font-semibold uppercase tracking-[0.16em] text-ink">
          Buy on Etsy · {money(product.price)} ↗
        </a>
      </div>
      <div className="h-24 md:hidden" aria-hidden="true" />

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={`${product.title}, enlarged`}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/96 p-4">
          <img src={product.images[active]} alt={product.title}
               className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={() => setZoom(false)}
            className="absolute right-5 top-5 border border-gold/40 px-4 py-2 font-ui text-xs
                       uppercase tracking-[0.2em] text-sand">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

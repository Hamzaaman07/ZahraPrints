import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import products from "./data/products.json";
import reviews from "./data/reviews.json";
import girih from "./data/girih.json";
import { GirihField } from "./components/GirihField";
import { Arabic, APPROVED } from "./components/Arabic";
import type { ApprovedPhrase } from "./components/Arabic";

/** Phase 3 harness: proves the geometry and the Arabic render. Pages are Phase 4. */
function Phase3Check() {
  return (
    <main className="min-h-screen">
      <section className="relative flex h-[70vh] items-center justify-center overflow-hidden">
        <GirihField animate className="absolute inset-0 h-full w-full text-gold" opacity={0.22} />
        <div className="relative text-center">
          <h1 className="font-display text-[length:var(--text-1)] tracking-[-0.02em] text-sand">
            Zahra Prints
          </h1>
          <p className="font-ui text-[0.83rem] uppercase tracking-[0.32em] text-amber">
            Quality on Wallahi
          </p>
          <a
            href="https://www.etsy.com/shop/ZahraPrints"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-ember px-8 py-4 font-ui text-[0.83rem] font-600 uppercase tracking-[0.18em] text-ink"
          >
            Shop on Etsy
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-8 py-16">
        <h2 className="mb-8 font-display text-[length:var(--text-3)] text-amber">
          Approved Arabic
        </h2>
        <div className="flex flex-wrap gap-12 text-[2rem]">
          {(Object.keys(APPROVED) as ApprovedPhrase[]).map((p) => (
            <Arabic key={p} phrase={p} showLatin />
          ))}
        </div>

        <h2 className="mt-16 mb-4 font-display text-[length:var(--text-3)] text-amber">
          Data layer
        </h2>
        <dl className="font-ui text-sm text-sand/70">
          <div data-testid="product-count">products: {products.length}</div>
          <div data-testid="review-count">reviews: {reviews.length}</div>
          <div data-testid="girih-tiles">girih tiles: {girih.meta.tiles}</div>
          <div data-testid="girih-straps">girih straps: {girih.meta.straps}</div>
          <div data-testid="strap-angle">strap angle: {girih.meta.strapAngle}°</div>
        </dl>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Phase3Check />
  </StrictMode>,
);

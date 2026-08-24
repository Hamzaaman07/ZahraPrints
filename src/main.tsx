import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import products from "./data/products.json";
import reviews from "./data/reviews.json";
import girih from "./data/girih.json";
import { GirihField } from "./components/GirihField";
/* Lazily loaded so phones and reduced-motion visitors never download three.js
   at all — useImmersive starts false, so the import is only reached on the
   wide-screen, motion-allowed path. */
const GirihScreen = lazy(() =>
  import("./components/GirihScreen").then((m) => ({ default: m.GirihScreen })),
);
import { useImmersive } from "./hooks/useImmersive";
import { Arabic, APPROVED } from "./components/Arabic";
import type { ApprovedPhrase } from "./components/Arabic";

function Hero() {
  const immersive = useImmersive();
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* The flat field always paints first, and stays as the backdrop the
          screen resolves over, so there is never an empty hero. */}
      <GirihField
        animate
        className="absolute inset-0 h-full w-full text-gold"
        opacity={immersive === "off" ? 0.5 : 0.18}
      />
      {immersive !== "off" && (
        <Suspense fallback={null}>
          <GirihScreen className="absolute inset-0 h-full w-full" quality={immersive} />
        </Suspense>
      )}
      <div className="pointer-events-none relative text-center">
        <h1 className="font-display text-[length:var(--text-hero)] leading-[0.95] tracking-[-0.03em] text-sand
                       [text-shadow:0_0_60px_rgba(11,10,8,0.9)]">
          Zahra Prints
        </h1>
        <p className="mt-2 font-ui text-[0.83rem] uppercase tracking-[0.42em] text-amber">
          Quality on Wallahi
        </p>
        <a
          href="https://www.etsy.com/shop/ZahraPrints"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-10 inline-block bg-ember px-9 py-4 font-ui text-[0.83rem]
                     font-semibold uppercase tracking-[0.18em] text-ink transition
                     hover:bg-amber focus-visible:outline focus-visible:outline-2
                     focus-visible:outline-offset-4 focus-visible:outline-amber"
        >
          Shop on Etsy
        </a>
      </div>
    </section>
  );
}

/** Phase 3 harness: proves the geometry and the Arabic render. Pages are Phase 4. */
function Phase3Check() {
  return (
    <main className="min-h-screen">
      <Hero />
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

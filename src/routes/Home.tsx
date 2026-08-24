import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { GirihField } from "../components/GirihField";
import { GirihDivider } from "../components/GirihDivider";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { Stars } from "../components/Stars";
import { Arabic } from "../components/Arabic";
import { useImmersive } from "../hooks/useImmersive";
import { useSeo } from "../lib/seo";
import { CATEGORIES, countBy, products, reviews, RATING, ETSY_SHOP } from "../lib/catalog";

const GirihScreen = lazy(() =>
  import("../components/GirihScreen").then((m) => ({ default: m.GirihScreen })),
);

/** Six across the categories rather than the first six rows, so the row reads varied. */
const featured = [
  ...products.filter((p) => p.category === "hoodies").slice(0, 2),
  ...products.filter((p) => p.category === "tees").slice(0, 2),
  ...products.filter((p) => p.category === "pants").slice(0, 1),
  ...products.filter((p) => p.category === "compression").slice(0, 1),
];

const pulled = [reviews[2], reviews[6], reviews[0]].filter(Boolean);

export function Home() {
  const immersive = useImmersive();
  useSeo(
    "Zahra Prints — Arabic calligraphy streetwear",
    "Heavyweight hoodies, washed tees and baggy sweats carrying real Arabic calligraphy. 57 pieces, made properly. Quality on Wallahi.",
    "/brand/logo-full-on-dark.svg",
  );

  return (
    <>
      <section className="relative flex h-[100svh] items-center justify-center overflow-hidden">
        <GirihField animate className="absolute inset-0 h-full w-full text-gold"
                    opacity={immersive === "off" ? 0.5 : 0.16} />
        {immersive !== "off" && (
          <Suspense fallback={null}>
            <GirihScreen className="absolute inset-0 h-full w-full" quality={immersive} />
          </Suspense>
        )}
        <div className="pointer-events-none relative px-6 text-center">
          <h1 className="font-display text-[length:var(--text-hero)] leading-[0.92] tracking-[-0.03em]
                         text-sand [text-shadow:0_0_70px_rgba(11,10,8,0.92)]">
            Zahra Prints
          </h1>
          <p className="mt-3 font-ui text-[0.78rem] uppercase tracking-[0.44em] text-amber">
            Quality on Wallahi
          </p>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link to="/shop"
              className="pointer-events-auto bg-ember px-9 py-4 font-ui text-[0.8rem] font-semibold
                         uppercase tracking-[0.18em] text-ink transition hover:bg-amber
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                         focus-visible:outline-amber">
              Shop the collection
            </Link>
            <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto border border-gold/50 px-8 py-4 font-ui text-[0.8rem]
                         uppercase tracking-[0.18em] text-sand/85 transition hover:border-gold
                         hover:text-sand focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-4 focus-visible:outline-amber">
              Buy on Etsy ↗
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10" aria-labelledby="featured-h">
        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <h2 id="featured-h" className="font-display text-[length:var(--text-1)] tracking-[-0.02em]">
            Featured
          </h2>
          <Link to="/shop" className="shrink-0 font-ui text-[0.75rem] uppercase tracking-[0.2em]
                                      text-amber hover:underline">
            All {products.length} pieces →
          </Link>
        </Reveal>

        {/* Staggered run: alternate items drop, so the row reads as a spread
            rather than a catalogue grid. Portrait imagery makes that natural. */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:gap-x-8">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.07} className={i % 2 === 1 ? "md:mt-16" : ""}>
              <ProductCard product={p} eager={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      <GirihDivider />

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10" aria-labelledby="story-h">
        <div className="grid gap-14 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <Reveal>
            <h2 id="story-h" className="font-display text-[length:var(--text-1)] leading-[1.05] tracking-[-0.02em]">
              Made for people who wear what they mean.
            </h2>
            <p className="mt-8 max-w-[54ch] font-ui text-[length:var(--text-4)] leading-relaxed text-sand/72">
              Every piece starts with the script. Heavyweight fleece, snow-washed
              cotton, raw hems left honest — then calligraphy that says something
              worth carrying. No filler graphics, no borrowed motifs.
            </p>
            <p className="mt-5 max-w-[54ch] font-ui leading-relaxed text-sand/60">
              We have been shipping from the same small shop since 2025. The
              fabric is thick because thin fabric does not last, and the print
              holds because we would rather make fewer things properly.
            </p>
            <Link to="/about" className="mt-8 inline-block font-ui text-[0.75rem] uppercase
                                         tracking-[0.2em] text-amber hover:underline">
              The full story →
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center">
            <div className="text-center">
              <Arabic phrase="rahma" showLatin className="text-[clamp(3.5rem,9vw,6rem)]" />
              <p className="mt-6 max-w-[26ch] font-ui text-sm leading-relaxed text-sand/55">
                Mercy. One of four words we will put on a garment, and only when
                it is set properly.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10" aria-labelledby="cat-h">
        <Reveal><h2 id="cat-h" className="mb-10 font-display text-[length:var(--text-1)] tracking-[-0.02em]">
          Categories
        </h2></Reveal>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <li>
                <Link to={`/shop?category=${c.id}`}
                  className="group flex h-full flex-col justify-between border border-gold/22 p-5
                             transition-colors hover:border-gold/55 hover:bg-gold/[0.04]
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                             focus-visible:outline-amber
                             [clip-path:polygon(14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%,0_14px)]">
                  <span className="font-ui text-[0.7rem] uppercase tracking-[0.24em] text-sand/45">
                    {countBy(c.id)} pieces
                  </span>
                  <span className="mt-8 block font-display text-2xl text-sand group-hover:text-amber">
                    {c.label}
                  </span>
                  <span className="mt-1 block font-ui text-xs text-sand/55">{c.blurb}</span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <GirihDivider />

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10" aria-labelledby="rev-h">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 id="rev-h" className="font-display text-[length:var(--text-1)] tracking-[-0.02em]">
              {RATING.average}
            </h2>
            <div className="mt-3 text-amber"><Stars value={RATING.average} size={20} /></div>
            <p className="mt-4 font-ui text-sm text-sand/60">
              Across {RATING.totalOnEtsy} Etsy reviews. {RATING.written} left written feedback.
            </p>
            <Link to="/reviews" className="mt-6 inline-block font-ui text-[0.75rem] uppercase
                                           tracking-[0.2em] text-amber hover:underline">
              Read them →
            </Link>
          </Reveal>
          <ul className="space-y-6">
            {pulled.map((r, i) => (
              <Reveal key={r.reviewer + r.date} delay={i * 0.08}>
                <li className="border-l border-gold/35 pl-6">
                  <p className="font-ui leading-relaxed text-sand/85">“{r.message}”</p>
                  <p className="mt-2 font-ui text-[0.72rem] uppercase tracking-[0.2em] text-sand/45">
                    {r.reviewer}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

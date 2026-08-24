import { Reveal } from "../components/Reveal";
import { Stars } from "../components/Stars";
import { useSeo } from "../lib/seo";
import { ETSY_SHOP, RATING, reviews } from "../lib/catalog";

const when = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

export function Reviews() {
  useSeo(
    "Reviews — Zahra Prints",
    `${RATING.average} across ${RATING.totalOnEtsy} Etsy reviews. ${RATING.written} customers left written feedback.`,
  );

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
      <header className="mb-16 border-b border-gold/18 pb-12">
        <h1 className="font-display text-[clamp(4.5rem,14vw,9rem)] leading-none tracking-[-0.04em] text-amber">
          {RATING.average}
        </h1>
        <div className="mt-4 text-amber"><Stars value={RATING.average} size={24} /></div>
        <p className="mt-5 max-w-[52ch] font-ui text-sand/65">
          Averaged across all {RATING.totalOnEtsy} reviews on Etsy. {RATING.written} of those
          customers wrote something, and those are the ones below — we would rather
          show you the words than pad the count.
        </p>
        <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-block font-ui text-[0.75rem] uppercase tracking-[0.2em]
                     text-amber hover:underline">
          See every review on Etsy ↗
        </a>
      </header>

      {/* CSS columns give a masonry flow without measuring anything in JS. */}
      <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:balance]">
        {reviews.map((r, i) => (
          <li key={`${r.reviewer}-${r.date}-${i}`} className="mb-6 break-inside-avoid">
            <Reveal delay={Math.min(i, 8) * 0.04}>
              <article className="border border-gold/18 p-6 transition-colors hover:border-gold/38">
                <div className="text-amber"><Stars value={r.rating} /></div>
                <p className="mt-4 font-ui leading-relaxed text-sand/85">{r.message}</p>
                <footer className="mt-5 flex items-baseline justify-between gap-3">
                  <span className="font-ui text-[0.72rem] uppercase tracking-[0.2em] text-sand/55">
                    {r.reviewer}
                  </span>
                  <time dateTime={r.date} className="font-ui text-[0.68rem] text-sand/35">
                    {when(r.date)}
                  </time>
                </footer>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

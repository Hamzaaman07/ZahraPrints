import { Arabic } from "../components/Arabic";
import { GirihDivider } from "../components/GirihDivider";
import { Reveal } from "../components/Reveal";
import { useSeo } from "../lib/seo";
import { ETSY_SHOP, products } from "../lib/catalog";

const wide = products.find((p) => p.images.length >= 6)?.images ?? [];

export function About() {
  useSeo(
    "About — Zahra Prints",
    "Why the script comes first, how the garments are made, and what we will and will not put on a shirt.",
  );

  return (
    <div>
      <section className="mx-auto max-w-[1100px] px-5 py-20 md:px-10">
        <Reveal>
          <p className="font-ui text-[0.7rem] uppercase tracking-[0.28em] text-amber">About</p>
          <h1 className="mt-6 font-display text-[length:var(--text-1)] leading-[1.03] tracking-[-0.025em]">
            The script comes first. Everything else is built to carry it.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-10 max-w-[58ch] font-ui text-[length:var(--text-4)] leading-relaxed text-sand/75">
            Zahra Prints started because the Arabic streetwear we could find was
            either beautiful script on a garment that fell apart, or a decent
            garment with letterforms that had clearly never been read by anyone
            who could read them.
          </p>
        </Reveal>
      </section>

      {wide[0] && (
        <Reveal>
          <figure className="relative h-[58vh] overflow-hidden md:h-[74vh]">
            <img src={wide[0]} alt="A Zahra Prints garment, worn" width={1600} height={1000}
                 loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/12 to-ink/45" />
          </figure>
        </Reveal>
      )}

      <section className="mx-auto max-w-[1100px] px-5 py-20 md:px-10">
        <div className="grid gap-14 md:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[length:var(--text-2)] tracking-[-0.02em]">
              What we put on a garment
            </h2>
            <p className="mt-6 font-ui leading-relaxed text-sand/72">
              Four phrases, and we do not add a fifth without asking. Each one is
              typeset in a real Arabic face by someone who reads it — never traced,
              never drawn, never stretched to fill a space.
            </p>
            <p className="mt-4 font-ui leading-relaxed text-sand/60">
              If a phrase would not survive being read closely by someone who
              knows the language, it does not go on the shirt.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid grid-cols-2 gap-8">
              {(["bismillah", "alhamdulillah", "rahma", "zahra"] as const).map((p) => (
                <li key={p} className="border border-gold/18 py-8 text-center">
                  <Arabic phrase={p} showLatin className="text-[2.4rem]" />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <GirihDivider />

      <section className="mx-auto max-w-[1100px] px-5 py-20 md:px-10">
        <div className="grid gap-14 md:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[length:var(--text-2)] tracking-[-0.02em]">
              The geometry is constructed, not drawn
            </h2>
            <p className="mt-6 font-ui leading-relaxed text-sand/72">
              The pattern running through this site is girih — five tiles with
              equal edges, strapwork crossing each edge at its midpoint at exactly
              54°. It is generated from those rules rather than sketched to look
              the part, which is why the ten-pointed stars line up the way they do
              in a Seljuk screen and not the way they do in clip art.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[length:var(--text-2)] tracking-[-0.02em]">
              How the pieces are made
            </h2>
            <p className="mt-6 font-ui leading-relaxed text-sand/72">
              Heavyweight fleece at 360–380 gsm. Snow-washed and acid-washed
              cotton that keeps its hand after a season. Raw hems left raw. Drop
              shoulders cut boxy on purpose.
            </p>
            <p className="mt-4 font-ui leading-relaxed text-sand/60">
              Thin fabric is cheaper and we are not interested. Fewer pieces,
              made properly, is the whole business.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 pb-28 md:px-10">
        <Reveal>
          <div className="border border-gold/22 p-10 text-center md:p-16">
            <Arabic phrase="bismillah" className="text-[2.6rem]" />
            <p className="mx-auto mt-8 max-w-[44ch] font-ui text-[length:var(--text-4)] leading-relaxed text-sand/75">
              Everything is sold through our Etsy shop, where it has been since
              the beginning. {products.length} pieces are up right now.
            </p>
            <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
              className="mt-9 inline-block bg-ember px-9 py-4 font-ui text-[0.8rem] font-semibold
                         uppercase tracking-[0.18em] text-ink transition hover:bg-amber
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                         focus-visible:outline-amber">
              Shop on Etsy ↗
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { ETSY_SHOP } from "../lib/catalog";
import { Arabic } from "./Arabic";

export function Footer() {
  return (
    <footer className="border-t border-gold/18 bg-ink-sunken">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
        <img src="/brand/logo-horizontal-on-dark.svg" alt="Zahra Prints"
             width={420} height={126} className="h-auto w-[280px]" />

        <div className="mt-12 grid gap-10 border-t border-gold/12 pt-10 sm:grid-cols-3">
          <nav aria-label="Footer">
            <h2 className="font-ui text-[0.7rem] uppercase tracking-[0.24em] text-sand/45">Browse</h2>
            <ul className="mt-4 space-y-2">
              {[["/shop", "Shop"], ["/reviews", "Reviews"], ["/about", "About"]].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="font-ui text-sm text-sand/75 hover:text-amber">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-ui text-[0.7rem] uppercase tracking-[0.24em] text-sand/45">Buying</h2>
            <p className="mt-4 max-w-[30ch] font-ui text-sm leading-relaxed text-sand/70">
              Every order is placed and paid for on Etsy. This site is the lookbook.
            </p>
            <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
               className="mt-4 inline-block font-ui text-sm text-amber hover:underline">
              Open the Etsy shop ↗
            </a>
          </div>

          <div className="sm:text-right">
            <Arabic phrase="rahma" className="text-[1.9rem] sm:items-end" />
            <p className="mt-3 font-ui text-[0.7rem] uppercase tracking-[0.24em] text-sand/45">
              Quality on Wallahi
            </p>
          </div>
        </div>

        <p className="mt-12 font-ui text-[0.7rem] text-sand/35">
          © {new Date().getFullYear()} Zahra Prints.
        </p>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ETSY_SHOP } from "../lib/catalog";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/reviews", label: "Reviews" },
  { to: "/about", label: "About" },
];

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-gold/20 bg-ink/92 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 md:px-10">
        <Link to="/" className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2
                                focus-visible:outline-offset-4 focus-visible:outline-amber">
          <img src="/brand/logo-mark-on-dark.svg" alt="" width={38} height={38} className="h-9 w-9" />
          <span className="font-display text-lg tracking-[0.06em] text-sand">Zahra Prints</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `font-ui text-[0.78rem] uppercase tracking-[0.2em] transition-colors
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                 focus-visible:outline-amber ${isActive ? "text-amber" : "text-sand/70 hover:text-sand"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
             className="border border-gold/45 px-4 py-2 font-ui text-[0.72rem] uppercase
                        tracking-[0.2em] text-amber transition-colors hover:bg-gold/12
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                        focus-visible:outline-amber">
            Etsy ↗
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="font-ui text-[0.75rem] uppercase tracking-[0.2em] text-sand md:hidden
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                     focus-visible:outline-amber"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-gold/20 bg-ink px-5 pb-5 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block border-b border-gold/12 py-4 font-ui text-sm uppercase tracking-[0.2em] text-sand">
              {l.label}
            </NavLink>
          ))}
          <a href={ETSY_SHOP} target="_blank" rel="noopener noreferrer"
             className="block py-4 font-ui text-sm uppercase tracking-[0.2em] text-amber">
            Shop on Etsy ↗
          </a>
        </nav>
      )}
    </header>
  );
}

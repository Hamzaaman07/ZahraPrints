import { Link } from "react-router-dom";
import { useSeo } from "../lib/seo";

export function NotFound() {
  useSeo("Not found — Zahra Prints", "That page does not exist.");
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-[640px] flex-col items-center justify-center px-5 text-center">
      <h1 className="font-display text-[length:var(--text-1)] tracking-[-0.02em]">Not here</h1>
      <p className="mt-4 font-ui text-sand/65">
        That page does not exist. The collection is still where you left it.
      </p>
      <Link to="/shop"
        className="mt-8 bg-ember px-8 py-4 font-ui text-[0.8rem] font-semibold uppercase
                   tracking-[0.18em] text-ink transition hover:bg-amber">
        Browse the shop
      </Link>
    </div>
  );
}

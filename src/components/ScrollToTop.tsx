import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Router keeps scroll position across route changes; product pages need the top. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  }, [pathname]);
  return null;
}

import { useEffect, useState } from "react";

export type Immersive = "high" | "low" | "off";

/**
 * Which hero this visitor gets.
 *
 * "off" under prefers-reduced-motion — that is a stated preference, not a
 * capability guess, so it is honoured everywhere. Otherwise phones get "low"
 * (same carved screen, half the layers, no bloom) and wider screens "high".
 * Starts "off" so the first paint is always the cheap flat field and the 3D
 * chunk is never fetched before we know it is wanted.
 */
export function useImmersive(wideFrom = 900): Immersive {
  const [tier, setTier] = useState<Immersive>("off");

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${wideFrom}px)`);
    const evaluate = () =>
      setTier(motion.matches ? "off" : wide.matches ? "high" : "low");
    evaluate();
    motion.addEventListener("change", evaluate);
    wide.addEventListener("change", evaluate);
    return () => {
      motion.removeEventListener("change", evaluate);
      wide.removeEventListener("change", evaluate);
    };
  }, [wideFrom]);

  return tier;
}

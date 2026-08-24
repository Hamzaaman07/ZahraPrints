/**
 * The carved ground: one continuous girih strapwork field.
 *
 * Geometry is generated at build time by scripts/build-girih.ts from the five
 * tile definitions, so the browser only paints paths. Straps arrive sorted into
 * rings by distance from centre, which lets the hero draw them in radiating
 * outward using a handful of nodes rather than thirteen hundred.
 *
 * Straps render as interlaced double-line bands, the way drawn girih reads:
 * every ring is stroked thick in the band colour, then re-stroked thinner in
 * the ground colour on top, leaving two parallel edges. All the thick passes
 * must come before any thin pass or a later band paints over an earlier one's
 * inner line — hence two separate groups rather than one pass per ring.
 */
import girih from "../data/girih.json";

interface GirihFieldProps {
  animate?: boolean;
  className?: string;
  opacity?: number;
  /** Must match the surface behind the field, since it cuts the band open. */
  ground?: string;
  /** Band weight in viewBox units; the inner cut is 60% of it. */
  weight?: number;
}

export function GirihField({
  animate = false,
  className = "",
  opacity = 0.5,
  ground = "var(--color-ink)",
  weight = 15,
}: GirihFieldProps) {
  const stagger = (i: number) =>
    animate ? { animationDelay: `${i * 0.16}s` } : undefined;
  const cls = animate ? "girih-draw" : undefined;

  return (
    <svg
      viewBox={girih.viewBox}
      className={className}
      aria-hidden="true"
      focusable="false"
      data-testid="girih-field"
      data-rings={girih.rings.length}
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
        <g stroke="currentColor" strokeWidth={weight}>
          {girih.rings.map((d, i) => (
            <path key={`band-${i}`} d={d} pathLength={1} className={cls} style={stagger(i)} />
          ))}
        </g>
        <g stroke={ground} strokeWidth={weight * 0.6}>
          {girih.rings.map((d, i) => (
            <path key={`cut-${i}`} d={d} pathLength={1} className={cls} style={stagger(i)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

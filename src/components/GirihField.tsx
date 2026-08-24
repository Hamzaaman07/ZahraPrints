/**
 * The carved ground: one continuous girih strapwork field.
 *
 * The geometry is generated at build time by scripts/build-girih.ts from the
 * five tile definitions, so the browser does no construction work — it only
 * paints paths. Straps arrive pre-sorted into rings by distance from centre,
 * which lets the hero draw itself in radiating outward using eight nodes
 * rather than thirteen hundred.
 */
import girih from "../data/girih.json";

interface GirihFieldProps {
  /** Draw the straps in on mount, outward from the centre. */
  animate?: boolean;
  className?: string;
  opacity?: number;
}

export function GirihField({ animate = false, className = "", opacity = 0.14 }: GirihFieldProps) {
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
      <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"
         strokeLinejoin="round" opacity={opacity}>
        {girih.rings.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className={animate ? "girih-draw" : undefined}
            style={animate ? { animationDelay: `${i * 0.18}s` } : undefined}
          />
        ))}
      </g>
    </svg>
  );
}

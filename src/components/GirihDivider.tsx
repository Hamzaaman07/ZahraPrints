import girih from "../data/girih.json";

/**
 * A thin window onto the same strapwork field the hero uses, so section breaks
 * are cut from the pattern rather than being a new ornament.
 */
export function GirihDivider({ className = "" }: { className?: string }) {
  const [, , w] = girih.viewBox.split(" ").map(Number);
  return (
    <div className={`relative h-20 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`${-w / 2} -90 ${w} 180`} className="h-full w-full text-gold"
           preserveAspectRatio="xMidYMid slice">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}>
          <g stroke="currentColor" strokeWidth={13}>
            {girih.rings.map((d, i) => <path key={i} d={d} />)}
          </g>
          <g stroke="var(--color-ink)" strokeWidth={7.8}>
            {girih.rings.map((d, i) => <path key={i} d={d} />)}
          </g>
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0
                      bg-[linear-gradient(90deg,var(--color-ink),transparent_22%,transparent_78%,var(--color-ink))]" />
    </div>
  );
}

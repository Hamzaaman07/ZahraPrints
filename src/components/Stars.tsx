/** Star row. The rating is conveyed in text too, so this is decorative. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-[0.15em]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20"
             fill={i <= Math.round(value) ? "currentColor" : "none"}
             stroke="currentColor" strokeWidth={1.4}>
          <path d="M10 1.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L10 14.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z"
                strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

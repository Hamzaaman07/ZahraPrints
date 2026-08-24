/**
 * Arabic is typeset, never drawn.
 *
 * Generated Arabic is reliably broken — disconnected letterforms, wrong
 * contextual shaping, invalid ligatures — and for a sacred phrase a garbled
 * render is offensive rather than merely untidy. So Arabic on this site is
 * always real Unicode in a real Arabic face, wrapped so shaping and bidi
 * resolve correctly.
 *
 * Rules this file exists to enforce:
 *   - Only the four approved phrases. The union type makes anything else a
 *     compile error rather than a judgement call at review time.
 *   - Never as SVG paths, traced letterforms, or generated imagery.
 *   - Never stretched, skewed, mirrored, or elongated with fake kashida. There
 *     is deliberately no `style`, `className` transform, or scale prop here.
 *
 * Adding a phrase requires the shop owner's sign-off. See CLAUDE.md.
 */

export const APPROVED = {
  bismillah: { text: "بسم الله", latin: "Bismillah", gloss: "In the name of God" },
  alhamdulillah: { text: "الحمد لله", latin: "Alhamdulillah", gloss: "Praise be to God" },
  rahma: { text: "رحمة", latin: "Rahma", gloss: "Mercy" },
  zahra: { text: "زهراء", latin: "Zahra", gloss: "Zahra" },
} as const;

export type ApprovedPhrase = keyof typeof APPROVED;

interface ArabicProps {
  phrase: ApprovedPhrase;
  /** Optional romanisation beneath, for readers who don't read Arabic. */
  showLatin?: boolean;
  className?: string;
}

export function Arabic({ phrase, showLatin = false, className = "" }: ArabicProps) {
  const { text, latin, gloss } = APPROVED[phrase];
  return (
    <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <span
        lang="ar"
        dir="rtl"
        title={`${latin} — ${gloss}`}
        data-testid={`arabic-${phrase}`}
        className="font-arabic leading-[1.8] text-amber"
      >
        {text}
      </span>
      {showLatin && (
        <span className="font-ui text-[0.7rem] uppercase tracking-[0.18em] text-sand/60">
          {latin}
        </span>
      )}
    </span>
  );
}

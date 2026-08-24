import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Scroll reveal. Under prefers-reduced-motion it renders plainly, no offset. */
export function Reveal({
  children, delay = 0, y = 28, className = "",
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

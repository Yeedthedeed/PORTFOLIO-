import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ease, dur } from "../motion";

/**
 * SECTION 2 — STATEMENT (100vh)
 *
 * One sentence of visual philosophy.
 * Held in negative space. Left-aligned to a 40% column.
 * Nothing else. No label. No author attribution.
 *
 * The statement IS the section.
 */

const STATEMENT =
  "Light is not what I capture — it is what I decide to let through.";

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.4, 0.75, 0.95], [0, 1, 1, 0]);
  const y       = useTransform(scrollYProgress, [0.15, 0.4], [32, 0]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        height: "100svh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        zIndex: 10,
        padding: "0 var(--gutter)",
      }}
    >
      <motion.p
        style={{ opacity, y }}
        className="t-display"
        transition={{ duration: dur.long, ease: ease.out }}
        aria-label={STATEMENT}
      >
        <span
          style={{
            display: "block",
            maxWidth: "40vw",
            minWidth: 280,
            fontSize: "clamp(1.6rem, 3.2vw, 3.4rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            fontWeight: 300,
            color: "var(--ink)",
            fontStyle: "italic",
            fontFamily: "var(--font-display)",
          }}
        >
          {STATEMENT}
        </span>
      </motion.p>
    </section>
  );
}

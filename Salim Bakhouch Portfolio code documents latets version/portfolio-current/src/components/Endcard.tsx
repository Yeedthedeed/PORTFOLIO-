import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ease, dur } from "../motion";

/**
 * SECTION 5 — ENDCARD (100vh)
 *
 * Name. Email. One line.
 * No form. No social wall. No icons. No "Get in Touch."
 * The filmmaker's direct address to the world.
 */
export default function Endcard() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale   = useTransform(scrollYProgress, [0, 0.5], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <footer
      ref={ref}
      id="contact"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(3rem,8vh,7rem) var(--gutter) clamp(2rem,5vh,4rem)",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {/* Top hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: dur.epic, ease: ease.out }}
        style={{
          height: 1,
          background: "rgba(237,232,225,0.12)",
          transformOrigin: "left center",
          marginBottom: "clamp(3rem,8vh,6rem)",
        }}
      />

      {/* Center — name + email */}
      <motion.div
        style={{ scale, opacity, flex: 1, display: "flex", alignItems: "center" }}
      >
        <div>
          <h2
            className="t-display"
            style={{
              fontSize: "clamp(3.5rem, 10vw, 13rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
              marginBottom: "clamp(1.5rem, 4vh, 3.5rem)",
            }}
          >
            Salim
            <br />
            <span style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>
              Bakhouch
            </span>
          </h2>

          {/* Email — direct, no label */}
          <a
            href="mailto:contact@salimbakhouch.com"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(1rem, 2vw, 1.8rem)",
              color: "rgba(34, 81, 232, 0.75)",
              letterSpacing: "-0.01em",
              transition: "color 0.8s var(--ease-out)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(34,81,232,0.95)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(34,81,232,0.75)")}
          >
            [email@placeholder.com]
          </a>
        </div>
      </motion.div>

      {/* Bottom — year + minimal mark */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: dur.base, ease: ease.out }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <span className="t-mono" style={{ color: "var(--ink-dim)", opacity: 0.4 }}>
          MMXXVI
        </span>
        <span className="t-mono" style={{ color: "var(--ink-dim)", opacity: 0.4 }}>
          CINEMATOGRAPHER
        </span>
      </motion.div>
    </footer>
  );
}

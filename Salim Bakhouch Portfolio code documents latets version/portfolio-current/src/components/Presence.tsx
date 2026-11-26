import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * SECTION 4 — PRESENCE (100vh)
 *
 * First-person prose. No "About" label.
 * One paragraph over a secondary still placeholder.
 * The text is the presence. The image is the atmosphere.
 */

const TEXT =
  "[Presence placeholder — first-person prose from the filmmaker. " +
  "A paragraph describing not biography but perspective: how they " +
  "approach a subject, what they look for in a frame, why they do " +
  "what they do. Written in the first person. No credentials. " +
  "No timelines. Only a point of view.]";

export default function Presence() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imgOp  = useTransform(scrollYProgress, [0.08, 0.35, 0.8, 0.96], [0, 0.45, 0.45, 0]);
  const textOp = useTransform(scrollYProgress, [0.2, 0.45, 0.8, 0.95], [0, 1, 1, 0]);
  const textY  = useTransform(scrollYProgress, [0.2, 0.45], [28, 0]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Background still placeholder — very muted */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: imgOp,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(
              90deg,
              rgba(255,255,255,0.02) 0%,
              rgba(255,255,255,0.045) 50%,
              rgba(255,255,255,0.02) 100%
            )`,
            backgroundSize: "200% 100%",
            animation: "shimmer 5s ease-in-out infinite",
          }}
        />
        {/* Darkening overlay — keeps text legible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, var(--bg-base) 35%, rgba(11,10,9,0.72) 100%)",
          }}
        />
      </motion.div>

      {/* Prose */}
      <motion.div
        style={{
          opacity: textOp,
          y: textY,
          position: "relative",
          zIndex: 2,
          padding: "0 var(--gutter)",
          maxWidth: "50rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "clamp(1.1rem, 2vw, 1.55rem)",
            lineHeight: 1.65,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          {TEXT}
        </p>

        {/* Signature line — name only, no label */}
        <motion.div
          style={{ marginTop: "3rem", opacity: 0.5 }}
        >
          <span className="t-mono" style={{ color: "var(--ink-dim)" }}>
            Salim Bakhouch
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

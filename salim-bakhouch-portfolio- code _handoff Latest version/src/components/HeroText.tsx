import { motion, useTransform } from "framer-motion";
import { useMouse } from "../hooks/useMouse";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * HEROTEXT — editorial captions framing the portrait.
 *
 * Positioned absolute inside the 100svh hero section so it sits in the
 * exact original coordinates on load and scrolls naturally with the hero.
 */
export default function HeroText() {
  const { mx2, my2 } = useMouse();
  const tx = useTransform(mx2, [-1, 1], [-2, 2]);
  const ty = useTransform(my2, [-1, 1], [-2, 2]);

  return (
    <>
      {/* ── Top-left kicker — hidden on small screens ─────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1.1, ease: E }}
        style={{
          x: tx,
          y: ty,
          position: "absolute",
          left: "var(--gutter)",
          top: "clamp(7rem, 14vh, 9rem)",
          maxWidth: 210,
          zIndex: 30,
          pointerEvents: "none",
        }}
        className="hidden md:block"
      >
        <div
          className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase"
          style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
        >
          <span
            style={{
              display: "inline-block",
              height: 1,
              width: 20,
              background: "var(--accent)",
            }}
          />
          DOP — 2026
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 350,
            fontSize: "clamp(0.95rem, 1.35vw, 1.15rem)",
            lineHeight: 1.4,
            color: "var(--ink-dim)",
          }}
        >
          Crafting light for stories that refuse to look away.
        </h1>
      </motion.div>

      {/* ── Bottom-right caption — hidden on small screens ─── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 1.1, ease: E }}
        style={{
          x: tx,
          y: ty,
          position: "absolute",
          right: "var(--gutter)",
          bottom: "clamp(2.5rem, 6vh, 4.5rem)",
          textAlign: "right",
          maxWidth: 250,
          zIndex: 30,
          pointerEvents: "none",
        }}
        className="hidden md:block"
      >
        <div
          className="mb-2 flex items-center justify-end gap-2 font-mono text-[10px] uppercase"
          style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
        >
          AVAILABLE — 2026
          <span
            style={{
              display: "inline-block",
              height: 1,
              width: 20,
              background: "var(--accent)",
            }}
          />
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(0.95rem, 1.35vw, 1.15rem)",
            lineHeight: 1.4,
            color: "var(--ink-dim)",
          }}
        >
          Selected works{" "}
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
            2018–2026
          </span>
          .
        </p>
        <p
          className="mt-1 font-mono text-[10px] uppercase"
          style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
        >
          Features · Fashion · Documentary
        </p>
      </motion.div>

      {/* ── Tablet nameplate — the tablet composition's own header ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.9, ease: E }}
        className="tablet-hero-mark"
        aria-hidden="true"
      >
        <p className="tablet-hero-kicker">
          <span aria-hidden />
          Cinematographer · Director of Photography
        </p>
        <p className="tablet-hero-name">
          Salim <em>Bakhouch</em>
        </p>
        <p className="tablet-hero-sub">Selected works · 2018 — 2026</p>
      </motion.div>

      {/* ── Compact mobile caption — clear of the portrait face ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.9, ease: E }}
        style={{
          position: "absolute",
          left: "var(--gutter)",
          top: "5.4rem",
          maxWidth: "min(76vw, 260px)",
          zIndex: 30,
          pointerEvents: "none",
        }}
        className="md:hidden mobile-hero-caption"
      >
        <div
          className="mb-1.5 flex items-center gap-2 font-mono text-[9px] uppercase"
          style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
        >
          <span
            style={{
              display: "inline-block",
              height: 1,
              width: 14,
              background: "var(--accent)",
            }}
          />
          DOP — 2026
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 350,
            fontSize: "0.92rem",
            lineHeight: 1.35,
            color: "var(--ink-dim)",
          }}
        >
          Crafting light for stories that refuse to look away.
        </p>
      </motion.div>

    </>
  );
}

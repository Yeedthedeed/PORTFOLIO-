import { motion, useTransform } from "framer-motion";
import { useMouse } from "../hooks/useMouse";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * HEROTEXT — editorial captions framing the portrait.
 *
 * Desktop: fixed positioning (left kicker + bottom-right caption + scroll cue).
 * Mobile:  hidden fixed captions to prevent face overlap.
 *          The portrait speaks for itself on narrow screens.
 *
 * Typography parallax: ±2px via medium spring — almost imperceptible.
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
        style={{ x: tx, y: ty }}
        className="pointer-events-none fixed z-30 hidden md:block"
        aria-hidden="true"
        /* Positioned below nav, clear of portrait on desktop */
        /* left margin = gutter, top = 7rem clears the nav bar */
        css-note="hidden on mobile to prevent portrait overlap"
      >
        <div
          style={{
            position: "fixed",
            left: "var(--gutter)",
            top: "clamp(7rem, 14vh, 9rem)",
            maxWidth: 200,
          }}
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
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(0.9rem, 1.3vw, 1.1rem)",
              lineHeight: 1.4,
              color: "var(--ink-dim)",
            }}
          >
            Crafting light for stories that refuse to look away.
          </p>
        </div>
      </motion.div>

      {/* ── Bottom-right caption — hidden on small screens ─── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 1.1, ease: E }}
        style={{ x: tx, y: ty }}
        aria-hidden="true"
        className="pointer-events-none fixed z-30 hidden md:block"
      >
        <div
          style={{
            position: "fixed",
            right: "var(--gutter)",
            bottom: "clamp(2.5rem, 6vh, 4.5rem)",
            textAlign: "right",
            maxWidth: 240,
          }}
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
              fontSize: "clamp(0.9rem, 1.3vw, 1.1rem)",
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
        </div>
      </motion.div>

      {/* ── Scroll cue — shown on all sizes ──────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1.4, ease: E }}
        className="pointer-events-none fixed z-30"
        style={{
          bottom: "clamp(1.25rem, 3vh, 2rem)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        aria-hidden="true"
      >
        <div
          className="flex flex-col items-center gap-2 font-mono text-[9px] uppercase"
          style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
        >
          <span>Scroll</span>
          <motion.span
            style={{
              display: "block",
              width: 1,
              height: 28,
              background:
                "linear-gradient(to bottom, var(--accent), transparent)",
              transformOrigin: "top",
            }}
            animate={{ scaleY: [0.2, 1, 0.2], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </>
  );
}

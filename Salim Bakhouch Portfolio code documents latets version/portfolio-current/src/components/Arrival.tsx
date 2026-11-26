import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ease, dur } from "../motion";

/**
 * SECTION 1 — ARRIVAL (100vh)
 *
 * Portrait + name. Nothing else.
 * The opening frame of the film.
 *
 * Sequence:
 *   t=0ms    grain + gradient only
 *   t=400ms  portrait fades in (1800ms, ease.out, y +12px→0)
 *   t=1400ms bloom behind portrait (1800ms)
 *   t=2200ms name types in (60ms/char)
 *   t=3400ms scroll hint at 40% opacity
 *
 * Portrait:
 *   - At 55% horizontal (allows negative space for the gaze)
 *   - Idle breathing: scale 1.000 → 1.008 → 1.000, 8s loop
 *   - Parallax out: moves at 0.85x scroll speed (portrait)
 *   - Grade: contrast(1.05) saturate(0.92) brightness(0.98)
 *   - Mask: radial gradient, soft edge blend
 *
 * PORTRAIT URL IS IMMUTABLE — never regenerate.
 */

const PORTRAIT_URL =
  "https://res.cloudinary.com/gblub9jf/image/upload/v1783889538/DSC05511_1_mo4vjl.jpg";

const NAME = "SALIM BAKHOUCH";

/** Single character reveal with stagger */
function NameReveal({ startAt }: { startAt: number }) {
  const chars = NAME.split("");
  return (
    <div
      aria-label={NAME}
      style={{
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: "0 0.06em",
      }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: startAt / 1000 + i * 0.06,
            duration: 0.001,
          }}
          style={{
            display: "inline-block",
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: ch === " " ? "0.12em" : "-0.03em",
            color: "var(--ink)",
            whiteSpace: ch === " " ? "pre" : undefined,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </div>
  );
}

export default function Arrival() {
  const sectionRef = useRef<HTMLElement>(null);
  const [idleBloom, setIdleBloom] = useState(false);

  /* Scroll-linked parallax — portrait at 0.85x */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const sectionOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Mouse parallax — portrait max ±6px */
  const rawMx = useMotionValue(0);
  const rawMy = useMotionValue(0);
  const mx = useSpring(rawMx, { stiffness: 38, damping: 18, mass: 0.9 });
  const my = useSpring(rawMy, { stiffness: 38, damping: 18, mass: 0.9 });
  const px = useTransform(mx, [-1, 1], [-6, 6]);
  const py = useTransform(my, [-1, 1], [-5, 5]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(idleTimer);
      setIdleBloom(false);
      idleTimer = setTimeout(() => setIdleBloom(true), 3000);
    };

    const onMove = (e: MouseEvent) => {
      rawMx.set((e.clientX / window.innerWidth) * 2 - 1);
      rawMy.set((e.clientY / window.innerHeight) * 2 - 1);
      reset();
    };

    reset();
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(idleTimer);
    };
  }, [rawMx, rawMy]);

  const PORTRAIT_START  = 400;
  const BLOOM_START     = 1400;
  const NAME_START      = 2200;
  const SCROLL_START    = 3400;

  return (
    <motion.section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100svh",
        width: "100%",
        overflow: "hidden",
        opacity: sectionOp,
      }}
    >
      {/* ── Portrait layer (z3) ────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: portraitY,
          x: px,
          willChange: "transform",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            /*
             * 55% horizontal: portrait's facial mass sits right of center,
             * opening left-side negative space for the gaze direction.
             * Height: 90vh. Width auto from aspect.
             */
            top: 0,
            bottom: 0,
            left: "5%",
            right: "0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            y: py,
          }}
        >
          {/* Breathing container */}
          <motion.div
            style={{ height: "100%", width: "100%", position: "relative" }}
            animate={{ scale: [1, 1.008, 1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: ease.inOut,
              times: [0, 0.5, 1],
            }}
          >
            <motion.img
              src={PORTRAIT_URL}
              alt="Salim Bakhouch — Cinematographer"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: PORTRAIT_START / 1000,
                duration: dur.long,
                ease: ease.out,
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "58% 15%",
                filter: "contrast(1.05) saturate(0.92) brightness(0.98)",
                maskImage: `radial-gradient(
                  ellipse 72% 90% at 60% 38%,
                  black 40%,
                  rgba(0,0,0,0.75) 60%,
                  rgba(0,0,0,0.3)  78%,
                  transparent 94%
                )`,
                WebkitMaskImage: `radial-gradient(
                  ellipse 72% 90% at 60% 38%,
                  black 40%,
                  rgba(0,0,0,0.75) 60%,
                  rgba(0,0,0,0.3)  78%,
                  transparent 94%
                )`,
                willChange: "transform",
              }}
            />

            {/* Bottom page-blend */}
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0 0",
                height: "28%",
                background: "linear-gradient(to bottom, transparent, var(--bg-base) 92%)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Idle bloom pulse behind portrait ──────────────── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: idleBloom ? 0.12 : 0.08 }}
        transition={{ delay: BLOOM_START / 1000, duration: dur.long, ease: ease.out }}
        style={{
          position: "absolute",
          width: "clamp(400px, 55vw, 750px)",
          height: "clamp(400px, 55vw, 750px)",
          borderRadius: "50%",
          left: "calc(55% - clamp(200px, 27.5vw, 375px))",
          top:  "calc(42% - clamp(200px, 27.5vw, 375px))",
          background: "radial-gradient(circle, rgba(var(--accent-rgb), 1), transparent 65%)",
          filter: "blur(120px)",
          zIndex: 4,
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />

      {/* ── Name (z5 — typography) ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "var(--gutter)",
          bottom: "clamp(2.5rem, 6vh, 5rem)",
          zIndex: 5,
        }}
      >
        {/* Discipline label above name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: NAME_START / 1000 - 0.1, duration: dur.short, ease: ease.out }}
          className="t-mono"
          style={{ color: "var(--ink-dim)", marginBottom: "1rem" }}
        >
          Cinematographer &nbsp;&amp;&nbsp; Director of Photography
        </motion.div>

        {/* Name — character by character */}
        <div style={{ fontSize: "clamp(2.2rem, 6vw, 7rem)" }}>
          <NameReveal startAt={NAME_START} />
        </div>
      </div>

      {/* ── Scroll hint (z5) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: SCROLL_START / 1000, duration: dur.long, ease: ease.out }}
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 4vh, 3rem)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
        }}
      >
        <span className="t-mono" style={{ color: "var(--ink-dim)" }}>
          scroll
        </span>
      </motion.div>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sfx } from "../audio/SoundEngine";

type Props = { onDone: () => void };
const E: [number, number, number, number] = [0.16, 1, 0.3, 1];
const PHASES = [
  "INITIALISING SENSOR",
  "LOADING LUT — KODAK 2383",
  "SYNC TIMECODE  24.000",
  "CALIBRATING WHITE POINT",
  "ROLLING",
];

/**
 * LOADER — restored original cinematic awakening sequence.
 */
export default function Loader({ onDone }: Props) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const DURATION = 2600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pi = setInterval(() => setPhase(v => Math.min(v + 1, PHASES.length - 1)), 520);
    const done = setTimeout(() => { sfx.reveal(); onDone(); }, DURATION + 900);
    return () => { cancelAnimationFrame(raf); clearInterval(pi); clearTimeout(done); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden"
      style={{ background: "var(--bg)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.015 }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Atmospheric haze */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 2.2, ease: E }}
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(61,159,255,0.09) 0%, transparent 60%)", filter: "blur(60px)" }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9, ease: E }}
        className="relative z-10 flex items-center justify-between px-8 pt-8 font-mono text-[10px] uppercase tracking-label"
        style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
      >
        <span>ETHEREALISM — PORTFOLIO</span>
        <span>4K · 24FPS · 2.39:1</span>
      </motion.div>

      {/* Center */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-8">
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.5, duration: 1.6, ease: E }}
          className="select-none text-center font-display"
          style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", letterSpacing: "-0.04em", lineHeight: 0.9, fontFamily: "var(--font-display)", fontWeight: 350 }}
        >
          <span style={{ fontStyle: "italic" }}>Salim</span>
          <br />
          <span>Bakhouch</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1, ease: E }}
          className="font-mono text-[10px] uppercase"
          style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
        >
          Cinematographer &nbsp;·&nbsp; Director of Photography
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.9, ease: E }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          <div className="relative h-px w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ width: `${count}%`, background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }}
            />
          </div>
          <div
            className="mt-3 flex justify-between font-mono text-[10px] uppercase"
            style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
          >
            <motion.span key={phase} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }}>
              {PHASES[phase]}
            </motion.span>
            <span style={{ color: "var(--ink)" }}>{String(count).padStart(3, "0")}</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9, ease: E }}
        className="relative z-10 flex items-end justify-between px-8 pb-8 font-mono text-[10px] uppercase"
        style={{ letterSpacing: "0.28em", color: "var(--muted)" }}
      >
        <span>BERLIN · LISBON · WORLDWIDE</span>
        <span className="flex items-center gap-2">
          <span className="rec-blink inline-block h-[5px] w-[5px] rounded-full" style={{ background: "var(--accent)" }} />
          STANDBY
        </span>
      </motion.div>
    </motion.div>
  );
}

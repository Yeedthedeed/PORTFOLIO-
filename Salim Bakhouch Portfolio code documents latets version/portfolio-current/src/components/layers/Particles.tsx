import { motion } from "framer-motion";
import { useMemo } from "react";
import { ease } from "../../motion";

/**
 * LAYER Z2 — Dust Motes / Particles
 * 16 near-invisible motes drifting at different speeds and angles.
 * Memoized to avoid regeneration on re-renders.
 * Each mote is unique — nothing loops in sync.
 */
export default function Particles({ count = 16 }: { count?: number }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 10 + Math.random() * 80,
        size: 0.5 + Math.random() * 1.2,
        dx: (Math.random() - 0.5) * 80,
        dy: -(20 + Math.random() * 70),
        dur: 35 + Math.random() * 40,
        delay: Math.random() * 25,
        maxOp: 0.18 + Math.random() * 0.22,
      })),
    [count]
  );

  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}
    >
      {motes.map((m) => (
        <motion.span
          key={m.id}
          style={{
            position: "absolute",
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            borderRadius: "50%",
            background: "var(--ink)",
            willChange: "transform, opacity",
          }}
          animate={{
            x: [0, m.dx * 0.4, m.dx],
            y: [0, m.dy * 0.5, m.dy],
            opacity: [0, m.maxOp, m.maxOp * 0.6, 0],
          }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Infinity,
            ease: ease.out,
            times: [0, 0.2, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}

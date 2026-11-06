import { motion } from "framer-motion";
import { ease } from "../../motion";

/**
 * LAYER Z4 — Sapphire Bloom
 * Radial glow behind portrait position. 8% base opacity.
 * Breathes with the portrait. On 3s idle: pulses to 12%.
 * NEVER visible as "blue" — only felt as depth.
 */
export default function BloomLight({ idleExpanded = false }: { idleExpanded?: boolean }) {
  const targetOp = idleExpanded ? 0.12 : 0.08;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          width: "clamp(400px, 60vw, 800px)",
          height: "clamp(400px, 60vw, 800px)",
          borderRadius: "50%",
          /* Positioned at 55% horizontal — matches portrait offset */
          left: "calc(55% - clamp(200px, 30vw, 400px))",
          top:  "calc(45% - clamp(200px, 30vw, 400px))",
          background: "radial-gradient(circle, rgba(var(--accent-rgb), 1) 0%, transparent 65%)",
          filter: "blur(120px)",
          willChange: "opacity, transform",
        }}
        animate={{
          opacity: [targetOp, targetOp * 1.08, targetOp],
          scale:   [1, 1.04, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: ease.inOut,
        }}
      />

      {/* Idle pulse — expands smoothly when idleExpanded */}
      <motion.div
        style={{
          position: "absolute",
          width: "clamp(600px, 80vw, 1000px)",
          height: "clamp(600px, 80vw, 1000px)",
          borderRadius: "50%",
          left: "calc(55% - clamp(300px, 40vw, 500px))",
          top:  "calc(45% - clamp(300px, 40vw, 500px))",
          background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.4) 0%, transparent 55%)",
          filter: "blur(180px)",
          willChange: "opacity",
        }}
        animate={{ opacity: idleExpanded ? 0.045 : 0.02 }}
        transition={{ duration: 2, ease: ease.out }}
      />
    </div>
  );
}

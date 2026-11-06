import { motion } from "framer-motion";
import { ease } from "../../motion";

/**
 * LAYER Z1 — Atmospheric Haze
 * Two slow-drifting soft gradient blobs. 45s irregular loops.
 * Provides the sense that the environment breathes independently.
 * Nearly invisible — felt, not seen.
 */
export default function AtmosphericHaze() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Primary warm haze — upper center */}
      <motion.div
        style={{
          position: "absolute",
          width: "80vmax",
          height: "80vmax",
          borderRadius: "50%",
          top: "-20%",
          left: "20%",
          background: "radial-gradient(circle, rgba(30,24,18,0.6) 0%, transparent 65%)",
          filter: "blur(80px)",
          willChange: "transform",
        }}
        animate={{ x: ["0%", "4%", "-3%", "0%"], y: ["0%", "5%", "-2%", "0%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: ease.inOut, times: [0, 0.35, 0.7, 1] }}
      />

      {/* Secondary cool haze — lower right — slight sapphire cast */}
      <motion.div
        style={{
          position: "absolute",
          width: "70vmax",
          height: "70vmax",
          borderRadius: "50%",
          bottom: "-15%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(22,30,55,0.35) 0%, transparent 60%)",
          filter: "blur(100px)",
          willChange: "transform",
        }}
        animate={{ x: ["0%", "-5%", "3%", "0%"], y: ["0%", "4%", "-4%", "0%"] }}
        transition={{ duration: 58, repeat: Infinity, ease: ease.inOut, times: [0, 0.3, 0.65, 1] }}
      />
    </div>
  );
}

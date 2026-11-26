import { motion } from "framer-motion";
import { ease, dur } from "../motion";

/**
 * INDEX — Minimal chrome
 *
 * Name top-left. Audio toggle top-right. Nothing else.
 * The interface disappears behind the experience.
 * No nav links. No hamburger. No underline animations.
 */

export default function Index({ audioEnabled, onAudioToggle }: {
  audioEnabled: boolean;
  onAudioToggle: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3.6, duration: dur.base, ease: ease.out }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(1.25rem,2.5vh,2rem) var(--gutter)",
        pointerEvents: "none",
      }}
    >
      {/* Name — top left */}
      <a
        href="#"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
          letterSpacing: "-0.01em",
          color: "var(--ink)",
          opacity: 0.75,
          pointerEvents: "auto",
          transition: "opacity 0.8s var(--ease-out)",
          textDecoration: "none",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
      >
        Salim Bakhouch
      </a>

      {/* Audio toggle — top right */}
      <button
        onClick={onAudioToggle}
        style={{
          pointerEvents: "auto",
          background: "none",
          border: "none",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={audioEnabled ? "Disable ambient audio" : "Enable ambient audio"}
        title={audioEnabled ? "Audio on" : "Audio off"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ opacity: audioEnabled ? 0.7 : 0.3, transition: "opacity 0.6s" }}
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="var(--ink)"
            strokeWidth="1"
          />
          {audioEnabled && (
            <circle
              cx="8"
              cy="8"
              r="2.5"
              fill="var(--accent)"
              opacity="0.8"
            />
          )}
        </svg>
      </button>
    </motion.header>
  );
}

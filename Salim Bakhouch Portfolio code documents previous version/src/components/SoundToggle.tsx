import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "../audio/SoundEngine";

/**
 * SOUND TOGGLE — fixed top-right, beside the menu button.
 *
 * Visual: animated frequency spectrum bars that pulse when sound is ON,
 * become flat and muted when OFF.
 *
 * 5 bars, each with independent height animation — like a real spectrum
 * analyser reacting to audio. Heights are randomised per frame in the
 * CSS animation, giving an authentic feel.
 *
 * Click: toggles sound on/off with a satisfying click sound (if enabling)
 * or a close sound (if disabling).
 */

const BAR_COUNT = 5;

/* Each bar gets a different animation duration for organic desync */
const BAR_DURATIONS = [0.45, 0.32, 0.58, 0.38, 0.51];
const BAR_DELAYS    = [0,    0.08, 0.16, 0.04, 0.12];

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [pulse, setPulse]     = useState(false);   // brief flash on toggle

  /* Load saved preference on mount */
  useEffect(() => {
    sfx.init();
    setEnabled(sfx.enabled);
  }, []);

  const toggle = useCallback(() => {
    const nowOn = sfx.toggle();
    setEnabled(nowOn);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    /* Play sound only when turning ON — turning OFF is always silent */
    if (nowOn) {
      /* Small delay so AudioContext initialises before we play */
      setTimeout(() => sfx.navigate(), 40);
    }
  }, []);

  return (
    <motion.button
      onClick={toggle}
      aria-label={enabled ? "Disable sound" : "Enable sound"}
      title={enabled ? "Sound ON" : "Sound OFF"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: "clamp(1.25rem,2.5vw,2rem)",
        right: "clamp(5.5rem,10vw,9rem)",   /* sits left of the menu button */
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        background: "none",
        border: "none",
        padding: "0.4rem 0.55rem",
        borderRadius: "100px",
        outline: "none",
        transition: "background 0.3s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(238,243,250,0.06)";
        sfx.hover();
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Frequency bars */}
      <div
        aria-hidden
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "2px",
          height: 16,
        }}
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <motion.span
            key={i}
            style={{
              display: "block",
              width: 2.5,
              borderRadius: 1.5,
              background: enabled
                ? pulse
                  ? "var(--accent-bright)"
                  : "var(--accent)"
                : "rgba(238,243,250,0.28)",
              transformOrigin: "bottom",
              transition: "background 0.35s",
            }}
            animate={
              enabled
                ? {
                    scaleY: [0.25, 1, 0.45, 0.85, 0.35, 1, 0.6, 0.25],
                    opacity: [0.7, 1, 0.8, 1, 0.75, 1, 0.85, 0.7],
                  }
                : {
                    scaleY: 0.18,
                    opacity: 0.3,
                  }
            }
            transition={
              enabled
                ? {
                    duration: BAR_DURATIONS[i],
                    delay: BAR_DELAYS[i],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
            initial={{ scaleY: 0.18 }}
          />
        ))}
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={enabled ? "on" : "off"}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: enabled ? "var(--accent)" : "rgba(238,243,250,0.3)",
            transition: "color 0.35s",
            userSelect: "none",
          }}
        >
          {enabled ? "SFX ON" : "SFX OFF"}
        </motion.span>
      </AnimatePresence>

      {/* Glow ring when active */}
      {enabled && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "100px",
            border: "1px solid rgba(61,159,255,0.22)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}

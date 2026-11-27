import { useEffect } from "react";
import { lightingEngine } from "../lighting/LightingEngine";

/**
 * LIGHTING LAYER
 *
 * Mounts the cinematic lighting engine and renders the surface overlays
 * that consume the CSS custom properties it writes every frame.
 *
 * Three fixed overlay divs — each reads one gradient CSS variable:
 *   .light-key    — cursor-driven key light, follows mouse with spring lag
 *   .light-fill   — fill light, opposite side, slowly drifts
 *   .light-rim    — rim/backlight, fixed upper-right, cool blue pulse
 *   .light-shadow — shadow on the opposite side of key
 *   .light-ao     — ambient occlusion, very subtle centre darkening
 *
 * All overlays use mix-blend-mode: screen for key/fill/rim
 * and multiply for shadow/AO — matching photographic blending.
 *
 * z-index: 75 — above background (z:0), below grain (z:90),
 * below vignette (z:85). Sits in the atmosphere layer.
 */
export default function LightingLayer() {
  useEffect(() => {
    /* A cursor-driven key light has no meaning on touch, and the continuous
       gradient pass is expensive on phone GPUs. Keep the static grade there. */
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let running = false;
    const start = () => {
      if (running || document.hidden) return;
      lightingEngine.start();
      running = true;
    };
    const stop = () => {
      if (!running) return;
      lightingEngine.stop();
      running = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  const base: React.CSSProperties = {
    position:      "fixed",
    inset:         0,
    pointerEvents: "none",
    zIndex:        75,
    transition:    "opacity 2s ease",
  };

  return (
    <>
      {/* Key light — cursor-driven, follows with spring delay */}
      <div
        aria-hidden
        style={{
          ...base,
          background: "var(--light-gradient, none)",
          mixBlendMode: "screen",
          opacity: 0.9,
        }}
      />

      {/* Fill light — opposite side of key */}
      <div
        aria-hidden
        style={{
          ...base,
          background: "var(--fill-gradient, none)",
          mixBlendMode: "screen",
          opacity: 0.8,
        }}
      />

      {/* Rim light — cool blue, upper-right backlight */}
      <div
        aria-hidden
        style={{
          ...base,
          background: "var(--rim-gradient, none)",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      />

      {/* Shadow — opposite key, adds depth directionality */}
      <div
        aria-hidden
        style={{
          ...base,
          background: "var(--shadow-gradient, none)",
          mixBlendMode: "multiply",
          opacity: 0.6,
        }}
      />

      {/* Ambient occlusion — centre slightly darker */}
      <div
        aria-hidden
        style={{
          ...base,
          background: "var(--ao-gradient, none)",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
    </>
  );
}

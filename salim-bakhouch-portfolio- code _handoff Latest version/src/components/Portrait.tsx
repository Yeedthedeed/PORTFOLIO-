import { motion, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { useMouse } from "../hooks/useMouse";
import { sfx } from "../audio/SoundEngine";
import Viewfinder from "./Viewfinder";
import MediaImage from "./MediaImage";
import { PORTRAIT_ORIGINAL_URL, PORTRAIT_SRC } from "../utils/media";

/**
 * PORTRAIT — with Viewfinder interaction.
 *
 * The face region is an interactive hit zone layered over the portrait.
 * When the cursor enters it:
 *   - `faceHover` → true
 *   - Viewfinder EVF HUD fades/scales/rotates in over the portrait
 *   - CustomCursor switches to "viewfinder" reticle via data-cursor attr
 *
 * Face zone coordinates are calibrated to the transparent portrait cutout
 * (900×822, subject face centred around 38% x, 38% y).
 */

const PORTRAIT_FALLBACK_URL = PORTRAIT_ORIGINAL_URL;

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_CINEMA: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function Portrait() {
  const { hx, hy } = useMouse();
  const [faceHover, setFaceHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Parallax — ±18px horizontal, ±14px vertical */
  const tx = useTransform(hx, [-1, 1], [-18, 18]);
  const ty = useTransform(hy, [-1, 1], [-14, 14]);

  const onFaceEnter = useCallback(() => {
    setFaceHover(true);
    sfx.hover();
  }, []);
  const onFaceLeave = useCallback(() => setFaceHover(false), []);
  const onFaceToggle = useCallback(() => {
    setFaceHover((prev) => {
      const next = !prev;
      if (next) sfx.hover();
      return next;
    });
  }, []);

  return (
    <div
      className="hero-portrait-stage"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <motion.div
        ref={containerRef}
        style={{
          x: tx,
          y: ty,
          position: "relative",
          height: "var(--portrait-height, min(100svh, 100vw))",
          maxHeight: "100svh",
          width: "auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          willChange: "transform",
        }}
        /* Organic 3-axis breathing — Y float + tiny scale pulse */
        animate={{
          y: [0, -3, -1, 0],
          scale: [1, 1.005, 1.002, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
          times: [0, 0.35, 0.65, 1],
        }}
      >
        {/* Rim light — right edge */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "5%",
            right: "-10%",
            width: "30%",
            height: "70%",
            background:
              "radial-gradient(ellipse at 100% 40%, rgba(61,159,255,0.08) 0%, transparent 65%)",
            filter: "blur(40px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Ground shadow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-2%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "6%",
            background:
              "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
            filter: "blur(18px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Portrait + EVF Viewfinder */}
        <div
          style={{
            position: "relative",
            height: "100%",
            zIndex: 1,
          }}
        >
          <MediaImage
            src={PORTRAIT_SRC}
            fallbackSrc={PORTRAIT_FALLBACK_URL}
            alt="Salim Bakhouch — Cinematographer and Director of Photography"
            width={1312}
            height={1199}
            loading="eager"
            fetchPriority="high"
            draggable={false}
            style={{
              display: "block",
              height: "100%",
              width: "auto",
              maxWidth: "100vw",
              objectFit: "contain",
              objectPosition: "bottom center",
            }}
          />

          {/* ── VIEWFINDER HUD ──────────────────────────── */}
          <motion.div
            initial={false}
            animate={{
              opacity: faceHover ? 1 : 0,
              scale: faceHover ? 1 : 0.96,
              rotate: faceHover ? 0 : -0.5,
            }}
            transition={{
              duration: faceHover ? 0.85 : 0.65,
              ease: faceHover ? EASE_EXPO : EASE_CINEMA,
            }}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "42% 35%",
              pointerEvents: "none",
            }}
          >
            <Viewfinder active={faceHover} />
          </motion.div>

          {/* ── FACE HIT ZONE ────────────────────────────── */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Inspect portrait through cinema viewfinder"
            aria-pressed={faceHover}
            data-cursor="viewfinder"
            onMouseEnter={onFaceEnter}
            onMouseLeave={onFaceLeave}
            onClick={onFaceToggle}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onFaceToggle();
              } else if (event.key === "Escape" && faceHover) {
                setFaceHover(false);
              }
            }}
            style={{
              position: "absolute",
              left: "22%",
              top: "12%",
              width: "44%",
              height: "52%",
              borderRadius: "50%",
              pointerEvents: "auto",
              outline: "none",
            }}
          />

          {/* Film grain */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              mixBlendMode: "overlay",
              opacity: 0.045,
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <filter id="pg3">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.72"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#pg3)" />
            </svg>
          </div>
        </div>

        {/* Bottom page fade */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: "-20%",
            right: "-20%",
            height: "24%",
            background:
              "linear-gradient(to bottom, transparent 0%, var(--bg) 92%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </motion.div>
    </div>
  );
}

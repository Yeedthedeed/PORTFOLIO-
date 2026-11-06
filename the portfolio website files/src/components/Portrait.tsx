import { motion, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { useMouse } from "../hooks/useMouse";
import Viewfinder from "./Viewfinder";

/**
 * PORTRAIT — with Viewfinder interaction (Option B).
 *
 * The face region is an invisible hit zone layered over the portrait.
 * When the cursor enters it:
 *   - `faceHover` → true
 *   - Viewfinder fades/scales/rotates in (premium easing)
 *   - CustomCursor switches to "viewfinder" variant via data-cursor attr
 *
 * The face zone is positioned based on the image's known composition:
 *   - Subject face center: ~55% x, ~32% y of the portrait height
 *   - Zone is an ellipse: 36% wide, 28% tall of the container
 *
 * Viewfinder transition:
 *   animate in:  opacity 0→1, scale 0.96→1, rotate -0.5°→0°, 0.85s expo
 *   animate out: opacity 1→0, scale 1→0.96, rotate 0°→-0.5°, 0.65s expo
 */

const PORTRAIT_URL =
  "https://res.cloudinary.com/gblub9jf/image/upload/v1783889538/DSC05511_1_mo4vjl.jpg";

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_CINEMA: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function Portrait() {
  const { hx, hy } = useMouse();
  const [faceHover, setFaceHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Parallax — ±18px horizontal, ±14px vertical */
  const tx = useTransform(hx, [-1, 1], [-18, 18]);
  const ty = useTransform(hy, [-1, 1], [-14, 14]);
  /* Halo counter-parallax — moves opposite for 3D depth */
  const haloX = useTransform(hx, [-1, 1], [28, -28]);
  const haloY = useTransform(hy, [-1, 1], [18, -18]);

  const onFaceEnter = useCallback(() => setFaceHover(true),  []);
  const onFaceLeave = useCallback(() => setFaceHover(false), []);

  return (
    <div
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
          height: "95svh",
          width: "auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          willChange: "transform",
        }}
        /* Organic 3-axis breathing — Y float + tiny scale pulse */
        animate={{
          y:     [0, -3, -1, 0],
          scale: [1, 1.005, 1.002, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
          times: [0, 0.35, 0.65, 1],
        }}
      >
        {/* Ambient sapphire halo — moves opposite to cursor for 3D depth */}
        {/* Sapphire halo — restrained, moves opposite cursor */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-10% -22%",
            x: haloX,
            y: haloY,
            zIndex: 0,
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{
            width: "100%", height: "100%",
            background:
              "radial-gradient(ellipse at 58% 42%, rgba(61,159,255,0.12) 0%, rgba(40,110,220,0.05) 38%, transparent 65%)",
            filter: "blur(58px)",
          }} />
        </motion.div>

        {/* Rim light — right edge */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "5%", right: "-10%",
            width: "30%", height: "70%",
            background: "radial-gradient(ellipse at 100% 40%, rgba(61,159,255,0.08) 0%, transparent 65%)",
            filter: "blur(40px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Key light */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--light-gradient, none)",
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "screen",
            opacity: 0.7,
          }}
        />

        {/* Fill light */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--fill-gradient, none)",
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        />

        {/* Shadow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--shadow-gradient, none)",
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "multiply",
            opacity: 0.55,
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

        {/* Portrait + overlays */}
        <div
          style={{
            position: "relative",
            height: "100%",
            zIndex: 1,
          }}
        >
          {/* ── LOCKED PORTRAIT ASSET ── */}
          <img
            src={PORTRAIT_URL}
            alt="Salim Bakhouch — Cinematographer and Director of Photography"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            style={{
              display: "block",
              height: "100%",
              width: "auto",
              objectFit: "contain",
              objectPosition: "bottom center",
              filter: "saturate(0) contrast(1.06) brightness(0.96)",
              maskImage: [
                "linear-gradient(to bottom,",
                "black 55%,",
                "rgba(0,0,0,0.85) 72%,",
                "rgba(0,0,0,0.45) 88%,",
                "transparent 100%)",
              ].join(" "),
              WebkitMaskImage: [
                "linear-gradient(to bottom,",
                "black 55%,",
                "rgba(0,0,0,0.85) 72%,",
                "rgba(0,0,0,0.45) 88%,",
                "transparent 100%)",
              ].join(" "),
              transition: "filter 0.9s ease",
              ...(faceHover && {
                filter: "saturate(0) contrast(1.09) brightness(0.98)",
              }),
            }}
          />

          {/* ── VIEWFINDER HUD ──────────────────────────── */}
          <motion.div
            initial={false}
            animate={{
              opacity: faceHover ? 1 : 0,
              scale:   faceHover ? 1 : 0.96,
              rotate:  faceHover ? 0 : -0.5,
            }}
            transition={{
              duration: faceHover ? 0.85 : 0.65,
              ease: faceHover ? EASE_EXPO : EASE_CINEMA,
            }}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "55% 38%",
              pointerEvents: "none",
            }}
          >
            <Viewfinder active={faceHover} />
          </motion.div>

          {/*
           * ── FACE HIT ZONE ──────────────────────────────
           * Invisible interactive ellipse over the face region.
           * Position tuned to the actual face in this portrait:
           *   left: 25%  (face is left-of-center in the image frame)
           *   top:  16%  (face starts near the top third)
           *   width: 52%, height: 38% — covers face + hair + chin
           *
           * data-cursor="viewfinder" triggers the custom cursor swap.
           * pointer-events: auto re-enables interaction on this node only.
           */}
          <div
            data-cursor="viewfinder"
            onMouseEnter={onFaceEnter}
            onMouseLeave={onFaceLeave}
            style={{
              position: "absolute",
              left: "25%",
              top: "16%",
              width: "52%",
              height: "38%",
              borderRadius: "50%",
              pointerEvents: "auto",
              /* Uncomment to debug zone position:
              background: "rgba(255,0,0,0.15)",
              border: "1px solid red", */
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
            height: "28%",
            background:
              "linear-gradient(to bottom, transparent 0%, var(--bg) 90%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </motion.div>
    </div>
  );
}

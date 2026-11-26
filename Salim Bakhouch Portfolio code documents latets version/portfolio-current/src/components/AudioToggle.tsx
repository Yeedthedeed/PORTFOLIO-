import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { sfx } from "../audio/SoundEngine";

/**
 * CINEMA AUDIO TOGGLE — morphing icon
 *
 * Icon design: three horizontal lines that transform between states.
 *
 * UNMUTED state — three animated bars of varying height (equaliser):
 *   Line 1 (left)   — medium height, slow animation
 *   Line 2 (centre) — tallest, medium animation
 *   Line 3 (right)  — short, fast animation
 *   Each bar breathes up/down independently → "active signal" reading
 *
 * MUTED state — three equal flat lines (silence):
 *   All bars collapse to the same short height
 *   Colour shifts to dim
 *   A diagonal strike-through line morphs in across the icon
 *
 * Transition: spring-based. Lines animate height individually.
 * Strike-through draws in via pathLength 0→1 on mute, reverses on unmute.
 *
 * Hover: subtle scale + opacity lift. No label text — icon is self-explanatory.
 * The word "Mute" / "Unmute" fades in beside it only on hover.
 */

const SPRING = { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.4 };
const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* Bar animation sequences — looping, irrational periods so they never sync */
const BAR_ANIMS = [
  /* left  */ { heights: [4, 10, 6, 13, 5, 8, 11, 4],  dur: 1.8 },
  /* mid   */ { heights: [8, 14, 5, 12, 9, 14, 6, 8],  dur: 1.4 },
  /* right */ { heights: [6, 9, 13, 5, 10, 7, 12, 6],  dur: 2.1 },
];

const MUTED_HEIGHT = 3;
const ICON_W = 18;
const ICON_H = 14;

function AudioIcon({ enabled, hovered }: { enabled: boolean; hovered: boolean }) {
  /* Track per-bar animated heights in RAF */
  const barRefs = [
    useRef<SVGRectElement>(null),
    useRef<SVGRectElement>(null),
    useRef<SVGRectElement>(null),
  ];
  const rafRef = useRef(0);
  const t0     = useRef(performance.now());
  const prev   = useRef<number[]>([MUTED_HEIGHT, MUTED_HEIGHT, MUTED_HEIGHT]);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const t = (performance.now() - t0.current) / 1000;

      BAR_ANIMS.forEach((anim, i) => {
        const el = barRefs[i].current;
        if (!el) return;

        /* Target: animated height or muted flat */
        const phase   = (t / anim.dur) % 1;
        const kCount  = anim.heights.length;
        const kIdx    = Math.floor(phase * kCount);
        const kFrac   = (phase * kCount) % 1;
        const kA      = anim.heights[kIdx % kCount];
        const kB      = anim.heights[(kIdx + 1) % kCount];
        const animated = kA + (kB - kA) * kFrac;

        const target = enabled ? animated : MUTED_HEIGHT;
        /* Smooth lerp: 0.12 per frame when enabling, 0.08 when disabling */
        const lk = enabled ? 0.12 : 0.08;
        prev.current[i] = lerp(prev.current[i], target, lk);

        const h = prev.current[i];
        const y = ICON_H - h;   /* anchored to bottom */
        el.setAttribute("height", h.toFixed(2));
        el.setAttribute("y", y.toFixed(2));

        const baseAlpha  = enabled ? 0.85 : 0.32;
        const hoverAlpha = enabled ? 1.0  : 0.45;
        const alpha = hovered ? hoverAlpha : baseAlpha;
        el.style.opacity = alpha.toFixed(2);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, hovered]);

  /* Bar x positions — evenly spaced */
  const barW = 2.8;
  const gap  = (ICON_W - barW * 3) / 2;
  const xs   = [0, barW + gap, (barW + gap) * 2];

  const barColor = enabled
    ? (hovered ? "var(--accent-bright)" : "var(--accent)")
    : "rgba(238,243,250,0.38)";

  return (
    <svg
      width={ICON_W} height={ICON_H}
      viewBox={`0 0 ${ICON_W} ${ICON_H}`}
      aria-hidden
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      {/* Three bars — heights driven by RAF */}
      {xs.map((x, i) => (
        <rect
          key={i}
          ref={barRefs[i]}
          x={x}
          y={ICON_H - MUTED_HEIGHT}
          width={barW}
          height={MUTED_HEIGHT}
          rx={1.4}
          fill={barColor}
          style={{ transition: "fill 0.4s" }}
        />
      ))}

      {/* Strike-through — draws across when muted */}
      <motion.line
        x1={-1} y1={ICON_H + 1}
        x2={ICON_W + 1} y2={-1}
        stroke="rgba(238,243,250,0.55)"
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: enabled ? 0 : 1, opacity: enabled ? 0 : 0.7 }}
        transition={{ duration: 0.45, ease: E }}
        style={{ strokeDasharray: 1 }}
      />
    </svg>
  );
}

/* ── Main toggle component ──────────────────────────────────── */
/**
 * GLOBAL AUDIO CONTROL
 *
 * One mute button plus a discreet volume slider, shared by every mount of this
 * component (header, menu, both gallery overlays). State is read from the
 * single audio engine, so all instances stay in step and the bed is never
 * restarted by opening a section.
 */
export default function AudioToggle() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    sfx.init();
    const sync = () => {
      setEnabled(sfx.enabled);
      setVolume(sfx.volume);
    };
    sync();
    return sfx.subscribe(sync);
  }, []);

  const toggle = useCallback(() => {
    const nowOn = sfx.toggle();
    setEnabled(nowOn);
    if (nowOn) setTimeout(() => sfx.transition(), 40);
  }, []);

  const showPanel = panelOpen || hovered;

  return (
    <motion.div
      onMouseEnter={() => {
        setHovered(true);
        setPanelOpen(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setPanelOpen(false);
      }}
      onFocus={() => setPanelOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPanelOpen(false);
        }
      }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
      }}
    >
      <motion.button
        onClick={toggle}
        aria-label={enabled ? "Mute audio" : "Unmute audio"}
        aria-pressed={enabled}
        whileTap={{ scale: 0.88 }}
        onMouseEnter={() => {
          setHovered(true);
          sfx.hover();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "transparent",
          border: "none",
          padding: "0.38rem 0.5rem",
          borderRadius: "100px",
          outline: "none",
          position: "relative",
          transition: "background 0.35s",
          cursor: "default",
          backdropFilter: hovered ? "blur(4px)" : "none",
          WebkitBackdropFilter: hovered ? "blur(4px)" : "none",
        }}
      >
        <motion.span
          aria-hidden
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: E }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "100px",
            background: "rgba(238,243,250,0.055)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ scale: hovered ? 1.06 : 1, opacity: hovered ? 1 : 0.78 }}
          transition={SPRING}
        >
          <AudioIcon enabled={enabled} hovered={hovered} />
        </motion.div>

        <AnimatePresence mode="wait">
          {hovered && (
            <motion.span
              key={enabled ? "mute" : "unmute"}
              initial={{ opacity: 0, x: -5, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -4, width: 0 }}
              transition={{ duration: 0.3, ease: E }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: enabled ? "rgba(238,243,250,0.55)" : "rgba(238,243,250,0.42)",
                userSelect: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {enabled ? "Mute" : "Unmute"}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {enabled && (
            <motion.span
              aria-hidden
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRING}
              style={{
                position: "absolute",
                bottom: 2,
                left: "50%",
                transform: "translateX(-50%)",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent-glow)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Volume — revealed on hover or keyboard focus, never obstructive. */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="volume"
            initial={{ opacity: 0, width: 0, x: -6 }}
            animate={{ opacity: 1, width: "auto", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -6 }}
            transition={{ duration: 0.3, ease: E }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              overflow: "hidden",
              padding: "0.3rem 0.55rem",
              borderRadius: "100px",
              border: "1px solid rgba(238,243,250,0.1)",
              background: "rgba(5,7,10,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7,
                letterSpacing: "0.14em",
                color: "var(--muted)",
              }}
            >
              VOL
            </span>
            <input
              className="audio-volume-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              style={{ ["--volume-fill" as string]: `${Math.round(volume * 100)}%` }}
              aria-label="Volume"
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              onChange={(event) => sfx.setVolume(Number(event.target.value) / 100)}
            />
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7,
                letterSpacing: "0.08em",
                color: "var(--ink-dim)",
                minWidth: "1.6em",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(volume * 100)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

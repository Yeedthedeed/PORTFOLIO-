import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue, useSpring, motion, AnimatePresence } from "framer-motion";

/**
 * CUSTOM CURSOR — Premium cinematic interaction system
 *
 * States:
 *   idle       — 6px sapphire dot + 28px trailing ring
 *   hover      — ring expands to 52px, fills 8% blue, label appears
 *                magnetic: dot snaps toward element centre
 *   pressed    — ring compresses to 22px, dot scales to 8px
 *   drag       — ring stretches in drag direction (ellipse)
 *   viewfinder — cinema reticle SVG (portrait face zone)
 *   hidden     — cursor off-document
 *
 * Physics:
 *   Dot:  instant RAF position (no lag)
 *   Ring: spring stiffness 320 / damping 28 / mass 0.35
 *   Magnetic pull: lerps dot toward element centre when hovering,
 *                  max 12px offset, eased at element edge falloff
 *   Drag stretch: ring scaleX/Y tracks velocity direction
 *
 * All transitions use spring physics — no duration-based ease.
 */

/* Spring configs for different cursor states */
const SPRING_DEFAULT  = { stiffness: 320, damping: 28,  mass: 0.35 };
const SPRING_HOVER    = { stiffness: 240, damping: 24,  mass: 0.45 };
const SPRING_DRAG     = { stiffness: 420, damping: 32,  mass: 0.25 };
const SPRING_VF       = { stiffness: 180, damping: 22,  mass: 0.55 };

export default function CustomCursor() {
  /* Raw dot position — updated in RAF, instant */
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  /* Ring position — springs behind dot */
  const [springCfg, setSpringCfg] = useState(SPRING_DEFAULT);
  const ringX = useSpring(dotX, springCfg);
  const ringY = useSpring(dotY, springCfg);

  /* Viewfinder position — heavier spring */
  const vfX = useSpring(dotX, SPRING_VF);
  const vfY = useSpring(dotY, SPRING_VF);

  /* Cursor state */
  type CursorState = "idle" | "hover" | "pressed" | "drag" | "viewfinder" | "hidden";
  const [state, setState]   = useState<CursorState>("hidden");
  const [label, setLabel]   = useState("");

  /* Drag velocity for ring stretch */
  const [dragVel, setDragVel] = useState({ x: 0, y: 0 });

  /* Magnetic offset for hover snap */
  const [magOffset, setMagOffset] = useState({ x: 0, y: 0 });

  /* Refs for RAF loop */
  const rafRef      = useRef(0);
  const rawPos      = useRef({ x: -200, y: -200 });
  const prevPos     = useRef({ x: -200, y: -200 });
  const stateRef    = useRef<CursorState>("hidden");
  const hoverEl     = useRef<Element | null>(null);
  const isDown      = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0 });
  const velRef      = useRef({ x: 0, y: 0 });
  const frameCount  = useRef(0);

  /* Sync state to ref for RAF */
  useEffect(() => { stateRef.current = state; }, [state]);

  /* Update spring config when state changes */
  useEffect(() => {
    if (state === "hover")   setSpringCfg(SPRING_HOVER);
    else if (state === "drag") setSpringCfg(SPRING_DRAG);
    else                     setSpringCfg(SPRING_DEFAULT);
  }, [state]);

  const goState = useCallback((s: CursorState) => {
    setState(s);
    stateRef.current = s;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    /* RAF loop — positions dot, computes velocity for drag stretch */
    const loop = () => {
      frameCount.current++;

      /* Velocity (smoothed over 3 frames) */
      const vx = rawPos.current.x - prevPos.current.x;
      const vy = rawPos.current.y - prevPos.current.y;
      velRef.current = {
        x: velRef.current.x * 0.72 + vx * 0.28,
        y: velRef.current.y * 0.72 + vy * 0.28,
      };

      /* Magnetic pull toward hovered element centre */
      let tx = rawPos.current.x;
      let ty = rawPos.current.y;

      if (stateRef.current === "hover" && hoverEl.current) {
        const r   = hoverEl.current.getBoundingClientRect();
        const cx  = r.left + r.width  / 2;
        const cy  = r.top  + r.height / 2;
        const dx  = cx - rawPos.current.x;
        const dy  = cy - rawPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        /* Pull strength: max 12px, falls off with distance */
        const pull = Math.min(12, 12 * (1 - Math.min(dist, 80) / 80));
        if (dist > 0) {
          tx = rawPos.current.x + (dx / dist) * pull;
          ty = rawPos.current.y + (dy / dist) * pull;
        }
        setMagOffset({ x: tx - rawPos.current.x, y: ty - rawPos.current.y });
      } else {
        setMagOffset({ x: 0, y: 0 });
      }

      dotX.set(tx);
      dotY.set(ty);

      /* Update drag velocity display every 2 frames */
      if (frameCount.current % 2 === 0 && stateRef.current === "drag") {
        setDragVel({ x: velRef.current.x, y: velRef.current.y });
      }

      prevPos.current = { ...rawPos.current };
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    /* ── Mouse events ────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      rawPos.current = { x: e.clientX, y: e.clientY };

      if (isDown.current && stateRef.current !== "viewfinder") {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (Math.sqrt(dx*dx + dy*dy) > 5 && stateRef.current !== "drag") {
          goState("drag");
        }
        return;
      }

      const el      = e.target as HTMLElement;
      const trigger = el.closest<HTMLElement>("[data-cursor]");

      if (trigger) {
        const v = trigger.dataset.cursor as CursorState;
        if (v === "viewfinder") {
          goState("viewfinder");
        } else {
          goState("hover");
          hoverEl.current = trigger;
          setLabel(trigger.dataset.cursorLabel ?? "");
        }
      } else {
        if (stateRef.current === "hover" || stateRef.current === "viewfinder") {
          goState("idle");
          hoverEl.current = null;
          setLabel("");
        }
      }
    };

    const onDown = (e: MouseEvent) => {
      isDown.current    = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      if (stateRef.current !== "viewfinder") {
        goState("pressed");
      }
    };

    const onUp = () => {
      isDown.current = false;
      /* Return to appropriate state */
      if (stateRef.current === "drag" || stateRef.current === "pressed") {
        if (hoverEl.current) goState("hover");
        else                 goState("idle");
      }
      setDragVel({ x: 0, y: 0 });
    };

    const onLeave = () => goState("hidden");
    const onEnter = () => {
      if (stateRef.current === "hidden") goState("idle");
    };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [dotX, dotY, goState]);

  /* ── Derived visual properties ──────────────────────────── */
  const isHidden  = state === "hidden";
  const isVF      = state === "viewfinder";
  const isHover   = state === "hover";
  const isPressed = state === "pressed";
  const isDrag    = state === "drag";

  /* Ring size */
  const ringSize = isHover ? 52 : isPressed ? 22 : isDrag ? 36 : 28;

  /* Ring stretch in drag direction */
  void Math.sqrt(dragVel.x ** 2 + dragVel.y ** 2); // speed available for future use
  const stretchX  = isDrag ? 1 + Math.abs(dragVel.x) / 28 * 0.5 : 1;
  const stretchY  = isDrag ? 1 + Math.abs(dragVel.y) / 28 * 0.5 : 1;
  const dragAngle = isDrag ? Math.atan2(dragVel.y, dragVel.x) * (180 / Math.PI) : 0;

  /* Dot size */
  const dotSize   = isPressed ? 8 : isHover ? 0 : 5;

  /* Ring border color */
  const ringBorder =
    isVF      ? "transparent" :
    isHover   ? "rgba(61,159,255,0.65)" :
    isPressed ? "rgba(61,159,255,0.80)" :
    isDrag    ? "rgba(61,159,255,0.50)" :
                "rgba(238,243,250,0.42)";

  /* Ring fill */
  const ringFill =
    isHover   ? "rgba(61,159,255,0.08)" :
    isPressed ? "rgba(61,159,255,0.14)" :
                "transparent";

  return (
    <>
      {/* ── Ring ──────────────────────────────────────────── */}
      {!isVF && (
        <motion.div
          aria-hidden
          style={{
            position: "fixed", left: 0, top: 0,
            x: ringX, y: ringY,
            translateX: "-50%", translateY: "-50%",
            zIndex: 9990,
            pointerEvents: "none",
            willChange: "transform",
          }}
          animate={{
            width:   ringSize,
            height:  ringSize,
            opacity: isHidden ? 0 : 1,
            scaleX:  stretchX,
            scaleY:  stretchY,
            rotate:  dragAngle,
          }}
          transition={{
            width:   { type: "spring", stiffness: 340, damping: 26, mass: 0.3 },
            height:  { type: "spring", stiffness: 340, damping: 26, mass: 0.3 },
            opacity: { duration: 0.22 },
            scaleX:  { type: "spring", stiffness: 280, damping: 20, mass: 0.25 },
            scaleY:  { type: "spring", stiffness: 280, damping: 20, mass: 0.25 },
            rotate:  { type: "spring", stiffness: 200, damping: 18, mass: 0.3 },
          }}
        >
          <div
            style={{
              width: "100%", height: "100%",
              borderRadius: "50%",
              border: `1px solid ${ringBorder}`,
              background: ringFill,
              transition: "border-color 0.28s, background 0.28s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {/* Label on hover */}
            <AnimatePresence mode="wait">
              {isHover && label && (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8, letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── Dot ───────────────────────────────────────────── */}
      {!isVF && (
        <motion.div
          aria-hidden
          style={{
            position: "fixed", left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: "-50%", translateY: "-50%",
            zIndex: 9995,
            pointerEvents: "none",
            borderRadius: "50%",
            background: "var(--accent-bright)",
            boxShadow: "0 0 8px var(--accent-glow)",
            willChange: "transform",
          }}
          animate={{
            width:   dotSize,
            height:  dotSize,
            opacity: isHidden || isHover ? 0 : 1,
          }}
          transition={{
            width:   { type: "spring", stiffness: 400, damping: 28, mass: 0.2 },
            height:  { type: "spring", stiffness: 400, damping: 28, mass: 0.2 },
            opacity: { duration: 0.18 },
          }}
        />
      )}

      {/* ── Magnetic attraction indicator (tiny secondary dot) */}
      {isHover && (magOffset.x !== 0 || magOffset.y !== 0) && (
        <motion.div
          aria-hidden
          style={{
            position: "fixed", left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: "-50%", translateY: "-50%",
            zIndex: 9993,
            pointerEvents: "none",
            width: 3, height: 3,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.4,
          }}
        />
      )}

      {/* ── Viewfinder reticle ────────────────────────────── */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0,
          x: vfX, y: vfY,
          translateX: "-50%", translateY: "-50%",
          zIndex: 9997,
          pointerEvents: "none",
          width: 80, height: 80,
          willChange: "transform",
        }}
        animate={{
          opacity: isVF ? 1 : 0,
          scale:   isVF ? [1, 1.025, 1] : 0.86,
        }}
        transition={
          isVF
            ? {
                opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                scale:   { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
              }
            : { duration: 0.3, ease: [0.76, 0, 0.24, 1] }
        }
      >
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none" style={{ overflow: "visible" }}>
          {/* Outer frame */}
          <rect x="4" y="4" width="72" height="72" stroke="var(--accent-bright)" strokeOpacity="0.6" strokeWidth="0.8" />
          {/* Corner L-brackets */}
          <path d="M 4 18 L 4 4 L 18 4"  stroke="var(--accent)" strokeWidth="1.6" />
          <path d="M 62 4 L 76 4 L 76 18" stroke="var(--accent)" strokeWidth="1.6" />
          <path d="M 4 62 L 4 76 L 18 76" stroke="var(--accent)" strokeWidth="1.6" />
          <path d="M 62 76 L 76 76 L 76 62" stroke="var(--accent)" strokeWidth="1.6" />
          {/* Ghost thirds */}
          <line x1="30" y1="4" x2="30" y2="76" stroke="var(--accent-bright)" strokeOpacity="0.18" strokeWidth="0.5" />
          <line x1="50" y1="4" x2="50" y2="76" stroke="var(--accent-bright)" strokeOpacity="0.18" strokeWidth="0.5" />
          <line x1="4" y1="30" x2="76" y2="30" stroke="var(--accent-bright)" strokeOpacity="0.18" strokeWidth="0.5" />
          <line x1="4" y1="50" x2="76" y2="50" stroke="var(--accent-bright)" strokeOpacity="0.18" strokeWidth="0.5" />
          {/* Crosshair */}
          <line x1="37" y1="40" x2="43" y2="40" stroke="var(--accent-bright)" strokeWidth="1.1" />
          <line x1="40" y1="37" x2="40" y2="43" stroke="var(--accent-bright)" strokeWidth="1.1" />
          <circle cx="40" cy="40" r="1.4" fill="var(--accent)" />
          <circle cx="40" cy="40" r="7.5" stroke="var(--accent-bright)" strokeOpacity="0.38" strokeWidth="0.7" />
          {/* Labels */}
          <text x="77" y="2" fontFamily="JetBrains Mono, monospace" fontSize="5" fill="var(--accent-bright)" fillOpacity="0.75" textAnchor="end" dominantBaseline="hanging">AF</text>
          <text x="4" y="79" fontFamily="JetBrains Mono, monospace" fontSize="4.5" fill="var(--accent-bright)" fillOpacity="0.6">50mm T1.9</text>
        </svg>
      </motion.div>

      {/* ── Press ripple — expands from click point ────────── */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            key="ripple"
            aria-hidden
            style={{
              position: "fixed", left: 0, top: 0,
              x: dotX, y: dotY,
              translateX: "-50%", translateY: "-50%",
              zIndex: 9989,
              pointerEvents: "none",
              borderRadius: "50%",
              border: "1px solid rgba(61,159,255,0.35)",
            }}
            initial={{ width: 18, height: 18, opacity: 0.8 }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

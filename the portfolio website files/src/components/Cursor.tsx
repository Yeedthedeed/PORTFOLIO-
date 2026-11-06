import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

/**
 * CURSOR
 *
 * 6px sapphire dot (instant) + 32px outlined circle (trailing, ease 0.15).
 * On interactive elements: circle scales to 48px, fills at 10% opacity.
 * That is the entire interaction. Nothing more.
 *
 * Uses requestAnimationFrame for 60fps positioning.
 */
export default function Cursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const circX = useSpring(dotX, { stiffness: 180, damping: 24, mass: 0.6 });
  const circY = useSpring(dotY, { stiffness: 180, damping: 24, mass: 0.6 });

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const raf = useRef<number | null>(null);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const tick = () => {
      dotX.set(pos.current.x);
      dotY.set(pos.current.y);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement;
      const interactive = el.closest("a, button, [data-cursor-active]");
      setActive(!!interactive);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [dotX, dotY, visible]);

  if (typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Trailing circle */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: circX,
          y: circY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 9999,
          pointerEvents: "none",
          willChange: "transform",
        }}
        animate={{
          width:   active ? 48 : 32,
          height:  active ? 48 : 32,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "1px solid rgba(237,232,225,0.45)",
            background: active ? "rgba(34,81,232,0.10)" : "transparent",
            transition: "background 0.4s ease, border-color 0.4s ease",
            borderColor: active ? "rgba(34,81,232,0.5)" : "rgba(237,232,225,0.45)",
          }}
        />
      </motion.div>

      {/* Dot — instant, no spring */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 10000,
          pointerEvents: "none",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(34, 81, 232, 0.85)",
          willChange: "transform",
        }}
        animate={{ opacity: visible && !active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </>
  );
}

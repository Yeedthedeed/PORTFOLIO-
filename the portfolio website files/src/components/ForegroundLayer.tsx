import { useEffect, useRef, useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { useMouse } from "../hooks/useMouse";

/**
 * FOREGROUND LAYER — closest depth plane
 *
 * Sits ABOVE content (z-index 80) but below overlays (grain z:90).
 * Contains:
 *   • 12 large, soft, out-of-focus foreground particles
 *     — big (8-28px), very low opacity (0.03-0.08)
 *     — blurred (filter: blur 6-14px) to simulate shallow DOF
 *     — move at ±6px parallax (least of any layer = closest)
 *     — each on independent Lissajous paths
 *
 *   • Ambient occlusion — soft inner shadow that darkens edges
 *     slightly more than vignette, simulating the way real
 *     spaces darken in corners where light doesn't reach
 *
 * The foreground particles create the sensation of dust/debris
 * floating between the viewer and the screen — bokeh circles
 * that are too close to the lens to be in focus.
 *
 * Parallax: ±6px — minimal movement because these are "closest"
 * to the viewer. The background moves ±40px (furthest), portrait
 * moves ±18px (mid-ground), foreground barely shifts. This is
 * what makes the depth feel physical.
 */

export default function ForegroundLayer() {
  const { mx2, my2 } = useMouse();

  /* Foreground parallax — moves MOST (closest to viewer) */
  const fx = useTransform(mx2, [-1, 1], [-22, 22]);
  const fy = useTransform(my2, [-1, 1], [-16, 16]);

  /* 12 large out-of-focus particles */
  const bokeh = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => {
        const r = (a: number, b: number) => a + Math.random() * (b - a);
        return {
          x0: r(5, 95),
          y0: r(5, 95),
          size: r(8, 28),
          blur: r(6, 14),
          maxOp: r(0.03, 0.08),
          fx: r(0.005, 0.015),
          fy: r(0.004, 0.012),
          px: r(0, Math.PI * 2),
          py: r(0, Math.PI * 2),
          ax: r(2, 6),
          ay: r(1.5, 5),
          fOp: r(0.008, 0.018),
          pOp: r(0, Math.PI * 2),
        };
      }),
    []
  );

  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let rafId = 0;
    const t0 = performance.now() / 1000;

    const tick = () => {
      const t = performance.now() / 1000 - t0;

      bokeh.forEach((p, i) => {
        const el = refs.current[i];
        if (!el) return;
        const x = p.x0 + Math.sin(t * p.fx + p.px) * p.ax;
        const y = p.y0 + Math.cos(t * p.fy + p.py) * p.ay;
        const op = p.maxOp * (0.4 + 0.6 * Math.sin(t * p.fOp + p.pOp));
        el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
        el.style.opacity = Math.max(0, op).toFixed(4);
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [bokeh]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: "none",
        x: fx,
        y: fy,
        willChange: "transform",
      }}
    >
      {/* Bokeh particles — large, blurred, barely visible */}
      {bokeh.map((p, i) => (
        <span
          key={i}
          ref={el => { refs.current[i] = el; }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(180,210,255,0.35) 0%, rgba(120,170,255,0.12) 50%, transparent 100%)`,
            filter: `blur(${p.blur}px)`,
            opacity: 0,
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Ambient occlusion — soft inner shadow on all edges.
          Darker than the vignette, simulates real-space corner
          light falloff. Very subtle. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 180px 60px rgba(0,0,0,0.18)",
          pointerEvents: "none",
        }}
      />

      {/* Top-edge occlusion — header area is slightly darkened,
          simulating overhead shadow in a studio */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "12%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom-edge depth fade — floor shadow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "8%",
          background: "linear-gradient(to top, rgba(0,0,0,0.10), transparent)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

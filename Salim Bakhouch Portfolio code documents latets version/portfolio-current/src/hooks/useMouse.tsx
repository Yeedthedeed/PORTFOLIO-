import { createContext, useContext, useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Global mouse context — one RAF loop, multiple spring configurations.
 * Consumers derive their own useTransform ranges from the shared motion values.
 *
 * Springs are tuned for different parallax "weight classes":
 *   heavy  → portrait, large elements  (slow, weighty)
 *   medium → typography, mid-ground
 *   light  → background gradient, far-field
 */
type MouseCtx = {
  /** Raw normalized -1..1 from viewport center */
  mx: ReturnType<typeof useMotionValue<number>>;
  my: ReturnType<typeof useMotionValue<number>>;
  /** Heavy spring — portrait (stiffness 40, damping 16) */
  hx: ReturnType<typeof useSpring>;
  hy: ReturnType<typeof useSpring>;
  /** Medium spring — typography (stiffness 55, damping 20) */
  mx2: ReturnType<typeof useSpring>;
  my2: ReturnType<typeof useSpring>;
  /** Light spring — background (stiffness 28, damping 14) */
  lx: ReturnType<typeof useSpring>;
  ly: ReturnType<typeof useSpring>;
  /** Raw pixel coords for cursor rendering */
  px: ReturnType<typeof useMotionValue<number>>;
  py: ReturnType<typeof useMotionValue<number>>;
};

const Ctx = createContext<MouseCtx | null>(null);

export function MouseProvider({ children }: { children: React.ReactNode }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  /* Heavy — portrait */
  const hx = useSpring(mx, { stiffness: 40, damping: 16, mass: 0.8 });
  const hy = useSpring(my, { stiffness: 40, damping: 16, mass: 0.8 });

  /* Medium — typography */
  const mx2 = useSpring(mx, { stiffness: 55, damping: 20, mass: 0.5 });
  const my2 = useSpring(my, { stiffness: 55, damping: 20, mass: 0.5 });

  /* Light — background / gradient */
  const lx = useSpring(mx, { stiffness: 28, damping: 14, mass: 1.2 });
  const ly = useSpring(my, { stiffness: 28, damping: 14, mass: 1.2 });

  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x:  (e.clientX / window.innerWidth)  * 2 - 1,
        y:  (e.clientY / window.innerHeight) * 2 - 1,
        px: e.clientX,
        py: e.clientY,
      };
      if (!raf.current) {
        raf.current = requestAnimationFrame(() => {
          mx.set(target.current.x);
          my.set(target.current.y);
          px.set(target.current.px);
          py.set(target.current.py);
          raf.current = null;
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, px, py]);

  return (
    <Ctx.Provider value={{ mx, my, hx, hy, mx2, my2, lx, ly, px, py }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMouse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMouse must be wrapped in <MouseProvider>");
  return ctx;
}

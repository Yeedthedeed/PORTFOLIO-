import { motion, useTransform } from "framer-motion";
import { useMemo, useEffect, useRef } from "react";
import { useMouse } from "../hooks/useMouse";

/**
 * BACKGROUND — Living cinematic environment
 *
 * Every layer uses procedural time-based motion — no CSS keyframes,
 * no tiling, no mechanical repetition. Each pixel's position is
 * derived from irrational-ratio sine compositions so the environment
 * never visibly loops.
 *
 * Layer stack (back to front):
 *   L0  Deep base gradient         — static, warm charcoal
 *   L1  Slow gradient displacement — procedural drift, 120s period
 *   L2  Primary sapphire bloom     — cursor-coupled, spring-lagged
 *   L3  Counter-bloom              — inverse cursor, depth cue
 *   L4  Volumetric haze A          — procedural drift, 43s base
 *   L5  Volumetric haze B          — procedural drift, 61s base
 *   L6  Warm centre presence       — procedural drift, 79s base
 *   L7  Microscopic noise canvas   — procedural per-pixel, ~20fps
 *   L8  Dust particles (32)        — each with unique Lissajous path
 *   L9  Contour lines              — procedural opacity breathing
 *   L10 35mm perforations          — static cinematic detail
 *
 * GPU: all motion via translate3d / opacity. Zero layout recalc.
 */

export default function Background() {
  const { lx, ly } = useMouse();

  /* Cursor-coupled bloom positions */
  const gx = useTransform(lx, [-1, 1], [-28, 28]);
  const gy = useTransform(ly, [-1, 1], [-20, 20]);
  const cx = useTransform(lx, [-1, 1], [14, -14]);
  const cy = useTransform(ly, [-1, 1], [9, -9]);

  /* ── L1: Slow gradient displacement — procedural drift ────── */
  const gradRef = useRef<HTMLDivElement>(null);

  /* ── L4-L6: Haze blobs — procedural drift (no CSS animation) */
  const hazeARf = useRef<HTMLDivElement>(null);
  const hazeBRf = useRef<HTMLDivElement>(null);
  const hazeCRf = useRef<HTMLDivElement>(null);

  /* ── L7: Microscopic noise canvas ─────────────────────────── */
  const noiseRef = useRef<HTMLCanvasElement>(null);

  /* ── L9: Contour lines — procedural opacity ──────────────── */
  const contourRef = useRef<SVGSVGElement>(null);

  /* 32 dust particles — unique Lissajous frequencies */
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }).map(() => {
        const r = (a: number, b: number) => a + Math.random() * (b - a);
        return {
          /* Starting position */
          x0: r(5, 95),
          y0: r(5, 95),
          /* Lissajous frequencies — irrational ratios, never sync */
          fx: r(0.008, 0.022),
          fy: r(0.006, 0.018),
          /* Amplitudes (% of viewport) */
          ax: r(1.5, 5),
          ay: r(1, 4),
          /* Phase offsets */
          px: r(0, Math.PI * 2),
          py: r(0, Math.PI * 2),
          /* Visual */
          size: r(0.6, 1.8),
          maxOp: r(0.15, 0.38),
          /* Individual opacity frequency */
          fOp: r(0.012, 0.028),
          pOp: r(0, Math.PI * 2),
        };
      }),
    []
  );

  const dustRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* ── Single RAF loop drives all procedural layers ─────────── */
  useEffect(() => {
    const noiseCanvas = noiseRef.current;
    const noiseCtx    = noiseCanvas?.getContext("2d");
    if (noiseCanvas) {
      noiseCanvas.width  = 200;
      noiseCanvas.height = 200;
    }

    let rafId = 0;
    let frame = 0;
    const t0  = performance.now() / 1000;

    /*
     * CURSOR AS ENVIRONMENTAL FORCE
     *
     * Raw pixel position → spring-smoothed with overshoot.
     * Within ~400px radius the cursor influences:
     *   • Gradient displacement (pulled toward cursor)
     *   • Haze density (hazes swell near cursor)
     *   • Dust particle drift (pushed away from cursor)
     *   • Noise intensity (grain turbulence near cursor)
     *   • Light diffusion overlay (soft glow tracks cursor)
     *
     * Spring: stiffness 0.035, damping factor 0.82.
     * The low stiffness + moderate damping creates natural
     * overshoot — the environment "catches up" to the cursor,
     * overshoots slightly, then settles. Like moving through fog.
     */
    let rawCurX = 0.5, rawCurY = 0.5;  // normalised 0..1
    let sprCurX = 0.5, sprCurY = 0.5;  // spring position
    let velCurX = 0,   velCurY = 0;    // spring velocity
    /* Velocity magnitude — used for turbulence intensity */
    let curSpeed = 0;
    let lastMoveT = 0;

    const SPRING_K = 0.035;  // stiffness — low = slow follow
    const SPRING_D = 0.82;   // damping — <1 allows overshoot
    const INFLUENCE_R = 400; // px radius of cursor influence

    const onMouseMove = (e: MouseEvent) => {
      rawCurX = e.clientX / window.innerWidth;
      rawCurY = e.clientY / window.innerHeight;
      lastMoveT = performance.now();
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    /* Light diffusion overlay — a div that follows the cursor with glow */
    const lightDiv = document.createElement("div");
    lightDiv.style.cssText = [
      "position:absolute",
      "width:800px", "height:800px",
      "border-radius:50%",
      "pointer-events:none",
      "will-change:transform,opacity",
      "background:radial-gradient(circle,rgba(61,159,255,0.06) 0%,rgba(61,159,255,0.02) 35%,transparent 65%)",
      "filter:blur(40px)",
      "opacity:0",
      "z-index:1",
    ].join(";");
    const container = noiseRef.current?.parentElement;
    if (container) container.appendChild(lightDiv);

    const tick = () => {
      const t = performance.now() / 1000 - t0;
      frame++;

      /* ── Spring cursor update ── */
      const forceX = (rawCurX - sprCurX) * SPRING_K;
      const forceY = (rawCurY - sprCurY) * SPRING_K;
      velCurX = (velCurX + forceX) * SPRING_D;
      velCurY = (velCurY + forceY) * SPRING_D;
      sprCurX += velCurX;
      sprCurY += velCurY;

      /* Cursor speed — decays when idle */
      const timeSinceMove = (performance.now() - lastMoveT) / 1000;
      const rawSpeed = Math.sqrt(velCurX * velCurX + velCurY * velCurY);
      const targetSpeed = timeSinceMove < 0.2 ? rawSpeed * 600 : 0;
      curSpeed += (targetSpeed - curSpeed) * 0.08;
      const intensity = Math.min(1, curSpeed);  // 0..1

      /* Cursor in viewport pixels */
      const cpxX = sprCurX * window.innerWidth;
      const cpxY = sprCurY * window.innerHeight;

      /* ── Light diffusion overlay — follows cursor with spring lag ── */
      lightDiv.style.transform = `translate3d(${(cpxX - 400).toFixed(1)}px,${(cpxY - 400).toFixed(1)}px,0)`;
      lightDiv.style.opacity = (0.25 + intensity * 0.55).toFixed(3);

      /* ── L1: Gradient displacement — pulled toward cursor ── */
      if (gradRef.current) {
        const dx = Math.sin(t * 0.052) * 3 + Math.sin(t * 0.031) * 2
                 + (sprCurX - 0.5) * intensity * 4;
        const dy = Math.cos(t * 0.041) * 2.5 + Math.cos(t * 0.023) * 1.5
                 + (sprCurY - 0.5) * intensity * 3;
        gradRef.current.style.transform =
          `translate3d(${dx.toFixed(2)}%, ${dy.toFixed(2)}%, 0)`;
      }

      /* ── L4-L6: Haze procedural drift — swells near cursor ── */
      const driftHaze = (
        el: HTMLDivElement | null,
        baseFreq: number, phase: number,
        hazeCentreX: number, hazeCentreY: number,
      ) => {
        if (!el) return;
        /* Base procedural drift */
        const dx = Math.sin(t * baseFreq + phase) * 2.8
                 + Math.sin(t * baseFreq * 0.73 + phase + 1.4) * 1.6;
        const dy = Math.cos(t * baseFreq * 0.87 + phase + 0.7) * 2.2
                 + Math.cos(t * baseFreq * 0.51 + phase + 2.1) * 1.3;
        let sc = 1 + Math.sin(t * baseFreq * 0.43 + phase) * 0.025;

        /* Cursor proximity — haze swells when cursor is near its centre */
        const hcx = hazeCentreX / 100;  // normalise to 0..1
        const hcy = hazeCentreY / 100;
        const distToCursor = Math.sqrt(
          (sprCurX - hcx) ** 2 + (sprCurY - hcy) ** 2
        );
        const proximity = Math.max(0, 1 - distToCursor * 2.5); // 0..1 falloff
        sc += proximity * intensity * 0.06;  // swell up to 6% when cursor is close

        /* Cursor also pushes the haze slightly away */
        const pushX = (sprCurX - hcx) * proximity * intensity * -3;
        const pushY = (sprCurY - hcy) * proximity * intensity * -2.5;

        el.style.transform =
          `translate3d(${(dx + pushX).toFixed(2)}%, ${(dy + pushY).toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
      };

      /* Haze centre positions (% of viewport) for proximity calc */
      driftHaze(hazeARf.current, 0.0233, 0,    -10, 3);    /* upper-left */
      driftHaze(hazeBRf.current, 0.0164, 2.1,  108, 92);   /* lower-right */
      driftHaze(hazeCRf.current, 0.0127, 4.3,  24,  -6);   /* top-centre */

      /* ── L7: Noise canvas — cursor-responsive grain turbulence ── */
      if (noiseCtx && frame % 3 === 0) {
        const W = 200, H = 200;
        const img = noiseCtx.createImageData(W, H);
        const d   = img.data;
        const seed = (frame / 3 * 7919) | 0;

        /* Cursor position mapped to noise canvas coords */
        const ncx = sprCurX * W;
        const ncy = sprCurY * H;
        /* Influence radius in noise canvas pixels */
        const nR  = W * 0.28;
        const nR2 = nR * nR;

        for (let py = 0; py < H; py++) {
          for (let px = 0; px < W; px++) {
            const idx = (py * W + px) * 4;
            const h = ((idx * 374761 + seed) ^ ((idx >> 3) * 668265)) & 0xff;

            /* Distance from cursor in noise space */
            const ddx = px - ncx;
            const ddy = py - ncy;
            const d2  = ddx * ddx + ddy * ddy;

            /* Grain intensity: base + boost near cursor */
            let grainI = 0.11;
            if (d2 < nR2) {
              const prox = 1 - d2 / nR2;
              grainI += prox * intensity * 0.18; // up to 60% brighter grain near cursor
            }

            const v = h * grainI;
            d[idx] = d[idx + 1] = d[idx + 2] = v;

            /* Alpha: base 22-37, boosted near cursor */
            let alpha = 22 + (h & 15);
            if (d2 < nR2) {
              const prox = 1 - d2 / nR2;
              alpha += prox * intensity * 18; // more visible grain near cursor
            }
            d[idx + 3] = Math.min(55, alpha);
          }
        }
        noiseCtx.putImageData(img, 0, 0);
      }

      /* ── L8: Dust particles — Lissajous + cursor repulsion ── */
      particles.forEach((p, i) => {
        const el = dustRefs.current[i];
        if (!el) return;

        /* Base Lissajous position */
        let x = p.x0 + Math.sin(t * p.fx + p.px) * p.ax;
        let y = p.y0 + Math.cos(t * p.fy + p.py) * p.ay;

        /* Cursor repulsion — particles drift away from cursor
         * within INFLUENCE_R. Strength proportional to proximity
         * and cursor speed. Creates the feeling of parting fog. */
        const pxX = x / 100 * window.innerWidth;
        const pxY = y / 100 * window.innerHeight;
        const ddx = pxX - cpxX;
        const ddy = pxY - cpxY;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < INFLUENCE_R && dist > 1) {
          const prox = 1 - dist / INFLUENCE_R;
          const push = prox * prox * intensity * 2.5; // quadratic falloff
          /* Push in vw/vh units */
          x += (ddx / dist) * push;
          y += (ddy / dist) * push;
        }

        let op = p.maxOp * (0.5 + 0.5 * Math.sin(t * p.fOp + p.pOp));
        /* Particles near cursor glow slightly brighter */
        if (dist < INFLUENCE_R) {
          const prox = 1 - dist / INFLUENCE_R;
          op = Math.min(0.55, op + prox * intensity * 0.15);
        }

        el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
        el.style.opacity = op.toFixed(3);
      });

      /* ── L9: Contour opacity breathing ── */
      if (contourRef.current) {
        const op = 0.04 + Math.sin(t * 0.072) * 0.018
                        + Math.sin(t * 0.041) * 0.01;
        contourRef.current.style.opacity = op.toFixed(4);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      lightDiv.remove();
    };
  }, [particles]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ willChange: "transform" }}
    >
      {/* L0: Deep base — warm charcoal, never pure black */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 130% 100% at 52% 42%, #0b0f18 0%, #07090d 45%, #030405 100%)",
      }} />

      {/* L1: Slow gradient displacement — procedural drift */}
      <div
        ref={gradRef}
        style={{
          position: "absolute", inset: "-5%",
          width: "110%", height: "110%",
          background: [
            "radial-gradient(ellipse at 35% 30%, rgba(20,35,70,0.08) 0%, transparent 55%)",
            "radial-gradient(ellipse at 70% 65%, rgba(15,25,55,0.06) 0%, transparent 50%)",
          ].join(","),
          willChange: "transform",
        }}
      />

      {/* L2: Primary sapphire bloom — cursor-coupled */}
      <motion.div
        style={{
          position: "absolute",
          width: "140vmax", height: "140vmax",
          left: "50%", top: "50%",
          translateX: "-50%", translateY: "-50%",
          x: gx, y: gy,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(61,159,255,0.10) 0%, rgba(61,159,255,0.04) 32%, transparent 68%)",
          filter: "blur(50px)",
          willChange: "transform",
        }}
      />

      {/* L3: Counter-bloom — inverse cursor */}
      <motion.div
        style={{
          position: "absolute",
          width: "90vmax", height: "90vmax",
          left: "50%", top: "58%",
          translateX: "-50%", translateY: "-50%",
          x: cx, y: cy,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,50,160,0.06) 0%, transparent 60%)",
          filter: "blur(70px)",
          willChange: "transform",
        }}
      />

      {/* L4: Volumetric haze A — upper-left */}
      <div
        ref={hazeARf}
        style={{
          position: "absolute",
          width: "70vw", height: "60vh",
          left: "-10%", top: "3%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(61,159,255,0.055) 0%, transparent 68%)",
          filter: "blur(68px)",
          willChange: "transform",
        }}
      />

      {/* L5: Volumetric haze B — lower-right */}
      <div
        ref={hazeBRf}
        style={{
          position: "absolute",
          width: "65vw", height: "55vh",
          right: "-8%", bottom: "8%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(61,159,255,0.04) 0%, transparent 65%)",
          filter: "blur(78px)",
          willChange: "transform",
        }}
      />

      {/* L6: Warm centre — barely perceptible */}
      <div
        ref={hazeCRf}
        style={{
          position: "absolute",
          width: "52vw", height: "42vh",
          left: "24%", top: "-6%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,242,220,0.018) 0%, transparent 58%)",
          filter: "blur(62px)",
          willChange: "transform",
        }}
      />

      {/* L7: Microscopic noise canvas — procedural, never tiles */}
      <canvas
        ref={noiseRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: 0.06,
          mixBlendMode: "overlay",
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />

      {/* L8: Dust particles — 32 independent Lissajous paths */}
      {particles.map((p, i) => (
        <span
          key={i}
          ref={el => { dustRefs.current[i] = el; }}
          style={{
            position: "absolute",
            left: 0, top: 0,
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: "rgba(238,243,250,0.5)",
            opacity: 0,
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* L9: Topographic contour lines — procedural opacity */}
      <svg
        ref={contourRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: 0.04,
          pointerEvents: "none",
        }}
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#3d9fff" stopOpacity="0" />
            <stop offset="25%"  stopColor="#3d9fff" stopOpacity="0.6" />
            <stop offset="75%"  stopColor="#3d9fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3d9fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 12 }).map((_, i) => {
          const y  = 280 + i * 34;
          const ph = (i % 4) * 48;
          return (
            <path
              key={i}
              d={`M -80 ${y} C ${180 + ph} ${y - 52}, ${460 - ph} ${y + 58}, 800 ${y + 6} S ${1280 + ph} ${y - 38}, 1680 ${y + 16}`}
              stroke="url(#cg)"
              strokeWidth="0.65"
            />
          );
        })}
      </svg>

      {/* L10: 35mm film perforations — static detail */}
      {[
        { side: "left" as const,  css: { left: 0, borderRight: "1px solid rgba(255,255,255,0.05)" } },
        { side: "right" as const, css: { right: 0, borderLeft:  "1px solid rgba(255,255,255,0.05)" } },
      ].map(({ side, css }) => (
        <div key={side} style={{ position: "absolute", top: 0, height: "100%", width: 14, ...css }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                [side]: 2,
                top: `${i * 4.6}%`,
                width: 6, height: 9,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

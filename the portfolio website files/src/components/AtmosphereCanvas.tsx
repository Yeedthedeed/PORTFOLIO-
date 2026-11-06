import { useEffect, useRef } from "react";

/**
 * ATMOSPHERE CANVAS — unified procedural environment
 *
 * One full-viewport <canvas> running a single RAF loop that composites:
 *   1. Procedural film grain (Simplex-seeded, never repeats)
 *   2. Microscopic analog noise (finer grain, different cycle)
 *   3. Cursor-responsive light diffusion (soft radial, spring-lagged)
 *   4. Vignette (edge darkening, always present)
 *   5. Sapphire bloom (centre glow, breathing)
 *
 * Advantages over the CSS approach:
 *   - Every pixel changes every frame — no tiling artefacts
 *   - Cursor influence is computed per-pixel in the glow region
 *   - Grain intensity varies with cursor proximity (localized turbulence)
 *   - Single composite operation = one GPU upload per frame
 *   - No layout recalculation, no DOM mutation, no React re-renders
 *
 * Performance: renders at canvas resolution / 2 (half-res) then
 * CSS-scales to full viewport. At 1440p this means a 720p canvas —
 * grain doesn't need retina resolution, and the blur hides the scaling.
 */

/* ── Simplex-like noise (fast, good enough for grain) ────────── */
function hashNoise(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0xff) / 255;
}

export default function AtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    /* Cursor spring */
    curX: 0.5,  curY: 0.5,   // target (normalised 0..1)
    sprX: 0.5,  sprY: 0.5,   // spring position
    velX: 0,    velY: 0,     // spring velocity
    /* Interaction intensity 0..1 (rises on move, decays on idle) */
    activity: 0,
    lastMoveT: 0,
    frame: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    /* Half-res for performance */
    const resize = () => {
      canvas.width  = Math.round(window.innerWidth  / 2);
      canvas.height = Math.round(window.innerHeight / 2);
    };
    resize();
    window.addEventListener("resize", resize);

    /* Mouse listener */
    const onMove = (e: MouseEvent) => {
      const s = stateRef.current;
      s.curX = e.clientX / window.innerWidth;
      s.curY = e.clientY / window.innerHeight;
      s.lastMoveT = performance.now();
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId = 0;
    const t0 = performance.now();

    const tick = () => {
      const s  = stateRef.current;
      const t  = (performance.now() - t0) / 1000;
      const W  = canvas.width;
      const H  = canvas.height;
      const frame = s.frame++;

      /* ── Spring cursor ── */
      const SK = 0.04, SD = 0.82;
      s.velX = (s.velX + (s.curX - s.sprX) * SK) * SD;
      s.velY = (s.velY + (s.curY - s.sprY) * SK) * SD;
      s.sprX += s.velX;
      s.sprY += s.velY;

      /* ── Activity level ── */
      const timeSinceMove = (performance.now() - s.lastMoveT) / 1000;
      const targetActivity = timeSinceMove < 0.3 ? 1 : Math.max(0, 1 - (timeSinceMove - 0.3) * 0.5);
      s.activity += (targetActivity - s.activity) * 0.06;

      /* ── Create image data ── */
      const img = ctx.createImageData(W, H);
      const d   = img.data;

      /* Grain seed changes every 3 frames (~20fps grain) */
      const grainSeed = Math.floor(frame / 3) * 7919;
      /* Fine noise seed — different cycle */
      const noiseSeed = Math.floor(frame / 5) * 4391;

      /* Cursor position in canvas coords */
      const cxPx = s.sprX * W;
      const cyPx = s.sprY * H;
      /* Cursor influence radius in canvas pixels */
      const influenceR = Math.min(W, H) * 0.28;
      const invR2 = 1 / (influenceR * influenceR);

      /* Bloom centre */
      const bloomCX = W * 0.5;
      const bloomCY = H * 0.46;
      /* Bloom breathe */
      const bloomStr = 0.065 + Math.sin(t * 0.78) * 0.018;

      /* Vignette params */
      const vigCX = W * 0.5;
      const vigCY = H * 0.52;
      const vigRX = W * 0.58;
      const vigRY = H * 0.55;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;

          /* ── Base colour — deep charcoal, not pure black ── */
          let r = 8, g = 10, b = 14;

          /* ── Grain — procedural, never repeats ── */
          const grain1 = hashNoise(x, y, grainSeed) - 0.5;
          const grain2 = hashNoise(x + 131, y + 97, noiseSeed) - 0.5;
          /* Combine: primary + finer secondary */
          const grainVal = grain1 * 18 + grain2 * 8;

          /* Grain intensity increases near cursor (localized turbulence) */
          const dxC = x - cxPx;
          const dyC = y - cyPx;
          const cursorDist2 = dxC * dxC + dyC * dyC;
          const cursorProx  = Math.max(0, 1 - cursorDist2 * invR2);
          const grainBoost  = 1 + cursorProx * s.activity * 0.6;

          r += grainVal * grainBoost * 0.7;
          g += grainVal * grainBoost * 0.7;
          b += grainVal * grainBoost * 0.75;

          /* ── Sapphire bloom — centre glow ── */
          const bdx = (x - bloomCX) / (W * 0.45);
          const bdy = (y - bloomCY) / (H * 0.38);
          const bloomD = bdx * bdx + bdy * bdy;
          if (bloomD < 1) {
            const bloomFalloff = 1 - Math.sqrt(bloomD);
            const bloomI = bloomFalloff * bloomStr * 255;
            r += bloomI * 0.24;
            g += bloomI * 0.62;
            b += bloomI * 1.0;
          }

          /* ── Cursor light diffusion — soft radial glow that follows mouse ── */
          if (cursorProx > 0) {
            const lightI = cursorProx * cursorProx * s.activity * 0.35;
            r += lightI * 60 * 0.22;
            g += lightI * 60 * 0.55;
            b += lightI * 60 * 1.0;
          }

          /* ── Vignette — edge darkening ── */
          const vdx = (x - vigCX) / vigRX;
          const vdy = (y - vigCY) / vigRY;
          const vigD = vdx * vdx + vdy * vdy;
          if (vigD > 0.3) {
            const vigI = Math.min(1, (vigD - 0.3) * 1.1);
            const darkening = 1 - vigI * 0.68;
            r *= darkening;
            g *= darkening;
            b *= darkening;
          }

          d[idx]     = Math.max(0, Math.min(255, r));
          d[idx + 1] = Math.max(0, Math.min(255, g));
          d[idx + 2] = Math.max(0, Math.min(255, b));
          d[idx + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        imageRendering: "auto",
      }}
    />
  );
}

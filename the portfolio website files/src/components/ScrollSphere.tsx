import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sfx } from "../audio/SoundEngine";
import {
  SPHERE_SELECTION,
  getAlbumPhotos,
  getAlbum,
  collectionSourceUrl,
  type Photo,
} from "../data/photographyManifest";

const N      = 36;
const PERSP  = 1000;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/* Sphere radii — balanced spacing */
const RX = 300, RY = 185, RZ = 255;

/* Ring radius for click animation */
const RING_R = 400;

/*
 * Mixed card sizes — vertical (portrait) + horizontal (landscape).
 * All reduced ~25% from previous 155×210.
 * 36 cards cycling through 9 size variants for visual rhythm.
 */
type CardSize = { w: number; h: number; orient: "v" | "h" };
const CARD_DEFS: CardSize[] = [
  /* vertical portrait */
  { w: 88,  h: 124, orient: "v" },
  { w: 96,  h: 132, orient: "v" },
  { w: 80,  h: 114, orient: "v" },
  { w: 92,  h: 128, orient: "v" },
  /* horizontal landscape */
  { w: 130, h:  82, orient: "h" },
  { w: 118, h:  76, orient: "h" },
  { w: 138, h:  88, orient: "h" },
  { w: 124, h:  80, orient: "h" },
  /* near-square */
  { w: 100, h: 100, orient: "v" },
];

interface Param {
  phi: number; theta0: number; phase: number;
  fX: number; fY: number; fZ: number;
  aX: number; aY: number; aZ: number;
}

function buildParams(): Param[] {
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  return Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const phi = Math.acos(Math.max(-1, Math.min(1, y)));
    return {
      phi,
      theta0: GOLDEN * i,
      phase:  (i / N) * Math.PI * 2,
      fX: r(0.11, 0.19), fY: r(0.07, 0.14), fZ: r(0.09, 0.16),
      aX: r(5, 13),      aY: r(4, 10),       aZ: r(3, 8),
    };
  });
}

/* Easing */
const easeOut3  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function ScrollSphere() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const sceneRef   = useRef<HTMLDivElement>(null);

  const [openPhotoIdx, setOpenPhotoIdx] = useState<number | null>(null);

  /* The 36 canonical sphere photographs, ordered by sphere slot. */
  const PHOTOS: Photo[] = SPHERE_SELECTION;

  const viewer = openPhotoIdx !== null ? PHOTOS[openPhotoIdx] : null;
  const viewerAlbum = viewer ? getAlbum(viewer.album_id) : undefined;
  const viewerPhotos = viewerAlbum ? getAlbumPhotos(viewerAlbum.album_id) : [];
  const viewerPos = viewer ? viewerPhotos.findIndex(p => p.photo_id === viewer.photo_id) : -1;

  /* Ring animation refs — read by RAF, never cause re-renders */
  const ringActive  = useRef(false);
  const ringStart   = useRef(0);
  const ringAlbum   = useRef(-1);
  /* Snapshot of each card's position when ring click fires */
  const snapX = useRef(new Float32Array(N));
  const snapY = useRef(new Float32Array(N));
  const snapZ = useRef(new Float32Array(N));

  useEffect(() => {
    const wrap  = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const params  = buildParams();

    /* ── State ──────────────────────────────────────────────── */
    let scrollT = 0;
    const t0    = performance.now() / 1000;

    /* Rotation */
    let rotH = 0, rotV = 0, velH = 0, velV = 0;
    let dragging = false, lastDX = 0, lastDY = 0, dwnX = 0, dwnY = 0;
    const IDLE   = 0.006;   /* idle float halved */
    const CUR_H  = 0.12;    /* cursor H — doubled */
    const CUR_V  = 0.07;    /* cursor V — doubled */
    const DRAG_M = 0.90;    /* drag/swipe — doubled (×2 of previous 0.45) */
    const FRIC   = 0.84;    /* tighter decay to match faster drag */
    const MIN_V  = 0.004;   /* min proportional to halved idle */

    let mouseNX = 0, mouseNY = 0;

    /* Per-card live positions */
    const curX = new Float32Array(N);
    const curY = new Float32Array(N);
    const curZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      curX[i] = (Math.random() - 0.5) * 30;
      curY[i] = (Math.random() - 0.5) * 30;
      curZ[i] = -3000;
    }

    /* ── DOM ────────────────────────────────────────────────── */
    const cards: HTMLDivElement[]    = [];
    const faces: HTMLDivElement[]    = [];
    const imgs:  HTMLImageElement[]  = [];

    Array.from({ length: N }).forEach((_, i) => {
      const def      = CARD_DEFS[i % CARD_DEFS.length];
      const { w, h } = def;
      /* Canonical manifest record — exact original photograph. */
      const photo = PHOTOS[i];
      if (!photo) return;
      const src = photo.source_url;

      const card = document.createElement("div");
      card.style.cssText = [
        "position:absolute",
        `width:${w}px`, `height:${h}px`,
        "left:50%", "top:50%",
        `margin-left:-${w / 2}px`, `margin-top:-${h / 2}px`,
        "will-change:transform", "opacity:0",
      ].join(";");

      const face = document.createElement("div");
      face.style.cssText = [
        "position:relative","width:100%","height:100%","overflow:hidden",
        "border:1px solid rgba(238,243,250,0.07)",
        "box-shadow:0 8px 40px rgba(0,0,0,0.65),0 2px 10px rgba(0,0,0,0.4)",
        "transition:border-color 0.5s,box-shadow 0.5s",
      ].join(";");

      const img = document.createElement("img");
      img.src = src; img.alt = photo.display_title;
      img.loading = "lazy"; img.draggable = false;
      img.style.cssText = [
        "display:block","width:100%","height:100%","object-fit:contain",
        "background:#070a0f","pointer-events:none",
        "transition:transform 0.6s","transform:scale(1)",
      ].join(";");

      const ret = document.createElement("div");
      ret.style.cssText = "position:absolute;inset:0;opacity:0;transition:opacity 0.5s;pointer-events:none;";
      ret.innerHTML = `
        <span style="position:absolute;top:6px;left:6px;width:12px;height:12px;border-top:1.5px solid var(--accent);border-left:1.5px solid var(--accent);opacity:0.9;"></span>
        <span style="position:absolute;top:6px;right:6px;width:12px;height:12px;border-top:1.5px solid var(--accent);border-right:1.5px solid var(--accent);opacity:0.9;"></span>
        <span style="position:absolute;bottom:6px;left:6px;width:12px;height:12px;border-bottom:1.5px solid var(--accent);border-left:1.5px solid var(--accent);opacity:0.9;"></span>
        <span style="position:absolute;bottom:6px;right:6px;width:12px;height:12px;border-bottom:1.5px solid var(--accent);border-right:1.5px solid var(--accent);opacity:0.9;"></span>`;

      const cap = document.createElement("div");
      cap.style.cssText = [
        "position:absolute","top:calc(100% + 7px)","left:0","right:0",
        "text-align:center","font-family:'JetBrains Mono',monospace",
        "font-size:8px","letter-spacing:0.2em","text-transform:uppercase",
        "color:var(--accent-bright)","opacity:0",
        "white-space:nowrap","overflow:hidden","text-overflow:ellipsis",
        "transition:opacity 0.5s","pointer-events:none",
      ].join(";");
      cap.textContent = `${String(i + 1).padStart(2, "0")} · ${photo.display_title}`;

      face.appendChild(img); face.appendChild(ret);
      card.appendChild(face); card.appendChild(cap);
      scene.appendChild(card);
      cards.push(card); faces.push(face); imgs.push(img);

      card.addEventListener("mouseenter", () => {
        if (ringActive.current) return;
        face.style.borderColor = "rgba(61,159,255,0.52)";
        face.style.boxShadow   = "0 12px 60px rgba(61,159,255,0.22),0 2px 10px rgba(0,0,0,0.4)";
        ret.style.opacity  = "1";
        cap.style.opacity  = "0.88";
        img.style.transform = "scale(1.04)";
        sfx.hover();
      });
      card.addEventListener("mouseleave", () => {
        face.style.borderColor = "rgba(238,243,250,0.07)";
        face.style.boxShadow   = "0 8px 40px rgba(0,0,0,0.65),0 2px 10px rgba(0,0,0,0.4)";
        ret.style.opacity  = "0";
        cap.style.opacity  = "0";
        img.style.transform = "scale(1)";
      });

      card.addEventListener("click", () => {
        if (ringActive.current) return;
        sfx.click();
        /* Snapshot current positions as ring start-points */
        for (let j = 0; j < N; j++) {
          snapX.current[j] = curX[j];
          snapY.current[j] = curY[j];
          snapZ.current[j] = curZ[j];
        }
        ringActive.current = true;
        ringStart.current  = performance.now();
        ringAlbum.current  = i;
      });
    });

    /* ── RAF ────────────────────────────────────────────────── */
    let rafId = 0;

    /*
     * Ring animation — two clean phases, no rotation matrix applied:
     *
     * Phase 1  0 → FORM_DUR : cards lerp from snapshot → ring positions (Y=0)
     * Phase 2  FORM_DUR → FORM_DUR+SPIN_DUR : ring spins one full turn
     *
     * The ring target positions are computed in a world-frame with Y=0
     * and NO rotation matrix, so the ring stays perfectly flat regardless
     * of the current rotH/rotV values.
     */
    const FORM_DUR = 0.50;  // seconds to form the ring
    const SPIN_DUR = 0.55;  // seconds for one full rotation
    const TOTAL    = FORM_DUR + SPIN_DUR;

    const tick = () => {
      const now = performance.now() / 1000;
      const t   = now - t0;

      /* Scroll entrance */
      const sec = sectionRef.current;
      if (sec) {
        const rect = sec.getBoundingClientRect();
        const vh   = window.innerHeight;
        const rng  = vh - (vh / 2 - rect.height / 2);
        scrollT    = rng > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / rng)) : 1;
      }

      /* ── Ring animation ──────────────────────────────────── */
      if (ringActive.current) {
        const elapsed  = (performance.now() - ringStart.current) / 1000;
        const formT    = Math.min(1, elapsed / FORM_DUR);
        const spinT    = Math.max(0, elapsed - FORM_DUR) / SPIN_DUR;
        const spinClamp = Math.min(1, spinT);

        /* Spin angle: 0 → 2π, ease-in-out */
        const spinAngle = easeInOut(spinClamp) * Math.PI * 2;

        for (let i = 0; i < N; i++) {
          /* Each card's evenly-spaced ring slot + spin offset */
          const baseAngle = (i / N) * Math.PI * 2;
          const angle     = baseAngle + spinAngle;
          const ringX     = Math.cos(angle) * RING_R;
          const ringY     = 0;   /* flat — no Y offset */
          const ringZ     = Math.sin(angle) * RING_R;

          /* Phase 1: lerp from snapshot → ring (ease-out) */
          const fe = easeOut3(formT);
          const tx = snapX.current[i] + (ringX - snapX.current[i]) * fe;
          const ty = snapY.current[i] + (ringY - snapY.current[i]) * fe;
          const tz = snapZ.current[i] + (ringZ - snapZ.current[i]) * fe;

          /* Write directly — no rotation matrix, no tidal, no micro-float */
          curX[i] = tx;
          curY[i] = ty;
          curZ[i] = tz;

          /* Scroll entrance factor */
          const staggerOff = (i / N) * 0.32;
          const rawS = Math.min(1, Math.max(0, (scrollT - staggerOff) / (1 - staggerOff)));
          const sE   = reduced ? rawS : 1 - Math.pow(1 - rawS, 3);
          const op   = 0.88 * sE;

          cards[i].style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) scale(${sE.toFixed(4)})`;
          cards[i].style.opacity   = op.toFixed(3);
          cards[i].style.zIndex    = "50";
        }

        /* Animation complete → open lightbox */
        if (elapsed >= TOTAL) {
          ringActive.current = false;
          const idx = ringAlbum.current;
          ringAlbum.current = -1;
          setOpenPhotoIdx(idx);
          sfx.open();
        }

        rafId = requestAnimationFrame(tick);
        return;
      }

      /* ── Normal sphere mode ──────────────────────────────── */

      /* Rotation — cursor has only gentle influence */
      if (!dragging) {
        velH = velH * FRIC + (mouseNX * CUR_H + IDLE) * (1 - FRIC);
        velV = velV * FRIC + (mouseNY * CUR_V)         * (1 - FRIC);
      }
      if (Math.abs(velH) < MIN_V) velH = MIN_V * (velH >= 0 ? 1 : -1);
      rotH += velH;
      rotV += velV;

      const thH  = (rotH * Math.PI) / 180;
      const thV  = (rotV * Math.PI) / 180;
      const cosH = Math.cos(thH), sinH = Math.sin(thH);
      const cosV = Math.cos(thV), sinV = Math.sin(thV);
      const tLoop = t * 0.06;

      for (let i = 0; i < N; i++) {
        const p  = params[i];
        const th = p.theta0 + tLoop;

        /* Sphere position */
        let fx = Math.sin(p.phi) * Math.cos(th) * RX;
        let fy = Math.cos(p.phi)                 * RY;
        let fz = Math.sin(p.phi) * Math.sin(th)  * RZ;

        /* Micro-float — Lissajous, unique per card */
        if (!reduced) {
          fx += Math.sin(t * p.fX + p.phase)       * p.aX;
          fy += Math.cos(t * p.fY + p.phase + 1.3) * p.aY;
          fz += Math.sin(t * p.fZ + p.phase + 2.7) * p.aZ;
        }

        /* Global rotation matrix Ry · Rx */
        const rx1 = fx * cosH - fz * sinH;
        const ry1 = fy;
        const rz1 = fx * sinH + fz * cosH;
        const rx2 = rx1;
        const ry2 = ry1 * cosV - rz1 * sinV;
        const rz2 = ry1 * sinV + rz1 * cosV;

        /* Smooth lerp */
        curX[i] += (rx2 - curX[i]) * 0.055;
        curY[i] += (ry2 - curY[i]) * 0.055;
        curZ[i] += (rz2 - curZ[i]) * 0.055;

        /* Scroll entrance */
        const staggerOff = (i / N) * 0.32;
        const rawS = Math.min(1, Math.max(0, (scrollT - staggerOff) / (1 - staggerOff)));
        const sE   = reduced ? rawS : 1 - Math.pow(1 - rawS, 3);
        const sz   = curZ[i] * sE + (-3000) * (1 - sE);
        const op   = (0.80 + Math.max(0, curZ[i] / 600) * 0.18) * sE;
        const di   = Math.round(((curZ[i] + 400) / 800) * 90 + 5);

        cards[i].style.transform = `translate3d(${curX[i].toFixed(1)}px,${curY[i].toFixed(1)}px,${sz.toFixed(1)}px) scale(${sE.toFixed(4)})`;
        cards[i].style.opacity   = op.toFixed(3);
        cards[i].style.zIndex    = String(Math.max(1, Math.min(99, di)));

        /* The photograph is displayed exactly as supplied — depth is
           carried by scale and opacity only, never by grading. */
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    /* ── Events ─────────────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && (r.top > window.innerHeight || r.bottom < 0)) return;
      mouseNX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (dragging) {
        const dx = e.clientX - dwnX, dy = e.clientY - dwnY;
        dwnX = e.clientX; dwnY = e.clientY;
        rotH += dx * DRAG_M * 0.1; rotV += dy * DRAG_M * 0.1;
        velH  = dx * DRAG_M * 0.1; velV  = dy * DRAG_M * 0.1;
        lastDX = dx; lastDY = dy;
      }
    };
    const onLeave = () => { mouseNX = 0; mouseNY = 0; };
    const onDown  = (e: MouseEvent) => {
      if (ringActive.current) return;
      dragging = true; dwnX = e.clientX; dwnY = e.clientY;
      lastDX = 0; lastDY = 0; velH = 0; velV = 0;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      velH = lastDX * DRAG_M * 0.1;
      velV = lastDY * DRAG_M * 0.1;
    };
    const onWheel = (e: WheelEvent) => { velH += e.deltaY * 0.004; };

    let tLX = 0, tLY = 0, tVX = 0, tVY = 0;
    const onTs = (e: TouchEvent) => {
      tLX = e.touches[0].clientX; tLY = e.touches[0].clientY;
      tVX = 0; tVY = 0; dragging = true; velH = 0; velV = 0;
    };
    const onTm = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - tLX, dy = e.touches[0].clientY - tLY;
      tLX = e.touches[0].clientX; tLY = e.touches[0].clientY;
      tVX = dx; tVY = dy;
      rotH += dx * DRAG_M * 0.1; rotV += dy * DRAG_M * 0.1;
      velH  = dx * DRAG_M * 0.1; velV  = dy * DRAG_M * 0.1;
    };
    const onTe = () => {
      dragging = false;
      velH = tVX * DRAG_M * 0.1;
      velV = tVY * DRAG_M * 0.1;
    };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("wheel",      onWheel, { passive: true });
    wrap.addEventListener("touchstart",   onTs,    { passive: true });
    wrap.addEventListener("touchmove",    onTm,    { passive: true });
    wrap.addEventListener("touchend",     onTe);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("wheel",      onWheel);
      wrap.removeEventListener("touchstart",   onTs);
      wrap.removeEventListener("touchmove",    onTm);
      wrap.removeEventListener("touchend",     onTe);
      while (scene.firstChild) scene.removeChild(scene.firstChild);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{ position: "relative", zIndex: 10, height: "100vh" }}
    >
      {/* Label */}
      <div style={{
        position: "absolute", top: "clamp(1.25rem,2.5vh,2rem)",
        left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap",
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 350,
          fontSize: "clamp(0.85rem,1.1vw,1rem)",
          letterSpacing: "-0.01em", color: "rgba(238,243,250,0.48)",
        }}>
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Photography</em>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.24em", color: "rgba(238,243,250,0.25)",
            marginLeft: "1.5rem",
          }}>
            {N} works
          </span>
        </span>
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: "clamp(1.5rem,3vh,2.5rem)",
        left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 20,
        display: "flex", gap: "0.65rem", alignItems: "center",
        whiteSpace: "nowrap",
      }}>
        {["Drag · rotate", "·", "Click · opens work"].map((t, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 8,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(238,243,250,0.18)",
          }}>{t}</span>
        ))}
      </div>

      {/* 3D scene */}
      <div
        ref={wrapRef}
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          perspective: `${PERSP}px`, perspectiveOrigin: "50% 50%",
          userSelect: "none", WebkitUserSelect: "none",
        }}
      >
        <div
          ref={sceneRef}
          style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d" }}
        />
      </div>

      {/* Album viewer — canonical manifests, original files untouched */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            key={`photo-${viewer.photo_id}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => { setOpenPhotoIdx(null); sfx.close(); }}
            style={{ position:"fixed", inset:0, zIndex:120, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", padding:"clamp(1rem,4vw,3rem)", background:"rgba(5,7,9,0.95)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)" }}
          >
            <div onClick={e => e.stopPropagation()} style={{ position:"relative", width:"min(94vw,980px)", height:"min(72vh,680px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img
                src={viewer.source_url}
                alt={viewer.display_title}
                loading="eager"
                decoding="async"
                style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", display:"block" }}
              />
            </div>

            <div onClick={e => e.stopPropagation()} style={{ width:"min(94vw,980px)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap" }}>
              <div>
                <h3 style={{ fontFamily:"var(--font-display)", fontWeight:350, fontStyle:"italic", fontSize:"clamp(1.2rem,2.6vw,1.9rem)", lineHeight:1, letterSpacing:"-0.03em", color:"var(--ink)" }}>
                  {viewer.display_title}
                </h3>
                <p style={{ marginTop:"0.45rem", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.24em", textTransform:"uppercase", color:"var(--muted)" }}>
                  {viewer.album_title} · {viewer.photo_id}
                </p>
              </div>
              <a href={collectionSourceUrl(viewer.collection_id)} target="_blank" rel="noreferrer" data-cursor="hover" style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none" }}>
                Source archive ↗
              </a>
            </div>

            <p onClick={e => e.stopPropagation()} style={{ width:"min(94vw,980px)", fontFamily:"var(--font-sans)", fontWeight:300, fontSize:"clamp(0.82rem,1.1vw,0.92rem)", lineHeight:1.7, color:"var(--ink-dim)", borderTop:"1px solid rgba(238,243,250,0.08)", paddingTop:"0.8rem" }}>
              {viewer.caption}
            </p>

            <div onClick={e => e.stopPropagation()} style={{ width:"min(94vw,980px)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}>
              <button
                onClick={() => { if (viewerPos > 0) setOpenPhotoIdx(openPhotoIdx! - 1); }}
                disabled={viewerPos <= 0}
                style={{ display:"flex", alignItems:"center", gap:"0.4rem", background:"none", border:"none", padding:"0.5rem", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted)", opacity:viewerPos <= 0 ? 0.2 : 0.75 }}
              >
                ← Prev
              </button>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.22em", color:"var(--muted)", opacity:0.6 }}>
                {String(Math.max(viewerPos+1,1)).padStart(2,"0")} / {String(viewerPhotos.length).padStart(2,"0")}
              </span>
              <button
                onClick={() => { if (viewerPos >= 0 && viewerPos < viewerPhotos.length - 1) setOpenPhotoIdx(openPhotoIdx! + 1); }}
                disabled={viewerPos >= viewerPhotos.length - 1}
                style={{ display:"flex", alignItems:"center", gap:"0.4rem", background:"none", border:"none", padding:"0.5rem", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted)", opacity:viewerPos >= viewerPhotos.length-1 ? 0.2 : 0.75 }}
              >
                Next →
              </button>
            </div>

            <button
              onClick={() => { setOpenPhotoIdx(null); sfx.close(); }}
              aria-label="Close viewer"
              style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"none", border:"1px solid rgba(238,243,250,0.14)", borderRadius:"100px", padding:"0.45rem 0.9rem", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.24em", textTransform:"uppercase", color:"var(--muted)" }}
            >
              Close ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

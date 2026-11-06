import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { sfx } from "../audio/SoundEngine";
import AudioToggle from "./AudioToggle";
import { useState } from "react";
import {
  ALBUMS,
  SPHERE_SELECTION,
  getAlbum,
  getAlbumPhotos,
  getAlbumCover,
  collectionSourceUrl,
  ARCHIVE_SOURCE_URL,
  REPO_ROOT,
  type Photo,
} from "../data/photographyManifest";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────────
   CONSTANTS — exact mirror of the landing-page sphere (ScrollSphere)
───────────────────────────────────────────────────────────── */
const N      = 36;                        /* 36 cards, like the landing sphere */
const PERSP  = 1000;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * SPHERE ASSETS — the 36 canonical photographs, ordered by sphere slot.
 * Each frame receives the manifest record verbatim: exact source_url,
 * title, album and photo id. No generated imagery is used anywhere.
 */
const SPHERE_IMAGES: Photo[] = SPHERE_SELECTION.slice(0, N);

/* Sphere radii — identical to landing page */
const RX = 300, RY = 185, RZ = 255;

/* Ring radius for click animation — identical */
const RING_R = 400;

/* Mixed card sizes — identical to landing page */
type CardSize = { w: number; h: number; orient: "v" | "h" };
const CARD_DEFS: CardSize[] = [
  { w: 88,  h: 124, orient: "v" },
  { w: 96,  h: 132, orient: "v" },
  { w: 80,  h: 114, orient: "v" },
  { w: 92,  h: 128, orient: "v" },
  { w: 130, h:  82, orient: "h" },
  { w: 118, h:  76, orient: "h" },
  { w: 138, h:  88, orient: "h" },
  { w: 124, h:  80, orient: "h" },
  { w: 100, h: 100, orient: "v" },
];

/* Motion — identical to landing page */
const IDLE   = 0.006;
const CUR_H  = 0.12;
const CUR_V  = 0.07;
const DRAG_M = 0.90;
const FRIC   = 0.84;
const MIN_V  = 0.004;

/* Ring timing — identical */
const FORM_DUR = 0.50, SPIN_DUR = 0.55, RING_TOTAL = FORM_DUR + SPIN_DUR;

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

const easeOut3  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function PhotographyGallery({ onClose }: { onClose: () => void }) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const sceneRef     = useRef<HTMLDivElement>(null);
  const detailRef    = useRef<HTMLDivElement>(null);
  const detailImgRef = useRef<HTMLImageElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const catRef       = useRef<HTMLSpanElement>(null);
  const yearRef      = useRef<HTMLSpanElement>(null);
  const noteRef      = useRef<HTMLParagraphElement>(null);
  const cntRef       = useRef<HTMLSpanElement>(null);
  const prevRef      = useRef<HTMLButtonElement>(null);
  const nextRef      = useRef<HTMLButtonElement>(null);
  const dotRef       = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);

  /* Asset-source panel (deep links to the canonical archive) */
  const [sourcesOpen, setSourcesOpen] = useState(false);

  /* Album stepping state for the viewer */
  const albumPhotos = useRef<Photo[]>([]);
  const albumPos    = useRef(0);

  /* Ring animation refs */
  const ringActive = useRef(false);
  const ringStart  = useRef(0);
  const ringIdx    = useRef(-1);
  const snapX = useRef(new Float32Array(N));
  const snapY = useRef(new Float32Array(N));
  const snapZ = useRef(new Float32Array(N));

  const S = useRef({
    detailOpen: false,
    detailIdx: -1,
    hoverIdx: -1,
    cursorMode: "default" as "default" | "hover" | "drag" | "scroll",
    curPX: 0, curPY: 0, ringX: 0, ringY: 0,
  });

  const sourceRef = useRef<HTMLAnchorElement>(null);

  const populateDetail = useCallback((idx: number) => {
    const photo = SPHERE_IMAGES[idx];
    if (!photo) return;

    /* Resolve the parent album so the viewer can step through the
       album's canonical photographs. */
    const album  = getAlbum(photo.album_id);
    const photos = album ? getAlbumPhotos(album.album_id) : [photo];
    const pos    = Math.max(0, photos.findIndex(p => p.photo_id === photo.photo_id));
    albumPhotos.current = photos;
    albumPos.current    = pos;

    if (detailImgRef.current) { detailImgRef.current.src = photo.source_url; detailImgRef.current.alt = photo.display_title; }
    if (titleRef.current)  titleRef.current.textContent  = photo.display_title;
    if (catRef.current)    catRef.current.textContent    = photo.album_title;
    if (yearRef.current)   yearRef.current.textContent   = photo.year ?? album?.year ?? "";
    if (noteRef.current)   noteRef.current.textContent   = photo.caption;
    if (cntRef.current)    cntRef.current.textContent    = `${String(pos+1).padStart(2,"0")} / ${String(photos.length).padStart(2,"0")}`;
    if (prevRef.current)   prevRef.current.disabled      = pos === 0;
    if (nextRef.current)   nextRef.current.disabled      = pos === photos.length - 1;
    if (sourceRef.current) sourceRef.current.href        = collectionSourceUrl(photo.collection_id);
  }, []);

  const openDetail = useCallback((idx: number) => {
    const s = S.current;
    s.detailOpen = true; s.detailIdx = idx;
    populateDetail(idx);
    detailRef.current?.classList.add("pg-open");
    detailRef.current?.focus();
  }, [populateDetail]);

  const closeDetail = useCallback(() => {
    S.current.detailOpen = false; S.current.detailIdx = -1;
    detailRef.current?.classList.remove("pg-open");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = S.current;
      if (e.key === "Escape") { if (s.detailOpen) closeDetail(); else onClose(); return; }
      if (!s.detailOpen) return;
      if ((e.key==="ArrowLeft"||e.key==="ArrowUp")    && s.detailIdx>0)    { s.detailIdx--; populateDetail(s.detailIdx); }
      if ((e.key==="ArrowRight"||e.key==="ArrowDown") && s.detailIdx<N-1)  { s.detailIdx++; populateDetail(s.detailIdx); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDetail, onClose, populateDetail]);

  /* ═══════════════════════════════════════════════════════════
     PHYSICS — exact mirror of ScrollSphere
  ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const s       = S.current;
    const wrap    = wrapRef.current;
    const scene   = sceneRef.current;
    const dot     = dotRef.current;
    const ring    = ringRef.current;
    if (!wrap || !scene) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const params  = buildParams();

    let scrollT = 0;
    const t0    = performance.now() / 1000;

    /* Rotation */
    let rotH = 0, rotV = 0, velH = 0, velV = 0;
    let dragging = false, lastDX = 0, lastDY = 0, dwnX = 0, dwnY = 0;
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

    s.curPX = window.innerWidth / 2;
    s.curPY = window.innerHeight / 2;
    s.ringX = s.curPX;
    s.ringY = s.curPY;

    /* ── DOM ────────────────────────────────────────────────── */
    const cards: HTMLDivElement[]   = [];
    const faces: HTMLDivElement[]   = [];
    const imgs:  HTMLImageElement[] = [];

    Array.from({ length: N }).forEach((_, i) => {
      const def   = CARD_DEFS[i % CARD_DEFS.length];
      const { w, h } = def;

      /* Canonical manifest record for this sphere slot. */
      const photo = SPHERE_IMAGES[i];
      if (!photo) return;

      /* The exact original file, used verbatim. */
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
        "pointer-events:none","background:#070a0f",
        "transition:transform 0.6s",
        "transform:scale(1)",
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
      cap.textContent = `${String(i + 1).padStart(2, "0")} · ${photo.display_title} · ${photo.album_title}`;

      face.appendChild(img); face.appendChild(ret);
      card.appendChild(face); card.appendChild(cap);
      scene.appendChild(card);
      cards.push(card); faces.push(face); imgs.push(img);

      card.addEventListener("mouseenter", () => {
        if (ringActive.current) return;
        s.hoverIdx = i; s.cursorMode = "hover";
        face.style.borderColor = "rgba(61,159,255,0.52)";
        face.style.boxShadow   = "0 12px 60px rgba(61,159,255,0.22),0 2px 10px rgba(0,0,0,0.4)";
        ret.style.opacity  = "1";
        cap.style.opacity  = "0.88";
        img.style.transform = "scale(1.03)";
        sfx.hover();
      });
      card.addEventListener("mouseleave", () => {
        if (s.hoverIdx === i) { s.hoverIdx = -1; s.cursorMode = "default"; }
        face.style.borderColor = "rgba(238,243,250,0.07)";
        face.style.boxShadow   = "0 8px 40px rgba(0,0,0,0.65),0 2px 10px rgba(0,0,0,0.4)";
        ret.style.opacity  = "0";
        cap.style.opacity  = "0";
        img.style.transform = "scale(1)";
      });

      card.addEventListener("click", () => {
        if (ringActive.current) return;
        sfx.click();
        for (let j = 0; j < N; j++) {
          snapX.current[j] = curX[j];
          snapY.current[j] = curY[j];
          snapZ.current[j] = curZ[j];
        }
        ringActive.current = true;
        ringStart.current  = performance.now();
        ringIdx.current    = i;
      });
    });

    /* ── RAF ────────────────────────────────────────────────── */
    let rafId = 0;

    const tick = () => {
      const now = performance.now() / 1000;
      const t   = now - t0;

      /* Scroll entrance */
      const sec = wrap;
      if (sec) {
        const rect = sec.getBoundingClientRect();
        const vh   = window.innerHeight;
        const rng  = vh - (vh / 2 - rect.height / 2);
        scrollT    = rng > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / rng)) : 1;
      }

      /* ── Ring animation ──────────────────────────────────── */
      if (ringActive.current) {
        const elapsed   = (performance.now() - ringStart.current) / 1000;
        const formT     = Math.min(1, elapsed / FORM_DUR);
        const spinT     = Math.max(0, elapsed - FORM_DUR) / SPIN_DUR;
        const spinClamp = Math.min(1, spinT);
        const spinAngle = easeInOut(spinClamp) * Math.PI * 2;

        for (let i = 0; i < N; i++) {
          const baseAngle = (i / N) * Math.PI * 2;
          const angle     = baseAngle + spinAngle;
          const ringX = Math.cos(angle) * RING_R;
          const ringY = 0;
          const ringZ = Math.sin(angle) * RING_R;

          const fe = easeOut3(formT);
          const tx = snapX.current[i] + (ringX - snapX.current[i]) * fe;
          const ty = snapY.current[i] + (ringY - snapY.current[i]) * fe;
          const tz = snapZ.current[i] + (ringZ - snapZ.current[i]) * fe;

          curX[i] = tx; curY[i] = ty; curZ[i] = tz;

          const staggerOff = (i / N) * 0.32;
          const rawS = Math.min(1, Math.max(0, (scrollT - staggerOff) / (1 - staggerOff)));
          const sE   = reduced ? rawS : 1 - Math.pow(1 - rawS, 3);
          const op   = 0.88 * sE;

          cards[i].style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) scale(${sE.toFixed(4)})`;
          cards[i].style.opacity   = op.toFixed(3);
          cards[i].style.zIndex    = "50";
        }

        if (elapsed >= RING_TOTAL) {
          ringActive.current = false;
          const idx = ringIdx.current;
          ringIdx.current = -1;
          openDetail(idx);
          sfx.open();
        }

        /* Custom cursor */
        if (dot && ring) {
          dot.style.left = `${s.curPX}px`; dot.style.top = `${s.curPY}px`;
          s.ringX += (s.curPX - s.ringX) * 0.14;
          s.ringY += (s.curPY - s.ringY) * 0.14;
          ring.style.left = `${s.ringX}px`; ring.style.top = `${s.ringY}px`;
        }

        rafId = requestAnimationFrame(tick);
        return;
      }

      /* ── Normal sphere mode ──────────────────────────────── */
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

        /* Photographs are never graded, filtered or blurred — only the
           frame's own opacity conveys depth. */
      }

      /* Custom cursor follow */
      if (dot && ring) {
        dot.style.left = `${s.curPX}px`; dot.style.top = `${s.curPY}px`;
        s.ringX += (s.curPX - s.ringX) * 0.14;
        s.ringY += (s.curPY - s.ringY) * 0.14;
        ring.style.left = `${s.ringX}px`; ring.style.top = `${s.ringY}px`;
        const mode = s.cursorMode;
        const sz = mode==="hover"?56:mode==="drag"?42:mode==="scroll"?36:28;
        ring.style.width = `${sz}px`; ring.style.height = `${sz}px`;
        ring.style.borderColor = mode==="hover"?"rgba(61,159,255,0.7)":mode==="drag"?"rgba(61,159,255,0.55)":"rgba(238,243,250,0.45)";
        ring.style.background  = mode==="hover"?"rgba(61,159,255,0.08)":"transparent";
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    /* ── Events — identical to ScrollSphere ─────────────────── */
    const onMove = (e: MouseEvent) => {
      s.curPX = e.clientX; s.curPY = e.clientY;
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
      if (s.detailOpen || ringActive.current) return;
      dragging = true; dwnX = e.clientX; dwnY = e.clientY;
      lastDX = 0; lastDY = 0; velH = 0; velV = 0;
      s.cursorMode = "drag";
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      velH = lastDX * DRAG_M * 0.1;
      velV = lastDY * DRAG_M * 0.1;
      s.cursorMode = s.hoverIdx !== -1 ? "hover" : "default";
    };
    const onWheel = (e: WheelEvent) => {
      if (s.detailOpen) return;
      velH += e.deltaY * 0.004;
      s.cursorMode = "scroll";
      clearTimeout((onWheel as any)._t);
      (onWheel as any)._t = setTimeout(() => {
        if (!dragging && s.hoverIdx === -1) s.cursorMode = "default";
      }, 400);
    };

    let tLX = 0, tLY = 0, tVX = 0, tVY = 0;
    const onTs = (e: TouchEvent) => {
      if (s.detailOpen || ringActive.current) return;
      tLX = e.touches[0].clientX; tLY = e.touches[0].clientY;
      tVX = 0; tVY = 0; dragging = true; velH = 0; velV = 0;
    };
    const onTm = (e: TouchEvent) => {
      if (!dragging) return;
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
  }, [openDetail]);

  /* ── CSS ────────────────────────────────────────────────── */
  const css = `
    .pg-wrap{user-select:none;-webkit-user-select:none;}
    .pg-dot{position:fixed;z-index:9999;pointer-events:none;width:5px;height:5px;border-radius:50%;background:var(--accent-bright);box-shadow:0 0 10px var(--accent-glow);transform:translate(-50%,-50%);transition:opacity 0.2s;}
    .pg-ring{position:fixed;z-index:9998;pointer-events:none;border-radius:50%;border:1px solid rgba(238,243,250,0.45);transform:translate(-50%,-50%);transition:width 0.3s cubic-bezier(0.16,1,0.3,1),height 0.3s cubic-bezier(0.16,1,0.3,1),border-color 0.3s,background 0.3s;width:28px;height:28px;}
    .pg-detail{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(5,7,9,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;pointer-events:none;transition:opacity 0.55s cubic-bezier(0.16,1,0.3,1);}
    .pg-detail.pg-open{opacity:1;pointer-events:auto;}
    .pg-detail-inner{position:relative;width:min(92vw,640px);display:flex;flex-direction:column;align-items:center;gap:clamp(0.9rem,2vw,1.5rem);transform:translateY(20px);transition:transform 0.65s cubic-bezier(0.16,1,0.3,1);}
    .pg-detail.pg-open .pg-detail-inner{transform:translateY(0);}
    .pg-img-wrap{position:relative;width:100%;max-height:60vh;overflow:hidden;border:1px solid rgba(238,243,250,0.08);}
    .pg-img-wrap::before{content:"";position:absolute;top:8px;left:8px;z-index:2;width:16px;height:16px;pointer-events:none;border-top:1px solid rgba(61,159,255,0.6);border-left:1px solid rgba(61,159,255,0.6);}
    .pg-img-wrap::after{content:"";position:absolute;bottom:8px;right:8px;z-index:2;width:16px;height:16px;pointer-events:none;border-bottom:1px solid rgba(61,159,255,0.6);border-right:1px solid rgba(61,159,255,0.6);}
    .pg-det-img{display:block;width:100%;max-height:60vh;object-fit:contain;}
    .pg-det-btn{display:flex;align-items:center;gap:0.4rem;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted);opacity:0.7;background:none;border:none;padding:0.5rem;transition:opacity 0.3s;}
    .pg-det-btn:hover{opacity:1;}.pg-det-btn:disabled{opacity:0.18;pointer-events:none;}
    .pg-root,.pg-root *{cursor:none !important;}
  `;

  return (
    <motion.div className="pg-root" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.65,ease:[0.16,1,0.3,1]}}
      style={{position:"fixed",inset:0,zIndex:200,background:"var(--bg)",overflow:"hidden"}}>
      <style>{css}</style>

      <div ref={dotRef}  className="pg-dot"  aria-hidden />
      <div ref={ringRef} className="pg-ring" aria-hidden />

      {/* Nav */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"clamp(1.25rem,2.5vw,2rem) clamp(1.5rem,4vw,3.5rem)",pointerEvents:"none"}}>
        <button onClick={onClose} aria-label="Back to portfolio"
          style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:"0.55rem",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",color:"rgba(238,243,250,0.5)",background:"none",border:"none",transition:"color 0.3s"}}
          onMouseEnter={e=>(e.currentTarget.style.color="rgba(238,243,250,0.9)")}
          onMouseLeave={e=>(e.currentTarget.style.color="rgba(238,243,250,0.5)")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="8,2 4,6 8,10"/></svg>
          Portfolio
        </button>
        <span style={{fontFamily:"var(--font-display)",fontWeight:350,fontSize:"clamp(0.85rem,1.1vw,1rem)",letterSpacing:"-0.01em",color:"rgba(238,243,250,0.6)"}}>
          <em style={{fontStyle:"italic",color:"var(--accent)"}}>Photography</em>
        </span>
        <div style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:"0.4rem"}}>
          {/* Sources — deep links to the raw Drive folders */}
          <div style={{position:"relative"}}>
            <button
              onClick={() => setSourcesOpen(v => !v)}
              aria-expanded={sourcesOpen}
              aria-label="Asset sources"
              data-cursor="hover"
              data-cursor-label="SOURCES"
              style={{
                display:"flex",alignItems:"center",gap:"0.4rem",
                background:"none",border:"none",
                fontFamily:"var(--font-mono)",fontSize:9,
                letterSpacing:"0.22em",textTransform:"uppercase",
                color: sourcesOpen ? "var(--accent)" : "rgba(238,243,250,0.45)",
                padding:"0.4rem 0.5rem",transition:"color 0.3s",
              }}
            >
              Sources
            </button>

            {sourcesOpen && (
              <div style={{
                position:"absolute",top:"calc(100% + 0.6rem)",right:0,
                width:"min(78vw,272px)",
                background:"rgba(5,7,10,0.96)",
                backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",
                border:"1px solid rgba(238,243,250,0.09)",
                borderRadius:3,padding:"0.5rem 0",zIndex:60,
                boxShadow:"0 24px 60px rgba(0,0,0,0.65)",
              }}>
                <a
                  href={ARCHIVE_SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.75rem",padding:"0.55rem 0.9rem",fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--accent)",textDecoration:"none",borderBottom:"1px solid rgba(238,243,250,0.08)"}}
                >
                  All project assets
                  <span aria-hidden>↗</span>
                </a>
                {ALBUMS.map(a => {
                  const cover = getAlbumCover(a.album_id);
                  return (
                    <a
                      key={a.album_id}
                      href={cover ? cover.source_url : REPO_ROOT}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="hover"
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.75rem",padding:"0.45rem 0.9rem",fontFamily:"var(--font-sans)",fontWeight:300,fontSize:"0.78rem",color:"var(--ink-dim)",textDecoration:"none"}}
                    >
                      {a.display_title}
                      <span aria-hidden style={{color:"var(--muted)",fontSize:9}}>↗</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <AudioToggle />
        </div>
      </div>

      {/* Scene */}
      <div ref={wrapRef} className="pg-wrap" style={{position:"absolute",inset:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",perspective:`${PERSP}px`,perspectiveOrigin:"50% 50%"}}>
        <div ref={sceneRef} style={{position:"relative",width:0,height:0,transformStyle:"preserve-3d"}}/>
      </div>

      {/* Hint */}
      <div style={{position:"fixed",bottom:"1.75rem",left:"50%",transform:"translateX(-50%)",zIndex:20,display:"flex",gap:"1rem",alignItems:"center",whiteSpace:"nowrap",pointerEvents:"none"}}>
        {["Move cursor to spin","·","Drag to steer","·","Click to open"].map((t,i)=>(
          <span key={i} style={{fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(238,243,250,0.22)"}}>{t}</span>
        ))}
      </div>

      {/* Detail view */}
      <div ref={detailRef} className="pg-detail" role="dialog" aria-modal="true" aria-label="Project detail" tabIndex={-1} onClick={e=>{if(e.target===detailRef.current)closeDetail();}}>
        <div className="pg-detail-inner">
          <button onClick={closeDetail} aria-label="Close" style={{position:"absolute",top:"-2.5rem",right:0,display:"flex",alignItems:"center",gap:"0.4rem",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--muted)",opacity:0.7,background:"none",border:"none",transition:"opacity 0.3s"}} onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0.7")}>
            Close<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
          </button>
          <div className="pg-img-wrap"><img ref={detailImgRef} className="pg-det-img" src="" alt="" loading="lazy"/></div>
          <div style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
            <h2 ref={titleRef} style={{fontFamily:"var(--font-display)",fontWeight:350,fontStyle:"italic",fontSize:"clamp(1.2rem,3vw,2.1rem)",lineHeight:1,letterSpacing:"-0.03em",color:"var(--ink)"}}/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.25rem",flexShrink:0}}>
              <span ref={catRef}  style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--muted)"}}/>
              <span ref={yearRef} style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--accent)",opacity:0.85}}/>
            </div>
          </div>
          <p ref={noteRef} style={{width:"100%",fontFamily:"var(--font-sans)",fontWeight:300,fontSize:"clamp(0.83rem,1.1vw,0.93rem)",lineHeight:1.72,color:"var(--ink-dim)",borderTop:"1px solid rgba(238,243,250,0.08)",paddingTop:"0.9rem"}}/>

          {/* Deep link to the raw asset source for this collection */}
          <a
            ref={sourceRef}
            href={ARCHIVE_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
            data-cursor-label="SOURCE"
            style={{width:"100%",display:"inline-flex",alignItems:"center",gap:"0.5rem",fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",transition:"color 0.3s",paddingBottom:"0.25rem"}}
            onMouseEnter={e=>(e.currentTarget.style.color="var(--accent)")}
            onMouseLeave={e=>(e.currentTarget.style.color="var(--muted)")}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M1 8 L8 1 M8 1 H3 M8 1 V6" />
            </svg>
            Open raw asset folder on Drive
          </a>

          <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button ref={prevRef} className="pg-det-btn" aria-label="Previous" onClick={()=>{const s=S.current;if(s.detailIdx>0){s.detailIdx--;populateDetail(s.detailIdx);}}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="8,2 4,6.5 8,11"/></svg>Prev
            </button>
            <span ref={cntRef} style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--muted)",opacity:0.5}}/>
            <button ref={nextRef} className="pg-det-btn" aria-label="Next" onClick={()=>{const s=S.current;if(s.detailIdx<N-1){s.detailIdx++;populateDetail(s.detailIdx);}}}>
              Next<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="5,2 9,6.5 5,11"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { sfx } from "../audio/SoundEngine";
import { FILM_STILLS, type FilmStill } from "../data/filmStills";

const FILMS: FilmStill[] = FILM_STILLS;


const N = FILMS.length;
const FRAME_W = 110, FRAME_H = 82, PERSP = 860;
const RIBBON_H = 720, RIBBON_R = 200, RIBBON_D = 140, RIBBON_T = 2.9;
const IDLE = 0.0019, CUR_H = 0.015, CUR_V = 0.006, DRAG_H = 0.34, DRAG_V = 0.02;
const FRIC = 0.88, MIN_V = 0.0015;
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);

function buildFrame(film: FilmStill, index: number): HTMLDivElement {
  const card = document.createElement("div");
  card.style.cssText = `position:absolute;width:${FRAME_W}px;height:${FRAME_H}px;left:50%;top:50%;margin-left:-${FRAME_W/2}px;margin-top:-${FRAME_H/2}px;will-change:transform;opacity:0;cursor:default;`;
  const strip = document.createElement("div");
  strip.style.cssText = `position:relative;width:100%;height:100%;background:#0d0b08;border:1px solid rgba(180,160,120,0.16);box-shadow:0 6px 26px rgba(0,0,0,0.6);overflow:hidden;transition:border-color 0.5s,box-shadow 0.5s;`;
  ["top:1px","bottom:1px"].forEach(pos => {
    const row = document.createElement("div");
    row.style.cssText = `position:absolute;${pos};left:6px;right:6px;display:flex;gap:3px;pointer-events:none;`;
    for (let s = 0; s < 7; s++) {
      const hole = document.createElement("span");
      hole.style.cssText = "display:block;flex:1;max-width:6px;height:4px;border-radius:1px;background:rgba(25,20,14,0.95);border:0.5px solid rgba(140,120,80,0.2);";
      row.appendChild(hole);
    }
    strip.appendChild(row);
  });
  const num = document.createElement("div");
  num.style.cssText = `position:absolute;top:8px;left:2px;writing-mode:vertical-rl;font-family:'JetBrains Mono',monospace;font-size:5px;letter-spacing:0.1em;color:rgba(200,170,100,0.38);pointer-events:none;user-select:none;`;
  num.textContent = `${String(index + 1).padStart(2, "0")}A`;
  strip.appendChild(num);
  const winH = FRAME_H - 16;
  const winW = Math.min(Math.round(winH * 2.39), FRAME_W - 12);
  const win = document.createElement("div");
  win.style.cssText = `position:absolute;top:8px;left:50%;transform:translateX(-50%);width:${winW}px;height:${winH}px;overflow:hidden;border:0.5px solid rgba(140,120,80,0.1);`;
  const img = document.createElement("img");
  img.src = film.url;
  img.alt = film.title; img.loading = "lazy"; img.draggable = false;
  img.style.cssText = `display:block;width:100%;height:100%;object-fit:contain;background:#070a0f;pointer-events:none;transition:transform 0.6s;transform:scale(1);`;
  const ret = document.createElement("div");
  ret.style.cssText = "position:absolute;inset:0;opacity:0;transition:opacity 0.5s;pointer-events:none;";
  ret.innerHTML = `
    <span style="position:absolute;top:2px;left:2px;width:7px;height:7px;border-top:1px solid var(--accent);border-left:1px solid var(--accent);"></span>
    <span style="position:absolute;top:2px;right:2px;width:7px;height:7px;border-top:1px solid var(--accent);border-right:1px solid var(--accent);"></span>
    <span style="position:absolute;bottom:2px;left:2px;width:7px;height:7px;border-bottom:1px solid var(--accent);border-left:1px solid var(--accent);"></span>
    <span style="position:absolute;bottom:2px;right:2px;width:7px;height:7px;border-bottom:1px solid var(--accent);border-right:1px solid var(--accent);"></span>`;
  win.appendChild(img); win.appendChild(ret);
  strip.appendChild(win);
  const cap = document.createElement("div");
  cap.style.cssText = `position:absolute;top:calc(100% + 5px);left:0;right:0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:6px;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent-bright);opacity:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity 0.5s;pointer-events:none;`;
  cap.textContent = `${String(index + 1).padStart(2, "0")} · ${film.title}`;
  card.appendChild(strip); card.appendChild(cap);
  (card as any)._strip = strip;
  (card as any)._img = img;
  return card;
}

function Detail({ film, idx, onClose, onPrev, onNext }: {
  film: typeof FILMS[0]; idx: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,7,9,0.94)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "relative", width: "min(92vw,640px)", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(0.9rem,2vw,1.5rem)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "-2.5rem", right: 0, display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.7, background: "none", border: "none", transition: "opacity 0.3s" }} onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
          Close<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
        </button>
        <div style={{ width: "100%", aspectRatio: "2.39/1", overflow: "hidden", border: "1px solid rgba(238,243,250,0.08)", background: "#0a0908" }}>
          <img src={film.url} alt={film.title} loading="eager" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 350, fontStyle: "italic", fontSize: "clamp(1.2rem,3vw,2.1rem)", lineHeight: 1, letterSpacing: "-0.03em", color: "var(--ink)" }}>{film.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--muted)" }}>{film.film}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.85 }}>{film.year}</span>
          </div>
        </div>
        <div style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.7 }}>{film.format}</div>
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onPrev} disabled={idx === 0} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", opacity: idx === 0 ? 0.2 : 0.7, background: "none", border: "none", padding: "0.5rem" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8,2 4,6.5 8,11"/></svg>Prev
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.5 }}>{String(idx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span>
          <button onClick={onNext} disabled={idx === N - 1} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", opacity: idx === N - 1 ? 0.2 : 0.7, background: "none", border: "none", padding: "0.5rem" }}>
            Next<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="5,2 9,6.5 5,11"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FilmSphere() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current, scene = sceneRef.current;
    if (!wrap || !scene) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now() / 1000;

    /* ── Shared physics state ─────────────────────────────────────── */
    let scrollT = 0;
    let rotV = 0, tiltV = 0, threadV = 0;
    let cursorNX = 0, cursorNY = 0, cursorPX = 0, cursorPY = 0;
    let mouseX = 0, mouseY = 0;
    let dragDX = 0, dragDY = 0;
    let grabOffX = 0, grabOffY = 0, grabVelX = 0, grabVelY = 0;
    let dragActive = false;
    let holdU = -1, holdStrength = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let tapIdx = -1, tapProg = 1, tapTimer: ReturnType<typeof setTimeout> | undefined;

    const tapZ = new Float32Array(N);
    const tapVZ = new Float32Array(N);
    const tapAccelerometer = { cosT: 0, sinT: 0 }; // placeholder to show usage scope
    void tapAccelerometer;

    const proxX = new Float32Array(N);
    const proxY = new Float32Array(N);
    const proxVX = new Float32Array(N);
    const proxVY = new Float32Array(N);

    const curX = new Float32Array(N);
    const curY = new Float32Array(N);
    const curZ = new Float32Array(N);
    for (let i = 0; i < N; i++) { curX[i] = 0; curY[i] = 0; curZ[i] = -1800; }

    /* ── DOM ── */
    const cards: HTMLDivElement[] = [];
    FILMS.forEach((film, i) => {
      const card = buildFrame(film, i);
      scene.appendChild(card);
      cards.push(card);

      const strip = (card as any)._strip as HTMLDivElement;
      const img = (card as any)._img as HTMLImageElement;

      card.addEventListener("mouseenter", () => {
        strip.style.borderColor = "rgba(200,170,100,0.45)";
        strip.style.boxShadow = "0 10px 50px rgba(200,170,100,0.14),0 2px 8px rgba(0,0,0,0.4)";
        img.style.transform = "scale(1.04)";
        sfx.hover();
      });
      card.addEventListener("mouseleave", () => {
        strip.style.borderColor = "rgba(180,160,120,0.16)";
        strip.style.boxShadow = "0 6px 26px rgba(0,0,0,0.6)";
        img.style.transform = "scale(1)";
      });
      card.addEventListener("click", () => {
        sfx.click();
        tapIdx = i;
        tapProg = 0;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { setDetailIdx(i); sfx.open(); }, 380);
      });
    });

    /* ── RAF tick ─────────────────────────────────────────────── */
    let rafId = 0;

    const tick = () => {
      const t = performance.now() / 1000 - t0;

      /* Scroll entrance */
      const sec = sectionRef.current;
      if (sec) {
        const rect = sec.getBoundingClientRect();
        const vh = window.innerHeight;
        const rng = vh - (vh / 2 - rect.height / 2);
        scrollT = rng > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / rng)) : 1;
      }

      /* ── Momentum — scroll + swipe + drag + steer ────────────────── */
      if (dragActive) {
        rotV += dragDX * DRAG_H * 0.12;
        tiltV += dragDY * DRAG_V * 0.06;
        threadV += dragDY * 0.002;
      } else {
        rotV = rotV * FRIC + (cursorNX * CUR_H + IDLE) * (1 - FRIC);
        tiltV = tiltV * FRIC + (cursorNY * CUR_V) * (1 - FRIC);
        threadV *= 0.92;
      }

      if (Math.abs(rotV) < MIN_V) rotV = MIN_V * (rotV >= 0 ? 1 : -1);

      /* Hold strength builds */
      holdStrength += ((holdU >= 0 ? 1 : 0) - holdStrength) * 0.042;

      /* Tap spring */
      if (tapProg < 1) {
        tapProg = Math.min(1, tapProg + 0.018);
        if (tapIdx >= 0) {
          tapVZ[tapIdx] += (0 - tapZ[tapIdx]) * 0.10;
          tapVZ[tapIdx] *= 0.82;
          tapZ[tapIdx] += tapVZ[tapIdx];
        }
      }

      /* Grab spring — decaying pull toward zero */
      const grabSpringK = 0.065, grabSpringD = 0.80;
      grabVelX = (grabVelX + (0 - grabOffX) * grabSpringK) * grabSpringD;
      grabVelY = (grabVelY + (0 - grabOffY) * grabSpringK) * grabSpringD;
      grabOffX += grabVelX;
      grabOffY += grabVelY;

      /* Proximity per frame — springs toward cursor offset, quadratic falloff */
      for (let i = 0; i < N; i++) {
        const wx2 = curX[i], wy2 = curY[i];
        const dist = Math.sqrt((wx2 - cursorPX) ** 2 + (wy2 - cursorPY) ** 2) || 1;
        const prox = Math.max(0, 1 - dist / 240);
        const reachX = prox * 18 * (wx2 - cursorPX) / dist;
        const reachY = prox * 16 * (wy2 - cursorPY) / dist;
        proxVX[i] = (proxVX[i] + (reachX - proxX[i]) * 0.05) * 0.80;
        proxVY[i] = (proxVY[i] + (reachY - proxY[i]) * 0.05) * 0.80;
        proxX[i] += proxVX[i];
        proxY[i] += proxVY[i];
      }

      /* ── Ribbon positions ───────────────────────────────────── */
      const phase = (rotV * 0.35 + threadV) * 0.42;
      const tiltA = tiltV;
      const cosT = Math.cos(tiltA), sinT = Math.sin(tiltA);
      void cosT; void sinT; // reserved for future two-axis twist

      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const rope = u * RIBBON_T * Math.PI * 2 + phase;
        const centreBias = u - 0.5;
        const pinch = 1 - 0.6 * (centreBias * centreBias * 2.0);
        const r = RIBBON_R * Math.max(0.22, pinch);
        const swayA = rope;

        let wx2 = Math.sin(swayA) * r;
        const wyBase = centreBias * RIBBON_H;
        const wzBase = Math.cos(swayA) * (r * (RIBBON_D / RIBBON_R));

        /* S-curve anchor ends */
        const sCurve = 1 - 0.55 * (centreBias * centreBias * 2.0);
        const s2v = Math.min(1, Math.max(0, sCurve));
        wx2 *= s2v;

        /* Cursor influence via proximity springs */
        wx2 += proxX[i] * 0.9;
        const wy2 = wyBase + proxY[i] * 0.9;

        /* Grab pull toward point */
        const stripD2 = Math.abs(u - 0.5) * (N - 1);
        const gi = Math.max(0, 1 - stripD2 * 0.34);
        const gi2 = gi * gi;
        wx2 += grabOffX * gi2 * 0.28 + Math.sin(swayA) * gi2 * 14;
        const wyHold2 = wy2 + grabOffY * gi2 * 0.28;
        const wzHold2 = wzBase + grabOffX * gi2 * 0.4;

        /* Hold slowdown near held frame */
        const holdProx = Math.max(0, 1 - Math.abs(u - holdU) * 2.8);
        const holdShift = -wyHold2 * holdProx * holdStrength * 0.24;

        /* Tap impulse */
        const tapWeightZ = tapProg < 1 && i === tapIdx ? 1 : 0;
        const tapShift = tapZ[i] * tapWeightZ * 0.5;

        /* Undulation */
        const unX = Math.sin(t * 0.11 + i * 0.7) * 1.4;
        const unY = Math.cos(t * 0.09 + i * 0.8) * 1.0;
        const unZ = Math.sin(t * 0.07 + i * 0.9) * 1.2;
        const wX = wx2 + unX;
        const wY = (wyHold2 + unY) + holdShift + grabOffY * gi2;
        const wZ = (wzHold2 + unZ) + tapShift;

        /* Rotation */
        const rotX = wX * Math.cos(tiltA) - wZ * Math.sin(tiltA);
        const rotZ = wX * Math.sin(tiltA) + wZ * Math.cos(tiltA);

        const ry2 = rotX * sCurve - 0;
        const rz2 = rotZ;

        /* Lerp */
        curX[i] += (ry2 - curX[i]) * 0.065;
        curY[i] += (wY - curY[i]) * 0.065;
        curZ[i] += (rz2 - curZ[i]) * 0.065;

        /* Scroll entrance */
        const stagger = (i / N) * 0.35;
        const rawS = Math.min(1, Math.max(0, (scrollT - stagger) / (1 - stagger)));
        const sE = reduced ? rawS : easeOut3(rawS);
        const szFinal = curZ[i] * sE + (-1600) * (1 - sE);

        const depthT = Math.max(0, Math.min(1, (curZ[i] + RIBBON_D) / (RIBBON_D * 2)));
        const scale = Math.max(0.5, 0.55 + depthT * 0.85) * sE;
        const op = (0.55 + depthT * 0.45) * sE;

        cards[i].style.transform = `translate3d(${curX[i].toFixed(1)}px,${curY[i].toFixed(1)}px,${szFinal.toFixed(1)}px) scale(${scale.toFixed(4)}) rotateY(${Math.sin(swayA) * 1.6 !== undefined ? (Math.sin(swayA) * 1.6).toFixed(2) : "0.00"}deg)`;
        cards[i].style.opacity = op.toFixed(3);
        cards[i].style.zIndex = String(Math.round(depthT * 100));

        /* Still displayed exactly as supplied — no grading, no blur. */
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    /* ── Events ────────────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && (r.top > window.innerHeight || r.bottom < 0)) return;
      cursorNX = (e.clientX / window.innerWidth - 0.5) * 2;
      cursorNY = (e.clientY / window.innerHeight - 0.5) * 2;
      cursorPX = e.clientX; cursorPY = e.clientY;

      if (dragActive) {
        dragDX = e.clientX - mouseX;
        dragDY = e.clientY - mouseY;
        mouseX = e.clientX; mouseY = e.clientY;
        grabOffX += dragDX * 1.8;
        grabOffY += dragDY * 1.8;
      }
    };

    const onDown = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dragActive = true;
    };

    const onUp = () => { dragActive = false; };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); threadV += e.deltaY * 0.0008; rotV += e.deltaX * 0.003; };

    let tLX = 0, tLY = 0, tVX = 0, tVY = 0;
    const onTs = (e: TouchEvent) => { tLX = e.touches[0].clientX; tLY = e.touches[0].clientY; tVX = 0; tVY = 0; dragActive = true; mouseX = tLX; mouseY = tLY; };
    const onTm = (e: TouchEvent) => {
      dragDX = e.touches[0].clientX - tLX; dragDY = e.touches[0].clientY - tLY;
      tLX = e.touches[0].clientX; tLY = e.touches[0].clientY; tVX = dragDX; tVY = dragDY;
      grabOffX += dragDX * 1.8; grabOffY += dragDY * 1.8;
    };
    const onTe = () => { dragActive = false; rotV += tVX * DRAG_H * 0.14; tiltV += tVY * DRAG_V * 0.08; threadV += tVY * 0.002; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("touchstart", onTs, { passive: true });
    wrap.addEventListener("touchmove", onTm, { passive: true });
    wrap.addEventListener("touchend", onTe);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(holdTimer);
      clearTimeout(tapTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("touchstart", onTs);
      wrap.removeEventListener("touchmove", onTm);
      wrap.removeEventListener("touchend", onTe);
      while (scene.firstChild) scene.removeChild(scene.firstChild);
    };
  }, []);

  return (
    <div ref={sectionRef} style={{ position: "relative", zIndex: 10, height: "100vh" }}>
      <div style={{ position: "absolute", top: "clamp(1.25rem,2.5vh,2rem)", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 350, fontSize: "clamp(0.85rem,1.1vw,1rem)", letterSpacing: "-0.01em", color: "rgba(238,243,250,0.48)" }}>
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Filmography</em>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.24em", color: "rgba(238,243,250,0.25)", marginLeft: "1.5rem" }}>{N} films</span>
        </span>
      </div>

      <div style={{ position: "absolute", bottom: "clamp(1.5rem,3vh,2.5rem)", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: "0.55rem", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(238,243,250,0.18)" }}>
          <span>Move cursor · steer ribbon</span>
          <span>·</span>
          <span>Drag · orbit</span>
          <span>·</span>
          <span>Hold · focus moment</span>
          <span>·</span>
          <span>Scroll · advance reel</span>
        </div>
      </div>

      <div ref={wrapRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", perspective: `${PERSP}px`, perspectiveOrigin: "50% 50%", userSelect: "none", WebkitUserSelect: "none" }}>
        <div ref={sceneRef} style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d" }} />
      </div>

      <AnimatePresence>
        {detailIdx !== null && (
          <Detail key={`film-${detailIdx}`} film={FILMS[detailIdx]} idx={detailIdx} onClose={() => { setDetailIdx(null); sfx.close(); }} onPrev={() => { if (detailIdx > 0) setDetailIdx(detailIdx - 1); }} onNext={() => { if (detailIdx < N - 1) setDetailIdx(detailIdx + 1); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

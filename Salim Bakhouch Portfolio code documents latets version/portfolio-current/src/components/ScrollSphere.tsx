import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { sfx } from "../audio/SoundEngine";
import {
  SPHERE_SELECTION,
  getAlbum,
  getAlbumPhotos,
  getCollectionTitle,
  collectionSourceUrl,
  type Photo,
} from "../data/photographyManifest";
import DevelopReveal from "./DevelopReveal";
import {
  photoSrc,
  photoThumb,
  preloadOriginal,
  resolveOriginalUrl,
  ImageLoadQueue,
} from "../utils/media";

const N = 36;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const FORM_DUR = 0.5;
const SPIN_DUR = 0.55;
const TOTAL = FORM_DUR + SPIN_DUR;

const PHOTOS: Photo[] = SPHERE_SELECTION.slice(0, N);

interface Param {
  phi: number;
  theta0: number;
  phase: number;
  fX: number;
  fY: number;
  fZ: number;
  aX: number;
  aY: number;
  aZ: number;
}

function buildParams(): Param[] {
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  return Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    return {
      phi: Math.acos(Math.max(-1, Math.min(1, y))),
      theta0: GOLDEN * i,
      phase: (i / N) * Math.PI * 2,
      fX: r(0.11, 0.19),
      fY: r(0.07, 0.14),
      fZ: r(0.09, 0.16),
      aX: r(5, 13),
      aY: r(4, 10),
      aZ: r(3, 8),
    };
  });
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function ScrollSphere({
  onOpenArchive,
  paused = false,
}: {
  onOpenArchive?: () => void;
  paused?: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);
  const [readyId, setReadyId] = useState<string | null>(null);
  const pausedRef = useRef(paused);
  const resumeRef = useRef<() => void>(() => {});
  pausedRef.current = paused || viewerPhoto !== null;

  const viewerAlbum = useMemo(
    () => (viewerPhoto ? getAlbum(viewerPhoto.album_id) : undefined),
    [viewerPhoto]
  );
  const viewerPhotos = useMemo(
    () => (viewerPhoto ? getAlbumPhotos(viewerPhoto.album_id) : []),
    [viewerPhoto]
  );
  const viewerPos = viewerPhoto
    ? viewerPhotos.findIndex((photo) => photo.photo_id === viewerPhoto.photo_id)
    : -1;
  const viewerOriginal = viewerPhoto ? photoSrc(viewerPhoto) : "";
  /*
   * The resolved master is stored with the id it belongs to. Previously the URL
   * alone was kept, so selecting a second photograph kept showing the first one
   * until the new file resolved — the "stuck" image.
   */
  const [viewerDisplay, setViewerDisplay] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const displayForViewer =
    viewerDisplay && viewerPhoto && viewerDisplay.id === viewerPhoto.photo_id
      ? viewerDisplay.url
      : "";
  const viewerReady = Boolean(viewerPhoto && readyId === viewerPhoto.photo_id);

  /* Phase 4 — the master is preloaded as soon as a photo is requested. The
     blurred preview stays visible until the master has fully decoded. */
  useEffect(() => {
    if (!viewerPhoto) {
      setReadyId(null);
      setViewerDisplay(null);
      return;
    }
    let alive = true;
    const id = viewerPhoto.photo_id;
    /* Clear immediately: the incoming photo must never inherit the last one. */
    setReadyId(null);
    setViewerDisplay(null);
    resolveOriginalUrl(viewerOriginal).then((display) => {
      if (!alive) return;
      if (!display) return;
      setViewerDisplay({ id, url: display });
      return preloadOriginal(display).then(() => {
        if (alive) setReadyId(id);
      });
    });
    return () => {
      alive = false;
    };
  }, [viewerPhoto, viewerOriginal]);

  const stepViewer = useCallback(
    (direction: number) => {
      setViewerPhoto((current) => {
        if (!current) return current;
        const photos = getAlbumPhotos(current.album_id);
        const position = photos.findIndex((p) => p.photo_id === current.photo_id);
        return photos[position + direction] ?? current;
      });
    },
    []
  );

  const closeViewer = useCallback(() => {
    setViewerPhoto(null);
    sfx.close();
  }, []);

  /* Lock scrolling + move focus into the dialog only when it opens. */
  useEffect(() => {
    if (!viewerPhoto) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [Boolean(viewerPhoto)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (viewerPhoto) return;
    if (triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
      triggerRef.current = null;
    }
  }, [viewerPhoto]);

  /* Full keyboard contract for the lightbox. */
  useEffect(() => {
    if (!viewerPhoto) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepViewer(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepViewer(1);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerPhoto, closeViewer, stepViewer]);

  /* ── 3D sphere engine ─────────────────────────────────────── */
  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    const section = sectionRef.current;
    if (!wrap || !scene || !section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lightweight = reduced || coarse;
    const params = buildParams();

    let RX = 300;
    let RY = 185;
    let RZ = 255;
    let RING_R = 400;
    const readViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      RX = Math.min(300, Math.max(154, width * 0.31));
      RY = Math.min(185, Math.max(112, height * 0.19));
      RZ = Math.min(255, Math.max(120, width * 0.27));
      RING_R = Math.min(400, Math.max(150, width * 0.34));
    };
    readViewport();

    let scrollT = 0;
    let scrollCheck = 0;
    const t0 = performance.now() / 1000;

    let rotH = 0;
    let rotV = 0;
    let velH = 0;
    let velV = 0;
    let dragging = false;
    let lastDX = 0;
    let lastDY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let dragDistance = 0;
    let mouseNX = 0;
    let mouseNY = 0;

    const IDLE = 0.006;
    const CUR_H = 0.12;
    const CUR_V = 0.07;
    const DRAG_M = 0.90;
    const FRIC = 0.84;
    const MIN_V = 0.004;

    const curX = new Float32Array(N);
    const curY = new Float32Array(N);
    const curZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      curX[i] = (Math.random() - 0.5) * 24;
      curY[i] = (Math.random() - 0.5) * 24;
      curZ[i] = -2400;
    }

    const cards: HTMLDivElement[] = [];
    const loaders: ((settle: () => void) => void)[] = [];
    const requested = new Uint8Array(N);
    const thumbQueue = new ImageLoadQueue(6);

    /* Phase 3 — rank the frames that face the camera at t=0. Only this small
       priority set is fetched on mount. */
    const frontRank = params
      .map((param, index) => ({
        index,
        z: Math.sin(param.phi) * Math.sin(param.theta0),
      }))
      .sort((a, b) => b.z - a.z)
      .map((entry) => entry.index);
    const priority = new Set(frontRank.slice(0, coarse ? 6 : 8));
    /* Nothing beyond the priority ring is fetched until the user interacts
       with the sphere or the section approaches the viewport. */
    let hasInteracted = false;

    const requestThumb = (index: number) => {
      if (!loaders[index] || requested[index]) return;
      requested[index] = 1;
      thumbQueue.push(() => loaders[index](() => thumbQueue.settle()));
    };
    /* Used only when a viewer is actually opened. */
    const warmMaster = (index: number) => {
      const photo = PHOTOS[index];
      if (photo) preloadOriginal(photoSrc(photo));
    };
    const snapX = new Float32Array(N);
    const snapY = new Float32Array(N);
    const snapZ = new Float32Array(N);

    let ringActive = false;
    let ringStart = 0;
    let ringIdx = -1;

    const focusCard = (index: number) => {
      cards[(index + N) % N]?.focus({ preventScroll: true });
    };

    const triggerRing = (index: number) => {
      if (ringActive) return;
      sfx.click();
      for (let i = 0; i < N; i++) {
        snapX[i] = curX[i];
        snapY[i] = curY[i];
        snapZ[i] = curZ[i];
      }
      ringActive = true;
      ringStart = performance.now();
      ringIdx = index;
      triggerRef.current = cards[index] ?? null;
    };

    PHOTOS.forEach((photo, index) => {
      const card = document.createElement("div");
      card.className = "ps-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");
      card.setAttribute(
        "aria-label",
        `Open ${photo.display_title}, from the album ${photo.album_title}`
      );
      card.title = `${photo.display_title} — ${photo.album_title}`;
      card.style.cssText =
        "position:absolute;left:50%;top:50%;width:auto;height:auto;opacity:0;will-change:transform;outline:none;";

      const img = document.createElement("img");
      img.alt = `${photo.display_title} — ${photo.album_title}`;
      img.decoding = "async";
      img.draggable = false;
      img.loading = "lazy";
      img.fetchPriority = priority.has(index) ? "high" : "low";

      /* Phase 1 + 2 — the card shows a separate 440px WebP preview over a
         24px Base64 placeholder. The pristine master is reserved strictly
         for the full-screen viewer. */
      const preview = photoThumb(photo);
      img.className = "is-pending";

      let started = false;
      const load = (settle: () => void) => {
        if (started) {
          settle();
          return;
        }
        started = true;
        img.onload = () => {
          img.classList.remove("is-pending");
          img.classList.add("is-loaded");
          settle();
        };
        img.onerror = () => {
          /* Last resort: the original file. */
          if (img.dataset.master !== "1") {
            img.dataset.master = "1";
            img.src = photoSrc(photo);
          } else {
            settle();
          }
        };
        /* The requested card must actually fetch now, regardless of how far
           its transform places it from the visual viewport. */
        img.loading = "eager";
        img.src = preview;
      };
      (card as HTMLDivElement & { _load?: typeof load })._load = load;

      const caption = document.createElement("span");
      caption.className = "ps-caption";
      caption.textContent = photo.display_title;

      card.appendChild(img);
      card.appendChild(caption);
      scene.appendChild(card);
      loaders.push(
        (card as HTMLDivElement & { _load: (settle: () => void) => void })._load
      );
      cards.push(card);

      if (priority.has(index)) requestThumb(index);

      const activate = () => card.classList.add("is-active");
      const deactivate = () => card.classList.remove("is-active");
      card.addEventListener("mouseenter", () => {
        activate();
        requestThumb(index);
        if (!lightweight) sfx.hover();
      });
      card.addEventListener("mouseleave", deactivate);
      card.addEventListener("focus", () => {
        activate();
        hasInteracted = true;
        requestThumb(index);
      });
      card.addEventListener("blur", deactivate);

      card.addEventListener("click", () => {
        if (ringActive || dragDistance > 7) return;
        warmMaster(index);
        triggerRing(index);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          warmMaster(index);
          triggerRing(index);
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          rotH += 8;
          focusCard(index + 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          rotH -= 8;
          focusCard(index - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          focusCard(0);
        } else if (event.key === "End") {
          event.preventDefault();
          focusCard(N - 1);
        }
      });
    });

    let rafId = 0;
    let onScreen = true;
    let paused = false;
    let lastFrame = 0;

    const tick = (time: number) => {
      if (pausedRef.current || paused || !onScreen) {
        rafId = 0;
        return;
      }

      if (coarse && time - lastFrame < 33) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastFrame = time;

      const now = time / 1000;
      const t = now - t0;

      if (now - scrollCheck > 0.08) {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const range = vh - (vh / 2 - rect.height / 2);
        scrollT = range > 0 ? clamp01((vh - rect.top) / range) : 1;
        scrollCheck = now;
      }

      if (ringActive) {
        const elapsed = (performance.now() - ringStart) / 1000;
        const formT = Math.min(1, elapsed / FORM_DUR);
        const spinT = Math.max(0, elapsed - FORM_DUR) / SPIN_DUR;
        const spinAngle = easeInOut(Math.min(1, spinT)) * Math.PI * 2;

        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2 + spinAngle;
          const targetX = Math.cos(angle) * RING_R;
          const targetZ = Math.sin(angle) * RING_R;
          const formed = easeOut3(formT);
          curX[i] = snapX[i] + (targetX - snapX[i]) * formed;
          curY[i] = snapY[i] + (0 - snapY[i]) * formed;
          curZ[i] = snapZ[i] + (targetZ - snapZ[i]) * formed;

          const stagger = (i / N) * 0.32;
          const raw = clamp01((scrollT - stagger) / (1 - stagger));
          const appear = reduced ? raw : easeOut3(raw);
          cards[i].style.transform = `translate3d(${curX[i].toFixed(
            1
          )}px,${curY[i].toFixed(1)}px,${curZ[i].toFixed(
            1
          )}px) translate(-50%,-50%) scale(${appear.toFixed(4)})`;
          cards[i].style.opacity = (0.94 * appear).toFixed(3);
          cards[i].style.zIndex = "60";
        }

        if (elapsed >= TOTAL) {
          ringActive = false;
          const selected = PHOTOS[ringIdx];
          ringIdx = -1;
          if (selected) {
            setViewerPhoto(selected);
            sfx.open();
          }
        }
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (!dragging) {
        velH = velH * FRIC + (mouseNX * CUR_H + IDLE) * (1 - FRIC);
        velV = velV * FRIC + mouseNY * CUR_V * (1 - FRIC);
      }
      if (Math.abs(velH) < MIN_V) velH = MIN_V * (velH >= 0 ? 1 : -1);
      rotH += velH;
      rotV += velV;

      const thH = (rotH * Math.PI) / 180;
      const thV = (rotV * Math.PI) / 180;
      const cosH = Math.cos(thH);
      const sinH = Math.sin(thH);
      const cosV = Math.cos(thV);
      const sinV = Math.sin(thV);
      const loop = t * 0.055;

      for (let i = 0; i < N; i++) {
        const param = params[i];
        const theta = param.theta0 + loop;

        let fx = Math.sin(param.phi) * Math.cos(theta) * RX;
        let fy = Math.cos(param.phi) * RY;
        let fz = Math.sin(param.phi) * Math.sin(theta) * RZ;

        if (!lightweight) {
          fx += Math.sin(t * param.fX + param.phase) * param.aX;
          fy += Math.cos(t * param.fY + param.phase + 1.3) * param.aY;
          fz += Math.sin(t * param.fZ + param.phase + 2.7) * param.aZ;
        }

        const rx1 = fx * cosH - fz * sinH;
        const rz1 = fx * sinH + fz * cosH;
        const ry2 = fy * cosV - rz1 * sinV;
        const rz2 = fy * sinV + rz1 * cosV;

        curX[i] += (rx1 - curX[i]) * 0.06;
        curY[i] += (ry2 - curY[i]) * 0.06;
        curZ[i] += (rz2 - curZ[i]) * 0.06;

        const stagger = (i / N) * 0.32;
        const raw = clamp01((scrollT - stagger) / (1 - stagger));
        const appear = reduced ? raw : easeOut3(raw);
        const finalZ = curZ[i] * appear + -2400 * (1 - appear);
        const depth = clamp01((curZ[i] + 320) / 760);
        const opacity = (0.5 + depth * 0.48) * appear;

        /* Once the user rotates, stream originals for frames that
           turn toward the front. Priority frames were requested on mount. */
        if (!requested[i] && hasInteracted && depth > 0.5 && appear > 0.2) {
          requestThumb(i);
        }
        cards[i].style.transform = `translate3d(${curX[i].toFixed(
          1
        )}px,${curY[i].toFixed(1)}px,${finalZ.toFixed(
          1
        )}px) translate(-50%,-50%) scale(${appear.toFixed(4)})`;
        cards[i].style.opacity = opacity.toFixed(3);
        cards[i].style.zIndex = String(Math.round(5 + depth * 90));

        /* Quantised depth band drives the same lighting tokens as the ribbons. */
        const band = depth < 0.2 ? 0 : depth < 0.4 ? 1 : depth < 0.6 ? 2 : depth < 0.8 ? 3 : 4;
        if (cards[i].dataset.depth !== String(band)) {
          cards[i].dataset.depth = String(band);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (paused || !onScreen || rafId) return;
      rafId = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    resumeRef.current = start;

    /* After the sphere is near the viewport, fill the remaining originals in
       small idle batches. This never blocks the priority ring and keeps the
       rotation fully populated without requesting all 36 at mount. */
    let prefetchTimer = 0;
    let prefetchCursor = 0;
    const prefetchRemaining = () => {
      const batch = frontRank.slice(prefetchCursor, prefetchCursor + 6);
      batch.forEach(requestThumb);
      prefetchCursor += 6;
      if (prefetchCursor < frontRank.length) {
        prefetchTimer = window.setTimeout(prefetchRemaining, 420);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          start();
          if (!prefetchTimer && prefetchCursor === 0) {
            const idle =
              "requestIdleCallback" in window
                ? window.requestIdleCallback
                : (callback: IdleRequestCallback) =>
                    window.setTimeout(
                      () => callback({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline),
                      260
                    );
            idle(prefetchRemaining);
          }
        } else {
          stop();
        }
      },
      { rootMargin: "320px 0px" }
    );
    observer.observe(section);

    const onVisibility = () => {
      paused = document.hidden;
      if (paused) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      hasInteracted = true;
      dragging = true;
      dragDistance = 0;
      pointerX = event.clientX;
      pointerY = event.clientY;
      velH = 0;
      velV = 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      mouseNX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseNY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!dragging) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      if (event.pointerType === "touch") {
        /* Original touch response: calm, with momentum on release. */
        rotH += dx * DRAG_M * 0.1;
        rotV += dy * DRAG_M * 0.1;
        velH = dx * DRAG_M * 0.1;
        velV = dy * DRAG_M * 0.1;
      } else {
        rotH += dx * DRAG_M * 0.1;
        rotV += dy * DRAG_M * 0.1;
        velH = dx * DRAG_M * 0.1;
        velV = dy * DRAG_M * 0.1;
      }
      lastDX = dx;
      lastDY = dy;
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      velH = lastDX * DRAG_M * 0.1;
      velV = lastDY * DRAG_M * 0.1;
      window.setTimeout(() => {
        dragDistance = 0;
      }, 30);
    };
    const onMouseLeave = () => {
      mouseNX = 0;
      mouseNY = 0;
    };
    const onWheelIntent = () => {
      hasInteracted = true;
    };
    const onKeyIntent = (event: KeyboardEvent) => {
      if (event.key.startsWith("Arrow") || event.key === "Enter") {
        hasInteracted = true;
      }
    };
    const onResize = () => readViewport();

    wrap.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    wrap.addEventListener("wheel", onWheelIntent, { passive: true });
    window.addEventListener("keydown", onKeyIntent);
    window.addEventListener("resize", onResize, { passive: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      stop();
      window.clearTimeout(prefetchTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      wrap.removeEventListener("wheel", onWheelIntent);
      window.removeEventListener("keydown", onKeyIntent);
      window.removeEventListener("resize", onResize);
      while (scene.firstChild) scene.removeChild(scene.firstChild);
      cards.length = 0;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pausedRef.current) resumeRef.current();
  }, [paused, viewerPhoto]);

  return (
    <section
      ref={sectionRef}
      id="photography"
      aria-labelledby="photography-title"
      className="sphere-section"
      style={{ position: "relative", zIndex: 10, height: "100svh", minHeight: 640 }}
    >
      <header className="spatial-header">
        <p className="eyebrow">
          <span className="eyebrow-line" aria-hidden />
          Still image
        </p>
        <h2 id="photography-title" className="spatial-title">
          <DevelopReveal as="span">Photo<em>graphy</em></DevelopReveal>
        </h2>
        <p className="spatial-subtitle">
          {N} photographs · natural aspect ratios · one continuous sphere
        </p>
        {onOpenArchive && (
          <button
            type="button"
            className="text-action"
            onClick={onOpenArchive}
            data-cursor="hover"
          >
            Browse all albums{" "}
            <span aria-hidden style={{ color: "var(--accent)" }}>
              ↗
            </span>
          </button>
        )}
      </header>

      <div
        ref={wrapRef}
        className="sphere-wrap"
        role="group"
        aria-roledescription="3D photography sphere"
        aria-label={`Photography sphere containing ${N} photographs`}
        aria-describedby="sphere-instructions"
      >
        <p id="sphere-instructions" className="sr-only">
          Use Tab to focus a photograph. Left and right arrow keys rotate the
          sphere and move between photographs. Press Enter or Space to open the
          selected photograph with its album notes. Drag with a pointer or swipe
          to rotate. Press Escape to close the viewer.
        </p>
        <div
          ref={sceneRef}
          className="sphere-stage"
          style={{
            position: "relative",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
          }}
        />
      </div>

      {/* ── Album viewer — full curatorial context ─────────────── */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {viewerPhoto && (
          <motion.div
            key="photo-viewer"
            ref={dialogRef}
            className="ps-viewer"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="ps-album-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeViewer();
            }}
          >
            <button
              ref={closeRef}
              type="button"
              className="overlay-close ps-viewer-close"
              onClick={closeViewer}
              aria-label="Close photograph viewer"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <line x1="1" y1="1" x2="10" y2="10" />
                <line x1="10" y1="1" x2="1" y2="10" />
              </svg>
              Close
            </button>

            <div
              className="ps-viewer-grid"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.figure
                key={viewerPhoto.photo_id}
                className="ps-viewer-image"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="ps-viewer-stage">
                  {!viewerReady && (
                    <div className="ps-viewer-progress" role="status" aria-live="polite">
                      <motion.span
                        className="ps-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        aria-hidden
                      />
                      <span>Loading full resolution</span>
                    </div>
                  )}

                  <motion.img
                    key={viewerPhoto.photo_id}
                    src={displayForViewer || viewerOriginal}
                    alt={`${viewerPhoto.display_title} — ${viewerPhoto.album_title}`}
                    className="ps-viewer-original"
                    initial={false}
                    animate={{ opacity: viewerReady ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    decoding="async"
                    fetchPriority="high"
                    draggable={false}
                    onLoad={() => setReadyId(viewerPhoto.photo_id)}
                    onError={(event) => {
                      const img = event.currentTarget;
                      if (img.dataset.fallback !== "1") {
                        img.dataset.fallback = "1";
                        img.src = viewerPhoto.source_url;
                      }
                    }}
                  />
                </div>
                <figcaption>
                  <span>
                    {String(Math.max(viewerPos + 1, 1)).padStart(2, "0")} /{" "}
                    {String(viewerPhotos.length).padStart(2, "0")}
                  </span>
                  <span>{viewerPhoto.photo_id}</span>
                </figcaption>
              </motion.figure>

              <aside className="ps-viewer-panel">
                <p className="eyebrow">
                  {getCollectionTitle(viewerPhoto.collection_id) || "Archive"}
                  <span aria-hidden> · </span>
                  {viewerPhoto.category}
                </p>

                <h3 id="ps-album-title" className="ps-album-title">
                  {viewerPhoto.album_title}
                </h3>
                {viewerAlbum?.subtitle && (
                  <p className="ps-album-subtitle">{viewerAlbum.subtitle}</p>
                )}
                {viewerAlbum?.intro && (
                  <p className="ps-album-intro">{viewerAlbum.intro}</p>
                )}

                <div className="ps-photo-notes">
                  <p className="eyebrow">Image notes</p>
                  <h4>{viewerPhoto.display_title}</h4>
                  <p>{viewerPhoto.caption}</p>
                </div>

                {viewerPhotos.length > 1 && (
                  <div
                    className="ps-filmstrip"
                    aria-label={`Photographs in ${viewerPhoto.album_title}`}
                  >
                    {viewerPhotos.map((photo, index) => (
                      <button
                        key={photo.photo_id}
                        type="button"
                        className="ps-thumb"
                        aria-label={`View ${photo.display_title}`}
                        aria-current={
                          photo.photo_id === viewerPhoto.photo_id
                            ? "true"
                            : undefined
                        }
                        onClick={() => setViewerPhoto(photo)}
                      >
                        <img
                          src={photoThumb(photo)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="ps-viewer-nav">
                  <button
                    type="button"
                    onClick={() => stepViewer(-1)}
                    disabled={viewerPos <= 0}
                    aria-label="Previous photograph in album"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      aria-hidden
                    >
                      <polyline points="7.5,2 3.5,6 7.5,10" />
                    </svg>
                    Prev
                  </button>
                  <span aria-live="polite">
                    {String(Math.max(viewerPos + 1, 1)).padStart(2, "0")} /{" "}
                    {String(viewerPhotos.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepViewer(1)}
                    disabled={viewerPos >= viewerPhotos.length - 1}
                    aria-label="Next photograph in album"
                  >
                    Next
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      aria-hidden
                    >
                      <polyline points="4.5,2 8.5,6 4.5,10" />
                    </svg>
                  </button>
                </div>

                <a
                  className="ps-source-link"
                  href={collectionSourceUrl(viewerPhoto.collection_id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source archive ↗
                </a>
              </aside>
            </div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

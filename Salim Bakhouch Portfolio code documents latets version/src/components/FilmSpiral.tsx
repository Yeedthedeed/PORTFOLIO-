import { useCallback, useEffect, useId, useRef, useState } from "react";
import { sfx } from "../audio/SoundEngine";
import { FILM_STILLS, type FilmStill } from "../data/filmStills";
import {
  filmSrc,
  filmThumb,
  preloadOriginal,
  originalHosts,
  ImageLoadQueue,
} from "../utils/media";
import FilmDetailOverlay from "./FilmDetail";

/**
 * FILM SPIRAL
 *
 * The composition is the centered filmography ribbon. The movement and
 * interaction are restored from the previous ribbon build:
 *
 *   • cursor-steered angular + tilt momentum
 *   • elastic grab-and-release drag; direct orbit on touch
 *   • the page wheel advances the reel (Escape-free; no scroll trapping)
 *   • roving keyboard focus, arrow-key travel, Enter/Space to open
 *   • depth-led scale and opacity, with a scroll-reveal stagger
 *   • one RAF loop, paused when off-screen, hidden, covered or reduced-motion
 *
 * Every card is centred mathematically on its orbit point. Natural image
 * ratios are preserved and the surface stays a thin 1px film edge.
 */

/**
 * Ribbon geometry — unchanged from the original filmography output.
 *
 * The Birth Permit ribbon consumes this identical configuration, so its
 * structure, silhouette, movement and interaction match the other two films.
 */
const SPIRAL = {
  height: 720,
  /* A wider orbit reads as a ribbon rather than a narrow column, and gives the
     three films an identical footprint so they align as one composition. */
  radius: 240,
  depth: 165,
  turns: 2.9,
  perspective: 920,
} as const;

/* ── Shared cinematic clock ────────────────────────────────────────────────
 * Every ribbon idles from one module-level accumulator, so the three films
 * rotate in unison. The clock freezes while no ribbon is running (all
 * off-screen, covered by an overlay, or the document hidden), which means a
 * ribbon never jumps forward when it resumes.                                    */
const IDLE_RAD_PER_MS = 0.0019 * 60 / 1000;
let sharedIdleMs = 0;
let sharedLastMs: number | null = null;

/** Advance the shared reel clock and return the elapsed idle milliseconds. */
function advanceIdle(now: number): number {
  if (sharedLastMs !== null) {
    sharedIdleMs += now - sharedLastMs;
    sharedLastMs = now;
  } else {
    sharedLastMs = now;
  }
  return sharedIdleMs;
}

/** Freeze the shared clock while no ribbon is on screen, so resuming never jumps. */
function freezeIdle() {
  sharedLastMs = null;
}

const MOTION = {
  idle: 0.0019,
  cursorH: 0.015,
  cursorV: 0.006,
  friction: 0.88,
  lerp: 0.065,
  grabSpring: 0.065,
  grabDamping: 0.8,
  stagger: 0.32,
  revealDepth: -900,
} as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Keeps the ribbon centred inside its section at every viewport size.
 * It scales the orbit — not the cards' pixels — so photographs stay crisp
 * and each still keeps its own aspect ratio.
 */
/** Measured width of the orbit at scale 1, relative to its height. */
const ORBIT_WIDTH_RATIO = 0.56;

/** Frame dimensions for a given orbit scale and canvas width. */
function frameSize(scale: number, canvasWidth: number) {
  const frameH = clamp(100 * scale, 40, 148);
  const frameW = clamp(Math.min(frameH * 2.4, canvasWidth * 0.42), 76, 258);
  return { frameH, frameW };
}

/**
 * Fit the ribbon *including its frames*.
 *
 * The orbit only spans `orbitHeight × scale`, but every still hangs half its
 * own height above/below its orbit point. Budgeting for the orbit alone let the
 * first and last frames overflow the canvas and be clipped: that was the
 * "cut at the top and bottom" bug.
 *
 * Two iterations converge on a scale where
 *   orbit height + frame height  ≤ canvas height − inset
 *   orbit width  + frame width   ≤ canvas width  − inset
 * so every still, its shadow and its caption stay inside the frame at every
 * viewport, while the ribbon stays as large as that allows.
 */
function fitScale(
  width: number,
  height: number,
  orbitHeight: number
): { scale: number; frameH: number; frameW: number } {
  const inset = width < 420 ? 18 : width < 760 ? 26 : 34;
  /* Extra breathing room beyond the inset: absorbs shadows, the caption under
     the lowest frame, and the small convergence tolerance below. */
  const margin = 14;
  const horizontalBudget = Math.max(80, width - inset - margin);
  const verticalBudget = Math.max(120, height - inset - margin);

  /* Orbit-only starting point. */
  let scale = clamp(
    Math.min(horizontalBudget / 520, verticalBudget / (orbitHeight + 20)),
    0.28,
    1.3
  );

  let frame = frameSize(scale, width);
  for (let i = 0; i < 3; i += 1) {
    const maxByHeight = (verticalBudget - frame.frameH) / orbitHeight;
    const maxByWidth =
      (horizontalBudget - frame.frameW) / (ORBIT_WIDTH_RATIO * orbitHeight);
    const next = clamp(Math.min(maxByHeight, maxByWidth), 0.24, 1.3);
    if (Math.abs(next - scale) < 0.0008) break;
    scale = next;
    frame = frameSize(scale, width);
  }

  return { scale, frameH: frame.frameH, frameW: frame.frameW };
}

/**
 * STILL-DRIVEN DENSITY — one canonical ribbon shape
 *
 * Every film shares the same spatial architecture: height 720, radius 240,
 * depth 165, pinch 0.4, s-curve 0.4, and the same winding ceiling.
 *
 * The winding count grows with the still count up to `MAX_TURNS`, which is the
 * winding of *The Birth Permit* (43 stills). Those 4.35 revolutions are the
 * canonical ribbon shape, so:
 *
 *   • Delusion of Negation (29) → 2.90 turns (naturally below the ceiling)
 *   • The Birth Permit (43)     → 4.35 turns (defines the ceiling; unchanged)
 *   • Zakia's Clock (50)        → 4.35 turns (capped, so it inherits the same
 *                                 shape, rotation distance and movement instead
 *                                 of gaining extra revolutions)
 *
 * Zakia keeps all 50 of its own photographs. Because the shape is now identical
 * rather than stretched, its frames sit marginally closer together (≈14%) than
 * the 43-frame ribbon — the only possible difference when the orbit, frame size
 * and revolutions are held equal.
 */
const REFERENCE_STILLS = 29;
const CANONICAL_STILLS = 43;
const MAX_TURNS = (SPIRAL.turns * (CANONICAL_STILLS - 1)) / (REFERENCE_STILLS - 1);

type RibbonGeometry = {
  height: number;
  radius: number;
  depth: number;
  turns: number;
};

function ribbonGeometry(count: number): RibbonGeometry {
  const density =
    count <= 1 ? 1 : Math.max(0.5, (count - 1) / (REFERENCE_STILLS - 1));

  return {
    height: SPIRAL.height,
    radius: SPIRAL.radius,
    depth: SPIRAL.depth,
    turns: Math.min(SPIRAL.turns * density, MAX_TURNS),
  };
}

type RibbonPoint = {
  x: number;
  y: number;
  z: number;
  sCurve: number;
  sway: number;
};

/**
 * The original spiral anchors: a pinched helix whose ends return to the
 * vertical axis, giving the ribbon its S-curve silhouette.
 */
function ribbonPoint(
  u: number,
  phase: number,
  scale: number,
  geometry: RibbonGeometry
): RibbonPoint {
  const rope = u * geometry.turns * Math.PI * 2 + phase;
  const centreBias = u - 0.5;
  const pinch = 1 - 0.4 * (centreBias * centreBias * 2);
  const radius = geometry.radius * Math.max(0.22, pinch);
  const sCurve = Math.max(0, 1 - 0.4 * (centreBias * centreBias * 2));

  return {
    x: Math.sin(rope) * radius * scale,
    y: centreBias * geometry.height * scale,
    z: Math.cos(rope) * (radius * (geometry.depth / geometry.radius)) * scale,
    sCurve,
    sway: rope,
  };
}

function buildFrame(
  film: FilmStill,
  index: number,
  total: number
): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "film-spiral-card";
  /* Required by the pointer-release selection path. */
  card.dataset.index = String(index);
  /* Roving tab stop: the ribbon is a single widget, not 45 tab stops. */
  card.tabIndex = index === 0 ? 0 : -1;
  card.setAttribute("role", "button");
  card.setAttribute("aria-haspopup", "dialog");
  card.setAttribute(
    "aria-label",
    `Open still ${index + 1} of ${total} — ${film.film}, ${film.year}`
  );
  card.style.cssText =
    "position:absolute;left:50%;top:50%;width:auto;height:auto;will-change:transform;opacity:0;";

  const img = document.createElement("img");
  img.alt = `${film.film} — film still ${index + 1}`;
  img.decoding = "async";
  img.draggable = false;
  img.loading = "lazy";

  /*
   * FRAME DELIVERY.
   *
   * A ribbon frame is at most ~200 px wide. It paints from the baked inline
   * preview, so the ribbon is complete the instant it appears — no network
   * request, no placeholder state. The full-resolution original is reserved for
   * the album showcase and the viewer, where the photograph is actually large
   * enough for the difference to exist.
   */
  const preview = filmThumb(film);
  img.className = "is-pending";

  let started = false;
  const load = (settle: () => void) => {
    if (started) {
      settle();
      return;
    }
    started = true;
    img.loading = "eager";
    img.onload = () => {
      img.classList.remove("is-pending");
      img.classList.add("is-loaded");
      settle();
    };
    img.onerror = () => {
      /* Fall back to the untouched original if a preview is ever missing. */
      const hosts = originalHosts(film.url);
      const next = Number(img.dataset.host ?? "0") + 1;
      if (next < hosts.length) {
        img.dataset.host = String(next);
        img.src = hosts[next];
      } else {
        settle();
      }
    };
    img.src = preview;
  };

  const caption = document.createElement("span");
  caption.className = "film-spiral-caption";
  caption.textContent = `${pad(index + 1)} · ${film.film}`;

  /* Discovery layer: the still's own editorial note, surfaced only on hold.
     It is always present in the DOM for assistive tech, visually collapsed. */
  const note = document.createElement("span");
  note.className = "film-spiral-note";
  note.textContent = film.note;
  note.setAttribute("aria-hidden", "true");

  card.appendChild(img);
  card.appendChild(caption);
  card.appendChild(note);
  (card as HTMLDivElement & { _load?: typeof load })._load = load;
  return card;
}

export default function FilmSpiral({
  films = FILM_STILLS,
  immediate = false,
  fullscreen = false,
  paused = false,
  compact = false,
  onDetailChange,
  onOpenAlbum,
}: {
  films?: FilmStill[];
  /** The archive is already open — form the ribbon without a stagger. */
  immediate?: boolean;
  /** The archive cannot scroll, so the wheel steers the reel itself. */
  fullscreen?: boolean;
  /** Stops the loop while an opaque parent overlay covers this ribbon. */
  paused?: boolean;
  /** True when the ribbon occupies one half of a split filmography. */
  compact?: boolean;
  /** Lets a parent overlay know whether its own Escape handler should act. */
  onDetailChange?: (open: boolean) => void;
  /**
   * When provided, selecting a still opens its **stills album** at that index
   * instead of a single-image overlay. Both filmography versions pass this.
   */
  onOpenAlbum?: (index: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<() => void>(() => {});
  const instructionsId = useId();
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  /* Read at selection time; never an effect dependency (see below). */
  const onOpenAlbumRef = useRef(onOpenAlbum);
  onOpenAlbumRef.current = onOpenAlbum;
  const [ready, setReady] = useState(false);

  /* Read by the long-lived RAF loop without restarting it. */
  const pausedRef = useRef(paused || detailIdx !== null);
  pausedRef.current = paused || detailIdx !== null;

  const closeDetail = useCallback(() => {
    setDetailIdx(null);
    onDetailChange?.(false);
    sfx.close();
  }, [onDetailChange]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;

    const count = films.length;
    if (!count) return;

    const geometry = ribbonGeometry(count);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lightweight = coarse || reduced;

    let layoutScale = 1;
    let centerX = 0;
    let centerY = 0;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const fit = fitScale(rect.width, rect.height, geometry.height);
        layoutScale = fit.scale;
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        /*
         * Frame dimensions come from the same fit, so the clearance between
         * neighbouring stills — and the margin above the first and below the
         * last frame — is proportional on desktop, tablet and phone, and
         * identical on all three ribbons.
         */
        wrap.style.setProperty("--ribbon-frame-h", `${fit.frameH.toFixed(1)}px`);
        wrap.style.setProperty("--ribbon-frame-w", `${fit.frameW.toFixed(1)}px`);
      }
      return rect;
    };
    measure();

    let rafId = 0;
    let paused = false;
    let onScreen = true;
    let lastFrame = 0;
    let lastMeasure = 0;
    let entrance = immediate ? 1 : 0;

    /* ── Movement state (the previous ribbon's momentum model) ── */
    let userAngle = 0;
    /* Radians still to travel from a keyboard step, eased out in the loop so
       arrow keys land exactly one still away for every film. */
    let pendingStep = 0;
    let angularVelocity: number = MOTION.idle;
    let tilt = 0;
    let tiltVelocity = 0;
    let thread = 0;
    let grabX = 0;
    let grabY = 0;
    let grabVelocityX = 0;
    let grabVelocityY = 0;
    let cursorNX = 0;
    let cursorNY = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragTravel = 0;
    /* Set at release and cleared on the next press. The click event fires
       immediately after pointerup, so it must consult a stable flag — reading
       the live counter meant normal hand jitter (>8px) silently ate every
       click and the still never opened. */
    let releasedAsDrag = false;

    /*
     * SELECTION IS RESOLVED AT RELEASE, NOT VIA `click`.
     *
     * An earlier build called setPointerCapture on the wrapper so a drag would
     * survive leaving the element. Pointer capture retargets the subsequent
     * click to the capturing element, which meant the card's own click listener
     * never fired — selecting a still did nothing at all. Capture is gone, and
     * selection is additionally resolved here at release.
     *
     * The press target and its travel are therefore recorded here, and the
     * release opens the still directly. This works with capture, without it,
     * on mouse, pen and touch alike.
     */
    let pressCard: HTMLElement | null = null;
    let pressTravel = 0;
    let releasedSelected = false;
    let lastOpenAt = 0;

    const curX = new Float32Array(count);
    const curY = new Float32Array(count);
    const curZ = new Float32Array(count);

    /* Opening the archive should reveal a fully formed centered ribbon. */
    if (immediate) {
      for (let i = 0; i < count; i++) {
        const point = ribbonPoint(i / (count - 1), 0, layoutScale, geometry);
        curX[i] = point.x * point.sCurve * point.sCurve;
        curY[i] = point.y;
        curZ[i] = point.z;
      }
    }

    /* ── DOM ── */
    const cards: HTMLDivElement[] = [];
    const loaders: ((settle: () => void) => void)[] = [];
    const requested = new Uint8Array(count);
    const queue = new ImageLoadQueue(6);
    let focusedIndex = 0;

    const focusCard = (index: number) => {
      const target = (index + count) % count;
      cards.forEach((card, i) => {
        card.tabIndex = i === target ? 0 : -1;
      });
      focusedIndex = target;
      cards[target]?.focus({ preventScroll: true });
    };

    const openStill = (index: number) => {
      if (releasedAsDrag) return;
      sfx.open();
      /* Album first: a still belongs to its film's album. The album view keeps
         prev/next across the whole album, so this is strictly more useful than
         opening a single frame. */
      const openAlbum = onOpenAlbumRef.current;
      if (openAlbum) {
        openAlbum(index);
        return;
      }
      setDetailIdx(index);
      onDetailChange?.(true);
    };

    films.forEach((film, i) => {
      const card = buildFrame(film, i, count);
      scene.appendChild(card);
      cards.push(card);
      loaders.push(
        (card as HTMLDivElement & { _load: (settle: () => void) => void })._load
      );

      const activate = () => card.classList.add("is-active");
      const deactivate = () => card.classList.remove("is-active");

      /* Hold reveals the editorial note without opening the viewer. */
      let holdTimer = 0;
      let held = false;
      /* Click fires *after* pointerup, so the suppression flag must outlive the
         release; otherwise a completed hold would open the viewer anyway. */
      let suppressClick = false;
      let suppressTimer = 0;
      const endHold = () => {
        window.clearTimeout(holdTimer);
        if (!held) return;
        held = false;
        suppressClick = true;
        window.clearTimeout(suppressTimer);
        suppressTimer = window.setTimeout(() => {
          suppressClick = false;
        }, 400);
        card.classList.remove("is-held");
        wrap.classList.remove("is-holding");
        sfx.holdEnd();
      };
      card.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        window.clearTimeout(holdTimer);
        holdTimer = window.setTimeout(() => {
          if (dragTravel > 6) return;
          held = true;
          card.classList.add("is-held");
          wrap.classList.add("is-holding");
          sfx.holdStart?.();
        }, 380);
      });
      card.addEventListener("pointerup", endHold);
      card.addEventListener("pointercancel", endHold);
      card.addEventListener("pointerleave", () => {
        window.clearTimeout(holdTimer);
        endHold();
      });

      card.addEventListener("mouseenter", () => {
        activate();
        wrap.classList.add("is-hovering");
        if (!lightweight) sfx.hover();
      });
      card.addEventListener("mouseleave", () => {
        deactivate();
        wrap.classList.remove("is-hovering");
      });
      card.addEventListener("focus", () => {
        activate();
        focusedIndex = i;
        cards.forEach((item, j) => {
          item.tabIndex = j === i ? 0 : -1;
        });
      });
      card.addEventListener("blur", deactivate);

      card.addEventListener("click", (event) => {
        event.preventDefault();
        /* Selection already happened at pointerup (see onPointerUp). This path
           only serves browsers/configurations where the release did not run. */
        if (
          releasedSelected ||
          held ||
          suppressClick ||
          releasedAsDrag ||
          Date.now() - lastOpenAt < 400
        ) {
          return;
        }
        lastOpenAt = Date.now();
        preloadOriginal(filmSrc(film));
        openStill(i);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openStill(i);
          return;
        }
        /* Keyboard equivalent of holding: surface the editorial note. */
        if (event.key === "i" || event.key === "I") {
          event.preventDefault();
          const open = card.classList.toggle("is-held");
          wrap.classList.toggle("is-holding", open);
          if (open) sfx.holdStart();
          else sfx.holdEnd();
          return;
        }
        /* One still per press: turns scale with the still count, so this step
           is the same physical distance on all three ribbons. */
        const stillStep = (Math.PI * 2 * geometry.turns) / Math.max(1, count - 1);
        if (event.key === "ArrowRight") {
          event.preventDefault();
          pendingStep += stillStep;
          grabX += 8;
          focusCard(focusedIndex + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          pendingStep -= stillStep;
          grabX -= 8;
          focusCard(focusedIndex - 1);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          tiltVelocity += 0.018;
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          tiltVelocity -= 0.018;
        } else if (event.key === "Home") {
          event.preventDefault();
          focusCard(0);
        } else if (event.key === "End") {
          event.preventDefault();
          focusCard(count - 1);
        } else if (event.key === "PageDown") {
          event.preventDefault();
          pendingStep += stillStep * 5;
          focusCard(focusedIndex + 5);
        } else if (event.key === "PageUp") {
          event.preventDefault();
          pendingStep -= stillStep * 5;
          focusCard(focusedIndex - 5);
        }
      });
    });


    /* Previews are bundled with the app, so the opening frames can be
       decoded immediately without any network request. */
    films.slice(0, 12).forEach((_, i) => {
      if (!requested[i]) {
        requested[i] = 1;
        queue.push(() => loaders[i](() => queue.settle()));
      }
    });

    /* ── RAF ── */
    const tick = (time: number) => {
      if (paused || !onScreen || pausedRef.current) {
        rafId = 0;
        freezeIdle();
        return;
      }

      /* On touch keep the full composition but spend half the GPU budget. */
      if (coarse && time - lastFrame < 33) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastFrame = time;

      /* Scroll reveal — measured at ~11fps, never every frame. */
      if (!immediate && !reduced) {
        if (time - lastMeasure > 90) {
          const rect = wrap.getBoundingClientRect();
          centerX = rect.left + rect.width / 2;
          centerY = rect.top + rect.height / 2;
          entrance = clamp(
            (window.innerHeight - rect.top) / (window.innerHeight * 0.92)
          );
          lastMeasure = time;
        }
      } else {
        entrance = 1;
      }

      if (dragging) {
        angularVelocity *= 0.45;
        tiltVelocity *= 0.45;
      } else {
        angularVelocity =
          angularVelocity * MOTION.friction +
          cursorNX * MOTION.cursorH * (1 - MOTION.friction);
        tiltVelocity =
          tiltVelocity * MOTION.friction +
          cursorNY * MOTION.cursorV * (1 - MOTION.friction);
      }

      /* Restraint: bound the throw so a flick can never whip the ribbon, and
         let the velocity settle cleanly instead of forcing an idle floor —
         the shared reel clock supplies the continuous drift for every ribbon. */
      angularVelocity = clamp(angularVelocity, -0.08, 0.08);
      tiltVelocity = clamp(tiltVelocity, -0.018, 0.018);
      if (!dragging) {
        if (Math.abs(angularVelocity) < 0.00035) angularVelocity = 0;
        if (Math.abs(tiltVelocity) < 0.00035) tiltVelocity = 0;
      }

      userAngle += angularVelocity;

      /* Keyboard stepping: ease the remaining travel in, so a press always
         settles on the neighbouring still rather than overshooting it. */
      if (!dragging && pendingStep !== 0) {
        const move = pendingStep * 0.16;
        userAngle += move;
        pendingStep -= move;
        if (Math.abs(pendingStep) < 0.0015) pendingStep = 0;
      }

      /* Tilt stays bounded so the composition never tumbles out of pose. */
      tilt = clamp(tilt + tiltVelocity, -0.38, 0.38);
      thread *= 0.94;

      const idleMs = advanceIdle(time);
      const angle = (reduced ? 0 : idleMs * IDLE_RAD_PER_MS) + userAngle;

      /* Elastic grab release. */
      grabVelocityX =
        (grabVelocityX + (0 - grabX) * MOTION.grabSpring) *
        MOTION.grabDamping;
      grabVelocityY =
        (grabVelocityY + (0 - grabY) * MOTION.grabSpring) *
        MOTION.grabDamping;
      grabX += grabVelocityX;
      grabY += grabVelocityY;

      const phase = angle + thread * 0.42;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const originX = centerX;
      const originY = centerY;

      for (let i = 0; i < count; i++) {
        const u = count === 1 ? 0.5 : i / (count - 1);
        const point = ribbonPoint(u, phase, layoutScale, geometry);
        const centreBias = u - 0.5;

        /* Previous interaction: cursor proximity lifts the nearby frames. */
        let proximity = 0;
        if (!lightweight) {
          proximity = Math.max(
            0,
            1 -
              Math.hypot(
                originX + point.x - pointerX,
                originY + point.y - pointerY
              ) /
                260
          );
        }

        const x =
          point.x * point.sCurve +
          grabX * (1 - Math.abs(centreBias) * 1.8) * 0.2;
        const y = point.y + grabY * 0.2 + proximity * 8;
        const z = point.z;

        const rotX = x * cosTilt - z * sinTilt;
        const rotZ = x * sinTilt + z * cosTilt;
        const targetX = rotX * point.sCurve;
        const targetY = y;
        const targetZ = rotZ;

        curX[i] += (targetX - curX[i]) * MOTION.lerp;
        curY[i] += (targetY - curY[i]) * MOTION.lerp;
        curZ[i] += (targetZ - curZ[i]) * MOTION.lerp;

        const stagger = (i / count) * MOTION.stagger;
        const rawReveal = immediate
          ? 1
          : clamp((entrance - stagger) / (1 - stagger));
        const reveal = reduced ? rawReveal : easeOut3(rawReveal);

        const depth = clamp(
          (curZ[i] / (geometry.depth * layoutScale) + 1) / 2
        );
        const cardScale =
          Math.max(0.52, 0.58 + depth * 0.62) * reveal;
        const cardOpacity = (0.46 + depth * 0.54) * reveal;
        const finalZ = curZ[i] + (1 - reveal) * MOTION.revealDepth;

        /* Scale comes after the percentage translate so the card's centre
           sits exactly on its orbit point at every depth. */
        /* Fetch this preview only once it faces the viewer. */
        if (!requested[i] && depth > 0.2) {
          requested[i] = 1;
          queue.push(() => loaders[i](() => queue.settle()));
        }

        cards[i].style.transform = `translate3d(${curX[i].toFixed(
          1
        )}px,${curY[i].toFixed(1)}px,${finalZ.toFixed(
          1
        )}px) translate(-50%,-50%) scale(${cardScale.toFixed(
          4
        )}) rotateY(${(Math.sin(point.sway) * 1.2).toFixed(2)}deg)`;
        cards[i].style.opacity = cardOpacity.toFixed(3);
        cards[i].style.zIndex = String(Math.round(depth * 100));

        /*
         * Depth-led lighting. Writing a stylesheet token every frame would be
         * wasteful, so quantise the depth into five bands and only touch the
         * attribute when the band changes. CSS turns the band into a warm rim,
         * a deeper shadow and a touch of highlight on the frames nearest the
         * viewer — the analogue of a light moving across the ribbon.
         */
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

    /* ── Pointer interaction ─────────────────────────────────── */
    let capturedPointer: number | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      dragging = true;
      dragTravel = 0;
      releasedAsDrag = false;
      releasedSelected = false;
      pressTravel = 0;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      pressCard = (hit?.closest?.(".film-spiral-card") ??
        (event.target as HTMLElement | null)?.closest?.(
          ".film-spiral-card"
        ) ??
        null) as HTMLElement | null;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      /*
       * Deliberately NO setPointerCapture here.
       *
       * Pointer capture retargets the subsequent `click` to the capturing
       * wrapper, so the card's own click listener never fired and selecting a
       * still did nothing. Drag continuity is already guaranteed by the
       * window-level pointermove/pointerup listeners registered below, which
       * keep receiving events outside the ribbon without stealing the click.
       */
      capturedPointer = null;
      wrap.classList.add("is-dragging");
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      /* Steering is relative to this ribbon's own centre. */
      const rect = wrap.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      const halfW = Math.max(rect.width / 2, 1);
      const halfH = Math.max(rect.height / 2, 1);
      cursorNX = clamp((event.clientX - centerX) / halfW, -1, 1);
      cursorNY = clamp((event.clientY - centerY) / halfH, -1, 1);

      if (!dragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      dragTravel += Math.abs(dx) + Math.abs(dy);
      pressTravel += Math.abs(dx) + Math.abs(dy);

      if (event.pointerType === "touch") {
        /* Direct orbit on touch, exactly as the previous ribbon. */
        userAngle += dx * 0.008;
        tilt += dy * 0.0008;
      } else {
        /* Elastic grab + a gentle steer on mouse. */
        grabX += dx * 1.4;
        grabY += dy * 0.6;
        userAngle += dx * 0.0025;
        tilt += dy * 0.002;
      }
    };

    const onPointerUp = (event?: PointerEvent) => {
      if (capturedPointer !== null) {
        try {
          wrap.releasePointerCapture(capturedPointer);
        } catch {
          /* nothing captured */
        }
        capturedPointer = null;
      }
      if (event) {
        /* Fold the final pointer velocity into the release momentum. */
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        if (dragging && Math.abs(dx) + Math.abs(dy) > 0) {
          userAngle += dx * 0.0025;
          tilt = clamp(tilt + dy * 0.002, -0.38, 0.38);
        }
      }
      /* Decide once: a gesture is a drag only if it travelled beyond the
         click slop. The flag survives into the click event that follows. */
      const CLICK_SLOP = 14;
      releasedAsDrag =
        dragTravel > CLICK_SLOP || pressTravel > CLICK_SLOP;

      let selected = pressCard;
      if (!selected && event) {
        const hit = document.elementFromPoint(event.clientX, event.clientY);
        selected = (hit?.closest?.(".film-spiral-card") ?? null) as HTMLElement | null;
      }
      pressCard = null;
      pressTravel = 0;

      /* A tap on a still opens it. A deliberate hold is a read gesture, and a
         drag is an orbit gesture, so both are excluded. */
      if (
        !releasedAsDrag &&
        selected &&
        !selected.classList.contains("is-held")
      ) {
        const idx = Number(selected.dataset.index ?? "-1");
        if (idx >= 0 && Date.now() - lastOpenAt > 250) {
          lastOpenAt = Date.now();
          releasedSelected = true;
          openStill(idx);
        }
      }

      dragging = false;
      dragTravel = 0;
      wrap.classList.remove("is-dragging");
    };

    const onWheel = (event: WheelEvent) => {
      /* The page section never captures the wheel, exactly like the previous
         ribbon build. Only the opened archive advances the reel. */
      if (!fullscreen) return;
      event.preventDefault();
      thread += event.deltaY * 0.004;
      userAngle += event.deltaX * 0.005;
    };

    const onResize = () => {
      measure();
    };

    /* The split layout changes column height independently of the viewport. */
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : undefined;
    resizeObserver?.observe(wrap);

    wrap.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    wrap.addEventListener("wheel", onWheel, { passive: !fullscreen });
    window.addEventListener("resize", onResize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { rootMargin: "180px 0px" }
    );
    observer.observe(wrap);

    const onVisibility = () => {
      paused = document.hidden;
      if (paused) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* Re-measure once the browser has committed the split layout. */
    requestAnimationFrame(() => {
      measure();
      setReady(true);
    });

    rafId = requestAnimationFrame(tick);

    return () => {
      stop();
      resumeRef.current = () => {};
      observer.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      while (scene.firstChild) scene.removeChild(scene.firstChild);
      cards.length = 0;
    };
  }, [films, fullscreen, immediate, onDetailChange]);

  /* Resume the exact motion state when the viewer closes or the page returns. */
  useEffect(() => {
    if (!pausedRef.current) resumeRef.current();
  }, [paused, detailIdx]);

  return (
    <div className={`film-spiral-root${compact ? " is-compact" : ""}${ready ? " is-ready" : ""}`}>
      <div
        ref={wrapRef}
        className="film-spiral-wrap"
        role="group"
        aria-roledescription="film ribbon gallery"
        aria-label={`${films.length} selected film stills. Use the arrow keys to steer the ribbon and press Enter to open a still.`}
        aria-describedby={instructionsId}
        style={{ perspective: `${SPIRAL.perspective}px` }}
      >
        <p id={instructionsId} className="sr-only">
          A centered spiral ribbon of film stills. Use the left and right arrow
          keys to rotate the reel and move through the stills. Up and down tilt
          the ribbon. Press Enter or Space on a focused still to open it with
          its details. Drag with a pointer, or swipe, to orbit the ribbon. Press
          Escape to close the viewer.
        </p>
        <div
          ref={sceneRef}
          className="film-spiral-stage"
          style={{
            position: "relative",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
          }}
        />
      </div>

      <FilmDetailOverlay
        index={detailIdx}
        films={films}
        onClose={closeDetail}
      />

      {/* Screen-reader-only indication of the current tab stop. */}
      <span className="sr-only" aria-live="polite">
        {detailIdx === null
          ? ""
          : `Viewing ${films[detailIdx]?.film ?? ""} still ${detailIdx + 1}`}
      </span>

    </div>
  );
}

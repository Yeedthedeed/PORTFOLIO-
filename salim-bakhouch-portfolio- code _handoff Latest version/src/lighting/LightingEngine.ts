/**
 * ETHEREALISM — CINEMATIC LIGHTING ENGINE
 *
 * One engine, one optional RAF, pure DOM mutation, zero React re-renders.
 *
 * PHYSICAL MODEL (shared by every chapter — presets change parameters only):
 *   KEY      a broad soft source, upper-left, fixed per chapter
 *   FILL     opposite, lower-right, low intensity
 *   RIM      cool backlight, upper-right, edge-only
 *   BOUNCE   warm ground reflection, very low, bottom edge
 *   AMBIENT  omnidirectional floor
 *   FALLOFF  inverse-distance exponent for localized pools
 *   SHADOW   opposite the key, multiply
 *   OCCLUSION ambient occlusion proxy, multiply
 *
 * IMPORTANT: the engine is *not* cursor-driven. An earlier build had a
 * pointer-following luminous bubble; that was removed at the owner's request and
 * must not return. Light here is anchored to chapters and content states, and
 * every gradient is edge-biased so the centre of the page stays clean.
 *
 * ANIMATION POLICY
 *   No random breathing, no idle loop. `setPreset` / `setState` start a single
 *   short RAF crossfade (~700ms, reduced to 1 frame under reduced motion), then
 *   the loop stops itself. At rest the engine consumes no CPU.
 *
 * CSS variables written (on <html>):
 *   --light-key-x, --light-key-y, --light-key-str
 *   --light-fill-str, --light-rim-str, --light-ambient
 *   --light-bounce-str, --light-falloff, --light-occlusion
 *   --light-gradient, --fill-gradient, --rim-gradient,
 *   --shadow-gradient, --ao-gradient, --light-bounce-gradient
 *   --light-accent          (chapter accent, for the rim tint)
 *   --light-accent-rgb      ("r g b" for compositing)
 *
 * `computeCardLight()` stays exported for the spatial surfaces.
 */

interface Vec3 { x: number; y: number; z: number }

/* Normalised light directions (shared by all presets). */
const KEY_DIR:  Vec3 = { x: -0.577, y: -0.577, z: 0.577 };
const FILL_DIR: Vec3 = { x:  0.707, y:  0.300, z: 0.640 };
const RIM_DIR:  Vec3 = { x:  0.500, y: -0.700, z: -0.510 };
const BNCE_DIR: Vec3 = { x:  0.100, y:  0.900, z: 0.420 };

const dot3 = (a: Vec3, b: Vec3) => a.x*b.x + a.y*b.y + a.z*b.z;
const len3 = (v: Vec3) => Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
const norm3 = (v: Vec3): Vec3 => { const l = len3(v) || 1; return { x: v.x/l, y: v.y/l, z: v.z/l }; };

/* ─────────────────────────────────────────────────────────────
   Presets
   ───────────────────────────────────────────────────────────── */

export type ChapterName =
  | "hero"
  | "photography"
  | "filmography"
  | "featured"
  | "archive"
  | "profile"
  | "contact"
  | "delusion"
  | "zakia"
  | "birth";

export type LightPreset = {
  keyX: number; keyY: number;      // normalised anchor 0..1
  keyStr: number;
  fillStr: number;
  rimStr: number;
  bounceStr: number;
  bounceX: number;
  bounceY: number;
  ambient: number;
  falloff: number;
  shadow: number;
  occlusion: number;
  accent: string;                  // rgb "r g b"
  accentAmt: number;               // 0..1 rim tint
  edgeOnly: boolean;
};

/**
 * Chapter presets. Parameters were chosen against the audited screenshots:
 * the type zone stays above 0.93 relative luminance contribution, light pools
 * sit at the frame edges, and film chapters take the sampled still accent.
 */
export const PRESETS: Record<ChapterName, LightPreset> = {
  hero: {
    keyX: 0.31, keyY: 0.30, keyStr: 0.34, fillStr: 0.15, rimStr: 0.20,
    bounceStr: 0.045, bounceX: 0.62, bounceY: 0.94,
    ambient: 0.12, falloff: 1.5, shadow: 0.055, occlusion: 0.030,
    accent: "126 196 255", accentAmt: 0.28, edgeOnly: true,
  },
  photography: {
    keyX: 0.20, keyY: 0.24, keyStr: 0.30, fillStr: 0.14, rimStr: 0.22,
    bounceStr: 0.035, bounceX: 0.52, bounceY: 0.94,
    ambient: 0.13, falloff: 1.6, shadow: 0.050, occlusion: 0.028,
    accent: "61 159 255", accentAmt: 0.34, edgeOnly: true,
  },
  filmography: {
    keyX: 0.24, keyY: 0.22, keyStr: 0.30, fillStr: 0.14, rimStr: 0.22,
    bounceStr: 0.030, bounceX: 0.50, bounceY: 0.95,
    ambient: 0.12, falloff: 1.7, shadow: 0.055, occlusion: 0.030,
    accent: "61 159 255", accentAmt: 0.24, edgeOnly: true,
  },
  featured: {
    keyX: 0.22, keyY: 0.28, keyStr: 0.32, fillStr: 0.13, rimStr: 0.20,
    bounceStr: 0.045, bounceX: 0.55, bounceY: 0.94,
    ambient: 0.12, falloff: 1.5, shadow: 0.060, occlusion: 0.032,
    accent: "208 140 126", accentAmt: 0.18, edgeOnly: true,
  },
  archive: {
    keyX: 0.12, keyY: 0.18, keyStr: 0.20, fillStr: 0.10, rimStr: 0.16,
    bounceStr: 0.020, bounceX: 0.50, bounceY: 0.96,
    ambient: 0.08, falloff: 2.0, shadow: 0.035, occlusion: 0.018,
    accent: "61 159 255", accentAmt: 0.18, edgeOnly: true,
  },
  profile: {
    keyX: 0.26, keyY: 0.26, keyStr: 0.28, fillStr: 0.13, rimStr: 0.18,
    bounceStr: 0.040, bounceX: 0.50, bounceY: 0.95,
    ambient: 0.12, falloff: 1.6, shadow: 0.045, occlusion: 0.026,
    accent: "126 196 255", accentAmt: 0.22, edgeOnly: true,
  },
  contact: {
    keyX: 0.30, keyY: 0.30, keyStr: 0.26, fillStr: 0.12, rimStr: 0.16,
    bounceStr: 0.035, bounceX: 0.50, bounceY: 0.96,
    ambient: 0.11, falloff: 1.7, shadow: 0.040, occlusion: 0.022,
    accent: "61 159 255", accentAmt: 0.20, edgeOnly: true,
  },
  delusion: {
    keyX: 0.22, keyY: 0.26, keyStr: 0.32, fillStr: 0.14, rimStr: 0.22,
    bounceStr: 0.050, bounceX: 0.58, bounceY: 0.93,
    ambient: 0.12, falloff: 1.55, shadow: 0.058, occlusion: 0.030,
    accent: "208 140 126", accentAmt: 0.30, edgeOnly: true,
  },
  zakia: {
    keyX: 0.24, keyY: 0.24, keyStr: 0.31, fillStr: 0.14, rimStr: 0.21,
    bounceStr: 0.045, bounceX: 0.55, bounceY: 0.93,
    ambient: 0.12, falloff: 1.6, shadow: 0.055, occlusion: 0.029,
    accent: "201 164 111", accentAmt: 0.28, edgeOnly: true,
  },
  birth: {
    keyX: 0.22, keyY: 0.26, keyStr: 0.33, fillStr: 0.15, rimStr: 0.22,
    bounceStr: 0.055, bounceX: 0.58, bounceY: 0.92,
    ambient: 0.12, falloff: 1.5, shadow: 0.060, occlusion: 0.031,
    accent: "226 174 116", accentAmt: 0.30, edgeOnly: true,
  },
};

export type LightMode = "idle" | "selected";

export interface LightState {
  preset: ChapterName;
  mode: LightMode;
  keyNX: number;
  keyNY: number;
  keyStr: number;
  fillStr: number;
  rimStr: number;
  bounceStr: number;
  ambient: number;
  falloff: number;
  occl: number;
  shadow: number;
  accent: string;
  accentAmt: number;
  time: number;
}

const num = (v: number) => v.toFixed(4);

/** Selected states lift the key slightly and deepen occlusion — a real change
 *  in emphasis, not a colour trick. */
function effective(p: LightPreset, mode: LightMode) {
  const selected = mode === "selected";
  return {
    keyX: p.keyX,
    keyY: p.keyY,
    keyStr: p.keyStr * (selected ? 1.18 : 1),
    fillStr: p.fillStr * (selected ? 0.82 : 1),
    rimStr: p.rimStr * (selected ? 1.25 : 1),
    bounceStr: p.bounceStr * (selected ? 1.12 : 1),
    ambient: p.ambient * (selected ? 0.9 : 1),
    falloff: p.falloff,
    shadow: p.shadow * (selected ? 1.15 : 1),
    occlusion: p.occlusion * (selected ? 1.2 : 1),
    accent: p.accent,
    accentAmt: p.accentAmt * (selected ? 1.3 : 1),
    bounceX: p.bounceX,
    bounceY: p.bounceY,
  };
}

type Values = ReturnType<typeof effective>;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpValues = (a: Values, b: Values, t: number): Values => ({
  keyX: lerp(a.keyX, b.keyX, t),
  keyY: lerp(a.keyY, b.keyY, t),
  keyStr: lerp(a.keyStr, b.keyStr, t),
  fillStr: lerp(a.fillStr, b.fillStr, t),
  rimStr: lerp(a.rimStr, b.rimStr, t),
  bounceStr: lerp(a.bounceStr, b.bounceStr, t),
  bounceX: lerp(a.bounceX, b.bounceX, t),
  bounceY: lerp(a.bounceY, b.bounceY, t),
  ambient: lerp(a.ambient, b.ambient, t),
  falloff: lerp(a.falloff, b.falloff, t),
  shadow: lerp(a.shadow, b.shadow, t),
  occlusion: lerp(a.occlusion, b.occlusion, t),
  accent: b.accent,
  accentAmt: lerp(a.accentAmt, b.accentAmt, t),
});

const rgb = (accent: string, alpha: number) =>
  `rgba(${accent.split(" ").join(",")},${Math.max(0, alpha).toFixed(4)})`;

/* ─────────────────────────────────────────────────────────────
   Engine
   ───────────────────────────────────────────────────────────── */

class LightingEngine {
  private root: HTMLElement | null =
    typeof document !== "undefined" ? document.documentElement : null;
  private rafId = 0;
  private current: Values | null = null;
  private target: Values | null = null;
  private from: Values | null = null;
  private startedAt = 0;
  private duration = 700;
  private chapter: ChapterName = "hero";
  private mode: LightMode = "idle";
  private running = false;
  private supportsLight =
    typeof window === "undefined" ||
    (window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches === false : false);

  get preset() { return this.chapter; }
  get state(): LightState {
    const v = this.current ?? effective(PRESETS[this.chapter], this.mode);
    return {
      preset: this.chapter,
      mode: this.mode,
      keyNX: 0, keyNY: 0,
      keyStr: v.keyStr, fillStr: v.fillStr, rimStr: v.rimStr,
      bounceStr: v.bounceStr, ambient: v.ambient, falloff: v.falloff,
      occl: v.occlusion, shadow: v.shadow, accent: v.accent,
      accentAmt: v.accentAmt, time: 0,
    };
  }

  /** Set a chapter preset (or a film-specific one). */
  setPreset(chapter: ChapterName, mode: LightMode = this.mode) {
    if (!this.root) this.root = document.documentElement;
    this.chapter = chapter;
    this.mode = mode;
    this.animateTo();
  }

  /** Selected-image / selected-film emphasis. */
  setMode(mode: LightMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.animateTo();
  }

  setChapterAndMode(chapter: ChapterName, mode: LightMode) {
    this.chapter = chapter;
    this.mode = mode;
    this.animateTo();
  }

  private reducedMotion() {
    return typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  private animateTo() {
    const next = effective(PRESETS[this.chapter], this.mode);
    const reduce = this.reducedMotion();
    if (reduce || !this.supportsLight) {
      this.current = next;
      this.target = next;
      this.write(next);
      return;
    }
    this.from = this.current ?? next;
    this.target = next;
    this.startedAt = performance.now();
    this.duration = 700;
    if (!this.running) {
      this.running = true;
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private tick = () => {
    if (!this.target) { this.running = false; return; }
    const t = Math.min(1, (performance.now() - this.startedAt) / this.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    this.current = lerpValues(this.from ?? this.target, this.target, eased);
    this.write(this.current);
    if (t < 1) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
      this.from = null;
    }
  };

  /** Write the six layers. Edge-anchored; no centre hotspot. */
  private write(v: Values) {
    const r = this.root;
    if (!r) return;
    const kx = (v.keyX * 100).toFixed(2);
    const ky = (v.keyY * 100).toFixed(2);
    const bx = (v.bounceX * 100).toFixed(2);
    const by = (v.bounceY * 100).toFixed(2);

    r.style.setProperty("--light-key-x", num(v.keyX));
    r.style.setProperty("--light-key-y", num(v.keyY));
    r.style.setProperty("--light-key-str", num(v.keyStr));
    r.style.setProperty("--light-fill-str", num(v.fillStr));
    r.style.setProperty("--light-rim-str", num(v.rimStr));
    r.style.setProperty("--light-bounce-str", num(v.bounceStr));
    r.style.setProperty("--light-ambient", num(v.ambient));
    r.style.setProperty("--light-falloff", num(v.falloff));
    r.style.setProperty("--light-occlusion", num(v.occlusion));
    r.style.setProperty("--light-accent", v.accent);
    r.style.setProperty("--light-cursor-nx", "0");
    r.style.setProperty("--light-cursor-ny", "0");

    /* KEY — a broad pool pinned to the chapter's anchor, falling off before
       the middle of the screen. */
    r.style.setProperty(
      "--light-gradient",
      `radial-gradient(ellipse 62% 54% at ${kx}% ${ky}%, ${rgb("205,226,255", v.keyStr * 0.30)} 0%, ${rgb("160,200,250", v.keyStr * 0.12)} 42%, transparent 74%)`
    );

    /* FILL — opposite corner, cooler, weaker. */
    r.style.setProperty(
      "--fill-gradient",
      `radial-gradient(ellipse 48% 42% at ${(100 - v.keyX * 100).toFixed(1)}% ${(100 - v.keyY * 100).toFixed(1)}%, ${rgb("150,185,235", v.fillStr * 0.16)} 0%, transparent 64%)`
    );

    /* RIM — upper-right edge; chapter accent tints only the rim. */
    r.style.setProperty(
      "--rim-gradient",
      `radial-gradient(ellipse 30% 46% at 92% 14%, ${rgb(v.accent, v.rimStr * 0.95 * (1 + v.accentAmt))} 0%, transparent 68%)`
    );

    /* BOUNCE — warm ground reflection, bottom edge only. */
    r.style.setProperty(
      "--light-bounce-gradient",
      `radial-gradient(ellipse 46% 22% at ${bx}% ${by}%, ${rgb("232,190,150", v.bounceStr * 5.2)} 0%, transparent 74%)`
    );

    /* SHADOW — opposite the key, multiply. */
    r.style.setProperty(
      "--shadow-gradient",
      `radial-gradient(ellipse 58% 48% at ${(100 - v.keyX * 100).toFixed(1)}% ${(100 - v.keyY * 100).toFixed(1)}%, rgba(0,0,0,${(v.shadow*2.2).toFixed(3)}) 0%, transparent 68%)`
    );

    /* OCCLUSION — static edge darkening, stronger with selection. */
    r.style.setProperty(
      "--ao-gradient",
      `radial-gradient(ellipse 78% 66% at 50% 50%, transparent 42%, rgba(0,0,0,${(v.occlusion*1.8).toFixed(3)}) 100%)`
    );
  }

  /** Deterministic teardown — safe on unmount and under HMR. */
  stop() {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.running = false;
    this.from = null;
    this.target = null;
  }
}

export const lightingEngine = new LightingEngine();

/* ─────────────────────────────────────────────────────────────
   Per-card lighting (unchanged contract, deterministic)
   ───────────────────────────────────────────────────────────── */
export function computeCardLight(
  wx: number, wy: number, wz: number,
  maxR: number,
  state: LightState,
): number {
  const n = norm3({ x: wx, y: wy, z: wz });
  const key = norm3({
    x: KEY_DIR.x + state.keyNX * 0.35,
    y: KEY_DIR.y + state.keyNY * 0.25,
    z: KEY_DIR.z,
  });
  const halfLambert = (d: number) => d * 0.5 + 0.5;
  const keyC  = halfLambert(Math.max(-1, Math.min(1, dot3(n, key))))     * state.keyStr;
  const fillC = halfLambert(Math.max(-1, Math.min(1, dot3(n, FILL_DIR)))) * state.fillStr;
  const rimC  = halfLambert(Math.max(-1, Math.min(1, dot3(n, RIM_DIR))))  * state.rimStr;
  const bnceC = halfLambert(Math.max(-1, Math.min(1, dot3(n, BNCE_DIR)))) * state.bounceStr;

  const depthT = Math.max(0, Math.min(1, (wz + maxR) / (2 * maxR)));
  const depthBoost = depthT * 0.05;
  const distFromCentre = Math.sqrt(wx*wx + wy*wy + wz*wz) / maxR;
  const ao = 0.92 + distFromCentre * 0.08;

  const raw = state.ambient
    + keyC * 0.22
    + fillC * 0.12
    + rimC * 0.06
    + bnceC * 0.04
    + depthBoost;

  return Math.max(0.72, Math.min(1.05, raw * ao));
}

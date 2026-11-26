/**
 * ETHEREALISM — CINEMATIC LIGHTING ENGINE
 *
 * A physically-based lighting simulation running on a single RAF loop.
 * Computes light contributions per-frame and writes CSS custom properties
 * that all components consume. Zero React re-renders. Pure DOM mutation.
 *
 * Light model (3-point cinema setup, all virtual):
 *   KEY    — large soft diffused source, cursor-driven. Upper-left origin.
 *            Moves with cursor at 35% of cursor travel (delayed, spring).
 *   FILL   — opposite side of key, 40% intensity. Fixed, slow drift.
 *   RIM    — backlight, upper-right, cool blue. Fixed position.
 *   BOUNCE — ground-reflected warm fill, very low. Subtle presence.
 *   AMBIENT— omnidirectional base. 15% contribution. Never zero.
 *
 * CSS custom properties written each frame:
 *   --light-key-x/y      — key light normalised position (0..1)
 *   --light-key-str      — key light strength (0..1)
 *   --light-fill-str     — fill strength
 *   --light-rim-str      — rim/backlight strength
 *   --light-ambient      — ambient level
 *   --light-cursor-nx/ny — smooth cursor position for JS consumers
 *   --light-gradient     — composited radial gradient string for surfaces
 *   --shadow-gradient    — opposing shadow gradient
 *
 * Per-card brightness is computed in JS (ScrollSphere/PhotographyGallery)
 * via the exported computeCardLight() function, which takes a 3D position
 * and returns a brightness multiplier (0.78..1.0).
 */

interface Vec3 { x: number; y: number; z: number }

/* ── Spring ─────────────────────────────────────────────────── */
function spring(
  cur: number,
  vel: number,
  target: number,
  k: number,
  d: number,
): [number, number] {
  const force = (target - cur) * k - vel * d;
  const newVel = vel + force;
  return [cur + newVel, newVel];
}

/* ── Light directions (normalised unit vectors) ─────────────── */
// Key: upper-left-front (45° elevation, 45° left azimuth)
const KEY_DIR:  Vec3 = { x: -0.577, y: -0.577, z: 0.577 };
// Fill: lower-right, softer
const FILL_DIR: Vec3 = { x:  0.707, y:  0.300, z: 0.640 };
// Rim: upper-right-back (backlight)
const RIM_DIR:  Vec3 = { x:  0.500, y: -0.700, z:-0.510 };
// Bounce: below, warm
const BNCE_DIR: Vec3 = { x:  0.100, y:  0.900, z: 0.420 };

function dot3(a: Vec3, b: Vec3) { return a.x*b.x + a.y*b.y + a.z*b.z; }
function len3(v: Vec3) { return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z); }
function norm3(v: Vec3): Vec3 { const l = len3(v)||1; return {x:v.x/l,y:v.y/l,z:v.z/l}; }

/* ── Exported per-card lighting function ────────────────────── */
/**
 * Given a card's world position (px) and the current engine state,
 * return a brightness multiplier for use in CSS filter.
 *
 * @param wx  World x (px, signed, 0 = centre)
 * @param wy  World y (px, signed, 0 = centre)
 * @param wz  World z (px, signed, positive = towards viewer)
 * @param maxR  Sphere radius for normalisation
 * @param state  Current engine export
 */
export interface LightState {
  keyNX: number;   // cursor-driven key offset -1..1
  keyNY: number;
  keyStr: number;  // 0..1
  fillStr: number;
  rimStr: number;
  ambient: number;
  time: number;
}

export function computeCardLight(
  wx: number, wy: number, wz: number,
  maxR: number,
  state: LightState,
): number {
  /* Normalise position to unit sphere */
  const n = norm3({ x: wx, y: wy, z: wz });

  /* Adjust key direction by cursor offset */
  const kd = norm3({
    x: KEY_DIR.x + state.keyNX * 0.35,
    y: KEY_DIR.y + state.keyNY * 0.25,
    z: KEY_DIR.z,
  });

  /* Light contributions — half-Lambert (softer than raw dot) */
  const halfLambert = (d: number) => d * 0.5 + 0.5;

  const key  = halfLambert(Math.max(-1, Math.min(1, dot3(n, kd))))     * state.keyStr;
  const fill = halfLambert(Math.max(-1, Math.min(1, dot3(n, FILL_DIR))))* state.fillStr;
  const rim  = halfLambert(Math.max(-1, Math.min(1, dot3(n, RIM_DIR)))) * state.rimStr;
  const bnce = halfLambert(Math.max(-1, Math.min(1, dot3(n, BNCE_DIR))))* 0.04;

  /* Depth-based proximity falloff — closer = slightly warmer */
  const depthT = Math.max(0, Math.min(1, (wz + maxR) / (2 * maxR)));
  const depthBoost = depthT * 0.05;

  /* Ambient occlusion proxy — cards in the "centre" of the cluster
     are slightly more occluded (less light reaches them) */
  const distFromCentre = Math.sqrt(wx*wx + wy*wy + wz*wz) / maxR;
  const ao = 0.92 + distFromCentre * 0.08; // 0.92..1.0

  /* Compose — ambient baseline + all contributions */
  const raw = state.ambient
    + key  * 0.22
    + fill * 0.12
    + rim  * 0.06
    + bnce
    + depthBoost;

  /* Clamp and apply AO */
  return Math.max(0.72, Math.min(1.05, raw * ao));
}

/* ── Engine class ───────────────────────────────────────────── */
export class LightingEngine {
  private rafId  = 0;
  private root   = document.documentElement;
  private t0     = performance.now() / 1000;

  /* Spring state — key light position */
  private kx = 0;  private kvx = 0;
  private ky = 0;  private kvy = 0;

  /* Spring state — cursor normalised */
  private cx = 0;  private cvx = 0;
  private cy = 0;  private cvy = 0;

  /* Target cursor */
  private txTarget = 0;
  private tyTarget = 0;

  /* Exported state — read by computeCardLight each RAF */
  public state: LightState = {
    keyNX: 0, keyNY: 0,
    keyStr: 0.72, fillStr: 0.38, rimStr: 0.18,
    ambient: 0.15,
    time: 0,
  };

  /* Raw mouse listener — fast, no spring */
  private onMove = (e: MouseEvent) => {
    this.txTarget = (e.clientX / window.innerWidth  - 0.5) * 2; // -1..1
    this.tyTarget = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  start() {
    window.addEventListener("mousemove", this.onMove, { passive: true });
    this.tick();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("mousemove", this.onMove);
  }

  private tick = () => {
    const now = performance.now() / 1000;
    const t   = now - this.t0;

    /* ── Cursor spring — very smooth, leading motion by 1-2 frames ── */
    // Cursor position spring: stiffness 0.055, damping 0.78 (slow, weighted)
    [this.cx, this.cvx] = spring(this.cx, this.cvx, this.txTarget, 0.055, 0.78);
    [this.cy, this.cvy] = spring(this.cy, this.cvy, this.tyTarget, 0.055, 0.78);

    /* ── Key light spring — lags even more behind cursor ── */
    // Key light follows cursor at 40% weight, heavier spring
    [this.kx, this.kvx] = spring(this.kx, this.kvx, this.cx * 0.40, 0.032, 0.86);
    [this.ky, this.kvy] = spring(this.ky, this.kvy, this.cy * 0.40, 0.032, 0.86);

    /* ── Breathing — key light breathes independently of cursor ── */
    const breathe = Math.sin(t * 0.18) * 0.04 + Math.cos(t * 0.11) * 0.02;
    const keyStr  = 0.72 + breathe;

    /* ── Fill — slowly drifts opposite key ── */
    const fillDrift = Math.sin(t * 0.07 + 1.2) * 0.06;
    const fillStr   = 0.38 + fillDrift;

    /* ── Rim — subtle pulse ── */
    const rimPulse = Math.sin(t * 0.13 + 2.4) * 0.04;
    const rimStr   = 0.18 + rimPulse;

    /* Update exported state (read by computeCardLight) */
    this.state.keyNX  = this.kx;
    this.state.keyNY  = this.ky;
    this.state.keyStr = keyStr;
    this.state.fillStr = fillStr;
    this.state.rimStr  = rimStr;
    this.state.ambient = 0.15;
    this.state.time    = t;

    /* ── Write CSS custom properties ── */
    const r = this.root;

    /* Key light screen-space position (0..1 range) */
    const kScreenX = (this.kx + 1) / 2;
    const kScreenY = (this.ky + 1) / 2;

    r.style.setProperty("--light-key-x",     kScreenX.toFixed(4));
    r.style.setProperty("--light-key-y",     kScreenY.toFixed(4));
    r.style.setProperty("--light-key-str",   keyStr.toFixed(4));
    r.style.setProperty("--light-fill-str",  fillStr.toFixed(4));
    r.style.setProperty("--light-rim-str",   rimStr.toFixed(4));
    r.style.setProperty("--light-ambient",   "0.15");
    r.style.setProperty("--light-cursor-nx", this.cx.toFixed(4));
    r.style.setProperty("--light-cursor-ny", this.cy.toFixed(4));

    /* ── Key light gradient — used by surface overlays ── */
    // A very soft radial from cursor-driven position
    // kScreenX/Y drive the centre; opacity reflects keyStr
    const kop1 = (keyStr * 0.09).toFixed(3);
    const kop2 = (keyStr * 0.03).toFixed(3);
    r.style.setProperty(
      "--light-gradient",
      `radial-gradient(ellipse 55% 45% at ${(kScreenX*100).toFixed(1)}% ${(kScreenY*100).toFixed(1)}%, rgba(210,228,255,${kop1}) 0%, rgba(180,210,255,${kop2}) 38%, transparent 65%)`
    );

    /* ── Fill gradient — opposite side ── */
    const fScreenX = (1 - kScreenX);
    const fScreenY = (1 - kScreenY);
    const fop = (fillStr * 0.045).toFixed(3);
    r.style.setProperty(
      "--fill-gradient",
      `radial-gradient(ellipse 45% 38% at ${(fScreenX*100).toFixed(1)}% ${(fScreenY*100).toFixed(1)}%, rgba(180,200,255,${fop}) 0%, transparent 58%)`
    );

    /* ── Rim gradient — fixed upper-right, cool blue ── */
    const rop = (rimStr * 0.055).toFixed(3);
    r.style.setProperty(
      "--rim-gradient",
      `radial-gradient(ellipse 30% 55% at 92% 12%, rgba(150,200,255,${rop}) 0%, transparent 55%)`
    );

    /* ── Ambient occlusion gradient — centre darkens very slightly ── */
    r.style.setProperty(
      "--ao-gradient",
      `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, rgba(0,0,0,0.045) 100%)`
    );

    /* ── Shadow gradient — opposite key light ── */
    const sop = (keyStr * 0.07).toFixed(3);
    r.style.setProperty(
      "--shadow-gradient",
      `radial-gradient(ellipse 55% 45% at ${((1-kScreenX)*100).toFixed(1)}% ${((1-kScreenY)*100).toFixed(1)}%, rgba(0,0,0,${sop}) 0%, transparent 60%)`
    );

    this.rafId = requestAnimationFrame(this.tick);
  };
}

export const lightingEngine = new LightingEngine();

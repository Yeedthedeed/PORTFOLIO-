/**
 * ETHEREALISM — CINEMATIC AUDIO ENGINE v4
 *
 * A filmmaker's portfolio deserves a sound design that feels
 * like being on a professional film set — mechanical precision,
 * analog warmth, spatial depth, and absolute restraint.
 *
 * Sound palette — inspired by real cinema equipment:
 *
 *   AMBIENT     Soft projector hum + room tone. Continuous when enabled.
 *               Near-silent. Noticed only when absent.
 *
 *   CURSOR      Lens focus breathing — micro sine shimmer on movement.
 *               200ms throttle. Almost inaudible.
 *
 *   HOVER       Camera aperture click — single metallic transient.
 *               Clean, precise. 100ms debounce.
 *
 *   PRESS       Film magazine load — soft thump + rattle.
 *               Fires on mousedown.
 *
 *   RELEASE     Shutter release — mechanical snap + ring decay.
 *               Fires on mouseup after press.
 *
 *   DRAG        Focus ring rotation — smooth whoosh proportional to velocity.
 *               Throttled to 80ms.
 *
 *   SCROLL      Film advance — brief ratchet tick, pitch ∝ speed.
 *               50ms throttle.
 *
 *   HOLD        Tape motor — low resonant drone, builds after 400ms hold.
 *
 *   MORPH       Lens zoom motor — smooth mechanical sweep.
 *
 *   OPEN        Clapperboard — clap transient + resonance tail.
 *
 *   CLOSE       Inverse clap — falling sweep + soft close click.
 *
 *   TRANSITION  Film cut — very brief white noise flash.
 *
 * Mixing rules:
 *   • Master: -14 dB (~0.20 linear gain). Barely present.
 *   • Ambient: -24 dB. Sub-perceptual texture.
 *   • All sounds are half-Lambert shaped — no hard on/off.
 *   • No two sounds of the same type stack.
 *   • Ambient crossfades 2s on enable, 0.8s on disable.
 */

class CinemaAudioEngine {
  private static readonly MASTER = 0.20;

  private ctx:    AudioContext | null = null;
  private master: GainNode    | null = null;
  private _on = false;
  private _volume = 1;
  private _initDone = false;
  private _gestureBound = false;
  private readonly _listeners = new Set<() => void>();

  /* Anti-stack busy flags */
  private _busy: Record<string, boolean> = {};
  private _throttle: Record<string, number> = {};

  /* Ambient system */
  private _ambNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private _ambGain:  GainNode | null = null;

  /* Hold drone */
  private _holdOsc:  OscillatorNode | null = null;
  private _holdGain: GainNode       | null = null;

  /* ── Public API ──────────────────────────────────────────── */
  get enabled() { return this._on; }
  get volume() { return this._volume; }

  /** Keep every mounted control in step with the single audio engine. */
  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => { this._listeners.delete(listener); };
  }

  private _emit() {
    this._listeners.forEach((listener) => {
      try { listener(); } catch { /* a broken control must not stop audio */ }
    });
  }

  /**
   * Starts or resumes the soundscape.
   *
   * Idempotent: an already-running bed is never rebuilt, so navigating between
   * sections, ribbons, photographs and albums can never restart or duplicate it.
   */
  enable() {
    this._on = true;
    try { if (!this.ctx) this._boot(); } catch { /* no audio device */ }
    void this._ensureRunning();
    try { localStorage.setItem("cine-audio", "1"); } catch { /* private mode */ }
    this._attachGesture();
    this._emit();
  }

  /**
   * Explicit mute. Persisted, so it survives navigation and reloads and is
   * never overridden by the automatic first-interaction start.
   */
  disable() {
    if (!this._on) return;
    this._on = false;
    this._fadeAmbient(false);
    this._killHold();
    this._applyMaster(false);
    try { localStorage.setItem("cine-audio", "0"); } catch { /* private mode */ }
    this._detachGesture();
    this._emit();
  }

  toggle() {
    this._on ? this.disable() : this.enable();
    return this._on;
  }

  /** User volume, 0…1. Applied to the master bus so every layer scales together. */
  setVolume(value: number) {
    const next = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
    this._volume = next;
    try { localStorage.setItem("cine-volume", String(next)); } catch { /* private mode */ }
    this._applyMaster(this._on);
    this._emit();
  }

  /**
   * Boot once.
   *
   * Default is sound ON. Because browsers require a user gesture, playback is
   * unlocked on the first interaction unless the visitor explicitly muted —
   * an explicit mute is always respected.
   */
  init() {
    if (this._initDone) { this._attachGesture(); return; }
    this._initDone = true;

    try {
      const storedVolume = localStorage.getItem("cine-volume");
      if (storedVolume !== null) {
        const parsed = Number(storedVolume);
        this._volume = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 1;
      }
      if (localStorage.getItem("cine-audio") === "0") {
        this._on = false;
        this._emit();
        return;
      }
    } catch {
      /* Storage unavailable — fall back to the default of sound on. */
    }

    this._on = true;
    try { if (!this.ctx) this._boot(); } catch { /* no audio device */ }
    void this._ensureRunning();
    this._attachGesture();
    this._emit();
  }

  /** Resume the context and start the bed once the browser allows it. */
  private _ensureRunning(): Promise<void> {
    try {
      if (!this.ctx) this._boot();
      const ctx = this.ctx!;
      const start = () => {
        if (!this._on) return;
        this._startAmbient();
        this._applyMaster(true);
      };
      if (ctx.state === "running") { start(); return Promise.resolve(); }
      const pending = ctx.resume ? ctx.resume() : undefined;
      if (pending && typeof pending.then === "function") {
        return pending.then(start, () => { /* blocked until the next gesture */ });
      }
      start();
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  }

  private _attachGesture() {
    if (this._gestureBound || typeof window === "undefined") return;
    this._gestureBound = true;
    const unlock = () => {
      if (!this._on) { this._detachGesture(); return; }
      this._detachGesture();
      void this._ensureRunning();
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown", "keydown", "touchend", "wheel",
    ];
    events.forEach((type) =>
      window.addEventListener(type, unlock, { once: true, passive: true })
    );
    this._detachGesture = () => {
      this._gestureBound = false;
      events.forEach((type) => window.removeEventListener(type, unlock));
    };
  }

  private _detachGesture(): void { /* rebound by _attachGesture */ }

  /** Master bus follows the user's volume, and only ever ramps. */
  private _applyMaster(on: boolean) {
    if (!this.ctx || !this.master) return;
    const target = on ? this._volume * CinemaAudioEngine.MASTER : 0;
    try {
      this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
    } catch { /* detached context */ }
  }

  /* ── Boot ────────────────────────────────────────────────── */
  private _boot() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      this._applyMaster(this._on);
      return;
    }
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this._on ? this._volume * CinemaAudioEngine.MASTER : 0;
    this.master.connect(this.ctx.destination);
  }

  private _c() {
    if (!this.ctx) this._boot();
    if (this.ctx!.state === "suspended") this.ctx!.resume();
    return this.ctx!;
  }
  private _m() { return this.master!; }

  /* ── Primitives ──────────────────────────────────────────── */
  private _sine(
    freq: number, vol: number, atk: number, rel: number,
    freqEnd?: number, startT = 0,
  ) {
    if (!this._on) return;
    const ctx = this._c(), now = ctx.currentTime + startT;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + atk + rel * 0.8);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + atk);
    g.gain.exponentialRampToValueAtTime(0.00001, now + atk + rel);
    osc.connect(g); g.connect(this._m());
    osc.start(now); osc.stop(now + atk + rel + 0.02);
  }

  private _noise(
    vol: number, dur: number, lp: number, hp = 0,
    atk = 0.002, startT = 0,
  ) {
    if (!this._on) return;
    const ctx   = this._c(), now = ctx.currentTime + startT;
    const len   = Math.ceil(ctx.sampleRate * (dur + 0.02));
    const buf   = ctx.createBuffer(1, len, ctx.sampleRate);
    const d     = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src   = ctx.createBufferSource();
    const f1    = ctx.createBiquadFilter();
    f1.type = "lowpass"; f1.frequency.value = lp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + atk);
    g.gain.exponentialRampToValueAtTime(0.00001, now + atk + dur);
    if (hp > 0) {
      const f2 = ctx.createBiquadFilter();
      f2.type = "highpass"; f2.frequency.value = hp;
      src.connect(f2); f2.connect(f1);
    } else { src.connect(f1); }
    f1.connect(g); g.connect(this._m());
    src.buffer = buf; src.start(now); src.stop(now + dur + 0.02);
  }

  private _busy_(id: string, ms: number): boolean {
    if (this._busy[id]) return true;
    this._busy[id] = true;
    setTimeout(() => { this._busy[id] = false; }, ms);
    return false;
  }

  private _throttle_(id: string, ms: number): boolean {
    const now = Date.now();
    if (now - (this._throttle[id] || 0) < ms) return true;
    this._throttle[id] = now;
    return false;
  }

  /* ── AMBIENT — projector hum + room tone ─────────────────── */
  private _startAmbient() {
    if (!this._on || this._ambNodes.length) return;
    const ctx = this._c();
    this._ambGain = ctx.createGain();
    this._ambGain.gain.value = 0;
    this._ambGain.connect(this._m());

    /* Layer 1: sub hum — 28 Hz, projector motor */
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine"; o1.frequency.value = 28;
    g1.gain.value = 0.18;
    o1.connect(g1); g1.connect(this._ambGain);
    o1.start();

    /* Layer 2: room tone — bandpass noise */
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const dat = buf.getChannelData(0);
    for (let i = 0; i < len; i++) dat[i] = Math.random() * 2 - 1;
    const loop = ctx.createBufferSource();
    loop.buffer = buf; loop.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 320; bp.Q.value = 0.6;
    (this as unknown as { _ambFilter?: BiquadFilterNode })._ambFilter = bp;
    const g2 = ctx.createGain(); g2.gain.value = 0.04;
    loop.connect(bp); bp.connect(g2); g2.connect(this._ambGain);
    loop.start();

    /* Layer 3: subtle harmonic — 56 Hz */
    const o2 = ctx.createOscillator();
    const g3 = ctx.createGain();
    o2.type = "sine"; o2.frequency.value = 56;
    g3.gain.value = 0.06;
    o2.connect(g3); g3.connect(this._ambGain);
    o2.start();

    this._ambNodes = [
      { osc: o1, gain: g1 },
      { osc: o2, gain: g3 },
    ];

    /* Fade in */
    this._ambGain.gain.setValueAtTime(0, ctx.currentTime);
    this._ambGain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 2.2);
  }

  private _fadeAmbient(on: boolean) {
    if (!this._ambGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (on) {
      this._ambGain.gain.setTargetAtTime(0.055, t, 0.8);
      return;
    }
    /* Detach first and capture the nodes: if the visitor re-enables within the
       fade window, the pending teardown must stop the *old* bed, never the new
       one — that was the source of abrupt interruptions. */
    const gain = this._ambGain;
    const nodes = this._ambNodes;
    gain.gain.setTargetAtTime(0, t, 0.5);
    this._ambGain = null;
    this._ambNodes = [];
    (this as unknown as { _ambFilter?: BiquadFilterNode })._ambFilter = undefined;
    setTimeout(() => {
      try { nodes.forEach((n) => n.osc.stop()); } catch { /* already stopped */ }
    }, 1800);
  }

  /* ── HOLD drone ──────────────────────────────────────────── */
  private _killHold() {
    if (this._holdGain && this.ctx) {
      this._holdGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      const o = this._holdOsc;
      setTimeout(() => { try { o?.stop(); } catch (_) {/**/} }, 400);
    }
    this._holdOsc = null; this._holdGain = null;
  }

  /* ════════════════════════════════════════════════════════
     INTERACTION SOUNDS
  ════════════════════════════════════════════════════════ */

  /** Lens focus micro-shimmer — cursor movement */
  cursor() {
    if (!this._on || this._throttle_("cur", 200)) return;
    this._sine(3600 + Math.random() * 400, 0.012, 0.006, 0.055);
  }

  /** Aperture click — element hover entry */
  hover() {
    if (!this._on || this._busy_("hov", 100)) return;
    /* Tiny metallic transient */
    this._noise(0.22, 0.010, 5500, 1800, 0.001);
    this._sine(1100, 0.030, 0.004, 0.08);
  }

  /** Magazine load — mousedown press */
  press() {
    if (!this._on || this._busy_("press", 80)) return;
    this._noise(0.28, 0.012, 3200, 400, 0.001);
    this._sine(180, 0.16, 0.004, 0.06, 50);
  }

  /** Shutter release — mouseup after press */
  release() {
    if (!this._on || this._busy_("rel", 80)) return;
    this._noise(0.35, 0.014, 4800, 700, 0.001);
    this._sine(220, 0.18, 0.003, 0.055, 55);
    /* Metallic ring decay */
    this._sine(3200, 0.04, 0.001, 0.06, 0, 0.01);
  }

  /** Focus ring drag — velocity-sensitive */
  drag(vx = 0, vy = 0) {
    if (!this._on || this._throttle_("drag", 80)) return;
    const vel = Math.sqrt(vx * vx + vy * vy);
    if (vel < 2) return;
    const spd  = Math.min(vel / 30, 1);
    const freq = 140 + spd * 220;
    const vol  = 0.04 + spd * 0.07;
    this._sine(freq * 1.3, vol, 0.005, 0.10, freq * 0.6);
    this._noise(vol * 0.35, 0.04, freq * 5, 0, 0.003);
  }

  /** Film advance ratchet — scroll */
  scroll(delta = 1) {
    if (!this._on || this._throttle_("scroll", 50)) return;
    const spd  = Math.min(Math.abs(delta) / 50, 1);
    const freq = 80 + spd * 260;
    const vol  = 0.05 + spd * 0.08;
    this._noise(vol * 0.6, 0.016, freq * 8, freq * 1.5, 0.001);
    this._sine(freq, 0.07 * vol, 0.001, 0.038);
  }

  /** Tape motor drone — hold */
  holdStart() {
    if (!this._on || this._holdOsc) return;
    const ctx  = this._c(), now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth"; osc.frequency.value = 36;
    filt.type = "lowpass"; filt.frequency.value = 180; filt.Q.value = 4;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.65);
    osc.connect(filt); filt.connect(gain); gain.connect(this._m());
    osc.start(now);
    this._holdOsc = osc; this._holdGain = gain;
  }

  holdEnd() { this._killHold(); }

  /** Lens zoom motor — formation morph */
  morph() {
    if (!this._on || this._busy_("morph", 600)) return;
    this._sine(62,   0.12, 0.04, 0.50, 240);
    this._sine(2200, 0.03, 0.08, 0.38, 800);
    this._noise(0.04, 0.28, 1600, 160, 0.018);
  }

  /** Clapperboard — panel open */
  open() {
    if (!this._on || this._busy_("gate", 380)) return;
    /* Clap transient */
    this._noise(0.42, 0.018, 4600, 800, 0.001);
    /* Body resonance */
    this._sine(52, 0.16, 0.014, 0.26, 280);
    /* Harmonic tail */
    setTimeout(() => {
      if (this._on) {
        this._sine(620, 0.035, 0.015, 0.45);
        this._sine(1240, 0.016, 0.022, 0.32);
      }
    }, 60);
  }

  /** Inverse clap — panel close */
  close() {
    if (!this._on || this._busy_("gate", 280)) return;
    this._sine(300, 0.12, 0.008, 0.18, 52);
    this._noise(0.22, 0.014, 3800, 500, 0.001);
  }

  /** Film cut flash — page transition */
  transition() {
    if (!this._on) return;
    this._noise(0.18, 0.022, 8000, 2000, 0.001);
  }

  /**
   * Chapter colouring.
   *
   * Nudges the ambient bed's filter and harmonic instead of starting anything
   * new, so moving between sections never restarts or overlaps the soundscape.
   */
  section(tone: number) {
    if (!this._on || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const target = 300 + Math.max(0, Math.min(1, tone)) * 220;
    const node = (this as unknown as { _ambFilter?: BiquadFilterNode })._ambFilter;
    if (node) node.frequency.setTargetAtTime(target, now, 1.2);
    /* A whisper of air, felt rather than heard. */
    this._noise(0.012, 0.9, 520, 90, 0.35);
  }

  /** Darkroom shimmer — used when editorial type develops. */
  develop() {
    if (!this._on || this._busy_("dev", 520)) return;
    this._sine(880, 0.028, 0.05, 0.5, 1320);
    this._sine(1760, 0.012, 0.06, 0.42, 2200);
    this._noise(0.02, 0.26, 5200, 1200, 0.03);
  }

  /** Reuse click for navigate */
  navigate() { this.release(); }

  /* ── Stubs for legacy call sites ──────────────────────────── */
  click()   { this.release(); }
  tap()     { this.press();   }
  swipe(_v = 0) { this.drag(_v, 0); }
  reveal()  { this.develop(); }
}

export const sfx = new CinemaAudioEngine();

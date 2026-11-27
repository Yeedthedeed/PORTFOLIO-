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
  private _holdBody: OscillatorNode | null = null;

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
  /**
   * A musical partial with an optional stereo position. Frequencies are never
   * ramped through zero, and gain starts above the exponential floor, so the
   * engine is safe on every Web Audio implementation.
   */
  private _sine(
    freq: number, vol: number, atk: number, rel: number,
    freqEnd?: number, startT = 0, pan = 0,
  ) {
    if (!this._on || vol <= 0) return;
    const ctx = this._c(), now = ctx.currentTime + startT;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    const p   = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = "sine";
    osc.frequency.setValueAtTime(Math.max(1, freq), now);
    if (freqEnd !== undefined && freqEnd > 0)
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + atk + rel * 0.8);
    g.gain.setValueAtTime(0.00001, now);
    g.gain.linearRampToValueAtTime(Math.max(0.00002, vol), now + Math.max(0.001, atk));
    g.gain.exponentialRampToValueAtTime(0.00001, now + atk + Math.max(0.02, rel));
    osc.connect(g);
    if (p) { p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(this._m()); }
    else g.connect(this._m());
    osc.start(now); osc.stop(now + atk + rel + 0.02);
  }

  /** Filtered noise with a stereo position — the tactile grain of the system. */
  private _noise(
    vol: number, dur: number, lp: number, hp = 0,
    atk = 0.002, startT = 0, pan = 0,
  ) {
    if (!this._on || vol <= 0) return;
    const ctx   = this._c(), now = ctx.currentTime + startT;
    const len   = Math.ceil(ctx.sampleRate * (dur + 0.02));
    const buf   = ctx.createBuffer(1, len, ctx.sampleRate);
    const d     = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src   = ctx.createBufferSource();
    const f1    = ctx.createBiquadFilter();
    f1.type = "lowpass"; f1.frequency.value = Math.max(80, lp);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.00001, now);
    g.gain.linearRampToValueAtTime(Math.max(0.00002, vol), now + Math.max(0.001, atk));
    g.gain.exponentialRampToValueAtTime(0.00001, now + atk + Math.max(0.01, dur));
    if (hp > 0) {
      const f2 = ctx.createBiquadFilter();
      f2.type = "highpass"; f2.frequency.value = Math.max(20, hp);
      src.connect(f2); f2.connect(f1);
    } else { src.connect(f1); }
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    f1.connect(g);
    if (p) { p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(this._m()); }
    else g.connect(this._m());
    src.buffer = buf; src.start(now); src.stop(now + dur + 0.02);
  }

  /** A tiny metallic body: two inharmonic partials and a filtered transient. */
  private _metal(base: number, vol: number, dur: number, pan = 0) {
    this._sine(base, vol, 0.002, dur, base * 0.985, 0, pan);
    this._sine(base * 2.71, vol * 0.34, 0.001, dur * 0.64, base * 2.67, 0.002, pan * 0.6);
    this._noise(vol * 0.5, 0.008, base * 4, base * 1.4, 0.001, 0, pan);
  }

  /** A breath of air used for transitions rather than an arcade sweep. */
  private _air(vol: number, dur: number, pan = 0) {
    this._noise(vol, dur, 3800, 320, Math.min(0.3, dur * 0.45), 0, pan);
    this._noise(vol * 0.35, dur * 1.4, 1200, 90, dur * 0.4, 0.02, -pan * 0.6);
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

  /* ── AMBIENT — glass room tone, tape air and a slow harmonic bed ── */
  private _startAmbient() {
    if (!this._on || this._ambNodes.length) return;
    const ctx = this._c();
    this._ambGain = ctx.createGain();
    this._ambGain.gain.value = 0;
    this._ambGain.connect(this._m());

    /* Layer 1: the sub floor. Almost felt, never a hum you notice. */
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine"; o1.frequency.value = 31;
    g1.gain.value = 0.13;
    o1.connect(g1); g1.connect(this._ambGain);
    o1.start();

    /* Layer 2: distant tape air, gently band-limited. */
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const dat = buf.getChannelData(0);
    for (let i = 0; i < len; i++) dat[i] = Math.random() * 2 - 1;
    const loop = ctx.createBufferSource(); loop.buffer = buf; loop.loop = true;
    const air = ctx.createBiquadFilter();
    air.type = "bandpass"; air.frequency.value = 620; air.Q.value = 0.42;
    const g2 = ctx.createGain(); g2.gain.value = 0.026;
    loop.connect(air); air.connect(g2); g2.connect(this._ambGain);
    loop.start();

    /* Layer 3: a quiet major-fifth harmonic, with a very slow filter drift. */
    const bed = ctx.createBiquadFilter();
    bed.type = "lowpass"; bed.frequency.value = 460; bed.Q.value = 0.5;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 62;
    const o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 93; o3.detune.value = 4;
    const g3 = ctx.createGain(); g3.gain.value = 0.032;
    const g4 = ctx.createGain(); g4.gain.value = 0.019;
    o2.connect(g3); g3.connect(bed);
    o3.connect(g4); g4.connect(bed);
    bed.connect(this._ambGain);
    o2.start(); o3.start();

    const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 130;
    lfo.connect(lfoGain); lfoGain.connect(bed.frequency); lfo.start();

    (this as unknown as { _ambFilter?: BiquadFilterNode })._ambFilter = air;
    this._ambNodes = [
      { osc: o1, gain: g1 },
      { osc: o2, gain: g3 },
      { osc: o3, gain: g4 },
      { osc: lfo, gain: lfoGain },
    ];

    this._ambGain.gain.setValueAtTime(0, ctx.currentTime);
    this._ambGain.gain.linearRampToValueAtTime(0.062, ctx.currentTime + 2.8);
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
      const b = this._holdBody;
      setTimeout(() => {
        try { o?.stop(); } catch (_) {/**/}
        try { b?.stop(); } catch (_) {/**/}
      }, 400);
    }
    this._holdOsc = null; this._holdGain = null; this._holdBody = null;
  }

  /* ════════════════════════════════════════════════════════
     INTERACTION SOUNDS
  ════════════════════════════════════════════════════════ */

  /**
   * New interaction identity: glass filament, brushed metal, felt and air.
   * One coherent palette replaces the previous clicks entirely.
   */

  /** A glass filament, barely there — pointer drift. */
  cursor() {
    if (!this._on || this._throttle_("cur", 240)) return;
    this._sine(4180 + Math.random() * 460, 0.009, 0.004, 0.07, 4020, 0, Math.random() * 0.7 - 0.35);
  }

  /** Brushed-metal contact — meaningful hover. */
  hover() {
    if (!this._on || this._busy_("hov", 90)) return;
    this._noise(0.10, 0.008, 7200, 2600, 0.001, 0, 0.18);
    this._metal(2360, 0.018, 0.075, 0.12);
    this._sine(712, 0.011, 0.004, 0.09, 690, 0.004, -0.08);
  }

  /** Felt-damped mechanism — press. */
  press() {
    if (!this._on || this._busy_("press", 70)) return;
    this._sine(78, 0.10, 0.005, 0.13, 56, 0, -0.05);
    this._noise(0.085, 0.028, 820, 130, 0.003, 0, -0.05);
  }

  /** Glass-and-metal release, tuned below speech level. */
  release() {
    if (!this._on || this._busy_("rel", 75)) return;
    this._metal(3460, 0.019, 0.055, 0.06);
    this._sine(168, 0.035, 0.004, 0.085, 122, 0.003, 0);
    this._noise(0.055, 0.018, 6800, 1900, 0.001, 0.002, -0.12);
  }

  /** Fine analogue friction — drag, with velocity shaping and a wide image. */
  drag(vx = 0, vy = 0) {
    if (!this._on || this._throttle_("drag", 85)) return;
    const vel = Math.sqrt(vx * vx + vy * vy);
    if (vel < 2) return;
    const spd = Math.min(vel / 30, 1);
    const pan = Math.max(-0.5, Math.min(0.5, vx / 800));
    this._sine(118 + spd * 46, 0.026, 0.012, 0.13, 82 + spd * 24, 0, pan);
    this._noise(0.035 + spd * 0.045, 0.075, 1900 + spd * 2400, 280, 0.02, 0, pan);
    this._sine(2380 + spd * 680, 0.006, 0.008, 0.09, 2210, 0.004, -pan);
  }

  /** A soft film-transport tick — scrolling never becomes a metronome. */
  scroll(delta = 1) {
    if (!this._on || this._throttle_("scroll", 72)) return;
    const spd = Math.min(Math.abs(delta) / 60, 1);
    this._metal(1320, 0.012 + spd * 0.008, 0.03, (Math.random() - 0.5) * 0.3);
    this._noise(0.026 + spd * 0.026, 0.016, 3600, 720, 0.003);
  }

  /** A glass suspension, not a tape motor — deliberate hold. */
  holdStart() {
    if (!this._on || this._holdOsc) return;
    const ctx = this._c(), now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const body = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const bodyGain = ctx.createGain();
    osc.type = "triangle"; osc.frequency.value = 196;
    body.type = "sine"; body.frequency.value = 588; body.detune.value = 3;
    filt.type = "lowpass"; filt.frequency.value = 1150; filt.Q.value = 1.1;
    gain.gain.setValueAtTime(0.00001, now);
    gain.gain.linearRampToValueAtTime(0.042, now + 0.6);
    bodyGain.gain.setValueAtTime(0.00001, now);
    bodyGain.gain.linearRampToValueAtTime(0.012, now + 0.85);
    osc.connect(filt); filt.connect(gain); gain.connect(this._m());
    body.connect(bodyGain); bodyGain.connect(gain);
    osc.start(now); body.start(now);
    this._holdOsc = osc; this._holdGain = gain;
    this._holdBody = body;
  }

  holdEnd() { this._killHold(); }

  /** Slow optical rack — a tonal swell rather than a zoom motor. */
  morph() {
    if (!this._on || this._busy_("morph", 620)) return;
    this._sine(82, 0.075, 0.12, 0.62, 176, 0, -0.12);
    this._sine(1046, 0.014, 0.18, 0.5, 1568, 0.03, 0.26);
    this._air(0.028, 0.52, 0.14);
  }

  /** A composed threshold — opening a body of work. */
  open() {
    if (!this._on || this._busy_("gate", 420)) return;
    this._sine(64, 0.10, 0.05, 0.42, 98, 0, -0.08);
    this._sine(784, 0.018, 0.14, 0.56, 1046, 0.04, 0.2);
    this._metal(1568, 0.012, 0.18, 0.1);
    this._air(0.04, 0.55, -0.06);
  }

  /** Its quieter inverse — closing returns the room. */
  close() {
    if (!this._on || this._busy_("gate", 300)) return;
    this._sine(412, 0.055, 0.008, 0.26, 98, 0, 0.1);
    this._sine(128, 0.034, 0.02, 0.2, 78, 0.02, -0.1);
    this._noise(0.05, 0.11, 2400, 280, 0.012, 0, 0.06);
  }

  /** Section cut: air and a low tonal accent, never a new ambience. */
  transition() {
    if (!this._on) return;
    this._air(0.032, 0.34, 0.12);
    this._sine(196, 0.018, 0.055, 0.32, 147, 0.01, -0.16);
  }

  /**
   * Chapter colouring.
   * Nudges the existing bed's filter and harmonic instead of starting anything
   * new, so moving between sections never restarts or overlaps the soundscape.
   */
  section(tone: number) {
    if (!this._on || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const target = 380 + Math.max(0, Math.min(1, tone)) * 300;
    const node = (this as unknown as { _ambFilter?: BiquadFilterNode })._ambFilter;
    if (node) node.frequency.setTargetAtTime(target, now, 1.4);
    this._air(0.016, 0.8, 0.18);
  }

  /** Editorial type coming into being: glass partials, no chime cliché. */
  develop() {
    if (!this._on || this._busy_("dev", 540)) return;
    this._sine(1046, 0.016, 0.09, 0.56, 1568, 0, 0.2);
    this._sine(2093, 0.006, 0.12, 0.44, 2340, 0.03, -0.24);
    this._noise(0.014, 0.3, 6800, 2200, 0.05, 0, 0);
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

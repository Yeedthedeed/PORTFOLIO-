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
  private ctx:    AudioContext | null = null;
  private master: GainNode    | null = null;
  private _on = false;

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

  enable() {
    this._on = true;
    this._boot();
    this._startAmbient();
    localStorage.setItem("cine-audio", "1");
  }

  disable() {
    this._on = false;
    this._fadeAmbient(false);
    this._killHold();
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    localStorage.setItem("cine-audio", "0");
  }

  toggle() {
    this._on ? this.disable() : this.enable();
    return this._on;
  }

  init() {
    const saved = localStorage.getItem("cine-audio");
    if (saved === "1") this.enable();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  private _boot() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (this.master) this.master.gain.setTargetAtTime(0.20, this.ctx.currentTime, 0.3);
      return;
    }
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.20;
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
    } else {
      this._ambGain.gain.setTargetAtTime(0, t, 0.5);
      setTimeout(() => {
        try {
          this._ambNodes.forEach(n => n.osc.stop());
          this._ambNodes = [];
          this._ambGain = null;
        } catch (_) {/**/}
      }, 1800);
    }
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

  /** Reuse click for navigate */
  navigate() { this.release(); }

  /* ── Stubs for legacy call sites ──────────────────────────── */
  click()   { this.release(); }
  tap()     { this.press();   }
  swipe(_v = 0) { this.drag(_v, 0); }
  reveal()  { /* silent */ }
}

export const sfx = new CinemaAudioEngine();

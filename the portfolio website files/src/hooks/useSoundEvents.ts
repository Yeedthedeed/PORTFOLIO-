import { useEffect, useRef } from "react";
import { sfx } from "../audio/SoundEngine";

/**
 * GLOBAL SOUND EVENTS — Cinema interaction layer
 *
 * Maps every user gesture to its precisely tuned cinematic sound.
 *
 *   mousemove (idle)      → sfx.cursor()   — lens focus shimmer, 200ms throttle
 *   [data-cursor] entry   → sfx.hover()    — aperture click, 100ms debounce
 *   mousedown             → sfx.press()    — magazine load
 *   mouseup (no drag)     → sfx.release()  — shutter release
 *   mouseup (after drag)  → sfx.drag()     — focus ring coast
 *   mousemove while down  → sfx.drag()     — focus ring rotation, 80ms throttle
 *   scroll                → sfx.scroll()   — film advance, 50ms throttle
 *   hold 400ms            → sfx.holdStart()— tape motor drone
 *   release after hold    → sfx.holdEnd()
 *   touchstart            → sfx.press()
 *   touchend (swipe)      → sfx.drag()
 */
export function useSoundEvents() {
  const lastHoverEl  = useRef<Element | null>(null);
  const isDown       = useRef(false);
  const hasDragged   = useRef(false);
  const downX        = useRef(0);
  const downY        = useRef(0);
  const lastX        = useRef(0);
  const lastY        = useRef(0);
  const prevVX       = useRef(0);
  const prevVY       = useRef(0);
  const holdTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY  = useRef(0);
  const lastScrollT  = useRef(0);
  const lastCursorT  = useRef(0);
  const touchX       = useRef(0);
  const touchY       = useRef(0);
  const touchT       = useRef(0);

  useEffect(() => {
    /* ── Mouse move ─────────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const now = Date.now();

      /* Cursor shimmer — 200ms throttle */
      if (now - lastCursorT.current > 200) {
        lastCursorT.current = now;
        sfx.cursor();
      }

      /* Hover detection — once per new element */
      const el      = e.target as HTMLElement;
      const trigger = el.closest("[data-cursor]");
      if (trigger && trigger !== lastHoverEl.current) {
        lastHoverEl.current = trigger;
        sfx.hover();
      } else if (!trigger) {
        lastHoverEl.current = null;
      }

      /* Drag sound — velocity-sensitive, 80ms throttle */
      if (isDown.current) {
        const dx = e.clientX - lastX.current;
        const dy = e.clientY - lastY.current;
        prevVX.current = prevVX.current * 0.55 + dx * 0.45;
        prevVY.current = prevVY.current * 0.55 + dy * 0.45;

        const dist = Math.sqrt(
          (e.clientX - downX.current) ** 2 + (e.clientY - downY.current) ** 2
        );
        if (dist > 6) hasDragged.current = true;

        if (hasDragged.current) {
          sfx.drag(prevVX.current, prevVY.current);
        }
      }

      lastX.current = e.clientX;
      lastY.current = e.clientY;
    };

    /* ── Mouse down ─────────────────────────────────────────── */
    const onDown = (e: MouseEvent) => {
      isDown.current   = true;
      hasDragged.current = false;
      downX.current    = e.clientX;
      downY.current    = e.clientY;
      prevVX.current   = 0;
      prevVY.current   = 0;
      sfx.press();
      holdTimer.current = setTimeout(() => sfx.holdStart(), 420);
    };

    /* ── Mouse up ───────────────────────────────────────────── */
    const onUp = () => {
      if (!isDown.current) return;
      isDown.current = false;

      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      sfx.holdEnd();
      sfx.release();
      hasDragged.current = false;
    };

    /* ── Scroll ─────────────────────────────────────────────── */
    const onScroll = () => {
      const now   = Date.now();
      const delta = window.scrollY - lastScrollY.current;
      const dt    = Math.max(now - lastScrollT.current, 1);

      if (Math.abs(delta) > 1) {
        sfx.scroll(delta / dt * 16);
      }
      lastScrollY.current = window.scrollY;
      lastScrollT.current = now;
    };

    /* ── Touch ──────────────────────────────────────────────── */
    const onTouchStart = (e: TouchEvent) => {
      touchX.current = e.touches[0].clientX;
      touchY.current = e.touches[0].clientY;
      touchT.current = Date.now();
      sfx.press();
      holdTimer.current = setTimeout(() => sfx.holdStart(), 480);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      sfx.holdEnd();

      const dx   = e.changedTouches[0].clientX - touchX.current;
      const dy   = e.changedTouches[0].clientY - touchY.current;
      const dt   = Math.max(Date.now() - touchT.current, 1);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 15) {
        sfx.drag((dx / dt) * 16, (dy / dt) * 16);
      } else {
        sfx.release();
      }
    };

    window.addEventListener("mousemove",   onMove,        { passive: true });
    window.addEventListener("mousedown",   onDown);
    window.addEventListener("mouseup",     onUp);
    window.addEventListener("scroll",      onScroll,      { passive: true });
    window.addEventListener("touchstart",  onTouchStart,  { passive: true });
    window.addEventListener("touchend",    onTouchEnd,    { passive: true });

    return () => {
      window.removeEventListener("mousemove",   onMove);
      window.removeEventListener("mousedown",   onDown);
      window.removeEventListener("mouseup",     onUp);
      window.removeEventListener("scroll",      onScroll);
      window.removeEventListener("touchstart",  onTouchStart);
      window.removeEventListener("touchend",    onTouchEnd);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);
}

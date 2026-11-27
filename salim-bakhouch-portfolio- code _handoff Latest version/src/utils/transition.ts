/**
 * SEAMLESS SURFACE TRANSITION
 *
 * The portfolio and its archives are two states of one experience. Where the
 * browser supports the View Transitions API we morph between them with a
 * matched crossfade; elsewhere React's own AnimatePresence fade is used.
 *
 * No animation loop, no listeners, respects reduced motion.
 */
export function runSurfaceTransition(apply: () => void) {
  if (typeof document === "undefined") return apply();
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (reduce || typeof doc.startViewTransition !== "function") {
    apply();
    return;
  }
  doc.startViewTransition(() => apply());
}

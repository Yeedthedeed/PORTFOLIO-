/**
 * ETHEREALISM — Motion Token System
 * Single source of truth for all animation constants.
 * Import everywhere. Never hardcode easing or duration.
 */

export const ease = {
  out:   [0.16, 1, 0.3, 1]    as [number, number, number, number],
  in:    [0.7,  0, 0.84, 0]   as [number, number, number, number],
  inOut: [0.83, 0, 0.17, 1]   as [number, number, number, number],
} as const;

export const dur = {
  micro: 0.4,  // cursor response only
  short: 1.0,
  base:  1.4,
  long:  1.8,
  epic:  2.4,
} as const;

/** prefers-reduced-motion aware amplitude multiplier */
export function getMotionScale(): number {
  if (typeof window === "undefined") return 1;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
}

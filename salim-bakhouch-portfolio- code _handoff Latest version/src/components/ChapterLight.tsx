/**
 * CHAPTER LIGHT — the scene-anchored light rig.
 *
 * Replaces the previous full-viewport lighting overlay. Movement and cost are
 * zero: these are static CSS gradients anchored inside each chapter, so light
 * scrolls with the composition it belongs to and can never wash the whole page.
 *
 * Art direction: "practical light". Each chapter is lit as if one practical
 * source sits just outside frame — a window at the hero's upper right, a spill
 * behind the sphere, a warm floor bounce, a projector shaft across the featured
 * poster. Light only ever *catches edges*; the reading centre is untouched.
 *
 *   .cl-key        broad soft spill behind the subject
 *   .cl-rim        narrow edge light, chapter-tinted
 *   .cl-bounce     warm reflection along the floor line
 *   .cl-shaft      masked projector beam (hero / featured only)
 *   .cl-occlusion  corner weighting, multiply
 *
 * Presets live in CSS (`chapter-light--hero` etc). A chapter may override the
 * accent with a film token; nothing is computed in JavaScript.
 *
 * KILL SWITCH: set LIGHTING_ENABLED = false, or add data-lighting="off" to
 * <html>. The site is fully authored without it.
 */

/**
 * DISABLED by owner decision after visual review: the scene-anchored rig
 * produced compositing artifacts (visible bounded-gradient edges) and was
 * removed. The component and the engine remain preserved for a future
 * approved iteration; flipping this flag is the only change needed to
 * re-enable. Nothing renders while false.
 */
export const LIGHTING_ENABLED = false;

export type LightPreset =
  | "hero"
  | "photography"
  | "filmography"
  | "featured"
  | "profile"
  | "contact";

export default function ChapterLight({ preset }: { preset: LightPreset }) {
  if (!LIGHTING_ENABLED) return null;
  return (
    <div className={`chapter-light chapter-light--${preset}`} aria-hidden="true">
      <span className="cl-shaft" />
      <span className="cl-key" />
      <span className="cl-rim" />
      <span className="cl-bounce" />
      <span className="cl-occlusion" />
    </div>
  );
}

# Accessibility

## Global

- `<html lang="en">`, a descriptive title and meta description.
- **Skip to content** link (`.skip-link`) targets `#main`.
- Focus-visible outlines for every interactive element.
- `prefers-reduced-motion` disables idle drift, reveal animations, and nonessential motion.

## Spatial galleries

Both galleries are DOM-built for performance but behave like native controls:

- Cards: `role="button"`, descriptive `aria-label`, `aria-haspopup="dialog"`.
- Sphere: all 36 cards are tabbable; the ribbons use a **roving tab stop** (one per ribbon).
- Keyboard:
  - `←` / `→` rotate and move focus.
  - `↑` / `↓` tilt (ribbons).
  - `Home` / `End` jump to the ends; `PageUp` / `PageDown` advance pages in ribbons.
  - `Enter` / `Space` open the focused image.
- Instruction blocks are provided via visually hidden (`sr-only`) text linked with
  `aria-describedby`.
- Focus restores to the originating card when a viewer closes.

## Viewers and dialogs

- `role="dialog"`, `aria-modal="true"`, labelled by the visible title.
- Focus moves to the close button on open.
- `Tab` / `Shift+Tab` cycle inside the viewer.
- `Escape` closes only the topmost layer (film detail → archive, viewer → page).
- Arrow keys step within the current album/film.
- `aria-live="polite"` announces position and readiness text.

## Content

- Every photograph has descriptive alt text built from its manifest title and album.
- Decorative overlays (halo, grain, scanline, bloom, cursor) are `aria-hidden`.
- Small captions are not the only source of information; accessible names are explicit.
- The hero portrait has a descriptive alt; the viewfinder face hit area is a focusable button
  with `aria-pressed` reflecting its state.
- The mobile/tablet dock is a `<nav aria-label="Portfolio chapters">` with `aria-current`.

## Motion and media

- Ambient sound defaults to on; because browsers require a gesture, playback unlocks on the
  first interaction. An explicit mute is persisted and never overridden.
- Volume and mute are exposed as real controls (`aria-pressed`, `aria-label`, range input
  with `aria-valuetext`), reachable by keyboard and visible on focus.
- Arrow keys step exactly one still; PageUp/PageDown step five; Home/End jump to the ends.
- Holding a still (or pressing `I`) surfaces its editorial note without opening the viewer;
  releasing, leaving or pressing Escape clears it. The note is present in the DOM, so assistive
  technology can read it even when visually collapsed.
- `DevelopReveal` never hides content permanently: reduced motion renders it immediately, and
  content is revealed by IntersectionObserver, not by pointer-only interaction.
- Chapter rail entries are real links with `aria-current` and visible focus states.
- The intro is skippable by any click, tap or key press, and is skipped entirely for
  reduced-motion visitors.
- Frame lighting is decorative only: depth bands change borders, shadows and opacity, never the
  photograph's own pixels, and all hover effects are disabled under reduced motion.
- `prefers-reduced-motion` stops looping animation and keeps transitions minimal.
- Reduced-motion users still get all content and navigation.

## Checklist for changes

- [ ] New interactive element has a name, role and focus style.
- [ ] New overlay traps focus, closes on Escape, and restores focus.
- [ ] No information conveyed by colour alone.
- [ ] Tap targets ≥ 44×44px on phone/tablet.
- [ ] Keyboard path reaches every gallery item and viewer control.

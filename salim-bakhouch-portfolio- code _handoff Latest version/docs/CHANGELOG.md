# CHANGELOG

## Spacing fix (current)

- Removed the empty `<ChapterGeometry preset="filmography" />` mount from
  `FilmSections.tsx` and hardened `.film-section-row > .chapter-geometry` to
  `position: absolute; inset: 0`, eliminating the ~188 px-per-row dead band.
- Before → after (1440×900): rows 1000/1032/1032 → 798/830/830; filmography
  3540 → 2934 px; 0 empty wrappers; aperture differential behind the films
  still 11.8 %; 0 overflow / 0 errors across all seven viewports.
- Review deployment updated to https://etherealism-final.deed.page/
  (byte-verified).

## Approved-state handoff

- Consolidated the confirmed/approved state into `HANDOFF.md`, `README.md`,
  `CONTINUATION.md` and the focused docs; rejected directions recorded
  explicitly; open items (including the deferred filmography spacing) documented
  with diagnosis for the next agent.
- Deployed the byte-verified review build: https://etherealism-review.deed.page/

## Phase 06 correction

Sections were repainting opaque backgrounds over the fixed field, hiding the
aperture. Made translucent; aperture effect behind the filmography measured at
12.61 % of pixels. Filmography spacing compacted once (gaps, margins, paddings,
ribbon margins) with geometry untouched.

## Phase 06 — Optical Aperture

Background rewritten as an oversized incomplete aperture with a masked sapphire
halo, one warm intersection, two light planes and static grain relocated behind
all content. Scroll choreography via CSS scroll timeline. Global grain,
scanlines and vignette removed.

## Phase 05.2 — Continuous filmography

Removed the filmography rotated SVG plane (the "light shape" artifact) and all
row borders, backgrounds, separators and per-row overlays.

## Phase 05.1 — Chromatic refinement

Per-frame captions removed at source; yellow/gold replaced with a monochromatic
orange family; blue tonal ladder; cinematic frame lighting; ribbon image
filters removed.

## Rejected / superseded (historical only)

Phase 03 semantic type scale and 12 px floor (rejected — typography restored) ·
Luminous Lichen palette (superseded by orange) · warm oxide/ochre/amber washes
(rejected — brown/purple mud) · global lighting overlay and cursor light
(rejected — seam artifacts; owner removed cursor light twice) · lighting
playground/simulator (never built; prohibited).

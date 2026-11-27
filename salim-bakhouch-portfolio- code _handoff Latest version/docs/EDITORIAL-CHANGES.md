# EDITORIAL / DESIGN CHANGES — current pass

## Hero portrait
- Master: `Landing page profile pictuer - Copy/the main portfolio picture.png`.
- 1312 × 1199 PNG with transparency, byte-identical to the previously loaded
  `3 .png` (sha256 `c7a560c4…6835`). Loaded explicitly from the named file with
  a raw-GitHub fallback. No edit, crop, recolour or recompression.
- Portrait is not covered by the editorial plate; the plate component is
  preserved in the codebase but intentionally unmounted. The hero is anchored
  by the existing top-left quote, top-right availability caption, Now Filming
  card and the viewfinder hover treatment.

## Guide removal
Visible: hero scroll cue, viewer swipe hint, any gesture/tutorial overlays.
Screen-reader-only descriptions remain (`.sr-only`) for accessibility.
Actual interactions unchanged.

## Bubble removal
The fixed luminous custom cursor/reticle is unmounted and native cursors are
restored. The portrait sapphire halo, rim/key/fill light, viewfinder and global
atmosphere are intentional and remain.

## Spatial language
`EtherealField`: blue-monochromatic measured grid, orbital contours, two
wireframe armillary structures, light band, registration marks and a capped
canvas particle field. `HeroStructure`: optical axis and field curvature
dial/survey linework around the portrait. CSS adds richer grain, controlled
bloom, vignette and editorial section framing. All generated, no added imagery.

## Content corrections
About counters: 81 photographs, 16 albums, 122 stills, 03 films. Bio includes
The Birth Permit. Footer CTA made always legible.

## Open owner decisions
Real contact addresses; authorisation to publish; GitHub commit/PR route.


## Owner revision — final state

- Cosmic constellation/spatial graphics **fully removed** (component deleted).
- Background pointer-following luminous `lightDiv` **deleted**; `LightingLayer`
  unmounted. No hover-triggered glow at the centre.
- Portrait: embedded WebP delivery copy at the master's own 1312 × 1199;
  hero height `min(100svh, 100vw)`; `MediaImage` now detects already-decoded
  images so it cannot stay hidden. Verified offline.
- Sound identity kept unchanged from the previous pass.
- Current public URL (predates Phase 00; NOT republished during Phases 00/01):
  https://salim-bakhouch-etherealism.deed.page/


## Phase status (after Phase 01)

The owner revision above is the current implementation state and has not been
changed by Phases 00–01. Phase 01 confirmed that the guides, cursor bubble,
pointer light bubble and cosmic graphics remain absent. Phase 02 design changes
are awaiting owner scope approval.

# PHASE 04B — LIGHTING: BUILD, REVIEW, AND REMOVAL

**Owner decision:** the lighting changes were rejected on visual review.
**Outcome:** the lighting is **removed from the rendered site**. The engine and the
rig component are preserved but disabled (`LIGHTING_ENABLED = false`), so a future
approved iteration can resume without re-architecture.
**Deployment:** none. Production is untouched.

---

## 1. What I built and why it failed

After the owner rejected the first Phase 04 attempt (a global full-viewport
overlay), I rebuilt it as a **scene-anchored “practical light” rig**:
per-chapter surfaces with key spill, accent rim, warm floor bounce, optional
projector shaft and corner occlusion — no RAF, no pointer response, no global
layer.

The rig did produce the intended spatial character, but it introduced a
**compositing artifact**: a visible hard vertical edge and soft rectangular
banding where bounded gradients met the chapter bounds. Two rounds of fixes
(removing blur, sizing gradients to their boxes, converting spans to full-bleed
layers) reduced but did not eliminate it. It was most obvious in Contact.

I measured the artifact directly: isolating each layer showed a max column
brightness jump of **9–19 RGB** at a consistent x-position, versus **5.6** in a
clean background band after the final rebuild. A visible rectangular seam is not
acceptable at a top-tier portfolio standard, so the rig was withdrawn rather
than shipped with a caveat.

## 2. Final state

| Item | State |
|---|---|
| `.chapter-light` in DOM | **0** at every viewport |
| `.lighting-layer` in DOM | **0** |
| Global lighting overlay | **removed** from `App.tsx` |
| Chapter rig CSS | **removed** from `src/index.css` |
| `ChapterLight.tsx` | Preserved, exports `LIGHTING_ENABLED = false` |
| `LightingEngine.ts` | Preserved (reworked: presets, states, no cursor/no idle loop) |
| Mounts in Hero / Photography / Filmography / Featured / About / Contact | Present but render `null` |
| Sound engine, manifests, assets, geometry | **untouched** |

The site returns to the authored atmosphere it had before Phase 04: static
background, bloom, vignette, grain. No seam, no wash, no inactive layers.

## 3. Verification after removal

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **pass** — one `dist/index.html`, 2,409,560 bytes |
| sha256 | `8ea72984e2dccb62cc755ce1adc84b9ddb2a7447ee433c948855fbaa63a03696` |
| Rigs / lighting layers at 1920, 1440, 1024, 768, 390, 360, 844×390 | **0 / 0** everywhere |
| Console errors | **0** |
| Horizontal overflow | **0** |
| Content integrity | 36 sphere cards · 3 ribbons · 122 frames |
| Bottom dock | still removed (0) |
| Asset / manifest checksums | unchanged |

Screenshots: `evidence/phase-04b/removed/` — six chapters at seven viewports,
artifact-free.

## 4. Rejected variants, for the record

| Variant | Result | Why rejected |
|---|---|---|
| Global 6-surface overlay with cursor key | Cursor-driven glow, idle breathing | Conflicts with the owner's earlier removal of pointer light; animated a static composition |
| Static global overlay, edge-anchored | Invisible at safe intensities | Too weak to be worth the layers; raising it washed the frame |
| Scene-anchored rig, blurred gradients | Spatial character achieved | Bounded-box seam and banding |
| Scene-anchored rig, sized gradients | Seam reduced | Still measurable and visible in Contact |
| **No rig (current)** | Clean authored atmosphere | Chosen: correctness over effect |

## 5. What a future lighting phase would need (not started)

1. A compositing approach with **no bounded gradient boxes**: e.g. light painted
   into the existing background gradient stack at section level, or a single
   full-viewport painted layer whose stops are all edge-anchored with explicit
   `100%` transparency — validated with an automated column-discontinuity test
   before visual review.
2. A numeric acceptance gate: max column luminance jump below **2 RGB** across
   background bands, measured per chapter, per viewport.
3. Owner review of the light at three intensities before it is committed.
4. Keep the no-cursor, no-idle-loop, no-wash constraints that this phase
   established.

Phase 04 is closed. No Phase 05 work has begun.

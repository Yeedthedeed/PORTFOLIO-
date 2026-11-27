# PHASE 04 — CHAPTER LIGHTING EXTENSION

**Scope delivered:** extended the existing single lighting engine with localized
chapter presets, state-driven highlights, six composited layers, selected-image
and selected-film states, and GPU/reduced-motion/low-power fallbacks.
**Not touched:** sound engine, image assets, manifests, image order/URLs, album
relationships, sphere/ribbon geometry, typography.

**Deployment:** none.

---

## 1. Executive summary

The engine previously existed but **was not mounted**, and its loop was
cursor-driven with continuous random breathing. That conflicted with the owner's
earlier removal of pointer-following light. Phase 04:

- **Extends the one existing engine** (`src/lighting/LightingEngine.ts`) — no
  second engine, no second CSS layer set, no duplicate listeners.
- **Replaces cursor influence with chapter anchors.** Verified pointer
  independence: moving the cursor 3 positions changed no light value.
- **Removes idle animation.** The loop runs only during a ~700 ms preset
  crossfade, then stops. At rest, values are stable (verified) and no RAF is
  scheduled after settle.
- **Adds selected states.** Photo viewer: key 0.3000→0.3434, rim 0.2200→0.2643.
  Film viewer: key 0.3200→0.3776, restoring exactly to 0.3200 on close.
- **Falls back by device.** Desktop active; touch/save-data/≤2 cores static;
  reduced-motion gets one static frame with zero transition.

## 2. Changed files

| File | Change |
|---|---|
| `src/lighting/LightingEngine.ts` | Extended: chapter presets, light-state model, selected emphasis, six-layer gradient writer, deterministic stop, preserved `computeCardLight`. |
| `src/components/LightingLayer.tsx` | Rewritten as the single mount: six surfaces, IntersectionObserver preset switching, one custom-event listener, low-power/reduced-motion policy, full cleanup. |
| `src/App.tsx` | Mounts `<LightingLayer />` (was unmounted). |
| `src/components/ScrollSphere.tsx` | Dispatches one `etherealism:light` state event on photo selection. |
| `src/components/FilmDetail.tsx` | Dispatches one `etherealism:light` state event on film-still selection. |
| `src/index.css` | `.lighting-layer` surfaces, z-index discipline, static/reduced rules. |
| `PHASE-04-LIGHTING-REPORT.md`, `evidence/phase-04/` | Report, screenshots, measurements, scripts. |

No other source file changed.

## 3. Lighting model

One physical model, shared by every chapter. Presets change parameters only:

| Role | Behaviour |
|---|---|
| Key | Broad soft pool, upper-left of a chapter anchor. Edge-biased; never covers the reading centre. |
| Fill | Opposite corner, lower-right, ~40 % of key. |
| Rim | Cool backlight, upper-right edge; the **only** surface tinted by a film accent. |
| Bounce | Warm ground reflection at the bottom edge; strongest in film chapters. |
| Ambient | Flat floor, 0.11–0.13. |
| Falloff | Preset inverse falloff (1.5–1.7) controlling pool tightness. |
| Shadow | Multiply, opposite the key. |
| Occlusion | Static edge darkening; increases in selected state. |

All six layers are `pointer-events:none`, edge-anchored, and sit at `z-index:75`
— **below** type and grain. No image receives a filter, grade or recolour.

### CSS variables / props controlled

`--light-key-x`, `--light-key-y`, `--light-key-str`, `--light-fill-str`,
`--light-rim-str`, `--light-bounce-str`, `--light-ambient`, `--light-falloff`,
`--light-occlusion`, `--light-accent`, `--light-gradient`, `--fill-gradient`,
`--rim-gradient`, `--light-bounce-gradient`, `--shadow-gradient`,
`--ao-gradient`, plus `--light-cursor-nx/ny` pinned to `0` (pointer influence
removed; retained only so legacy consumers cannot read a stale value).

## 4. Chapter preset table (measured in-browser)

| Preset | Mounted section | Key | Rim | Fill | Bounce | Ambient | Falloff | Accent |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `hero` | `#work` | 0.34 | 0.20 | 0.15 | 0.045 | 0.12 | 1.50 | silver-blue |
| `photography` | `#photography` | 0.30 | 0.22 | 0.14 | 0.035 | 0.13 | 1.60 | sapphire |
| `filmography` | `#filmography` | 0.32 | 0.22 | 0.14 | 0.050 | 0.12 | 1.55 | Delusion oxide* |
| `delusion` | `#delusion-of-negation` | 0.32 | 0.22 | 0.14 | 0.050 | 0.12 | 1.55 | `208 140 126` |
| `zakia` | `#zakias-clock` | 0.31 | 0.21 | 0.14 | 0.045 | 0.12 | 1.60 | `201 164 111` |
| `birth` | `#the-birth-permit` | 0.33 | 0.22 | 0.15 | 0.055 | 0.12 | 1.50 | `226 174 116` |
| `featured` | `#featured-project` | 0.32 | 0.20 | 0.13 | 0.045 | 0.12 | 1.50 | Delusion oxide |
| `profile` | `#about` | 0.28 | 0.18 | 0.13 | 0.040 | 0.12 | 1.60 | silver-blue |
| `contact` | `#contact` | 0.26 | 0.16 | 0.12 | 0.035 | 0.11 | 1.70 | sapphire |
| `archive` | Overlay scrim (fallback) | 0.20 | 0.16 | 0.10 | 0.020 | 0.08 | 2.00 | sapphire |

\* The filmography chapter adopts the last film preset in view, so its rim tint
matches the film being read. Accent remains **provisional** per Phase 02.

## 5. State model

| State | Behaviour | Evidence |
|---|---|---|
| `idle` | Chapter preset at rest | Stable across 1.4 s; no value drift |
| `selected` (photo) | Key +18 %, rim +25 %, occlusion +20 %, accent ×1.3 | key 0.3000 → 0.3434; rim 0.2200 → 0.2643 |
| `selected` (film) | Same model, film accent rim | key 0.3200 → 0.3776 |
| close / unmount | Restores exactly | 0.3200 → 0.3776 → **0.3200** |
| chapter change | 700 ms eased crossfade, then stop | Visual + measured |

Highlight response is therefore tied to **meaningful state**, not random motion.
There is no breathing, pulse, drift or pointer tracking anywhere in the code.

## 6. Performance

| Item | Result |
|---|---|
| Engines | 1 (existing class, extended) |
| CSS layer sets | 1 (six surfaces, one mount) |
| Listeners | 1 `ethereum:light`-style custom listener + 1 IntersectionObserver; both removed on unmount |
| Idle RAF | None scheduled after crossfade completes; values stable when idle |
| Crossfade RAF | Only for ~700 ms per preset/state change |
| Gradient writes | 10 custom properties per animation frame during a crossfade only |
| Document size | 2,418,770 bytes (was 2,409,330 before Phase 04) |
| Console errors | 0 |
| Console/overflow | 0 errors; 0 horizontal overflow at all seven viewports |

`contain: strict` on `.lighting-layer`; no filters, no backdrop filters, no extra
canvases; `will-change` limited to the six fixed surfaces.

## 7. Reduced motion & low power

| Condition | Behaviour | Verified |
|---|---|---|
| `(pointer: coarse)` / touch | `data-lighting="static"`, engine not mounted | mobile: lighting `static`, layer `0` |
| `navigator.connection.saveData` | Static | policy branch |
| `hardwareConcurrency <= 2` | Static | policy branch |
| `prefers-reduced-motion: reduce` | `data-lighting="reduced"`, **one static frame**, transition `0s`, no RAF crossfade | layer 1, key 0.3400, stable across 900 ms |
| Desktop capable | `data-lighting="active"`, presets + states | 6 surfaces, all presets measured |

The static path preserves the authored atmosphere (background, bloom,
vignette, grain); it simply skips the extra light surfaces.

## 8. Compositing measurements

Edge-region luminance with lighting off → on, sampled from rendered PNGs:

| Section | Luminance off | Luminance on | Δ |
|---|---:|---:|---:|
| Hero | 0.0025 | 0.0029 | +16 % |
| Photography | 0.0013 | 0.0017 | +31 % |
| Filmography | 0.0020 | 0.0024 | +20 % |
| Featured | 0.0020 | 0.0023 | +15 % |
| About | 0.0020 | 0.0024 | +20 % |
| Contact | 0.0020 | 0.0022 | +10 % |

Delusion rim region (right edge, 200×300 px): base RGB `5.2, 8.4, 13.3` → light
`22.5, 19.0, 22.1` (**+17.3 / +10.6 / +8.8**). The warm rim is clearly present
but confined to the edge; it does not cross the text column or the stills.

Text contrast is **unchanged** because the light layers are edge-biased and sit
below type: measured hero heading 11.42:1, film logline 14.72:1, About body
11.42:1 — identical to the non-lit render.

## 9. Before/after screenshots

`evidence/phase-04/`:

- `light-onoff-hero.jpg` — 1440 and 1920 hero, off/on
- `light-onoff-photo.jpg` — photography and About
- `light-onoff-film.jpg` — filmography and featured
- `light-onoff-zoomed.jpg` — left-edge crop, hero off/on
- `film-rim-comparison.jpg` — film right-edge, off/on, plus Zakia and Birth
- `light-mobile.jpg` — phone chapters
- `screens/` — full set at 1920, 1440, 1024, 768, 390, 360 and 844×390, with
  `__light` and `__base` variants
- `verify.json`, `background-delta.json`, `contrast.json`, `capture.json`,
  plus the capture/verification scripts

## 10. Typecheck / build

```
npx tsc --noEmit  → clean
npm run build     → dist/index.html only
                     2,418,770 bytes (1,457,690 gzip)
sha256            256f4e90e796c884194743cdbffaa84075df1f30d6ad04485873db30abcf4061
```

## 11. Integrity

Unchanged (verified by checksum):

- `src/audio/SoundEngine.ts` `c3c973dc…`
- `src/utils/media.ts` `4a2306c1…`
- `src/data/photographyManifest.ts` `c8294c7b…`
- `src/data/filmStills.ts` `27f48ecc…`
- `src/data/birthPermit.ts` `118a9d78…`
- `src/assets/portraitInline.ts` `11e1ed4e…`

No filter, grade or recolour is applied to any master photograph or film still.
Sphere 36 cards / 3 ribbons / 122 frames unchanged.

## 12. Known limitations

1. Headless Chromium reports low core counts, so automated captures need the
   hardware-concurrency override to exercise the active path; real desktops are
   unaffected by this test harness detail.
2. The `archive` preset exists as a defined fallback but the full-screen archive
   overlays keep their own opaque scrim; lighting is not applied over them by
   design (archives are reading surfaces).
3. Film accents remain provisional pending owner visual review.
4. Filmography archive scroll-lock and phone hero composition remain carried
   Phase 03 defects, untouched here.
5. No physical-device GPU profiling was performed; the low-power policy is
   heuristic (pointer type, save-data, core count), not a measured benchmark.

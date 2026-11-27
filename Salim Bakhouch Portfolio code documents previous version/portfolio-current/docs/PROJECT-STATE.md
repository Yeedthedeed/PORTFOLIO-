# Project state — Salim Bakhouch Portfolio Website

**Definitive snapshot.**

Use this file when you need facts rather than narrative. It describes the code exactly as it
stands in this repository snapshot.

**Version 1.0.0** · production build passing · not yet publicly published from this snapshot.

---

## Build facts

| Item | Value |
| --- | --- |
| Entry | `index.html` → `src/main.tsx` → `src/App.tsx` |
| Framework | React 19.2 · Vite 7.3 · TypeScript 5.9 |
| Styling | Hand-written CSS in `src/index.css` (~3.5k lines) + Tailwind utilities in markup |
| Animation | Framer Motion · one RAF loop per spatial surface · Lenis smooth scroll |
| Build output | **`dist/index.html` only** (single-file; ≈1.94 MB / ≈1.11 MB gzip) |
| Baked previews | **203** (`previewAssets.ts` 160 + `birthPermitPreviews.ts` 43) |
| External media | GitHub CDN (jsDelivr primary, GitHub raw + statically fallbacks) |
| Type gate | `npx tsc --noEmit` — clean |
| Secrets | None. No API keys, tokens or env vars. |

---

## Mounted source files (45)

Reachable from `src/main.tsx` through static imports:

```text
src/App.tsx
src/audio/SoundEngine.ts
src/components/About.tsx
src/components/AlbumOriginal.tsx
src/components/ArchiveLinks.tsx
src/components/AudioToggle.tsx
src/components/Background.tsx
src/components/ChapterRail.tsx
src/components/CustomCursor.tsx
src/components/DevelopReveal.tsx
src/components/FeaturedProject.tsx
src/components/FilmDetail.tsx
src/components/FilmRibbonPair.tsx
src/components/FilmSections.tsx
src/components/FilmSphere.tsx
src/components/FilmSpiral.tsx
src/components/FilmographyGallery.tsx
src/components/Footer.tsx
src/components/HeroText.tsx
src/components/LightingLayer.tsx
src/components/Loader.tsx
src/components/Marquee.tsx
src/components/MediaImage.tsx
src/components/MetaCard.tsx
src/components/MobileDock.tsx
src/components/Nav.tsx
src/components/PhotographyGallery.tsx
src/components/Portrait.tsx
src/components/ScrollSphere.tsx
src/components/Viewfinder.tsx
src/data/birthPermit.ts
src/data/birthPermitPreviews.ts
src/data/filmStills.ts
src/data/photographyManifest.ts
src/data/previewAssets.ts
src/data/previews.ts
src/hooks/useDeviceLayout.ts
src/hooks/useLenis.ts
src/hooks/useMouse.tsx
src/hooks/useSoundEvents.ts
src/index.css
src/lighting/LightingEngine.ts
src/main.tsx
src/utils/media.ts
```

Plus `src/vite-env.d.ts` (ambient typings, not imported).

---

## Unmounted files (19) — preserved, not in the bundle

Nothing in the mounted graph imports these (19 files). They are earlier explorations kept for reference.
Deleting them is safe; re-run `npx tsc --noEmit` afterwards.

```text
src/components/Arrival.tsx
src/components/AtmosphereCanvas.tsx
src/components/Cursor.tsx
src/components/Endcard.tsx
src/components/ForegroundLayer.tsx
src/components/Index.tsx
src/components/Presence.tsx
src/components/Sequence.tsx
src/components/SoundToggle.tsx
src/components/Statement.tsx
src/components/Works.tsx
src/components/layers/AtmosphericHaze.tsx
src/components/layers/BloomLight.tsx
src/components/layers/GradientBase.tsx
src/components/layers/Grain.tsx
src/components/layers/Particles.tsx
src/motion.ts
src/utils/cn.ts
src/vite-env.d.ts
```

---

## Content inventory

### Photography
| Item | Count |
| --- | --- |
| Photographs | 81 |
| Albums | 16 (some nested via `parent_album_id`) |
| Collections | 10 |
| Sphere selection | 36 (`sphere_slot` 1–36) |

### Film
| Film | Credit | Stills | Watch |
| --- | --- | --- | --- |
| Delusion of Negation | Director & Screenwriter | 29 | On-site featured project |
| Zakia's Clock | Director of Photography & Colorist | 50 | Google Drive screening |
| The Birth Permit | First Assistant Director | 43 | `https://vimeo.com/1185788174?fl=pl&fe=sh` |

Loglines for all three live in `src/components/FilmSections.tsx`
(Birth Permit's also in `src/data/birthPermit.ts`).

---

## Spatial engines

### Photography sphere (`ScrollSphere.tsx`)

- 36 frames on a golden-angle distribution; per-card Lissajous float.
- Transform order: `translate3d(x,y,z) translate(-50%,-50%) scale(s)`.
- Click → ring animation (`FORM_DUR 0.50s`, `SPIN_DUR 0.55s`) → album viewer.
- Cards use `photoThumb()` (baked preview); viewer uses `photoSrc()` (master).
- One RAF loop; pauses off-screen, on hidden documents, and while an overlay covers it.

### Film ribbons (`FilmSpiral.tsx`)

- Shared geometry for all three films: height `720`, radius `240`, depth `165`,
  perspective `920`, pinch `0.4`, s-curve `0.4`.
- Canonical shape: height `720`, radius `240`, depth `165`, pinch `0.4`.
- Density: `turns = 2.9 × (stills − 1) / 28`, capped at `MAX_TURNS = 4.35` (The Birth Permit's
  winding). Delusion 2.90, Birth 4.35, Zakia 4.35 — so the two 40+ ribbons are geometrically
  identical in shape, rotation and frame size; Zakia's 50 stills sit ≈14% closer than 43.
- Motion: shared reel clock (`advanceIdle` / `freezeIdle`), velocity clamp ±0.08,
  tilt clamp ±0.38, pointer capture, eased one-still keyboard stepping.
- Frames sized from orbit scale through CSS variables `--ribbon-frame-w` / `--ribbon-frame-h`.
- Hold 380 ms → editorial note (`is-held`), click suppressed so the viewer does not open.
- One RAF loop per ribbon; paused off-screen/hidden/covered/reduced-motion.

### Audio (`SoundEngine.ts`)

Single singleton `sfx`. Ambient on by default; unlocks on first gesture; explicit mute persists;
`setVolume` + `cine-volume`; `subscribe()` keeps all `AudioToggle` instances in sync;
`section(tone)` re-tunes the existing bed (never restarts); `develop()` accompanies reveals.

---

## Device compositions

| View | Trigger | Distinguishing features |
| --- | --- | --- |
| Desktop | >1180 fine pointer | Header nav, fixed hero captions, chapter rail, side-by-side archive |
| Tablet | 721–1180, or coarse ≤1400 | Floating pill dock, nameplate hero, wider ribbons, 3-column archive |
| Phone | ≤720, or coarse short side <600 | Bottom chapter dock, stacked ribbons, compact hero, 2-column archive |

Classification is also written to `<html data-layout>` by an inline bootstrap in `index.html`.

---

## Verification performed

- `npx tsc --noEmit` — clean.
- `npm run build` — clean; single-file artefact.
- HTTP smoke test of `dist/` — 200, correct title, 203 previews, no local asset paths.
- Geometry simulation of all three ribbons at four viewports — even spacing, no clipping.
- `portfolio-current/` snapshot type-checked and built independently (symlinked deps).
- Static audit of 30+ behaviours (audio lifecycle, hold interaction, keyboard, ARIA, layout).
- **Not performed:** visual/audio regression on real devices (no browser engine available).

---

## Outstanding items

1. Publish `dist/` to a public host and verify in a private window.
2. Push this snapshot to GitHub (no credentials were available at handoff time).
3. Optional: add a direct Delusion of Negation watch URL.
4. Optional: delete unmounted legacy components.
5. Optional: add Playwright screenshot tests.

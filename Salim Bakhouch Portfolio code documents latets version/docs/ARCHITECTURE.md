# Architecture

## Stack

- **React 19** with function components and hooks.
- **Vite 7** with `vite-plugin-singlefile`: production output is one `dist/index.html`.
- **TypeScript** strict mode (`npx tsc --noEmit` is the type gate).
- **Framer Motion** for component transitions, the loader, and overlays.
- **Hand-written CSS** (`src/index.css`) for tokens and layouts; small Tailwind utilities are used in markup.
- **Custom DOM + RAF** for the two spatial galleries. React renders the chrome; the galleries
  create and mutate their cards directly for performance.

## Composition tree

```text
App
├── MouseProvider                 normalized cursor motion values
├── Background                    fixed atmospheric canvas (single RAF)
├── Loader                        short cinematic intro
├── Nav                           wordmark, chapter links, menu, audio, layout preview
├── main
│   ├── #work                     hero: MetaCard + HeroText + Portrait(Viewfinder)
│   ├── Marquee
│   ├── #photography              ScrollSphere (3D photography sphere)
│   ├── #filmography              FilmSphere → FilmSections
│   │                               ├ 01 Delusion of Negation  → FilmSpiral
│   │                               ├ 02 Zakia's Clock         → FilmSpiral
│   │                               └ 03 The Birth Permit      → FilmSpiral
│   ├── #featured-project         FeaturedProject (real poster + credits)
│   ├── ArchiveLinks              opens full-screen archives
│   ├── #about                    About
│   └── #contact                  Footer
├── MobileDock                    phone bar / tablet floating pill (CSS decides)
├── LightingLayer                 procedural three-point light (disabled on touch)
├── overlays: bloom, scanlines, vignette, grain
├── CustomCursor
├── PhotographyGallery (overlay)
└── FilmographyGallery (overlay)
```

Both overlays are rendered through `AnimatePresence`; gallery dialogs and media viewers are
portalled to `document.body` where needed so they always sit above page content.

## State model

`App` owns only three pieces of UI state:

| State | Type | Meaning |
| --- | --- | --- |
| `loading` | boolean | loader visibility |
| `showPhotography` | boolean | photography archive overlay |
| `showFilmography` | boolean | film archive overlay |

Everything else is local to a component. Heavy interaction state (rotation, momentum, depth,
load queues) deliberately lives in `useRef` or closures inside the RAF engine so it never
causes React re-renders.

`useDeviceLayout()` sets `<html data-layout="phone|tablet|desktop">` and manages a persisted
preview override. CSS media queries implement the actual layout; the attribute is for
diagnostics and manual previews (see [DEVICES.md](DEVICES.md)).

## The two spatial engines

### Photography sphere — `ScrollSphere.tsx`

- Fibonacci/golden-angle distribution (`GOLDEN`) over 36 slots.
- Per-card Lissajous micro-float, global `Ry · Rx` rotation.
- Card transforms are written with:
  `translate3d(x,y,z) translate(-50%,-50%) scale(s)` — translate **before** scale so the card
  centre is mathematically on its orbit point.
- Depth drives opacity and z-index only; photographs are never blurred or graded.
- Click runs a **ring animation** (`FORM_DUR = 0.5s`, `SPIN_DUR = 0.55s`) then opens the viewer.
- The engine pauses when the section is off-screen or the document is hidden, and throttles to
  ~30fps on coarse pointers.

### Film ribbons — `FilmSpiral.tsx`

- Ribbon geometry: `height 720`, `radius 240`, `depth 165`, `turns 2.9`, `perspective 920`;
  end pinch `0.4`, S-curve `0.4`. All three films share this one configuration.
- Idle rotation is driven by a module-level shared reel clock (`advanceIdle` / `freezeIdle`)
  so visible ribbons turn in unison and never jump when they resume.
- `measure()` publishes `--ribbon-frame-w` / `--ribbon-frame-h`; a single CSS rule overrides
  every historical fixed clamp, giving all ribbons the same proportional clearance.
- **Canonical ribbon shape.** All three films share one geometry: height `720`, radius `240`,
  depth `165`, pinch `0.4`, s-curve `0.4`, perspective `920`. Winding grows with the still count
  but is **capped at `MAX_TURNS = 4.35`** — the winding of *The Birth Permit* (43 stills):
  - Delusion of Negation (29) → 2.90 turns (naturally below the ceiling)
  - The Birth Permit (43) → 4.35 turns (defines the ceiling; unchanged)
  - Zakia's Clock (50) → 4.35 turns (capped, so it inherits the same shape, rotation
    distance, movement and footprint instead of gaining extra revolutions)
  Zakia keeps all 50 originals; with the orbit, frame size and revolutions held equal, its
  frames sit ≈14% closer than the 43-frame ribbon — the only possible difference.
  There is **one** code path — no per-film geometry flags, no special-case props.
- Momentum uses `idle 0.0019`, `cursorH 0.015`, `cursorV 0.006`, `friction 0.88`.
- Drag is elastic on mouse (`grabX/Y` spring) and direct on touch.
- In the open film archive the wheel advances the reel; on the landing page the wheel is never
  captured, so page scrolling is untouched.
- One RAF loop per ribbon, paused off-screen/hidden/covered/reduced-motion.

## Media resolution

`src/utils/media.ts` is the only place that decides where an image URL comes from.

| Helper | Used by | Returns |
| --- | --- | --- |
| `photoThumb` | sphere card, archive tiles, filmstrip | baked preview (Base64 WebP) |
| `photoSrc` | viewers, final sphere upgrade | pristine master |
| `filmThumb` | ribbon frames | baked preview |
| `filmSrc` | film detail viewer | pristine master |
| `preloadOriginal` | viewer + sphere upgrade | cached decoded master promise |
| `PORTRAIT_SRC` / `POSTER_SRC` | hero / featured project | master via jsDelivr CDN |

See [MEDIA.md](MEDIA.md) for the full delivery policy.

## Overlay and z-index contract

| Layer | z-index |
| --- | --- |
| Background | 0 |
| Page sections | 5–30 |
| Header | 40 |
| Mobile/tablet dock | 95 |
| Overlays (bloom/vignette/grain) | 75–90 |
| Photography sphere viewer | 140 |
| Archive overlays | 200 |
| Film detail viewer | 300 |
| Custom cursor | 9990–9997 |
| Skip link | 999 |

Dialogs set `data-lenis-prevent` so their internal scrolling works with smooth scrolling active.

## Rendering and accessibility

- Galleries are DOM-created for performance but expose `role="button"`, `aria-label`, keyboard
  handlers and roving tab stops exactly like React buttons.
- The sphere renders 36 tab stops; the film ribbons use a roving tab stop (one per ribbon).
- All dialogs trap focus, restore focus on close, and layer `Escape` so only the topmost closes.
- The skip link targets `#main`.

See [ACCESSIBILITY.md](ACCESSIBILITY.md).

## Build output

```bash
npm run build
# dist/index.html
```

`viteSingleFile` inlines JS, CSS, and baked Base64 previews. There are no runtime file
dependencies for gallery imagery; masters come from the CDN. This guarantees the galleries can
never load partially because of a missing asset path.

## Immersive interface layer

| Piece | File | Behaviour |
| --- | --- | --- |
| Chapter rail | `ChapterRail.tsx` | Six chapters, `aria-current`, progress fill, ambient tone per chapter |
| Develop reveal | `DevelopReveal.tsx` | Clip wipe + one light sweep; plays `develop()`; instant under reduced motion |
| Depth lighting | engine `data-depth` → CSS | Five quantised bands drive rim/shadow/highlight per frame |

`FilmSpiral` and `ScrollSphere` write `data-depth` only when the band changes, so the lighting
costs nothing beyond the existing transform writes.

## Image quality contract

| Surface | First paint | Final state |
| --- | --- | --- |
| Sphere landing cards | baked preview | baked preview (no master downloads while rotating) |
| Sphere viewer | preview behind spinner | pristine master |
| Photography archive tiles | baked preview (instant) | pristine master via `ProgressiveImage` |
| Photography lightbox | baked preview (instant) | pristine master via `ProgressiveImage` |
| Film ribbon frames | untouched original (2-request, front-facing only) | untouched original |
| Film viewer | spinner | pristine master |
| Hero portrait / poster | master from CDN | master |

`ProgressiveImage` upgrades archive tiles only when they approach the viewport, with a
three-request queue. The sphere intentionally stays light. See [MEDIA.md](MEDIA.md).

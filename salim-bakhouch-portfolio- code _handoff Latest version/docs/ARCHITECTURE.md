# ARCHITECTURE

React 19 · TypeScript 5.9 · Vite 7 · Tailwind 4 · Framer Motion · GSAP · Lenis.
`vite-plugin-singlefile` produces one `dist/index.html`.

## Composition

`src/main.tsx` wraps `App` in `LightboxProvider`. `App.tsx` mounts `Background`
(Optical Aperture), `Loader`, `Nav`, hero (`MetaCard`, `HeroText`,
`ChapterGeometry` hero only, `Portrait` + `Viewfinder`), `Marquee`,
`ScrollSphere`, `FilmSphere` → `FilmSections`, `FeaturedProject`, `ArchiveLinks`,
`About`, `Footer`, `ChapterRail`, and the archive portals.

## Background — one system

`Background.tsx` renders the Optical Aperture: base field, two diagonal light
planes, an SVG aperture of three incomplete concentric arcs (r 536/612/702), a
masked sapphire halo, a secondary arc plus axis, one warm intersection, and a
static grain layer. 36 SVG nodes, no canvas, no RAF. Scroll choreography uses
CSS `animation-timeline: scroll(root)` only; unsupported browsers and reduced
motion receive a complete static state. Grain lives inside the field at z-0 so
it never sits above photography.

**Sections paint translucent tints, not opaque backgrounds** — that is what lets
the fixed field be the environment everywhere. Painting sections opaque at
z-10 previously hid the aperture entirely (fixed and verified in Phase 06).

## Spatial engines

One RAF each for `ScrollSphere` and every `FilmSpiral`; paused when off-screen,
hidden or covered. Ribbon geometry constants are shared and untouched by all
colour/spacing work; chapter stage sizing is what has changed, never the
geometry.

## Filmography structure

`FilmSections` renders three stacked `.film-section-row` chapters, each with its
own `FilmSpiral`. Per-frame captions and hold-notes are **not created** in
`buildFrame()`. Rows are transparent, borderless, and sit on the shared
`#filmography` gradient. **Known:** an empty `.chapter-geometry` wrapper is
still mounted per row and a broad `.film-section-row > * { position: relative }`
rule makes it occupy flow height (~188 px/row) — the deferred spacing task.

## Media

`src/utils/media.ts` is the only resolver (jsDelivr → raw → statically, with
MIME repair). Baked previews live in `src/data/previewAssets.ts` and
`birthPermitPreviews.ts` (generated, committed). Viewers use masters. The hero
uses an embedded 1312×1199 delivery copy with the master as fallback.

## Audio

One `CinemaAudioEngine` (`src/audio/SoundEngine.ts`), one master bus, persisted
mute/volume, one subscription model.

## Overlays

Portal archives/viewers with focus entry/restoration and Escape. Portfolio ↔
archive uses the View Transitions API (`src/utils/transition.ts`) with graceful
fallback and reduced-motion opt-out.

## Preserved / unmounted

`CustomCursor`, `Cursor`, `Arrival`, `AtmosphereCanvas`, `LightingLayer`,
`LightingEngine`, `ChapterLight`, `MobileDock`, `Sequence`, `Works`, `Index`,
`Presence`, `Statement`, `Endcard`, `ForegroundLayer`, `SoundToggle`,
`components/layers/*`. Do not delete.

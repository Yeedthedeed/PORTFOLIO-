# ARCHITECTURE — CURRENT APPROVED SOURCE

**Source root:** this project folder. The repository root is not the Vite application root.  
**Stack:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind 4 · Framer Motion · GSAP · Lenis.  
**Production artifact:** one self-contained dist/index.html via vite-plugin-singlefile.

## Composition

src/main.tsx wraps App in LightboxProvider. App composes:
- Background — fixed Optical Aperture field.
- Loader and Nav.
- Hero / Work — ChapterGeometry hero, MetaCard, HeroText, Portrait and Viewfinder.
- Marquee.
- ScrollSphere — photography sphere.
- FilmSphere → FilmSections → three FilmSpiral ribbons.
- FeaturedProject.
- ArchiveLinks, About and Footer.
- ChapterRail.
- Photography and film archive portals/viewers.

The existing order is intentional. Preserve it unless the owner requests a specific change.

## Background — Optical Aperture / Blue Hour

src/components/Background.tsx is the single global background system.

It renders:
- a deep-blue base field;
- two diagonal light planes;
- one off-axis SVG aperture with three incomplete concentric arcs;
- a short, masked sapphire halo on one arc segment;
- a secondary arc and diagonal axis;
- one small orange intersection;
- one soft mineral-blue environmental pool;
- one static fine-grain layer.

The composition is 36 lightweight SVG nodes according to the implementation report. There is no background canvas and no background RAF. Scroll choreography uses CSS animation-timeline: scroll(root), with a complete static fallback where unsupported and under reduced motion.

The grain is inside .optical-field at z-index 0. Legacy global .grain, .scanlines and .vignette overlays are not mounted and are hard-disabled in the final stylesheet. Never reintroduce a global texture or light layer above photographs.

Sections use translucent background tints so the fixed aperture remains visible behind the page. Opaque section backgrounds previously hid the field. Preserve the translucent treatment and the large negative-space regions.

## Chapter geometry

src/components/ChapterGeometry.tsx contains authored section geometry for supported presets. The filmography preset intentionally renders no geometry because its former rotated plane created a visible light-shape artifact.

App explicitly mounts the hero geometry. Other geometry should only be treated as active where the current source mounts it. Do not infer that a component is active merely because it exists in the source tree.

## Filmography structure

FilmSphere mounts FilmSections. FilmSections renders three stacked .film-section-row chapters, each with its own existing FilmSpiral.

- Per-frame captions and hold-note text nodes are not created in FilmSpiral.buildFrame().
- The card's accessible name is provided by aria-label.
- The film chapter's title, credit, index, still count, format, year, logline and actions remain in the section content.
- Rows are transparent and borderless, on the shared filmography field.
- Filmography does not mount a ChapterGeometry element.
- The stylesheet retains a defensive .film-section-row > .chapter-geometry absolute-position rule so a future accidental wrapper cannot reserve flow height.
- The empty-wrapper/vertical-spacing defect is fixed. Project-state measurements record rows near 798 / 830 / 830 px and total filmography near 2,934 px in the measured desktop condition. Do not describe the old ~188 px-per-row issue as open.

### Film ribbon engine

FilmSpiral creates the frame cards and owns the shared ribbon motion/interaction. Preserve:
- canonical shared spiral geometry and still ordering;
- drag, keyboard and pointer-release selection behaviour;
- depth-driven frame scaling/opacity and five-band data-depth state;
- one RAF per spatial ribbon;
- visibility/off-screen/covered/reduced-motion pause behaviour;
- preview loading and media-resolver paths;
- accessible card labels and viewer integration.

Do not modify geometry to compensate for a CSS spacing issue.

## Photography sphere

ScrollSphere provides the 36-photo Fibonacci-distributed sphere and viewer integration. Preserve geometry, physics, selection, image order and album relationships. The sphere pauses when it is off-screen or an archive is covering it.

## Media architecture

src/utils/media.ts is the sole resolver for original and preview media. Baked previews live in committed TypeScript data modules, including previewAssets.ts and birthPermitPreviews.ts. Masters remain unchanged and are used for the large viewers. Do not introduce runtime dependencies on ephemeral preview folders or raw master URLs in components.

## Data and content

- Photography: 81 photographs, 16 albums, 10 collections, 36 sphere selections.
- Films: 29 Delusion, 50 Zakia, 43 Birth Permit = 122 stills.
- Baked gallery previews: 203.

Do not change manifest schemas, identifiers, image URLs/order, album relationships or canonical data without owner direction.

## Audio

One engine: src/audio/SoundEngine.ts. It owns ambient audio, sound effects, gain, mute and volume persistence. Do not add another audio runtime or independent event bus. The prior handoff records that the sound was not auditioned; audio quality is not certified until heard and checked.

## Overlays and transitions

Archive and viewer surfaces use the existing portals, focus handling, Escape layering and scroll restoration. Portfolio/archive transitions use src/utils/transition.ts and the View Transitions API with a graceful fallback and reduced-motion opt-out. Preserve the shared behaviour.

## Preserved but unmounted/disabled components

The source tree contains legacy exploratory components and the former global lighting system, including LightingEngine, LightingLayer, ChapterLight, CustomCursor, Cursor, Arrival, AtmosphereCanvas, MobileDock, Sequence, Works, Index, Presence, Statement, Endcard, ForegroundLayer, SoundToggle and components/layers/*.

Do not mount or delete these simply because they exist. The current approved composition intentionally uses one Optical Aperture background system and does not use the rejected global lighting rig or a lighting playground.

## Performance, accessibility and release

- One background system; no background RAF/canvas.
- One RAF per existing spatial gallery surface.
- No React state updates inside gallery RAF loops.
- Reduced motion receives a complete static background.
- Preserve pointer-events:none on decorative background elements.
- Keep contrast and keyboard focus visible.
- Keep one dist/index.html production output.
- Before release, run npx tsc --noEmit, npm run build, seven-viewport overflow/console checks, asset integrity and reduced-motion checks.
- No deployment without explicit owner approval.

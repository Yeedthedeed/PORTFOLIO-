# Components

All components are TypeScript React function components. This file is the contract map; see
`docs/ARCHITECTURE.md` for how they compose.

## Entry and chrome

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/App.tsx` | Page composition, overlay state, device layout bootstrap | Owns only loader/archive booleans |
| `Nav.tsx` | Wordmark, chapter links, menu, audio, layout preview, Phone view | Tap-to-toggle menu; Escape closes |
| `MobileDock.tsx` | Phone chapter bar / tablet floating pill | Active section via IntersectionObserver, hairline reading progress |
| `ChapterRail.tsx` | Desktop chapter index, progress, ambient section tone | Hidden ≤1180px and on coarse pointers |
| `DevelopReveal.tsx` | Darkroom type reveal | clip wipe + light sweep + `develop()` sound; instant under reduced motion |
| `ProgressiveImage`/`AlbumOriginal` | Archive masters | Preview-first then original; multi-host + MIME repair |
| `MediaImage.tsx` | Single-master image | One fallback host, no resampling |
| `FilmSections.tsx` | Landing filmography: three stacked films | Opens the in-site stills showcase per film |
| `FilmStillsShowcase.tsx` | In-site stills album grid | Originals via `AlbumOriginal`; opens `FilmDetailOverlay` |
| `FilmographyGallery.tsx` | Full filmography archive | Split pair + scroll-down Birth Permit ribbon |
| `AlbumOriginal.tsx` | Archive master-image loader | Viewport gated, 4 concurrent, multi-host + blob repair |
| `Loader.tsx` | Short cinematic intro | Must never wait on large downloads |
| `CustomCursor.tsx` | Cinematic cursor states incl. viewfinder reticle | `data-cursor` driven |
| `AudioToggle.tsx` | Global mute + volume control; subscribes to the shared engine so every mount stays in step |

## Hero

| File | Responsibility |
| --- | --- |
| `Portrait.tsx` | 100svh portrait stage, parallax, halo, lighting overlays, viewfinder hit zone |
| `Viewfinder.tsx` | Pure SVG cinema EVF HUD; parent controls reveal |
| `HeroText.tsx` | Desktop captions, compact phone caption, tablet nameplate, scroll cue |
| `MetaCard.tsx` | Landing project slate |

## Photography

| File | Responsibility |
| --- | --- |
| `ScrollSphere.tsx` | 36-photo golden-angle sphere + album viewer. Preview → original upgrade, lazy queue, keyboard, ring-open animation |
| `PhotographyGallery.tsx` | Album browser and lightbox with full curation |

`ScrollSphere` contracts:

- Uses `SPHERE_SELECTION.slice(0, N)`; `N = 36`.
- Card transform order: `translate3d → translate(-50%,-50%) → scale`.
- Click runs the ring animation then opens the album viewer.
- Previews only on the landing sphere; the viewer loads the pristine master.
- No master downloads while rotating — this keeps the landing page fast.
- One RAF loop; pauses off-screen/hidden/covered/reduced-motion.

## Film

| File | Responsibility |
| --- | --- |
| `FilmSphere.tsx` | Landing filmography section wrapper |
| `FilmRibbonPair.tsx` | Splits stills per film, renders two panels, coordinates detail state |
| `FilmSpiral.tsx` | The ribbon engine (one instance per film) |
| `FilmDetail.tsx` | Accessible film-still viewer; master image with loading state |
| `FilmographyGallery.tsx` | Full-screen film archive using the same pair |

`FilmSpiral` contracts:

- Geometry: height 720, radius 200, depth 140, turns `2.9 × density`.
- Movement: cursor steer, elastic drag, direct touch orbit, roving focus.
- Wheel advances the reel **only** in the archive.
- Previews are baked; masters only on open.

## Editorial sections

| File | Responsibility |
| --- | --- |
| `FeaturedProject.tsx` | Real *Delusion of Negation* poster + credits |
| `ArchiveLinks.tsx` | Large archive entry links |
| `About.tsx` | Profile, stats, biography |
| `Footer.tsx` | Contact, socials, legal |
| `Marquee.tsx` | Discipline ticker |
| `Background.tsx` | Fixed procedural atmosphere (single RAF) |
| `LightingLayer.tsx` | Three-point cinematic light engine |

## Shared media

| File | Responsibility |
| --- | --- |
| `MediaImage.tsx` | Original-file image with one fallback host |

Never put photographic filters (`grayscale`, `contrast`, `brightness`, `blur`) on gallery
images. Display-only transforms (scale, opacity, layout) are allowed.

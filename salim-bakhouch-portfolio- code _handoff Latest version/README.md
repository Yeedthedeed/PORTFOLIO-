# ETHEREALISM — Salim Bakhouch Portfolio

**Read [HANDOFF.md](./HANDOFF.md) before editing.** It is the current owner-approved contract: source location, deployment identity, creative direction, invariants, open decisions and next-agent workflow.

Cinematic photography and film portfolio for Salim Bakhouch. The approved visual identity is **one blue world, silver/pearl typography and one restrained orange counterlight; the photographs are always the subject.**

## Current project identity

| Item | Current value |
|---|---|
| Owner-designated working/review URL | **https://etherealism-final.deed.page/** |
| Repository | https://github.com/Yeedthedeed/PORTFOLIO- |
| Authoritative source folder | This folder: `salim-bakhouch-portfolio- code _handoff Latest version/` |
| Main branch head inspected before documentation refresh | `447b4cda948a7ab3afe44f95705bb9ad5ec19b1e` |
| Approved build recorded in project QA | 2,428,266 bytes |
| Approved build SHA-256 | `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c` |
| Build output | One self-contained `dist/index.html` |

The URL above is the current owner-designated working/review URL. It is not necessarily the canonical SEO URL. The canonical, Open Graph and structured-data metadata still point at the older e0d2e5c9 URL; see HANDOFF.md and docs/DEPLOYMENT.md. Do not alter or deploy without approval.

## Run locally

Run from this folder, not from the repository root:

~~~bash
npm install
npm run dev
npx tsc --noEmit
npm run build       # dist/ must contain only index.html
npm run preview
~~~

Record the build size and SHA-256. The project handoff records the approved baseline hash; if a fresh checkout produces a different hash, diagnose rather than reverting to an older source folder.

## What the website contains

1. **Hero / Work** — editorial introduction, owner-designated portrait delivery copy with master fallback, Viewfinder interaction.
2. **Photography** — 36-image spatial sphere; archive of 81 photographs, 16 albums and 10 collections.
3. **Filmography** — three stacked film sections with existing spatial ribbons: Delusion of Negation (29), Zakia’s Clock (50) and The Birth Permit (43).
4. **Featured Project** — Delusion of Negation poster and credits.
5. **Archives** — photography and film archive portals, contact-sheet stills showcase and single-still viewer.
6. **About / Contact** — editorial profile and closing contact surface.
7. **Shared systems** — Optical Aperture background, ChapterRail, View Transitions, one global audio engine and existing keyboard/reduced-motion support.

Total film stills: 122. Baked previews: 203.

## Approved visual system

### Colour

Core blue environment: `#050912`, `#081629`, `#0D2340`, `#123858`, `#174B70`. Structural blues: `#3D9FFF`, `#7EC4FF`. Neutral type: `#EDF3F8`, `#A9BBD0`, `#7F93AA`. The restrained orange family is `#793921`, `#A94F32`, `#CD6742`, `#E58359`, `#F2B18F`.

Film micro-signals: Delusion = ice; Zakia = copper; Birth Permit = burnt. They remain small and provisional pending owner confirmation.

### Background

The approved **Optical Aperture / Blue Hour: The Light Score** is already implemented in src/components/Background.tsx and src/index.css. It uses an off-axis incomplete aperture, masked sapphire edge illumination, two diagonal light planes, secondary arc/axis, one warm intersection, a subtle mineral pool and one static grain layer. Geometry is behind the page content; sections use translucent treatments so the aperture remains perceptible through the page.

There is no background canvas or background RAF. Scroll movement is CSS scroll-driven with a complete static fallback. Grain is inside the background, below the photographs.

### Typography and image treatment

The original authored Fraunces / Space Grotesk / JetBrains Mono system and sizes are retained. Do not introduce the rejected Phase 03 type scale.

Film ribbon frames have no repeated per-frame captions or hold-note text nodes. Frame interaction lighting occurs on edges/environment only. Original images are never filtered or graded.

## Source map

- `src/App.tsx` — page composition, navigation, surfaces and transitions.
- `src/components/Background.tsx` — Optical Aperture and background grain.
- `src/components/ChapterGeometry.tsx` — restrained chapter-specific geometry; the filmography preset intentionally renders no geometry.
- `src/components/FilmSections.tsx` — three film records and landing structure.
- `src/components/FilmSpiral.tsx` — shared ribbon engine and DOM-built frame cards.
- `src/components/FilmSphere.tsx` — filmography landing section.
- `src/components/ScrollSphere.tsx` — photography sphere.
- `src/components/FilmographyGallery.tsx`, `FilmStillsShowcase.tsx`, `FilmDetail.tsx` — film archive and viewers.
- `src/components/PhotographyGallery.tsx`, `AlbumOriginal.tsx` — photography archive and originals.
- `src/components/FeaturedProject.tsx` — featured film poster.
- `src/utils/media.ts` — sole media resolver.
- `src/utils/transition.ts` — archive surface transitions.
- `src/audio/SoundEngine.ts` — sole audio engine.
- `src/data/photographyManifest.ts`, `filmStills.ts`, `birthPermit.ts`, `birthPermitRibbon.ts` — canonical data.
- `src/data/previewAssets.ts`, `birthPermitPreviews.ts` — baked previews.

## Non-negotiable invariants

- Never crop, resize, recompress, recolour, filter, grade, regenerate or overwrite master photographs, film stills or poster artwork.
- Do not change manifest schemas, image URLs, order, IDs or album relationships.
- Preserve sphere/ribbon geometry, movement, physics and interactions.
- Keep one audio engine and one background system.
- Keep the single-file production artifact.
- Preserve keyboard, focus, Escape, scroll restoration and reduced-motion behaviour.
- No new simulator, lighting lab, cursor-following light, centre glow, starfield or generic geometric wallpaper.
- Do not deploy, publish a new slug, or alter canonical metadata without explicit owner approval.

## Documentation order

1. [HANDOFF.md](./HANDOFF.md) — master source of truth.
2. [CONTINUATION.md](./CONTINUATION.md) — paste-ready new-agent takeover prompt.
3. [docs/PROJECT-STATE.md](./docs/PROJECT-STATE.md) — current approved state and open items.
4. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — actual code architecture.
5. [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — current URL and deployment constraints.
6. [docs/QA-CHECKLIST.md](./docs/QA-CHECKLIST.md) — release and regression gates.
7. [docs/CHANGELOG.md](./docs/CHANGELOG.md) — decision history.
8. [PHASE-*.md](./) — historical phase records; later records supersede earlier prompts.

## Open items

Canonical SEO metadata still points to the old e0d2e5c9 URL; contact identity contains placeholders; Delusion’s watch action points to the featured section rather than a separately confirmed stream; film accent tiers await owner confirmation; formal portrait delivery-copy acceptance is outstanding; physical-device, screen-reader, CPU-throttling and sound-audition testing are not recorded as complete.

See HANDOFF.md §8. Do not invent details to close these items.

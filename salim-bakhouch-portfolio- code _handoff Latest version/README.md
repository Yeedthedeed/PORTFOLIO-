# ETHEREALISM — Salim Bakhouch Portfolio

> **Read [HANDOFF.md](./HANDOFF.md) first.** It is the contract: only confirmed
> and approved decisions, plus the rejected ones, plus the open items.

Cinematic, blue-monochromatic portfolio for Salim Bakhouch — cinematographer and
director of photography, Berlin / Lisbon. One blue world, silver typography, one
orange counterlight; the photographs are always the subject.

| | |
|---|---|
| **Review deployment** | **https://etherealism-final.deed.page/** (byte-verified) |
| Approved build | 2,428,266 bytes · sha `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c` |
| Stack | React 19 · TS 5.9 · Vite 7 · Tailwind 4 · Framer Motion · GSAP · Lenis |
| Output | one self-contained `dist/index.html` |

## Run

```bash
npm install
npm run dev
npx tsc --noEmit
npm run build     # dist/ must contain only index.html
npm run preview
```

## Source map

- `src/components/Background.tsx` — **Optical Aperture**: base field, two light
  planes, SVG aperture (3 incomplete concentric arcs), masked sapphire halo,
  secondary arc + axis, one warm intersection, static grain. 36 SVG nodes, no
  canvas, no RAF. Scroll via CSS `animation-timeline: scroll(root)`.
- Hero: `Nav`, `HeroText`, `MetaCard`, `Portrait` (master portrait, no halo),
  `Viewfinder`, `ChapterGeometry` (hero only).
- Photography: `ScrollSphere` (36) + `PhotographyGallery` (81 / 16 / 10).
- Film: `FilmSphere` → `FilmSections` (3 stacked), `FilmSpiral` (shared ribbon,
  **no per-frame captions**), `FilmographyGallery` (archive: split pair +
  Birth Permit), `FilmStillsShowcase` (contact-sheet album), `FilmDetail`.
- Editorial: `FeaturedProject`, `ArchiveLinks`, `About`, `Footer`, `ChapterRail`.
- Shared viewer: `src/lib/lightbox.tsx`, `src/hooks/useLightboxBridge.ts`.
- Transitions: `src/utils/transition.ts` (View Transitions API + fallback).
- Audio: `src/audio/SoundEngine.ts` (single engine), `AudioToggle`.
- Media: `src/utils/media.ts` (only resolver), `src/data/preview*.ts` (203).
- Data: `photographyManifest.ts`, `filmStills.ts`, `birthPermit.ts`,
  `birthPermitRibbon.ts`.

## Confirmed design facts

- Palette: `#050912` `#081629` `#0d2340` `#123858` `#174b70` `#286b9b` `#3d9fff`
  `#7ec4ff` `#edf3f8` `#a9bbd0` `#7f93aa`; orange family `#793921` `#a94f32`
  `#cd6742` `#e58359` `#f2b18f`. Delusion = ice, Zakia = copper, Birth = burnt.
- Typography is the **original authored system** — do not introduce a new scale.
- No centre glow, no bloom ring, no cursor light, no visible guides, no bottom
  dock, no cosmic/particle background, no lighting simulator.
- Grain lives inside the background at z-0, never above photographs.
- Sections use translucent tints so the aperture is visible behind all of them.
- Interactions: sphere drag/keys, ribbon drag/keys, stills album, viewers,
  Escape, focus restoration, reduced motion, mute persistence — all preserved.

## Invariants

Never modify masters (no crop, resize, recompress, recolour, filter, grade).
Do not change manifest schemas, album relationships, image order, sphere or
ribbon geometry. One audio engine. One background system. Single-file build.
No new 3D libraries. No deployment without explicit approval.

## Docs

`HANDOFF.md` (contract) · `CONTINUATION.md` (paste-ready brief) ·
`docs/PROJECT-STATE.md` · `docs/ARCHITECTURE.md` · `docs/DEPLOYMENT.md` ·
`docs/AUDIO.md` · `docs/QA-CHECKLIST.md` · `docs/CHANGELOG.md` · phase reports
`PHASE-*.md` (history; later phases supersede earlier ones).

## Open items

Canonical URL ·
placeholder contact identity · Delusion screening URL · film accent
confirmation · formal portrait-copy acceptance. See `HANDOFF.md` §8.

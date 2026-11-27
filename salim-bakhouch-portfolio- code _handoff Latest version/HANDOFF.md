# ETHEREALISM — HANDOFF (CONFIRMED / APPROVED STATE)

**Read this first. Then `README.md`, `CONTINUATION.md` and `docs/`.**
This file records only what the owner has confirmed or approved. Rejected
directions are listed separately so they are not reintroduced.

| Field | Value |
|---|---|
| Review deployment | **https://etherealism-final.deed.page/** (byte-verified; includes the spacing fix) |
| Local build | `dist/index.html` · 2,428,266 bytes · sha `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c` |
| Type check / build | clean / pass |
| Stack | React 19 · TypeScript 5.9 · Vite 7 · Tailwind 4 · Framer Motion · GSAP · Lenis |
| Output | one self-contained `dist/index.html` (`vite-plugin-singlefile`) |
| Git | not initialised in this workspace (resets); identity is by build hash |
| Canonical URL | **still the old `…e0d2e5c9.deed.page` — open defect, see §8** |

---

## 1. Approved identity

**One blue world, silver typography, one orange counterlight, photographs are
the subject.** The work must always outrank the interface.

- Environment: abyss `#050912` → midnight navy `#081629` → deep blue `#0d2340` →
  mineral `#123858` → cobalt `#174b70`.
- Structure/accent: sapphire `#3d9fff`, ice `#7ec4ff`.
- Type: pearl `#edf3f8`, silver `#a9bbd0`, mist `#7f93aa`.
- Contrast orange, one hue family only: ember `#793921`, burnt `#a94f32`, copper
  `#cd6742`, tangerine `#e58359`, apricot `#f2b18f`.
- Typography: **original authored sizes and the blue–white split.** Explicitly
  restored after Phase 03; do not re-apply a new type scale.

## 2. Approved page composition (unchanged order)

`Background` (Optical Aperture) → `Loader` → `Nav` → hero `#work` (`MetaCard`,
`HeroText`, `Portrait` + `Viewfinder`) → `Marquee` → `#photography`
(`ScrollSphere`, 36 cards) → `#filmography` (`FilmSphere` → `FilmSections`, three
stacked films) → `#featured-project` → `ArchiveLinks` → `#about` → `#contact` →
`ChapterRail` → archive portals (`PhotographyGallery`, `FilmographyGallery`,
`FilmStillsShowcase`, `FilmDetail`, shared lightbox).

## 3. Confirmed changes in force

**Hero** — portrait is the owner-designated master `the main portfolio
picture.png` (1312 × 1199), embedded as a delivery copy so it always renders;
master untouched and used as fallback. Old breathing sapphire halo removed.
Directional window light from the left, negative fill from the right.

**Photography** — 36 images, Fibonacci sphere, geometry/physics/interaction
untouched. Mineral-blue field with ice counterlight behind the sphere. Type and
sphere occupy separate bands; no overlap (measured gap 113–296 px).

**Filmography** — three stacked landing sections, each with its own ribbon,
credit, index, still count, logline, watch action, album action, GitHub masters.
Per-frame captions **removed at source** (caption + hold-note nodes are never
created in `FilmSpiral.buildFrame()`; 0 nodes verified on landing and in all
archive ribbons). Ribbon rectangular blocks removed: row borders, per-row
backgrounds, separators and per-row overlays are gone — the filmography is one
continuous translucent blue field. The rotated SVG plane that caused the "light
shape" artifact is deleted (filmography geometry preset renders no shapes).
Frame interaction lighting: neutral cool edge; hover/keyboard focus gets an ice
key on top/left edges and an orange counterlight on right/bottom, a soft
environmental pool and 2 px lift; active state stronger; ~380–420 ms recovery;
`:focus-visible` parity. **No filters on photographs** — a `filter:none
!important` authority block covers all ribbon/still images. Film accents:
Delusion = ice (frames near-achromatic), Zakia = copper, Birth Permit = burnt;
applied to four marks only (index numeral, 32 px rule, active-frame outline,
logline label).

**Featured / About / Contact** — sapphire exhibition wall, poster untouched,
parallax travel clamped so the mark never crosses an image; About/Contact return
to quiet sapphire/silver.

**Archives** — photography archive: 81 photos, 16 albums, 10 collections,
nested relationships preserved. Stills album is a contact-sheet grid (2 cols
desktop, 3 at ≥1600, 1 phone) with separate "View full album" and "GitHub
masters" actions. Selecting a ribbon frame opens the **single-still viewer
only**; the viewer offers "View full album". Escape closes nested surfaces in
order; body scroll restored. Portfolio ↔ archive uses the View Transitions API
(320 ms crossfade) with graceful fallback and reduced-motion opt-out.

**Background — The Optical Aperture (approved)** — one oversized incomplete
aperture (three concentric arcs r 536/612/702 from upper right, off-axis, dashed
gaps, no centre target); sapphire halo masked to one short arc run; secondary
620 px arc + diagonal axis; **one** warm intersection line + point; two diagonal
light planes; one soft mineral pool. 36 SVG nodes, **no canvas, no RAF**. Scroll
choreography via CSS `animation-timeline: scroll(root)` only; complete static
fallback for unsupported browsers and reduced motion. Grain relocated inside the
field at z-0, behind every photograph, still, portrait and control; global
`.grain`, `.scanlines`, `.vignette` removed from `App.tsx`. **Sections paint
translucent tints, not opaque backgrounds**, so the aperture reads behind every
section (measured 12.61 % pixel differential behind the filmography).

**Removed permanently at owner request** — centre bloom/radial glow and uniform
centre-to-black vignette ring; cursor-following light and central luminous
cursor bubble; visible interaction guides, gesture hints, scroll cue, swipe
hints; the lower Work/Photos/Films/Contact dock (component preserved,
unmounted); cosmic/constellation graphics, particle fields, contour line fields.

## 4. Rejected / superseded — do not reintroduce

| Direction | Status |
|---|---|
| Phase 03 semantic type scale, 12 px floor, enlarged headings | **Rejected** — typography restored |
| Luminous Lichen (`#d7e66a`) yellow-green accents | **Superseded** by orange family; 0 yellow in build |
| Warm oxide/ochre/amber background washes | **Rejected** — brown/purple mud |
| Global lighting overlay / `LightingLayer` / cursor light | **Rejected**, unmounted |
| Lighting simulator / playground / sliders / preset lab | **Never built; prohibited** |
| Filmography rotated SVG plane and per-row blocks | **Removed**; do not restore |

Unmounted but preserved (do not delete): `LightingEngine.ts`, `LightingLayer.tsx`,
`ChapterLight.tsx`, `CustomCursor.tsx`, `Cursor.tsx`, `Arrival.tsx`,
`AtmosphereCanvas.tsx`, `MobileDock.tsx`, `Sequence.tsx`, `Works.tsx`,
`Index.tsx`, `Presence.tsx`, `Statement.tsx`, `Endcard.tsx`,
`ForegroundLayer.tsx`, `SoundToggle.tsx`, `components/layers/*`.

## 5. Content inventory (verified from source)

81 photographs · 16 albums · 10 collections · 36 sphere · 79 + 43 = **122 film
stills** (Delusion 29, Zakia 50, Birth 43) · 3 films · **203 baked previews**.
Watch: Delusion → featured section; Zakia → Google Drive; Birth → Vimeo.

## 6. Audio

One global engine (`src/audio/SoundEngine.ts`): 31 Hz sub + 620 Hz tape air +
fifth-harmonic bed; glass/metal interaction palette; safe gain envelopes; stereo
panning; persisted mute (`cine-audio`) and volume (`cine-volume`); one
subscription model; explicit mute authoritative. **Never auditioned here** — do
not claim sound character.

## 7. Deployment

**Review deployment (exact match, published at owner's request):**
**https://etherealism-final.deed.page/** — live document matches the local
build for 2,428,251 of 2,428,266 bytes; the 1,033-byte difference is the
host-injected badge only. Includes the spacing fix.

`https://etherealism-review.deed.page/` (pre-fix) and `https://etherealism-approved.deed.page/` (intermediate state, diverges at ~97.7 %) are earlier deployments. Do not treat them as the reference.

Deed issues an update token only once; none exist in this workspace, so older
slugs cannot be updated in place. Superseded slugs:
`salim-bakhouch-etherealism`, `etherealism-preview`, `etherealism-bluehour*`,
`etherealism-thebirthpermit`, `etherealism-seamless`, `etherealism-aperture*`.

```bash
npx tsc --noEmit
npm run build          # dist/index.html only
DEED_TOKEN=<token> ./scripts/deploy.sh <slug>
```

Never commit a token. Do not repoint the canonical URL or publish to the
canonical site without authorisation.

## 8. Open items for the next agent

1. **Filmography residual vertical space** — owner asked repeatedly and then
   deferred it. Diagnosis (verified): each `.film-section-row` still mounts an
   empty `.chapter-geometry` wrapper, and the broad rule `.film-section-row > * {
   position: relative; z-index: 1 }` overrides its intended absolute placement,
   so the empty wrapper reserves ~188 px of flow height per row (~564 px across
   three). Fix: remove the `<ChapterGeometry preset="filmography" />` mount in
   `FilmSections.tsx` (it renders no shapes) or force the wrapper `position:
   absolute`, then re-measure row heights. **No other spacing work is approved.**
2. **Canonical URL** — `index.html` still declares `…e0d2e5c9.deed.page`.
3. **Portrait delivery copy** — embedded 1312 × 1199 WebP accepted in practice;
   formal written acceptance outstanding.
4. **Film accent tiers** — ice / copper / burnt are provisional.
5. **Contact identity** — footer emails are placeholders; socials generic.
6. **Delusion screening URL** — points at the featured section, not a stream.
7. **Not tested** — physical iOS/Android/WebKit, screen readers, sound
   audition, CPU-throttled performance.
8. **Git** — workspace is not versioned; rebuild hash `8210f4e6…` is the
   identity check.

## 9. QA at this snapshot

`tsc` clean · one `dist/index.html` 2,428,266 bytes · sha `77870260…` · 0 console
errors · 0 horizontal overflow at 1920×1080, 1440×900, 1024×768, 768×1024,
390×844, 360×800, 844×390 · 36 cards · 3 ribbons · 122 frames · 0 captions ·
0 filtered photographs · 0 row borders/backgrounds · aperture visible behind
every section (12.6 % pixel effect) · contrast AA on all sampled pairs · reduced
motion gives a complete static background · masters, manifests, media resolver
and sound engine checksums unchanged.

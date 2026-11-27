# ETHEREALISM — MASTER HANDOFF
## Confirmed source of truth · Approved design · Current deployment · Next-agent contract

**Last reconciled:** 27 November 2026  
**Owner:** Salim Bakhouch  
**Repository:** https://github.com/Yeedthedeed/PORTFOLIO-  
**Authoritative project folder:** `salim-bakhouch-portfolio- code _handoff Latest version/`  
**Current owner-designated working/review URL:** **https://etherealism-final.deed.page/**  
**Approved build identity recorded by the project:** `dist/index.html`, 2,428,266 bytes, SHA-256 `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c`  
**Repository main head inspected before this documentation update:** `447b4cda948a7ab3afe44f95705bb9ad5ec19b1e` (27 November 2026).

> Read this file first, then README.md, CONTINUATION.md, docs/PROJECT-STATE.md,
> docs/ARCHITECTURE.md, docs/DEPLOYMENT.md, and the latest relevant phase report.
> The source code is authoritative if any document disagrees with it.

---

## 1. The takeover brief

You are taking over an existing, working, owner-reviewed portfolio. **Do not rebuild it, replace its identity, or start a fresh design exploration.** Preserve the current website as the baseline and continue only from explicit owner direction.

The current working URL supplied by the owner is:

**https://etherealism-final.deed.page/**

The project’s deployment record identifies this as the latest owner-requested review build and records a byte comparison against the approved local build, with only the hosting badge injected by Deed differing. Open this exact URL in a real browser at the start of the takeover. A failed automated fetch is not permission to substitute an older preview URL.

Important limitation: the website’s canonical SEO metadata still points at the older `salim-bakhouch-portfolio-e0d2e5c9.deed.page` URL. This is a documented, unresolved metadata issue. **Do not change canonical metadata, repoint domains, publish another slug, or deploy without the owner's explicit approval.** The owner-designated working URL and the canonical metadata URL are not the same thing.

The project repository is public, but the runnable application is not at the repository root. The authoritative source is inside the folder shown above. The root-level README.md and HANDOFF.md are repository entry points; they must not describe the old source snapshot as current. The folder named `Salim Bakhouch Portfolio code documents previous version` is historical and is not the active source.

### Source and build identity

- Repository: https://github.com/Yeedthedeed/PORTFOLIO-
- Branch: main
- Source folder: `salim-bakhouch-portfolio- code _handoff Latest version/`
- Latest inspected main commit before the handoff refresh: `447b4cda948a7ab3afe44f95705bb9ad5ec19b1e`
- Approved build recorded in project QA: 2,428,266 bytes; SHA-256 `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c`
- Build output contract: exactly one `dist/index.html`.

The build hash is the recorded approved-state identity, not proof that a fresh checkout has already been built in your workspace. Re-run the type-check and build in the actual project folder before editing. If the result differs from the recorded identity, diagnose the difference before proceeding; do not overwrite or “repair” the approved source by reverting to a previous folder.

---

## 2. Project identity and creative thesis

ETHEREALISM is a cinematic photography and film portfolio for Salim Bakhouch.

**Approved creative thesis: one blue world, silver/pearl typography, one restrained orange counterlight; the photographs are always the subject.**

The site should feel like a carefully composed optical and cinematic environment, not a generic portfolio template and not an effects demonstration.

The existing design is considered fundamentally good. Work should be precise, additive only where approved, and respectful of the existing composition.

### Approved colour identity

Core environment:
- Abyss: `#050912`
- Midnight navy: `#081629`
- Deep blue: `#0D2340`
- Mineral blue: `#123858`
- Cobalt shadow: `#174B70`
- Sapphire: `#3D9FFF`
- Ice blue: `#7EC4FF`

Neutral typography:
- Pearl: `#EDF3F8`
- Silver: `#A9BBD0`
- Silver mist: `#7F93AA`

One warm hue family only:
- Ember: `#793921`
- Burnt orange: `#A94F32`
- Copper: `#CD6742`
- Tangerine: `#E58359`
- Apricot: `#F2B18F`

Film signals:
- Delusion of Negation: ice.
- Zakia’s Clock: copper.
- The Birth Permit: burnt orange.

The film accents are restrained and provisional pending owner confirmation. They are applied to a small, deliberate set of marks, not used as large background washes or separate full-screen themes.

### Typography

The authored type system is retained:
- Fraunces — display/editorial.
- Space Grotesk — interface/body.
- JetBrains Mono — technical labels and metadata.

**Do not impose the rejected Phase 03 type scale, enlarge every heading, or apply a new universal minimum type size.** The owner explicitly restored the original authored sizes and blue–white title hierarchy. Preserve it unless a specific typography task is authorised.

---

## 3. Approved page composition

Preserve the existing section order and interaction model:

1. Background — Optical Aperture.
2. Loader.
3. Navigation.
4. Hero / Work — MetaCard, HeroText, Portrait and Viewfinder.
5. Marquee.
6. Photography — 36-image spatial sphere.
7. Filmography — three stacked film sections and three existing ribbons.
8. Featured Project — Delusion of Negation poster and editorial information.
9. Archive links.
10. About.
11. Contact / Footer.
12. ChapterRail and the existing archive/viewer portals.

Do not rearrange sections, replace the spatial galleries with generic grids or carousels, or introduce new pages to demonstrate visual techniques.

---

## 4. Confirmed implementation state

### Hero and portrait

- The hero uses the owner-designated portrait master, with a delivery copy embedded so it renders reliably and the master retained as fallback.
- Delivery copy dimensions recorded by the project: 1312 × 1199.
- The master is untouched.
- The old breathing sapphire halo behind the portrait was removed.
- The intended treatment is directional environmental light and negative fill around the portrait, not a filter or artificial grade over the portrait.
- The existing Viewfinder interaction remains.

Formal owner acceptance of the embedded portrait delivery copy remains an open administrative item. Do not regenerate or replace it.

### Photography

- 81 photographs, 16 albums, 10 collections.
- 36 curated images in the existing Fibonacci-distributed photography sphere.
- Preserve sphere geometry, physics, ordering, interaction and viewer.
- The environmental mineral-blue and ice-blue treatment sits behind the sphere.
- Do not recolour, filter, crop, resize or otherwise alter the photographs.

### Filmography

Three stacked landing sections:
- Delusion of Negation — 29 stills.
- Zakia’s Clock — 50 stills.
- The Birth Permit — 43 stills.

Total film stills: **122**.

Each section retains its main title, credit, index, still count, format, year, logline, watch action and stills-album actions.

**Per-frame captions and hold-note text nodes are removed at source.** In FilmSpiral.buildFrame(), individual stills are not annotated with repeated numbered film titles. The accessible name remains on each card through its aria-label. Do not reintroduce caption nodes, hidden caption boxes, caption spacing, or repeated writing below the frames.

The three films share one continuous blue filmography field. Per-row backgrounds, borders, separators, rotated filmography plane, and row overlays were removed. The filmography preset in ChapterGeometry intentionally renders no shapes. Keep it that way.

Film-section spacing was corrected after Phase 06:
- The unnecessary empty filmography geometry mount is gone.
- A defensive absolute-position rule remains for any future geometry wrapper so it cannot reserve document flow height.
- Project-state measurements after the fix: rows approximately 798 / 830 / 830 px and total filmography approximately 2,934 px at the measured desktop condition.
- The fix was verified across the seven project viewports.
- Do not repeat this spacing work or independently “improve” vertical rhythm without owner approval.

### Film-frame interaction lighting

Lighting belongs on the frame boundary and in the immediate frame environment only.

- Neutral: restrained cool edge.
- Hover and keyboard focus: cool ice key from the top/left and restrained orange counterlight on the right/bottom.
- Active state: slightly stronger separation.
- A very subtle environmental pool and approximately 2 px lift are allowed where already implemented.
- Recovery to neutral is smooth, approximately 380–420 ms.
- Keyboard focus receives equivalent treatment and a visible focus outline.
- **No image filters.** A stylesheet authority rule prevents brightness, contrast, hue, saturation, grayscale, blur, grading or other filters from being applied to ribbon photographs.
- Do not alter image pixels or use generated/modified replacements.

### Featured project and archive

- The real Delusion of Negation poster remains untouched.
- The featured area uses the approved blue exhibition-wall treatment.
- The photography archive preserves 81 images, 16 albums, 10 collections and nested relationships.
- Film stills use the existing contact-sheet/showcase and single-still viewer architecture.
- Selecting a ribbon still opens the single-still viewer; the viewer provides access to the full album.
- Escape handling, focus restoration and scroll restoration must remain intact.
- Portfolio/archive transitions use the existing View Transitions helper with graceful fallback and reduced-motion opt-out.

### Background — Optical Aperture / Blue Hour: The Light Score

The accepted background is already implemented. It is not a proposal for a new phase.

The existing Background component contains:
- One deep-blue base field.
- Two restrained diagonal light planes.
- Three oversized, incomplete, off-axis concentric aperture arcs.
- A masked sapphire halo on one short segment of one arc.
- A secondary arc and diagonal axis.
- One small orange intersection line/point.
- One subtle mineral-blue environmental pool.
- One static, monochromatic fine-grain texture.

The composition has large negative-space regions and is designed to sit behind the entire portfolio. The section backgrounds must remain translucent enough for the aperture to read through them; opaque section backgrounds previously hid it.

Implementation characteristics recorded in the source:
- One background system.
- 36 lightweight SVG nodes.
- No background canvas.
- No background RAF loop.
- Scroll choreography uses CSS scroll-driven animations only.
- A complete static fallback exists when scroll-driven animation is unsupported.
- Reduced motion retains a complete static composition.
- Grain lives inside the background at z-index 0, behind every photograph, portrait, still, title and control.

The optical geometry evolves very slowly through the page: the aperture drifts and rotates slightly, the sapphire halo changes emphasis, and the orange intersection is most perceptible around filmography before receding toward the closing sections.

**Do not add more circles, floating objects, particles, starfields, contour grids, random lines, additional glows or a second background system.** The objective is a coherent composition, not more decoration.

### Audio

- One global audio engine: src/audio/SoundEngine.ts.
- Persisted mute and volume.
- One subscription model.
- Do not add a second audio engine or independently rewrite the sound system.
- The current handoff records that the sound was not auditioned in the previous review. Do not claim audio quality or balance has been professionally verified without auditioning it.

---

## 5. Rejected and superseded directions — do not reintroduce

| Direction | Current decision |
|---|---|
| Central luminous bubble / centre glow / uniform centre-to-black vignette | Removed |
| Cursor-following global light | Removed |
| Global lighting overlay / old LightingLayer engine | Unmounted or disabled |
| Standalone “Light as a material” simulator, artificial sphere, sliders or preset lab | Rejected; do not build |
| Luminous Lichen yellow-green palette | Superseded by orange family |
| Yellow / gold / mustard / amber typography identity | Replaced |
| Brown, purple, oxide, ochre or amber background washes | Rejected; caused muddy colour mixing |
| Per-film full-screen colour themes | Rejected; retain one continuous blue field |
| Repeated numbered captions below ribbon frames | Removed at source |
| Filmography rotated SVG plane and per-row visual blocks | Removed |
| Global grain above photographs | Removed; grain belongs inside the background |
| Cosmic / constellation / starfield / random particles / dense contour fields | Rejected |
| Bottom Work / Photos / Films / Contact dock | Preserved but unmounted |
| Phase 03 enlarged semantic type scale / 12 px floor | Rejected; original authored type sizes restored |
| New 3D library or replacement spatial gallery | Not approved |

Some older components remain in the source tree but are unmounted or disabled. Preserve them unless a specific, separately approved cleanup task is issued. Do not mistake their existence for permission to mount them.

---

## 6. Non-negotiable technical invariants

1. Never modify original master photographs, film stills or the official poster. No crop, resize, recompression, re-export, recolour, filter, grade, retouch or overwrite.
2. Do not change photography or film manifest schemas.
3. Preserve image URLs, ordering, dimensions, aspect ratios, album relationships, IDs and curation.
4. Preserve the 36-card sphere and shared ribbon geometry, physics, ordering and interactions.
5. Keep the single audio engine.
6. Keep one background system.
7. Do not add another RAF loop for the background.
8. Preserve the current media resolver in src/utils/media.ts. Do not replace it with raw image URLs in components.
9. Baked preview modules are source and must remain available; do not introduce runtime dependencies on missing preview asset folders.
10. Keep the production artifact as exactly one dist/index.html.
11. Preserve keyboard navigation, accessible names, focus handling, Escape behaviour, reduced motion and device-specific layouts.
12. No deployment, new permanent preview slug, canonical URL update or hosting change without explicit owner approval.
13. Never commit a Deed token, credential or secret.

---

## 7. Source map and working commands

Run commands from the authoritative project folder, not the repository root.

Primary files:
- src/App.tsx — page composition, section order, archive transitions.
- src/components/Background.tsx — Optical Aperture and background grain.
- src/index.css — colour tokens, filmography layout, geometry, transitions and responsive styling.
- src/components/ChapterGeometry.tsx — authored chapter geometry; filmography preset intentionally has no shapes.
- src/components/Portrait.tsx — hero portrait presentation.
- src/components/ScrollSphere.tsx — 36-image photography sphere.
- src/components/FilmSphere.tsx — filmography landing section.
- src/components/FilmSections.tsx — three film records, titles, loglines and ribbon mounting.
- src/components/FilmSpiral.tsx — shared ribbon engine and DOM-built frame cards.
- src/components/FilmographyGallery.tsx — archive overlay.
- src/components/FilmStillsShowcase.tsx — contact-sheet film stills album.
- src/components/FilmDetail.tsx — single-still viewer.
- src/components/FeaturedProject.tsx — featured poster and credits.
- src/utils/media.ts — sole media resolver.
- src/utils/transition.ts — portfolio/archive transitions.
- src/data/photographyManifest.ts — photography curation.
- src/data/filmStills.ts — Delusion and Zakia film records.
- src/data/birthPermit.ts and src/data/birthPermitRibbon.ts — Birth Permit records.
- src/data/previewAssets.ts and src/data/birthPermitPreviews.ts — baked previews.
- src/audio/SoundEngine.ts — single audio engine.

Run:
~~~bash
npm install
npm run dev
npx tsc --noEmit
npm run build
npm run preview
~~~

After the build, verify that dist/ contains exactly index.html. Record the file size and SHA-256. Compare against the approved build identity where the environment is expected to reproduce it.

---

## 8. Remaining owner decisions and unverified areas

These are real open items, not invitations to invent information:

1. **Canonical metadata:** index.html still contains the older e0d2e5c9 URL in canonical, og:url and structured data. Changing it requires owner approval and an authorised deployment.
2. **Contact identity:** current footer email/social details include placeholders or generic entries. Do not invent replacement email addresses, accounts or contact details.
3. **Delusion screening:** its watch action currently points to the featured section rather than an independently confirmed public screening URL. Do not invent a link.
4. **Film accent tiers:** Delusion ice / Zakia copper / Birth burnt are the current provisional assignment. Do not redefine without owner visual approval.
5. **Portrait delivery copy:** embedded 1312 × 1199 WebP delivery copy works in the approved build; formal written acceptance of that derivative is still outstanding. Preserve the master.
6. **Physical-device testing:** physical iOS/Android/WebKit testing has not been recorded as complete.
7. **Assistive-technology testing:** a full screen-reader audit has not been recorded as complete.
8. **Audio audition:** previous report explicitly says the sound was not auditioned.
9. **Performance:** CPU-throttled and physical-device GPU profiling remain unverified.
10. **Live inspection:** the owner-designated current URL must be opened in the next agent’s browser environment. If the page cannot be fetched by an automated text fetcher, do not use an old slug as a substitute.

Do not silently “fix” any of these with invented data or an unauthorised deployment.

---

## 9. Takeover workflow for the next agent

### Step 1 — Establish source and deployment identity
- Read this handoff, README, CONTINUATION, PROJECT-STATE, ARCHITECTURE and DEPLOYMENT.
- Open https://etherealism-final.deed.page/ in a real browser.
- Confirm the repository’s main head and work inside the authoritative source folder.
- Do not use the previous-version folder or the stale root-level project snapshot.
- Capture the current appearance at the seven documented viewports and at multiple scroll positions if browser tooling is available.

### Step 2 — Reproduce the approved baseline
- Install dependencies.
- Run TypeScript and production build checks.
- Verify the single-file artifact.
- Record build size and hash.
- If the build differs from the recorded approved identity, diagnose the discrepancy before editing.
- Verify the original assets, manifests, resolver and previews are unchanged.

### Step 3 — Report the handoff state
Provide a short source/deployment verification report, the actual current visual state, any discrepancies, and the unverified items. Separate observed facts from assumptions.

### Step 4 — Wait for the owner’s next implementation priority
Do not invent a new redesign phase. Do not continue the Optical Aperture or filmography work merely because historical phase briefs exist. The latest state is approved as the current baseline.

### Step 5 — For any authorised change
- Make the smallest coherent change within the existing architecture.
- Preserve all invariants above.
- Capture before/after evidence.
- Run type-check, production build, seven-viewport layout/overflow checks, accessibility/contrast and reduced-motion checks.
- Recheck the real deployment only if the owner authorises publishing.
- Report exactly what changed and what was not tested.

---

## 10. Seven required viewport sizes

Use these exact sizes for visual and responsive verification:

- 1920 × 1080
- 1440 × 900
- 1024 × 768
- 768 × 1024
- 390 × 844
- 360 × 800
- 844 × 390

QA gate:
- TypeScript clean.
- Build succeeds and emits only index.html.
- 0 horizontal overflow at all seven sizes.
- 0 console errors.
- 36 sphere cards, 3 ribbons, 122 film stills.
- 0 per-frame caption/hold-note text nodes.
- 0 filters applied to photographs or film stills.
- Optical Aperture visible behind the intended translucent sections.
- AA contrast on the tested text/background pairs.
- Reduced-motion mode renders a complete static background.
- Archives, viewers, Escape, focus return and scroll restoration work.
- Master assets, manifests, media resolver and sound engine remain unchanged.

**Do not claim that a check passed unless you ran it in the current working environment.**

---

## 11. Historical phase record — later phases supersede earlier ones

The phase files are retained as design and verification history. Read them in order only when you need their detailed evidence.

- PHASE-00-SOURCE-OF-TRUTH.md — original source-of-truth audit; some workspace and repository facts were later superseded.
- PHASE-01-BASELINE-AUDIT.md — baseline audit and responsive evidence.
- PHASE-02-ART-DIRECTION.md — approved initial art direction, with later colour/lighting decisions superseding parts of it.
- PHASE-03-REPORT.md — historical implementation report; its new type scale was rejected/restored.
- PHASE-04-* — original lighting experiments; the global rig was rejected/removed.
- PHASE-04B-LIGHTING-DECISION.md — explicit rejection of the chapter-light rig due visible compositing seams.
- PHASE-04G-COLOR-SEAMLESS-PREVIEW.md — intermediate monochromatic colour and seamless-surface study; superseded by later blue/orange work.
- PHASE-05-BLUE-HOUR.md — blue palette and film colour study; Luminous Lichen later superseded.
- PHASE-051-REPORT.md — frame captions removed, orange family, blue progression and frame-edge lighting.
- PHASE-052-REPORT.md — filmography field consolidated; intrusive plane and row blocks removed.
- PHASE-06-APERTURE.md — Optical Aperture and grain implementation.
- PHASE-06-FIX.md — aperture made visible behind translucent sections and excess filmography space corrected.
- TYPOGRAPHY-RESTORATION-REPORT.md — original authored typography restored.

The current approved state is the combination of the latest source code, this handoff, README, docs/PROJECT-STATE.md, docs/ARCHITECTURE.md and docs/DEPLOYMENT.md. Historical phase prompts are not permission to reintroduce rejected variants.

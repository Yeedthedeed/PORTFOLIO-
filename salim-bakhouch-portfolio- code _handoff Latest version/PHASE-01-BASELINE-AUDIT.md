# PHASE 01 — FORENSIC BASELINE AUDIT

**Status:** read-only audit. No implementation source was modified.
**Audited build:** workspace deployment-line source, `npx tsc --noEmit` clean,
`npm run build` → one `dist/index.html` (2,397,966 bytes; sha256
`d0788c235b64eef936f6add5b0883ebc7884b0e5eab5b6d26635f17a09fd1e8e`).
**Served locally at:** `http://127.0.0.1:4173/` (production build).
**Owner recording:** `Desktop 2026.11.26 - 16.45.48.01.mp4` was **not present**
in the connected workspace. It could not be inspected. No statements in this
report rely on it.

Baseline evidence: `evidence/phase-01/` — 80 PNG screenshots, 4 labelled contact
sheets, and 9 JSON logs + 18 capture scripts. Key sheets:
`sheet-desktop-a.jpg`, `sheet-desktop-b.jpg`, `sheet-responsive.jpg`,
`sheet-mobile-details.jpg`.

---

## 1. Screenshot baseline (all requested viewports captured)

| Viewport | Layout attr | Pointer | Page height | H-overflow | Console errors | Failed requests |
|---|---|---|---|---|---|---|
| 1920×1080 | desktop | fine | 9,092 | 0 | 0 | 0 |
| 1440×900 | desktop | fine | 8,140 | 0 | 0 | 0 |
| 1024×768 | tablet | fine | 7,001 | 0 | 0 | 0 |
| 768×1024 | tablet | coarse | 7,988 | 0 | 0 | 0 |
| 390×844 | phone | coarse | 7,638 | 0 | 0 | 0 |
| 360×800 | phone | coarse | 7,561 | 0 | 0 | 0 |

Extra, not requested but tested: **844×390 landscape** (classified `phone`;
portrait is pushed under the dock — see defect V-3).

Section order confirmed in every viewport: Hero `#work` → Marquee →
Photography `#photography` → Filmography `#filmography` → Featured
`#featured-project` → ArchiveLinks → About `#about` → Contact/footer
`#contact`.

Hero portrait present in every viewport: embedded `data:image/webp`, natural
**1312×1199**, opacity 1. 1920: box 1188×1085; 1440: 990×904; 1024: 557×509;
768: 625×571; 390: 392×510; 360: 362×470.

---

## 2. Section / interaction matrix

| Surface | Mounted file | Tested behaviour | Result |
|---|---|---|---|
| Loader / arrival | `Loader.tsx` | auto completion, no console errors | PASS |
| Nav header | `Nav.tsx` | links, Reel, audio, menu open/close | PASS with caveats (A-2, V-2) |
| Sound control | `AudioToggle.tsx`, `SoundEngine.ts` | mute click, persistence | PASS (`true`→`false`, `cine-audio="0"`) |
| Nav menu | `Nav.tsx` | keyboard Enter, 5 items, Esc | PASS; Esc closes; focus stays inside |
| Portrait / viewfinder | `Portrait.tsx`, `Viewfinder.tsx`, `MediaImage.tsx` | hover, keyboard Enter, Esc | PASS; full HUD reveals; screenshot captured |
| Photography sphere | `ScrollSphere.tsx` | 36 cards, drag, keyboard open, Esc | PASS; focus returns to card |
| Album viewer | `ScrollSphere.tsx` | dialog role, focus inside, swipe | PASS (swipe 01→02 / 02) |
| Photography archive | `PhotographyGallery.tsx` | 16 albums, nested Mermaid, tiles, lightbox, arrows, Esc | PASS; Esc closes; focus returns to body (A-5) |
| Film landing ribbons | `FilmSections.tsx`, `FilmSpiral.tsx` | 3 ribbons, 122 frames, tap→stills | PASS |
| Film still viewer | `FilmDetail.tsx` | dialog, arrows, counter, Esc | PASS (10/29) |
| Stills showcase | `FilmStillsShowcase.tsx` | 29 Delusion / 43 Birth Permit tiles, Esc | PASS |
| Full filmography archive | `FilmographyGallery.tsx` | 3 ribbons (pair + Birth Permit), internal scroll, Esc | PASS with caveat (A-4) |
| Featured project | `FeaturedProject.tsx` | poster, full-resolution link | PASS; **watch href = `#`** (U-1) |
| About | `About.tsx` | counters/typography | PASS content; 122/03 verified |
| Contact / footer | `Footer.tsx` | CTA, emails, socials | PASS display; **placeholder emails** (C-2) |
| Mobile dock | `MobileDock.tsx` | 4 links, navigation | PASS |
| Reduced motion | global CSS + engines | `prefers-reduced-motion: reduce` | PASS: develop opacity 1, grain/bloom animations `none`; 1 animation still running |

`document.body.scrollHeight` and all screenshots were captured after an 8 s
settle at each viewport.

---

## 3. Confirmed asset inventory (from source, not documentation)

| Item | Confirmed count | Source |
|---|---|---|
| Photographs | **81** unique records, 81 unique `source_url` | `src/data/photographyManifest.ts` `PHOTOGRAPHS` |
| Albums | **16** unique `album_id` | same file, `ALBUMS` |
| Collections | **10** | same file, `COLLECTIONS` |
| Sphere entries | **36**, ordered `sphere_slot` 1–36 | same file, `SPHERE_SELECTION` |
| Nested albums | **4**: Mermaid→Silver/Shadow; Mael, Willy, Yan→Skate Up | album `parent_album_id` |
| Film stills, `filmStills.ts` | **79** (Delusion 29, Zakia 50) | source count |
| Birth Permit stills | **43** | `src/data/birthPermit.ts` |
| Total film stills | **122** | 79 + 43 |
| Baked previews | **203** (160 + 43) | `previewAssets.ts`, `birthPermitPreviews.ts` |
| Watch/screening links | Delusion → internal featured; Zakia → Google Drive; Birth Permit → Vimeo | `FilmSections.tsx`, `birthPermit.ts` |
| Poster | jsDelivr master, full-resolution raw GitHub link | `FeaturedProject.tsx` |

Master media at repo `main`: 206 files / ≈1,334.5 MB — 81 photography, 122 film
stills, 2 posters, 1 portrait. **No master was modified by this audit.**
Portrait delivery is an embedded WebP derivative at true 1312×1199; the
untouched PNG master remains the repository source.

---

## 4. Component-to-file map

- Shell: `src/main.tsx`, `src/App.tsx`, `index.html`, `src/index.css`, `src/lib/lightbox.tsx`.
- Atmosphere: `Background.tsx` (single canvas RAF), `LightingLayer.tsx` (unmounted), `.grain/.bloom/.scanlines/.vignette` CSS.
- Hero: `Nav.tsx`, `HeroText.tsx`, `MetaCard.tsx`, `Portrait.tsx`, `Viewfinder.tsx`, `MediaImage.tsx`, `Loader.tsx`.
- Photography: `ScrollSphere.tsx`, `PhotographyGallery.tsx`, `AlbumOriginal.tsx`, `DevelopReveal.tsx`, `ChapterRail.tsx`.
- Film: `FilmSphere.tsx`, `FilmSections.tsx`, `FilmSpiral.tsx`, `FilmRibbonPair.tsx`, `FilmographyGallery.tsx`, `FilmStillsShowcase.tsx`, `FilmDetail.tsx`.
- Editorial/close: `FeaturedProject.tsx`, `ArchiveLinks.tsx`, `About.tsx`, `Footer.tsx`, `MobileDock.tsx`.
- Engine/data: `src/audio/SoundEngine.ts`, `useSoundEvents.ts`, `src/utils/media.ts`, `src/data/*`.
- Responsive: `src/hooks/useDeviceLayout.ts`, inline bootstrap in `index.html`, media queries in `index.css`.
- Preserved/unmounted: `CustomCursor.tsx`, `Cursor.tsx`, `Arrival.tsx`, `AtmosphereCanvas.tsx`, `Sequence.tsx`, `Works.tsx`, `Index.tsx`, `Presence.tsx`, `Statement.tsx`, `Endcard.tsx`, `ForegroundLayer.tsx`, `SoundToggle.tsx`, `Index.tsx`, legacy `layers/*`.

---

## 5. Prioritised issue register

### P0 — confirmed functional defects

**F-1 · Photography archive Escape is state-dependent.**  
One run left `dialogs: ['archive']` and `body.style.overflow = 'hidden'`
after Esc; a second clean open→Esc run closed correctly and restored
overflow to `''` (`escape-check.mjs`). The listener
(`PhotographyGallery.tsx:52-58`) is only active when `lightbox === null`, so
nested surface state determines the result. Owning file:
`PhotographyGallery.tsx`. Repro: open archive, select album, open a photo,
Esc to dismiss the photo, Esc again for the archive, then reopen and Esc at
various focus states. Severity: high, but intermittent by state — not reported
as a universal blocker.

**F-2 · Filmography archive leaves `body` scroll locked after close.**  
`FilmographyGallery.tsx:83-90` sets `body.overflow = hidden` and its cleanup
restores `previousOverflow`, but `FilmStillsShowcase` also writes the same
property. Closing nested surfaces restores an already-`hidden` value. Verified:
after film archive close, `dialogs: 0`, `body.style.overflow: 'hidden'`.
Owning files: `FilmographyGallery.tsx`, `FilmStillsShowcase.tsx`,
`PhotographyGallery.tsx` (all write `body.style.overflow`). Severity: high;
body scroll remains disabled after leaving the archive.

**F-3 · Featured project “Watch the film” is a dead link.**  
`FeaturedProject.tsx:28` — `const FILM_URL = "#"`. Rendered `href="#"`, click
prevented. Verified in the live DOM. Severity: high for a film portfolio’s
primary CTA.

**F-4 · Focus is not restored to the invoking control after archive close.**  
After closing the photography archive by keyboard, `document.activeElement`
is `body`, not the “Browse all albums” button. Verified
(`focusAfterArchiveClose`: body, `browseFocus: false`), after a 2.2 s wait.
Owning file: `PhotographyGallery.tsx`. Severity: high accessibility/keyboard.

**F-5 · Event routing / z-order: header controls overlap on tablet widths.**  
Measured at 768×1024: “DOP — BERLIN / LISBON” overlaps WORK, ABOUT and CONTACT.
At 844×390 landscape it overlaps WORK and ABOUT. At 1024×768 it overlaps WORK.
Owning file: `Nav.tsx` + `index.css` header rules. Severity: high; the centre
tagline is unreadable and competes with links.

**F-6 · Landscape phone hero hides the portrait.**  
844×390 (`data-layout="phone"`): nav bottom 72, portrait top 335, dock top 313.
Portrait begins **below** the dock; no visible subject in the first screen.
Severity: high responsive defect. Owning file: `index.css` phone media queries /
`useDeviceLayout`.

### P1 — usability / responsive / accessibility

**U-1 · Typography is extremely small and low-contrast at real sizes.**  
105–111 visible text nodes under 11 px per viewport. Examples: eyebrow 8.5 px,
film caption 7 px, hero side rail 7 px, several labels at 6.5 px, 7 px.
`#495869` on `#050709` measures **2.77:1** (below WCAG AA 4.5:1 for normal
text). `#b8c4d4` on `#050709` is 11.42:1 and acceptable. Severity: high for
legibility across the whole site. Owning files: `index.css` tokens
(`--muted`), `MetaCard.tsx`, `HeroText.tsx`, `FilmSpiral.tsx` captions.

**V-1 · Sphere is much too small on large desktops.**  
Measured cluster width/height vs viewport: 1920×1080 → 219×144 px (**11 % of
viewport width**); 1440×900 → 321×217 (22 %); 1024×768 → 463×258 (45 %);
390×844 → 344×374 (88 %). The centrepiece is visually tiny at large screens.
Severity: high art-direction/legibility. Owning file: `ScrollSphere.tsx`
sphere scale constants + `.sphere-wrap` sizing.

**V-2 · Film ribbons are small relative to their host section on desktop.**  
At 1920×1080 each ribbon wrapper is 1360×713 but the largest visible frame is
**183 px wide**; at 1440×900, 1328×594 with 154 px frames; at 1024×768, 942×507
with 128 px frames. Large empty vertical bands above/below. Severity: high
art-direction; owning files `FilmSpiral.tsx` (fitScale), `.film-section-ribbon`
CSS.

**V-3 · Phone hero has a large dead band and clipped portrait.**  
390×844: portrait box y 51→561; caption at y 740–771; dock 784–844. The
120–180 px band between portrait and caption is empty in every phone capture.
At 360×800 the band is even larger relative to height. Severity: medium-high
composition defect. Owning files: `index.css` phone hero rules,
`MetaCard` hidden state, `HeroText` mobile caption.

**V-4 · Tablet hero nameplate competes with the portrait and MetaCard.**  
At 768×1024 the nameplate sits top-right while the MetaCard sits bottom-left
over the portrait chest; the floating dock overlaps the portrait lower body
(dock top 947, portrait bottom 998). Severity: medium. Owning files
`HeroText.tsx`, `MetaCard.tsx`, `MobileDock.tsx` + CSS.

**V-5 · 768/1024 navigation crams identity + tagline + links + audio + Reel +
menu into one row.** Visible crowding, not just measurement. Severity: medium
(see F-5 for actual collision). Owning file: `Nav.tsx`.

**V-6 · Corner registration marks / side rail are barely visible** at 6.5–7 px
and 2.77:1–4.6:1 contrast; they read as noise on large screens rather than
intentional chapter framing. Severity: low-medium, partly subjective.
Owning files: `ChapterRail.tsx`, `index.css`.

**U-2 · Menu is hover-opened on pointer enter and focus does not enter it
automatically.** Keyboard Enter opens the menu and Tab reaches all 8 items
(PASS), but opening does not move focus into the menu; Esc closes without
returning focus to the trigger explicitly. Severity: medium accessibility.
Owning file: `Nav.tsx`.

**U-3 · Touch targets below 44×44 px.** 136 of 144 visible controls at 360×800
are under 44 px in one dimension. Notably audio 34×26, Reel 50×16, nav links
18 px high, menu 40×40, dock links 28–32 px high. Severity: medium-high on
phones; WCAG 2.5.8 minimum is 24 px, enhanced 44 px. Owning files: `Nav.tsx`,
`AudioToggle.tsx`, `MobileDock.tsx`, `Footer.tsx`.

**U-4 · Photography archive phone layout differs between documentation and
computed layout.** Measured tiles are 175 px wide at 390 and 160 px at 360;
the computed container reports `grid-template-columns: none`. The result is
usable and can read as a two-column flow, but the CSS mechanism differs from
`docs/DEVICES.md` wording. Severity: low-medium; owning files
`PhotographyGallery.tsx` / `index.css`. Visual evidence:
`390x844__photo-archive-mobile.png`, `360x800__photo-archive-mobile.png`.

**U-5 · Mobile stills showcase reports 2-column grid template while rendering a
single-column flex layout.** `gridDisplay: flex`, `gridTemplateColumns:
repeat(2, …)`, tile width 366 px in a 390 px viewport. Visually correct
(single column) but CSS intent and actual layout disagree; clean-up risk.
Severity: low. Owning file `index.css` `.stills-showcase-grid` mobile rule.

**U-6 · Sphere exposes 36 tab stops.** All 36 cards have `tabindex` values
`0,0,0…` initially; keyboard traversal requires 36 Tabs between the hero and
the filmography. Severity: medium accessibility burden. Owning file
`ScrollSphere.tsx` (roving tabindex).

**U-7 · Archive open-button focus restoration inconsistency.** On a clean
open→Esc→close, focus went to body rather than the originating control; on a
different run it stayed on the Back button. Severity: medium; same owner as F-4.

### P1 — code / performance risk

**C-1 · Eighteen console errors: `<rect> attribute height: Expected length,
"undefined"`.** Reproduced once during a viewfinder-hover interaction sweep,
not in a clean load (0 errors). Trace points to the Web-Audio visualiser
`AudioToggle.tsx` bar RAF (`barRefs[i].current` setAttribute after refs
unmount). Severity: medium (silent SVG noise; can indicate RAF writing after
unmount). Owning file: `AudioToggle.tsx`.

**C-2 · Identity/contact placeholders remain.** Footer uses
`studio@ilianvoss.com`, `press@ilianvoss.com`,
`representation@ilianvoss.com`; device docs mention “Ilian Voss”; social links
are generic homepages. Owner input required; not changed by this audit.

**C-3 · Two independent style snapshots.** Primary CSS 116,646 B vs
`portfolio-current` 114,807 B; workspace deployment-line CSS 117,031 B.
Repository `main` cannot reproduce the live site. Risk carried over from Phase
00.

**C-4 · Hero delivery portrait is an embedded WebP derivative** (338 KB,
same 1312×1199) rather than the master path. Master untouched. Needs explicit
owner ruling under the media-integrity policy (Phase 00 flagged this).

**C-5 · Loaded page weight.** Local production build 2.40 MB / ≈1.42 MB
transfer; DOM 8,140 px tall at 1440; 160 `<img>` elements; one canvas,
24 SVGs, 5 fixed atmosphere layers; First Contentful Paint 456 ms,
DOMContentLoaded 194 ms. The 203 inline previews dominate document size.
Severity: medium; no evidence of jank yet, but mobile decode cost is real.
Owning files: `previewAssets.ts`, `birthPermitPreviews.ts`.

**C-6 · Single global RAF discipline confirmed in source** (Background,
ScrollSphere, each FilmSpiral; custom cursor unmounted). Runtime rAF sample
recorded 10/s idle and 15/s with filmography visible. This is a proxy only —
not a measured frame-rate benchmark. No duplicate engines observed.

### P2 — art-direction opportunities (subjective, not defects)

1. Large-screen composition under-uses the canvas: 11 %-wide sphere and
   154–183 px film frames inside 1300 px hosts.
2. The hero’s lower third at 390/360 is empty; the portrait could sit higher and
   the editorial caption closer, or a small credits block could occupy the band.
3. Chapter rail is nearly invisible and does not help distinguish chapters.
4. Film ribbons could gain stronger depth layering (foreground/background
   frames) without changing engine geometry.
5. Featured project is visually strong but its “Watch” CTA must lead somewhere
   before art polish is meaningful.

### Facts vs subjective recommendations

**Facts** are all measurements, status codes, counts, source paths and
screenshots above. **Subjective recommendations** are only the P2 list and the
“could” clauses in V-1/V-3/V-4. No visual changes were made.

---

## 6. Accessibility / performance risks

- Contrast: `--muted` `#495869` = 2.77:1 on `#050709` — used for eyebrows,
  meta labels, captions across the site. Fails AA normal text.
- Tiny type: 105–111 visible nodes < 11 px at every viewport; 7 px film captions
  and 6.5 px labels are below comfortable reading size even on 2× DPR.
- Touch targets: 136/144 controls below 44 px in one dimension on 360-wide.
- Focus: `:focus-visible` present globally and on spheres/ribbons; but
  archive-close restoration lands on `body`. Sphere makes 36 sequential tab
  stops.
- Reduced motion: verified develop text visible, grain/bloom disabled, loader
  absent, portrait visible. One animation remains running (likely a transform
  loop) — low risk, worth auditing in implementation.
- Media: only originals/preview modules referenced; no missing assets observed
  in 80 captures. Masters were never written.
- Performance: 2.4 MB single document; 160 image elements; P2 risk of decode
  cost on low-end phones. No failed requests, no Web-Audio errors, one console
  error family (C-1) observed under rapid audio/viewfinder interaction.

---

## 7. Recommended implementation sequence (for owner approval, not started)

1. **P0 correctness:** unify overlay scroll-lock + focus restoration; fix the
   archive Esc state; provide the real Delusion watch URL or make the CTA
   honest.
2. **P0 legibility:** raise small-label sizes and `--muted` contrast; verify at
   360/390 and 1920.
3. **P1 responsive:** resolve nav/tagline collisions at 1024/768/844; fix the
   landscape phone hero; remove the phone dead band.
4. **P1 composition:** scale the sphere and ribbon stage on large desktops
   without changing ribbon geometry, count or interaction.
5. **P1 accessibility:** roving tabindex in the sphere; 44 px targets; focus
   move/return in the menu and archives.
6. **P2:** chapter-rail legibility, ribbon depth, final art director pass.

Each step must be separately approved; no design/coding work begins until the
owner reviews this baseline.

---

## 8. Untested areas (explicit)

1. **Owner recording** — unavailable in this workspace; not inspected.
2. **Sound audition / quality** — architecture inspected, but quality was not
   auditioned. Headless Chromium audio is muted; do not infer sound character.
3. **Real mobile Safari / iOS / Android** — only Chromium emulation at 768/390/
   360; no physical device or WebKit.
4. **Live deployment interaction** — the owner URL was verified over HTTP in
   Phase 00; this phase interacted with the identical local production build.
   No fresh live-browser session was performed.
5. **Screen readers** — semantics/landmarks checked in DOM only; no NVDA/
   VoiceOver pass.
6. **Colour-blind simulation / DPI 2×/3×** — not tested.
7. **Full keyboard traversal of all 122 frames and 81 photos** — sampled, not
   exhaustive.
8. **Performance under CPU throttling / low-end hardware** — not profiled.
9. **Curation/editorial branches and open PRs** — not inspected for content
   decisions; out of scope.

---

## 9. Deployment verification and state (corrected at close-out)

**Deployment state is separate from the audited build.**

- The owner has confirmed that the platform status **“Deployed the project”
  referred to a PREVIEW build, not a production publish.** This is owner-supplied
  context and is not observable from the workspace.
- No separate public preview URL is recorded anywhere in the workspace or
  documentation. None is invented here.
- The only known public URL is **https://salim-bakhouch-etherealism.deed.page/**.
  It predates Phase 00 and is the owner-supplied visual reference. It is publicly
  reachable (HTTP/2 200) but **was not republished during Phase 00 or Phase 01**;
  those phases only performed HTTP HEAD/GET and never ran the deploy script.
- No production publish event happened in Phase 00 or Phase 01.

| Check | Result |
|---|---|
| URL | `https://salim-bakhouch-etherealism.deed.page/` |
| HTTP | HTTP/2 **200**, `text/html; charset=utf-8`, HTTPS, no auth required |
| Live bytes / sha256 | 2,398,993 / `c4cc380e925b877b6613f36b26d243ff4865e515009dcc24e56bde3c1537b4d3` |
| Local build bytes / sha256 | 2,397,966 / `d0788c235b64eef936f6add5b0883ebc7884b0e5eab5b6d26635f17a09fd1e8e` |
| Identity | live matches local for the first 2,397,951 bytes; only the 1,027-byte host badge differs |
| ETag | `d0788c235b64eef936f6add5b0883ebc-b2` (embeds the local hash) |
| Verification method | direct HTTP retrieval + byte-prefix comparison at close-out; no interactive live-browser session |

**Conclusion:** the public URL serves the audited build content. This is not a
production republish claim. The audited screenshots remain captures of the
identical local production build.

**Limitation:** no deed.page update token exists in this environment, so the URL
cannot be updated in place from here.

**Open deployment defect:** live canonical/og:url still points to the older
`https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/`. Phase 02 P0 input; it
requires a token and owner authorisation to correct in production.

## PHASE HANDOFF TEMPLATE

**PHASE COMPLETED:** PHASE 01 — Forensic Baseline Audit (read-only) + post-audit
documentation/continuity update and live-build verification.
**WORKING BRANCH / COMMIT:** At audit time the workspace was not a Git
repository. The first close-out checkpoint was lost when the workspace reset
(the `.git` directory and `dist/` were removed; no bundle survived). The
baseline was reconstructed without touching application source: branch
`baseline/phase-01-audited-baseline` and the lightweight tag
`phase-01-audited-baseline` point directly at the frozen commit. Resolve the literal hash
with `git rev-parse phase-01-audited-baseline`; a commit cannot embed its own
hash, so tracked docs reference the tag and the hash is stored in the annotated
tag and `/home/user/phase-01-CHECKPOINT.txt`. No remote, no push. Audited source
checksums unchanged from Phase 00.
**SOURCE FOLDER USED:** Workspace deployment-line primary source; repository
`main` @ `9940d1fa3fc1` as reference. `portfolio-current/` rejected as stale.
**FILES INSPECTED:** All mounted components and engines in `src/`, all data and
preview modules, `index.html`, `src/index.css`, responsive hooks, every visible
surface at six requested viewports plus landscape.
**FILES MODIFIED:** **None.** Implementation source unchanged (verified
checksums in `HANDOFF.md` §12).
**FILES ADDED / DELETED:** No application files added or deleted. Added audit
and continuity artefacts: `PHASE-01-BASELINE-AUDIT.md`,
`PHASE-00-SOURCE-OF-TRUTH.md`, `CONTINUATION.md`,
`evidence/phase-01/` (screens, contact sheets, capture scripts, JSON logs),
updated handoff/README/docs, local Git checkpoint.
**ASSETS OR MANIFESTS TOUCHED:** None. No master image, manifest schema or
preview module was modified.
**WHAT CHANGED:** Documentation and continuity only. Public URL verified as
already serving the audited build. No design, code or deployment change.
**WHY IT CHANGED:** Owner approved closing Phase 01 and asked for updated
handoff/README, a public URL and seamless transfer to another chat/model.
**TESTS RUN:** `npx tsc --noEmit`; production build + single-file assertion;
six-viewport capture; landscape check; hero portrait/natural-size check;
nav/menu/audio/viewfinder; sphere open/close/drag/swipe; archive + nested album
+ lightbox + Esc + arrows; ribbon → still → showcase → archive; featured links;
About/contact; touch taps; keyboard tab order; focus trap/restoration; reduced
motion; contrast and font-size inventory; scroll-lock/dialog state; load/perf
metrics; live HTTP retrieval and byte-prefix comparison.
**TEST RESULTS / LOGS:** `tsc` exit 0; build single file 2,397,966 B / 1,453,200
B gzip; zero console errors and zero failed requests on all six clean loads;
zero horizontal overflow; 36 sphere cards; 3 ribbons; 122 frames; 16 albums;
29 Delusion + 43 Birth Permit tiles; mute persistence works; reduced-motion
develop opacity 1 and grain/bloom animations `none`. Raw logs:
`evidence/phase-01/data/` and `evidence/phase-01/SUMMARY.json`.
**VIEWPORTS VERIFIED:** 1920×1080, 1440×900, 1024×768, 768×1024, 390×844,
360×800; bonus 844×390 landscape.
**INTERACTIONS VERIFIED:** Pointer click/hover, keyboard Tab/Enter/Escape,
touch tap and swipe, ribbon drag/hold/release, dock navigation, mute and
persistence, reduced-motion states, archive/lightbox/still navigation.
**KNOWN LIMITATIONS:** Owner recording absent; no physical devices/WebKit; no
screen-reader pass; sound not auditioned; no interactive live-browser session at
close-out (HTTP/content identity only); one focus/Escape defect is
state-dependent; no deployment token.
**RISKS / REGRESSIONS:** Scroll-lock leak, dead watch CTA, focus restoration,
tablet nav collisions, landscape phone hero, sub-AA small text, undersized touch
targets, 36-stop sphere, 2.4 MB single-file payload, uncommitted-vs-GitHub
delta, missing deployment token, canonical URL mismatch.
**SCREENSHOTS OR RECORDINGS:** `evidence/phase-01/screens/` — 80 captures plus
4 contact sheets (`sheet-desktop-a.jpg`, `sheet-desktop-b.jpg`,
`sheet-responsive.jpg`, `sheet-mobile-details.jpg`).
**NEXT PHASE RECOMMENDATION:** Phase 02, scope **P0 correctness and legibility
only**: scroll-lock/focus unification, deterministic archive Escape, honest
Delusion CTA, header collisions, landscape hero, canonical URL, contrast and
minimum type size. Then re-run the six-viewport baseline and diff.
**OWNER DECISION REQUIRED:** **Yes** — approve Phase 02 scope (A/B/C), supply
the Delusion watch URL and real contact identity, decide the deployment token
route and canonical correction, and confirm acceptance of the embedded portrait
delivery copy. No implementation work has begun.

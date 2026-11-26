# Changelog & decision log

## Current

### Stills album redesigned — full view, never cropped
The stills showcase was a thumbnail grid, which contradicted the "show the originals" requirement
and left most of each photograph unusable.

**New album layout.** A single centred column, one still per row:

- Each still is shown **whole**, at its own aspect ratio, as large as the album column allows —
  `width: 100%`, `height: auto`, `object-fit: contain`, `max-height: 82svh`. There is no crop, no
  upscale, no letterboxing, no fixed tile box.
- Stills read in the film's edit order, separated by generous spacing
  (`clamp(2rem, 4.5vh, 3.6rem)`) so each one is presented, not tiled.
- Each tile carries a slate-style caption: still index and album total, plus the film name.
- Hover/focus lifts the border, adds shadow, and reveals an "Open full view →" cue.
- The still viewer opens that photograph at full size and now also supports **swipe** navigation
  (horizontal drag past 48 px), alongside prev/next and arrow keys.
- Clicking a ribbon frame opens the album **scrolled to that still**, briefly outlined.
- Arrow keys step through the album when the viewer is closed.

Layout is responsive by construction: the column is `min(100%, 1180px)` with the still capped at
`82svh`, so phone, tablet and desktop all present every still whole.

### Click a still → full view · album by swiping
- Selecting a frame on any ribbon now opens **that photograph in full view immediately**. The
  album sits behind the viewer; closing the viewer reveals the grid, and tiles reopen the viewer.
- The still viewer supports **swipe navigation**: a horizontal drag past 48 px (and clearly more
  horizontal than vertical) steps to the previous/next still. Vertical drags are left to the page
  via `touch-action: pan-y`, so scrolling and pull-to-dismiss gestures are unaffected.
- Prev/Next buttons and arrow keys continue to work; the counter carries a discreet "swipe" cue on
  touch devices only.
- The photography archive lightbox gained the same swipe navigation for consistency.
- Ribbon speed unchanged: frames paint from inline previews, the album and viewer load originals.

### Still selection: two concrete bugs found and fixed
1. **`card.dataset.index` was never assigned.** The release path read it and always got `-1`, so
   it silently declined to open. The index is now stamped in `buildFrame`.
2. **The pressed card could not be identified from the event.** When the event is retargeted to the
   wrapper (as it is with pointer capture, and in some touch stacks), `event.target.closest()` is
   `null`. The press target is now resolved with `document.elementFromPoint(x, y)`, with a second
   hit-test at release as a fallback.
3. Pointer capture is removed entirely; drag continuity comes from the window-level
   `pointermove`/`pointerup` listeners. A 400 ms guard prevents double activation between the
   release path and the click path.
Result: tapping a still opens that film's album showcase, positioned on the clicked still.

### Still selection fixed at the root (pointer capture removed)
- **Cause:** the ribbon called `setPointerCapture` on its wrapper. Pointer capture retargets the
  following `click` to the capturing element, so the card's own click listener never ran — tapping a
  still did nothing, and neither the album nor the single viewer could open.
- **Fix:** capture is gone. Drag continuity is already handled by the window-level
  `pointermove`/`pointerup` listeners, so nothing regressed. Selection is also resolved directly on
  `pointerup` (press target + 14px slop) as a second path, with a 400ms guard so the two paths can
  never double-open.
- The album opener is held in a ref inside `FilmSpiral`, so an inline parent callback can no longer
  tear down and rebuild the ribbon mid-gesture.
- Clicking a still now opens that film's **album showcase**, scrolled to the clicked still and
  briefly highlighted; a tile in that grid opens the original at full size.

### Still click opens the album showcase (restored)
- Clicking a ribbon frame now opens the **full album showcase** for that film, scrolled to and
  briefly highlighting the chosen still — not a single-image overlay. The viewer is one tile click
  away, so the whole album is immediately visible.
- Applies everywhere: landing filmography sections, the archive split pair, and the archive
  Birth Permit ribbon.
- Ribbon frames continue to paint from the inline previews (instant, zero network); the album and
  viewer load the untouched originals.

### Clicking a still opens its album · ribbons instant again
- **A still now opens its album.** `FilmSpiral` gained `onOpenAlbum(index)`: selecting any frame
  opens that film's `FilmStillsShowcase` **on that still**, so the full album and its prev/next
  navigation are one click away. Wired into the landing filmography (per-film sections), the
  archive split pair, and the archive Birth Permit ribbon.
- **Ribbons are instant again.** Frames paint from the baked inline preview (~9 KB, already in the
  document, zero network) with a six-request queue and an early reveal threshold, so a ribbon is
  complete the moment it appears. The untouched original is loaded in the album showcase and the
  viewer, where the photograph is large enough for the difference to exist.
- The showcase opens with `initialIndex`, so the clicked frame is already displayed in its
  original resolution.

### Published — public review URL
- Deployed the current `dist/index.html` to **https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/** (deed.page, Cloudflare edge,
  permanent, no expiry, no authentication). Verified: HTTP/2 200, correct title, 81 inlined
  photography previews, stills showcase, archive third ribbon, all three films, Vimeo and Drive
  links; the served document matches the local build apart from the host's publish badge.
- Master media verified reachable from the live origin: jsDelivr returns `200` with
  `access-control-allow-origin: *` for the portrait, Delusion stills, Birth Permit stills and the
  photography sphere.
- Added `scripts/deploy.sh` for repeatable publishing. The update token is stored outside the
  repository at `~/.config/deed-page/token`.

### Original stills only · film-still opening fixed · archive scroll fixed
- **Ribbons now load the untouched originals.** `FilmSpiral` no longer requests a baked preview;
  every frame requests the repository master through `filmSrc` and walks the host chain on
  failure. To keep this usable, only frames rotating toward the front are fetched, through a
  **two-request** queue, and the browser caches them. The showcase and the viewer already used
  originals, so no resized replicas of film stills remain anywhere.
- The bundle dropped from 1.95 MB to **1.15 MB** because the baked film-preview data is no longer
  reachable and is tree-shaken out. Only the 81 photography previews remain inlined (used by the
  sphere, which must stay light with 36 frames).
- **Clicking a still now opens it.** The gesture test read a live travel counter that was only
  cleared 40 ms *after* pointerup, so ordinary hand jitter (>8 px) silently swallowed the click.
  A `releasedAsDrag` flag is now decided once at release (14 px slop) and consulted by both the
  card click and `openStill`, so a click opens the viewer and a real drag still only rotates.
- **Film archive scrolls again.** A tablet rule forced `.film-archive { overflow: hidden
  !important }`, which defeated the scrollable archive so the Birth Permit ribbon could never be
  reached. It is now scoped to `:not(.film-archive--scroll)`, the scroll variant owns its
  overflow at every breakpoint, and the split pair participates in normal flow above the third
  ribbon.

### Stills albums open a showcase · archive third ribbon · sphere viewer fix
- **New `FilmStillsShowcase`.** Selecting a film's stills album now opens an in-site grid of that
  film's stills instead of navigating away. Each tile is the untouched original, viewport-gated
  and capped at four concurrent downloads by `AlbumOriginal`; opening a tile reuses
  `FilmDetailOverlay`. Wired into **both** versions:
  - landing filmography — the "Open stills album →" button per film (GitHub remains as a secondary
    text link);
  - filmography archive — the "Stills album" control in each split panel header.
- **Filmography archive keeps its split pair** and gains a **scroll-down third ribbon** for
  *The Birth Permit*, centred, built from the same `FilmSpiral` engine and data. The archive is now
  a scrollable page with a sticky header. The landing filmography is unchanged (still stacked
  three films).
- Removed wheel capture from the archive ribbons so the page can actually scroll; rotation is drag
  and pointer-driven only there.
- **Sphere viewer fix:** the resolved master URL was stored without the photo it belonged to, so
  selecting a second photograph kept displaying the first until the new file arrived. The display
  now carries its photo id, is cleared on every selection, and only renders when it matches the
  current photo. The loading state starts immediately on each change.

### Guides removed — interactions retained
- Deleted `DiscoverPanel.tsx` and every discovery-guide surface: the "Field notes" pill, its
  panel, the persisted `iv-discover-seen` state and the `?` shortcut.
- Removed the visible hint bars from the photography sphere, the landing filmography and the film
  archive (`spatial-hint`), and the photography archive footer hint (`archive-hint`), together
  with all of their CSS.
- **Kept, unchanged:** hold-to-discover editorial notes on ribbon frames (with click
  suppression), drag with pointer capture and momentum, depth-led frame lighting, the photographic
  hover sheen, darkroom develop reveals, chapter rail + phone progress, and the full cinematic
  audio system.
- Screen-reader-only instructions remain on the two spatial galleries, because they are invisible
  to sighted visitors but required for keyboard and assistive-technology users.

### Immersive refinement — second pass (light, interaction, continuity, sound)
A deeper pass over the existing OFF+BRAND-inspired layer. Nothing was replaced; all additions sit
on the established Etherealism architecture.

**Depth-led lighting.** Both spatial engines now quantise each frame's depth into five bands and
write `data-depth` only when the band changes (no per-frame style churn). CSS turns the band into
a warm rim, a deeper shadow and a faint highlight, so light appears to travel across the ribbon
and sphere as it rotates. Photographs receive no filter — only borders, shadows and opacity.

**Photographic hover.** A restrained diagonal sheen crosses a frame on hover/focus, like tilting a
print under a lamp. It is an overlay (`::after`, screen blend), never a filter on the image, and it
is suspended while a still is held so the editorial note stays legible.

**Fine-line interaction system.** One shared language for `film-watch`, `film-album-link`,
`text-action`, `archive-quality`, the chapter rail and the discovery panel: a hairline that draws
from the left, a 1px lift, a single-pixel inset light on primary buttons, and consistent
`focus-visible` rings. No fills, no glows on type, no colour changes to photographs.

**Continuity.** Album titles now develop with the same darkroom reveal as the film headings, and
each album change emits one soft transition tone on the existing engine. The intro is now
skippable by any click, tap or key — it never gates the site.

**Sound.** `DevelopReveal` triggers the engine's `develop()` shimmer synchronised with its light
sweep (throttled, so adjacent reveals cannot stack). Chapter-rail hover now uses the shared
`hover()` sound. Everything runs through the single `SoundEngine`; no new audio system.

**Discovery.** (Superseded — the `?` field-notes panel was removed at the owner's request; see
"Guides removed" above.) Holding a still or pressing `I` still reveals its editorial note without
opening the viewer.

**Verification.** `npx tsc --noEmit` and `npm run build` clean; depth attributes present in both
engines; ten `prefers-reduced-motion` guards in the stylesheet; single-file build unchanged.

### Zakia's Clock ribbon aligned to The Birth Permit
- The middle ribbon wound 5.08 turns versus The Birth Permit's 4.35, so its silhouette and
  rotation rhythm read differently.
- Winding is now capped at `MAX_TURNS = 4.35` (The Birth Permit's canonical shape). Zakia's
  Clock uses that exact winding; Delusion of Negation (2.90) and The Birth Permit (4.35) are
  unchanged.
- All three films already shared height 720 / radius 240 / depth 165 and one engine; with the
  cap, Zakia now matches The Birth Permit in turns, orbit, frame dimensions, rotation distance,
  movement, fit and interaction. Only its own 50 photographs differ, sitting ≈14% closer than
  the 43-frame ribbon because the orbit, frame size and revolutions are held equal.
- Verified at 1360×760, 1024×700 and 393×500: identical turns and frame size for both ribbons,
  with ≥14px vertical slack (no clipping).

### Ribbon clipping fixed (top and bottom)
- Root cause: `fitScale` budgeted only the orbit height (720 × scale) and ignored the frames,
  which hang half their own height above and below their orbit point. At desktop the painted
  height was ≈766px inside a 720px canvas, so the first and last stills were cut off.
- `fitScale` now solves for orbit **plus** frame extents, iterating to a stable scale with a
  14px margin, and returns the frame size it used. The engine publishes those exact dimensions.
- Removed `contain: paint` from `.film-spiral-wrap` and `.film-spiral-stage` (paint containment
  clips descendants to the padding box) and set the ribbon surfaces to `overflow: visible`.
- Canvases grew slightly to keep the ribbon generous: desktop `clamp(480px, 66svh, 800px)`,
  tablet `clamp(440px, 58svh, 620px)`, phone `clamp(380px, 52svh, 500px)`.
- Verified for all three films across seven viewports: minimum vertical slack **14px**,
  minimum horizontal slack **20px**, no clipping anywhere.

### v1.0.0 — repository organization and handoff
- Rewrote `README.md` and added a master `HANDOFF.md` (state, invariants, file map, publishing,
  QA, limitations, change map).
- Added `docs/PROJECT-STATE.md` (definitive state), `docs/REPOSITORY.md` (remote/branches/CI),
  `CONTRIBUTING.md` (working agreements + pre-PR checks) and a generated `MANIFEST.md`.
- Added a self-contained snapshot in `portfolio-current/` (95 files, no dependencies or build
  output) and verified it type-checks and builds independently.
- Added `.github/workflows/ci.yml`: type-check, build, single-file artefact assertion, minimum
  baked-preview count, artefact upload.
- Raised the ribbon density clamp to 1.75 at the time so the 50-still Zakia ribbon matched the
  others' spacing (superseded by the canonical-winding cap above).
- Initialised a clean local git repository (one commit) ready to push; no credentials existed
  in the handoff environment, so the remote was not updated from here.

### Immersive interaction, visual language and audio refinement
Reinterpreted the *exploration-first* principles of OFF+BRAND through Etherealism's own
dark, sapphire photographic identity. Nothing was replaced; everything below is additive.

**Interface.** New `ChapterRail` — a fixed fine-line instrument with six chapters, active
tracking, hover labels and a reading-progress fill (desktop only; the phone/tablet dock gains
its own hairline progress marker). *(A "field notes" clue panel was added in this pass and later
removed at the owner's request.)* Both use hairlines,
digits and sapphire accents rather than panels or borders.

**Develop reveal.** New `DevelopReveal` reproduces a darkroom development in CSS: type wipes
in through a `clip-path`, resolves from a slight defocus, and one hairline of light crosses the
line once. Applied to the photography and filmography titles, every film heading, the featured
project title and the About statement. Nested coloured spans keep their own colour, no canvas
or WebGL is used, and reduced motion renders the text immediately.

**Discovery interactions.** Long-press (380ms) on any ribbon still surfaces that still's
editorial note in a small glass slip, recedes the rest of the ribbon to 42%, plays the existing
tape-motor hold sound, and **suppresses the click** so a read gesture never opens the viewer.
`I` is the keyboard equivalent; `Escape`/release/leave all clear it. Hover and focus already
promote a single frame.

**Audio.** Extended the single `SoundEngine` rather than adding a second system:
`section(tone)` re-tunes the existing ambient band-pass and adds a breath of air as chapters
change (no restart, no overlap), `develop()` adds a two-part shimmer for reveals, and
`reveal()` now maps to it. Ambient remains on by default, unlocks on the first gesture, honours
an explicit mute, and keeps its persisted volume and shared subscription model.

**Loader.** Refined into a controlled reveal: the nameplate develops through a clip wipe,
the progress bar gains fine frame marks, and reduced-motion visitors pass through in 220ms.
No unnecessary delay was added.

### Ribbon refinement — composition, movement, interaction, sound
**Composition.** All three film ribbons now share one geometry and one canvas:
`height 720`, `radius 240` (was 200), `depth 165`, `perspective 920`, with softened
ends (`pinch 0.4`, `s-curve 0.4`, was `0.6`/`0.55`). The Birth Permit's bespoke
`extendedRibbon` / `matchReferenceSpacing` branch was removed, so there is exactly one
code path. Density stays `turns = 2.9 × (stills − 1) / 28`, which makes the arc distance
between neighbouring stills ≈131 orbit units for *any* film.

Measured at 1360×720 — ribbon footprint and spacing are now effectively identical:

| Film | Ribbon | Spacing avg / min | Frame | Air |
| --- | --- | --- | --- | --- |
| Delusion of Negation (29) | 432×658 | 113 / 93 | 162×91 | 21px |
| Zakia's Clock (16 at the time) | 405×658 | 119 / 98 | 162×91 | 27px |
| The Birth Permit (43) | 431×658 | 111 / 92 | 162×91 | 20px |

**Frame contract.** `FilmSpiral.measure()` writes `--ribbon-frame-w` / `--ribbon-frame-h`
from the orbit scale; one CSS declaration overrides every historical fixed clamp. Frames
therefore keep the *same proportional clearance* on desktop, tablet and phone instead of
colliding on short screens. Natural aspect ratios and orientation are untouched — only
`max-width`/`max-height` with `object-fit: contain` are used.

**Movement.** Idle rotation now comes from a shared module-level reel clock
(`advanceIdle`/`freezeIdle`), so all visible ribbons turn in unison; the clock freezes
while nothing is on screen, so resuming never jumps. Velocity is bounded (±0.08 rad/frame,
tilt ±0.38 rad) so a flick can never whip the ribbon, and the forced `minSpeed` floor was
removed in favour of a clean settle.

**Interaction.** Pointer capture keeps a drag alive outside the ribbon; release folds the
final pointer velocity into momentum; hover/focus promotes one frame and recedes the rest
(`is-hovering`); arrow keys now step exactly one still via eased `pendingStep`
(`2π·turns/(n−1)`), PageUp/Down step five, so every film moves by the same physical
distance.

**Sound.** One engine, one bed: `init()` is idempotent, defaults to sound **on**, and only
an explicit mute is persisted as off. Autoplay-blocked browsers unlock on the first
pointer/key/touch/wheel gesture; an explicit mute detaches that handler so it is never
overridden. Added `setVolume`/`volume` on the master bus (persisted as `cine-volume`) and a
discreet volume slider beside every mute control, with `subscribe()` so all mounted
controls stay in step. Fixed the ambient teardown race where re-enabling inside the 1.8 s
fade stopped the *new* bed.

### Zakia's Clock — updated stills and screening link
- Read the refreshed `Film Stills/_Zakia_s Clock_ short Film Stills` folder from GitHub:
  **50** stills dated `2026-11-11`, replacing the previous **16**.
- Removed every old record (`Copie de Still 2026-06-23 …`) from `filmStills.ts`, from the baked
  preview module, and from the raw-first host list in `utils/media.ts`. No stale URL remains.
- Regenerated all 50 display previews at the standard 320 px / q72 quality; masters are
  untouched and every new URL was verified `200` with an `image/png` content type.
- Zakia's Clock watch action now opens the supplied Google Drive screening link
  (`drive.google.com/file/d/1c9mrOUBP92CuX9-AKg4dZaXPSq5IqSqC/view`) in a new tab, labelled
  “Watch the screening”.

### Filmography ribbons enlarged and equalised
- Ribbon canvases grew from 940×420 to **1320×600** on desktop (and proportionally on tablet and
  phone). Frame images grew from a 140 px cap to a **196 px cap** (124 px tall), with larger
  captions.
- Spacing is now identical across films: the winding count scales with the still count
  (`turns = 2.9 × (n−1)/28`, capped at 1.6). Delusion 29 → 2.90 turns, Zakia 16 → 1.55,
  Birth Permit 43 → 4.35 — an equal **130 px arc gap** in each ribbon.
- The Birth Permit ribbon uses the same baked inline previews as the other two, so its frames
  match in quality, sizing and load behaviour.

### Filmography restructured into three stacked films
- Landing filmography is now `FilmSections`: three centred films stacked vertically —
  **Delusion of Negation** (Director & Screenwriter), **Zakia's Clock**
  (Director of Photography & Colorist), **The Birth Permit** (First Assistant Director).
- Each section owns a ribbon, credits line, logline, watch action and a GitHub stills-album link.
- The Birth Permit uses baked inline previews (`birthPermitPreviews.ts`) through the same
  `FilmSpiral` engine, so it loads and behaves identically to the other two.
- Removed the featured still beside the Birth Permit Vimeo link; the watch link and logline now
  follow the shared section layout.
- The landing section is spacious by design: larger vertical gaps, wider ribbons and a two-column
  logline/actions block that stacks on phone.

### The Birth Permit — third film ribbon (superseded)
- Added `src/data/birthPermit.ts`: 43 stills extracted from
  `Film Stills/The Birth permit __ Short Film __ Stills`, each pointing at the untouched
  repository original. No image was downloaded, resized or re-encoded to build it.
- Added `BirthPermitRibbon`: a centred third spiral below the existing two, reusing the shared
  `FilmSpiral` engine so movement and interaction match exactly.
- Below the ribbon: a featured still, the logline, the full Vimeo URL, and a **Watch on Vimeo**
  button linking to `https://vimeo.com/1185788174?fl=pl&fe=sh`.
- The featured still is viewport-gated, host-verified and decoded before display; it falls back
  through jsDelivr → GitHub raw → statically.
- The landing filmography now stacks: two side-by-side ribbons, the third ribbon, then its
  Vimeo/logline panel. Archived filmography overlay is unchanged.

### Photography archive — originals only (scoped change)
- The archive grid and its lightbox now render **only untouched originals** through
  `AlbumOriginal`; no compressed preview appears in the photography HTML.
- Added an in-memory cache, 800px viewport gating, four concurrent downloads, and jsDelivr-first
  host ordering to keep the archive responsive without altering any file.
- Every other surface (sphere, film ribbons, portrait, poster) is unchanged.

## Superseded

### Originals only — all derivative images deleted
- Deleted `src/data/previewAssets.ts`, `src/data/previews.ts`, `src/assets/previews/` and the
  preview generation/baking scripts.
- The photography archive, sphere, film ribbons, film viewer and lightbox now request the
  original repository files only.
- `dist/index.html` contains zero inline raster images.
- Delivery relies on `originalHosts()` (jsDelivr → GitHub raw → statically) plus Blob repair for
  files GitHub mislabels with a non-image MIME type.

### Loading optimisations that preserve originals
- Archive: viewport-gated at 450 px, three concurrent downloads site-wide, progress readout,
  neutral skeletons, no broken-image states.
- Sphere: 4 priority frames (3 on touch), two-request queue, depth-gated unlocking.
- Film ribbons: 3 opening frames, two-request queue.
- Repeat views reuse the browser cache.

### Site identity
- Name: **Salim Bakhouch Portfolio Website** (title, Open Graph, application name, loader).
- Canonical URL, `og:url` and WebSite structured data added.

### Device layouts
- Phone composition with bottom chapter dock, stacked film ribbons, compact hero.
- Tablet/iPad composition with floating pill dock, nameplate hero, side-by-side ribbons,
  three-column archive.
- Pre-paint bootstrap selects the composition before React mounts.

### Interactions
- Sphere drag restored to the original feel (`DRAG_M 0.90 × 0.1`).
- Film density derives from each film's still count (29 reference → Zakia 1.55 turns).
- Viewers always load the original, with a spinner until decode.

## Retained decisions

- No LQIP / blur placeholders.
- Thin 1px film edges, no sprockets or number strips.
- Album curation (title, subtitle, intro, caption) shown in the viewer.
- Natural aspect ratios; no forced card sizes.
- `translate3d(...) translate(-50%,-50%) scale(...)` transform order.

## Rejected approaches

- Resizing, re-encoding or regenerating master images — prohibited.
- Inlining full-resolution masters — enormous payload.
- Preloading every gallery image — hidden bandwidth cost.
- Bounding boxes that leave broken images — now impossible.

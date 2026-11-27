# PHASE 02 — ART DIRECTION  
# THE CINEMATIC INSTRUMENT

**Status:** specification only. **No implementation code written or edited.**
**Baseline:** Phase 01 audited source (application source unchanged; checksums in
`HANDOFF.md` §12). This document proposes Phase 03 work and waits for approval.
**Evidence base:** `evidence/phase-01/` — 80 screenshots, four contact sheets and
measurement logs at 1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×800
and 844×390 landscape; the project’s real baked film-still previews (sampled for
colour); current CSS tokens and component code.
**Not available:** the owner’s screen recording. Sound was not auditioned; this
document says nothing about sound character.
**Note on the environment:** a workspace reset after the Phase 01 freeze removed
the local Git repository and the durability bundle/archive. All surviving
application source checksums still match the frozen fingerprints. That is a
continuity failure to resolve, not an art-direction issue.

---

## 1. CREATIVE THESIS

> **ETHEREALISM is a calibrated optical instrument for looking at light: a
> midnight-blue editorial apparatus in silver type, where Salim’s photographs
> and film stills — never the interface — carry the colour, and each film is
> identified by one restrained, evidence-derived warm signal.**

The interface behaves like a well-made instrument: measured, quiet, exact,
spacious at the centre, atmospheric at the edges. It is not a cockpit and not a
moodboard. It is an archive you trust with the work.

---

## 2. PRINCIPLES AND ANTI-PATTERNS

### 2.1 Seven principles

1. **The aperture precedes the chrome.** Masters are shown whole, uncropped,
   ungraded, at their own ratios. Interface lines never cross a photograph.
2. **Measure, don’t decorate.** Every tick, ratio, index and count corresponds to
   real data (36 sphere photographs, 122 stills, 29/50/43, 81/16/10). No invented
   lens data, ratios or credits.
3. **One warm signal per film.** Colour in the film chapters is *evidence sampled
   from the stills*, not a themed overlay. It appears only in index numbers,
   rules, active frames and metadata labels.
4. **Atmosphere at the edges, clarity at the centre.** Grain, haze and bloom live
   at frame edges and behind type — never over faces or across an image’s midtones.
5. **Editorial scale contrast.** Large Fraunces display against 12 px mono
   metadata. Avoid the mushy middle in which everything is 14–18 px and nothing
   leads.
6. **Instrument, not HUD.** Technical marks are sparse, static and semantic. No
   full-screen constellations, no cockpit clutter, no decorative radar.
7. **Authored pacing.** Each chapter has its own scale, rhythm and one accent.
   Transitions are cuts or slow dissolves, never slideshow wipes.

### 2.2 Anti-patterns — explicitly forbidden

- Full-screen cosmic/constellation wireframes, orbit fields or particle skies
  (removed by the owner; must not return).
- A pointer-following luminous bubble, centre glow, cursor expansion or
  hover-reactive light of any kind.
- Visible interaction guides, tutorial overlays, “drag/swipe/use arrows” hints,
  field-notes panels.
- 6–8 px microtype carrying real information; low-contrast grey on black.
- Cropping, upscaling, filtering, duotoning, grading or recompressing masters.
- Heavy grain over faces; bloom that lifts blacks; glassmorphism on every panel.
- Rounded floating cards, pill clusters, generic awards-site hero layouts.
- Hover-only metadata or keyboard-invisible states.
- Replacing the sphere with a grid or the ribbons with a carousel.
- Imitating OFF+BRAND / Lando Norris / Dune / Interstellar / CONTROL branding,
  layouts, motifs or sounds.
- Fake instrument data, invented technical labels, invented film credits.

---

## 3. WHAT THE AUDIT SAYS — WHY THIS DIRECTION

| Evidence (Phase 01) | Art-direction consequence |
|---|---|
| Sphere cluster is **11 %** of viewport width at 1920 (22 % at 1440) | Photography chapter becomes a true light table: sphere target **46–52 %** at ≥1600, **32–38 %** at 1440 |
| Film frames max **183 px** at 1920 inside a 1360 px stage | Frame target **230–260 px** at ≥1600, **190–210 px** at 1440; stage breathes less |
| **105–111** visible text nodes below 11 px; captions 6.5–7 px | New floor: **12 px** for all essential metadata; 10 px only for non-information registration marks |
| `--muted #495869` = **2.77:1** on base | Remove as text token; replace with `text-quiet #7C8FA6` (6.09:1) |
| **136/144** phone controls under 44 px in one dimension | All primary controls ≥ **44 × 44 px** hit area |
| Header tagline collides with nav at 1024/768/844 | Recompose the header into two planes; remove the centre tagline at ≤1180 |
| Phone hero has a ~180 px dead band | Move the identity plate into the band; portrait stays full-width and unobstructed |
| Delusion warm hue ≈27°, Zakia ≈63°, Birth ≈62° (sampled) | Three distinct film temperatures — cyan/oxide vs field ochre vs sodium amber |
| Duplicate 2.4 MB payload, 160 image elements | Keep the single-file build; no new runtime assets or libraries |

**Diagnosis:** the identity is already correct. The problems are *scale*,
*legibility*, *hierarchy* and *chapter distinction*. This direction fixes those
without redesigning the identity.

---

## 4. TWO ROUTES

### Route A — **CALIBRATED INSTRUMENT** (precision-led)

Keeps the current architecture-language (slates, chapter index, viewfinder,
hairlines) and turns it into a coherent instrument system. Cool silver
typography, larger optics, measured rails, generous negative space, film accents
used strictly as data. The darkroom is felt in the grain and the blacks; the
surface is precise.

- **Feels like:** a cinematographer’s light meter, an archival contact sheet, a
  well-printed monograph.
- **Strengths:** closest to the existing authored identity; solves legibility and
  archive clarity; scales to large desktops; lowest implementation risk.
- **Risks:** can become cold or “dashboard-like” if marks multiply. Mitigation:
  cap graphic marks per viewport and keep one warm signal per film.

### Route B — **DARKROOM EMULSION** (material-led)

Fewer rules, larger tonal washes, image-first with metadata at the edges. Film
accents are allowed to bleed into chapter washes at ≤6 % area; transitions feel
chemical and slow; captions feel like grease-pencil notes on a sleeve. The
instrument becomes an atmosphere rather than a panel.

- **Feels like:** the darkroom tray, a film canister, a projected frame in a dark
  room.
- **Strengths:** more emotional, more photographic, potentially more distinctive.
- **Risks:** softens the archive’s information architecture; a warm-washed
  direction can drift toward generic “cinematic” templates; higher risk to
  contrast and to the blue identity; harder to keep chapter distinctions crisp.

### 4.1 Comparison against the current portfolio

| Criterion | Current | A — Calibrated Instrument | B — Darkroom Emulsion |
|---|---|---|---|
| Continuity with ETHEREALISM | — | High | Medium |
| Legibility gain | — | High (measured floors) | Medium (softer contrast) |
| Archive clarity | Weak small type | High | Medium |
| Film differentiation | Low | High (three sampled accents) | High |
| Desktop drama | Under-scaled | High via optics + scale | High via atmosphere |
| Mobile composition | Dead band, tiny type | High | Medium |
| Blue monochrome identity | Strong | Strong | At risk |
| Implementation cost | — | Medium (CSS + scale props) | Medium-high (wash system) |
| Regression risk | — | Low-medium | Medium-high |

### 4.2 Recommendation

**Adopt Route A — Calibrated Instrument — with one borrowed B device:** the
Photography chapter header may use a single, static darkroom tonal wash (≤6 %
sapphire) behind the sphere, and chapter transitions may dissolve over 520 ms
rather than cut. Nothing else moves toward B.

Reason: A preserves the authored identity, is testable against hard evidence,
and directly repairs the audit’s failures. B is beautiful but would need a second
legibility system to survive the archive, multiplying risk.

---

## 5. CHAPTER MAP

Global: one 12-column desktop grid, 8-column tablet, 4-column phone. Gutters and
type scale below. Chapter numbers remain 01 Arrival · 02 Photography · 03
Filmography · 04 Featured · 05 Profile · 06 Contact. Navigation, sphere and
ribbons keep their engines.

### 5.1 Hero — “Arrival Plate”

**Intent:** the portrait is the first instrument reading. Calm, full-height,
unobstructed.

**Desktop composition (≥1181 px):**
- 100 svh. Portrait occupies columns 4–12, full available height, bottom-anchored,
  `object-fit: contain`, `object-position: bottom center`; no crop.
- Left rail columns 1–3: `SALIM BAKHOUCH` monogram at top (existing), then at
  ~38 % viewport height: chapter mark `01 / ARRIVAL`, role line
  `Cinematographer & image maker` in Fraunces 32–44 px, one italic thesis line
  at 18 px, availability line with a 5 px cyan indicator.
- Bottom slate strip (full width, 56 px high, 1 px top rule): four fields —
  `BORN / BERLIN · LISBON` · `PRACTICE / NARRATIVE · PORTRAIT · SPATIAL` ·
  `LATEST / DELUSION OF NEGATION, 2026` · `STATUS / AVAILABLE` — 12 px mono.
- Nav stays at the top; the centre “DOP — Berlin / Lisbon” tagline is removed
  below 1181 and replaced by the role line in the rail.
- Viewfinder: hover/focus only, density reduced ~25 %, labels ≥10 px, never
  covers the face at rest. No scroll cue, no guide text.

**Mobile composition (≤720 px):**
- Nav 56 px. Portrait full-bleed width beneath it, top-anchored, face clear.
- Identity plate occupies the previously empty band above the dock: chapter mark,
  name at 26–30 px Fraunces, role line at 14 px, availability dot. No MetaCard,
  no duplicated caption, no scroll cue.
- Dock stays 60 px + safe area. Nothing overlaps the dock.

**Motion:** portrait breathing retained but reduced to 1.002 scale / 4 px float;
first-load fade 600 ms. No parallax on touch.

**Acceptance:** face unobstructed at all six viewports; no overlap with dock/nav;
portrait natural ratio preserved; left rail never below 12 px.

### 5.2 Photography — “Light Table”

**Intent:** the archive as a physical light table, not a widget.

**Desktop:**
- Chapter header left-aligned to the grid: `02 / STILL IMAGE`, `Photography` in
  Fraunces 56–72 px, subtitle in 13 px mono, then a data rail
  `36 SELECTED · 81 CATALOGUED · 16 ALBUMS · 10 COLLECTIONS`.
- Sphere stage: target cluster width **46–52 %** of viewport at ≥1600,
  **32–38 %** at 1440, **55 %** at 1024, **86 %** at phone width. Increase via the
  sphere’s existing scale constants and stage sizing only; do not alter geometry,
  distribution order or interaction.
- Surround the stage with **three static 1 px orbit ticks** at 12 % opacity and
  the camera-style corner marks. No constellations, no particle field, no
  pointer-reactive light.
- “Browse all albums” becomes a 44 px control with a 12 px label.
- Album viewer (“light table”): image 62 % / notes 38 %; image whole, max 78 svh;
  notes column max 40 ch; title 28–34 px; intro 15 px / 1.65; photo caption 13 px.
  Index and count in 12 px mono. Close control 44 × 44 px.
- Archive: album rail 264 px; content max 1440 px; 3 columns ≥1280, 2 columns
  768–1279. Tile captions 12 px, counts 12 px mono, no hover-only information.

**Mobile:**
- Header centred, title 30 px.
- Sphere stage 86 % width; drag and tap unchanged.
- Album viewer stacks: image, then notes; 24 px side margins; close pinned 44 px.
- Archive: 2 columns; 20 px gutter; captions 12 px, maximum two lines.

**Accent:** photography stays neutral blue/silver. No warm film accents here.

**Acceptance:** sphere cluster meets target share; 36 cards; no new layers behind
images; captions ≥12 px; no tile below 44 px target.

### 5.3 Filmography — “Three Reels, Three Temperatures”

**Intent:** three films as three calibrated reels, each with one evidence-derived
temperature; one shared ribbon engine.

**Desktop:**
- Each film is a chapter band separated by a 1 px rule and 96–128 px of space.
- Top slate (one component, reused) is **fully data-driven from the existing
  `FilmSection` metadata** in `FilmSections.tsx`:
  `index`, `credit`, `title` + `emphasis`, `year`, `format`,
  `stills.length`. Left: `index` in the film accent and `credit` in 12 px mono.
  Centre: title in Fraunces 40–52 px. Right:
  `year · format · stills.length STILLS`, all 12 px mono.
  **Never reuse the Delusion numbers, credits or counts for another film.** The
  illustrative `29` shown in this document belongs only to Delusion of Negation;
  Zakia’s Clock renders 50 stills and The Birth Permit 43. The same rule applies
  to the full archive (`FilmographyGallery.tsx`).
- Ribbon stage: 60–66 vw wide; frame width **230–260 px** at ≥1600,
  **190–210 px** at 1440, **140–160 px** at tablet (provisional, for visual verification), **120–140 px** at phone.
  Increase via `fitScale` / frame sizing only; do not touch geometry, winding,
  transform order or RAF.
- Logline: 17 px Space Grotesk, max 46 ch, colour `text-secondary`.
- Actions row: `Watch the film` (primary, 44 px), `Open stills album`,
  `GitHub` (secondary, 12 px mono, 44 px hit area).
- Film accents: index numeral, a 24–40 px rule, active-frame outline, metadata
  label. Total accent area ≤ **6 %** of the chapter.
- Delusion accent also marks the Featured Project chapter; Zakia and Birth Permit
  remain inside their own chapters.

**Mobile:**
- Slate stacks: index + title 30–34 px, role and counts on one wrapped line 12 px.
- Ribbon 92 vw, frames 120–140 px; logline 16 px / 1.65; actions stacked, each
  ≥44 px high.
- Archive button full width.

**Accent sampling (measured from 8 / 12 / 12 baked stills) — PROVISIONAL:**

| Film | Mean hue | Mean L / C | Primary accent | Secondary spark | Reading |
|---|---:|---|---|---|---|
| Delusion of Negation | 27.2° | 0.535 / 0.084 | `#D08C7E` dust oxide | `#8FC3DC` clinical cyan | fluorescence + flesh + theatre red |
| Zakia’s Clock | 62.7° | 0.489 / 0.076 | `#C9A46F` field ochre | `#7E9BAE` soft sky | daylight, wood, dust |
| The Birth Permit | 61.8° | 0.563 / 0.101 | `#E2AE74` sodium amber | `#BFD0A2` institutional green | bureaucratic fluorescent |

**Acceptance:** three visibly distinct temperatures without tinting images;
frame size target met; captions ≥12 px; actions ≥44 px; one shared ribbon engine.

### 5.4 Featured Project — “The Poster as Artefact”

**Intent:** one film presented like a framed object, not a marketing card.

**Desktop:** 5/7 split. Poster max 520 px wide, contained, never cropped, with a
12 px caption beneath (`OFFICIAL POSTER · FULL RESOLUTION`). Right column:
`04 / FEATURED PROJECT` in Delusion accent, title in Fraunces 48–64 px, logline
18 px max 44 ch, credits 13–15 px, watch control 44 px and honest about its
destination (real URL or “Coming [month]” state — owner decision).
**Mobile:** poster 86 vw, then title 34–40 px, logline 16 px, credits 13 px,
watch control full-width 48 px.

### 5.5 Archive — “Darkroom Cabinet”

**Intent:** the full archive should feel like opening a cabinet, not a modal.

- Keep the full-screen overlay pattern and portal architecture.
- Header 64 px: back control (44 px), centred archive title 20 px, counts 12 px
  mono, audio control.
- Desktop: left rail 264 px, 12–13 px album names, 11–12 px counts, active album
  marked by a 2 px accent bar and `surface-instrument`.
- Content: 3 columns; title 40–56 px; intro 15 px max 62 ch; progress and source
  actions 12 px.
- Lightbox: 78 % image / 22 % notes on desktop, image whole, no crop; 44 px
  controls; 12 px index; 13 px caption; focus returns to the tile on close.
- No heavy borders, no rounded cards, no decorative graphics.

### 5.6 About / Contact — “Colophon and End Slate”

**About:** 5/7 split. Left: `05 / PROFILE`, headline “Light is a language. I
write with it.” in Fraunces 48–64 px. Right: lead 24 px italic, body 17 px /
1.7, max 62 ch. Below: four statistics at 44–64 px Fraunces with 12 px mono
labels (81 / 16 / 122 / 03). Tools row 12 px mono.
**Contact:** full-width end slate. `06 / CONTACT`, “Let’s shoot.” at
clamp(52 px, 9 vw, 112 px), email 18–20 px, three contact columns at 13–15 px,
social row 14 px, legal 12 px. Real identity required before this chapter is
considered finished.

---

## 6. COLOUR-ROLE SYSTEM

### 6.1 Rules

- **Semantic tokens only.** Components reference roles (`text-tertiary`,
  `surface-panel`), never raw hex.
- **Provisional values.** All tokens must be validated on the real images and
  surfaces before being frozen. Values below are computed, not yet visually
  tested in situ.
- **Area budget per viewport:** neutral surfaces/type **92–96 %**, blue accents
  **4–6 %**, film accents **≤2–3 %** (and ≤6 % per film chapter).
- **No image tinting.** The only colour on a photograph is the photograph.
- **Essential text ≥4.5:1**; large display ≥3:1; non-essential registration marks
  may sit at 3:1 but must carry no unique information.
- **Contrast is verified against each component’s actual rendered background** —
  base page, `surface-raised` slate, `surface-panel` album rail, viewer panel,
  active album row, poster caption, footer panel and overlay scrim — not only
  against `#050709`. The token table’s ratio column is a starting reference;
  Phase 03 must measure composited backgrounds (including gradients and any
  translucent layer) in the browser before any token is frozen.
- CSS strategy: declare hex fallback, then override inside
  `@supports (color: oklch(0 0 0))`. Do not rely on colour alone for state.

### 6.2 Tokens

| Token | Hex | OKLCH | Contrast on base | Role |
|---|---|---:|---:|---|
| `--surface-void` | `#03060A` | `oklch(0.119 0.013 247.6)` | 1.01:1 | overlay ground |
| `--surface-base` | `#050709` | `oklch(0.127 0.007 243.8)` | — | page ground (current) |
| `--surface-raised` | `#08111B` | `oklch(0.174 0.025 251.5)` | 1.06:1 | cards, slate plates |
| `--surface-panel` | `#0B1724` | `oklch(0.201 0.031 251.5)` | 1.12:1 | archive rail, panels |
| `--surface-instrument` | `#0F2133` | `oklch(0.242 0.042 250.0)` | 1.24:1 | headers, active rail |
| `--text-primary` | `#EEF3FA` | `oklch(0.962 0.011 256.7)` | 18.10:1 | headings, hero |
| `--text-secondary` | `#C9D5E3` | `oklch(0.868 0.023 252.2)` | 13.56:1 | body |
| `--text-tertiary` | `#9DAEC3` | `oklch(0.745 0.036 253.8)` | 8.91:1 | captions, metadata |
| `--text-quiet` | `#7C8FA6` | `oklch(0.643 0.041 253.3)` | 6.09:1 | least emphasis (≥12 px) |
| `--line-hair` | `#1A2633` | `oklch(0.264 0.030 251.0)` | 1.32:1 | 1 px hairlines |
| `--line-soft` | `#253546` | `oklch(0.323 0.037 250.5)` | 1.61:1 | dividers |
| `--line-strong` | `#3A5168` | `oklch(0.426 0.048 249.0)` | 2.46:1 | active border |
| `--blue-core` | `#3D9FFF` | `oklch(0.691 0.168 251.3)` | 7.30:1 | primary accent (current) |
| `--blue-bright` | `#8FD2FF` | `oklch(0.835 0.093 238.7)` | 12.33:1 | focus ring, highlights |
| `--blue-deep` | `#1B5FB8` | `oklch(0.495 0.156 257.2)` | 3.24:1 | pressed, deep fill |
| `--blue-ink` | `#03101D` | `oklch(0.168 0.034 247.1)` | 1.05:1 | text on blue fills |
| `--film-delusion` | `#D08C7E` | `oklch(0.705 0.086 32.1)` | 7.43:1 | Delusion warm signal |
| `--film-delusion-cool` | `#8FC3DC` | `oklch(0.790 0.065 229.2)` | 10.58:1 | Delusion clinical spark |
| `--film-zakia` | `#C9A46F` | `oklch(0.740 0.082 75.9)` | 8.67:1 | Zakia signal |
| `--film-birth` | `#E2AE74` | `oklch(0.786 0.096 68.7)` | 10.13:1 | Birth Permit signal |
| `--silver-gelatin` | `#D6DEE8` | `oklch(0.897 0.016 253.9)` | 14.87:1 | neutral instrument silver |

**Removed as a text colour:** `#495869` (`--muted`, 2.77:1). It may survive only
as a non-informational line/graphic colour at ≥3:1 usage, never for text.
**Do not** introduce a fourth hue family. Warm signals are limited to the three
films; no orange CTA, no purple, no teal gradient.

---

## 7. TYPOGRAPHY

### 7.1 Roles only

| Family | Role | Never |
|---|---|---|
| **Fraunces** (display serif, variable) | Hero identity, chapter titles, film/project titles, large numerals, pull quotes. Weight 300–380, optical size auto. Italic for one emphasis clause only. | Body copy, metadata, buttons |
| **Space Grotesk** (sans) | Body, lead paragraphs, loglines, navigation words, form-like controls in sentence case. Weight 300–400. | Display headlines, mono data |
| **JetBrains Mono** (mono) | Counts, indices, roles, years, technical labels, legal, archive metadata. Weight 400, tabular numerals, tracking 0.16–0.22 em, uppercase for labels ≤3 words. | Paragraphs, long headings |

### 7.2 Responsive scale (provisional)

| Step | Phone (≤720) | Tablet | Desktop | Use |
|---|---|---|---|---|
| Display / end slate | 44–56 px | 64–80 px | `clamp(52px, 8.5vw, 112px)` | “Let’s shoot.”, archive links |
| H1 identity | 26–30 px | 40–48 px | `clamp(32px, 3.4vw, 56px)` | hero name/role |
| H2 chapter | 30–34 px | 40–48 px | `clamp(40px, 4vw, 64px)` | Photography, Filmography, About |
| H3 film/project | 28–34 px | 34–44 px | `clamp(36px, 3.6vw, 52px)` | film titles, poster title |
| H4 / slate | 18–20 px | 20–22 px | 22–24 px | panel headings |
| Lead | 18 px / 1.55 | 20 px / 1.5 | 22–24 px / 1.45 | thesis, lead paragraph |
| Body | **16 px** / 1.7 | 16.5 px / 1.7 | **17 px** / 1.7 | paragraphs, loglines |
| Body S | 14 px / 1.65 | 15 px / 1.65 | 15 px / 1.65 | secondary paragraphs |
| Caption | **12 px** / 1.45 | 12 px / 1.45 | **13 px** / 1.45 | image captions, notes |
| Metadata | **12 px** mono | 12 px | **12 px** mono | counts, roles, years, indices |
| Micro / registration | 10 px | 10 px | 10 px | non-information marks only |

**Hard rules:** no essential information below 12 px; no body copy below 16 px;
measure 58–66 ch for body, 38–46 ch for loglines; uppercase only for labels ≤3
words; no letter-spacing on Fraunces; use `font-variant-numeric: tabular-nums`
for all counts; line-height never below 1.4 for body or 1.25 for captions.

---

## 8. GRID, SPACING, FRAMES AND LINES

### 8.1 Spacing base
4 px scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 · 200.
Section rhythm: **96 px phone · 128 px tablet · 160–200 px desktop**.
Gutters: 20 px phone · 32 px tablet · `clamp(48px, 4.5vw, 72px)` desktop.
Content max: 1560 px editorial; 1440 px archive; 62 ch body measure.

### 8.2 Grid
- Desktop ≥1181: 12 columns, 24 px gap.
- Tablet 721–1180: 8 columns, 20 px gap.
- Phone ≤720: 4 columns, 16 px gap.
- Keep the existing device classification and `data-layout` attributes.


### 8.3 Optics scale targets (evidence vs proposal)

| Viewport | Current sphere cluster | Proposed | Current max ribbon frame | Proposed |
|---|---:|---:|---:|---:|
| 1920×1080 | 219 px (11 %) | 884–998 px (46–52 %) | 183 px | 230–260 px |
| 1440×900 | 321 px (22 %) | 461–547 px (32–38 %) | 154 px | 190–210 px |
| 1024×768 | 463 px (45 %) | 563 px (55 %) | 136 px | 170–190 px |
| 768×1024 | 424 px (55 %) | 422–480 px (55–62 %) | 176 px | **140–160 px** (provisional) |
| 390×844 | 344 px (88 %) | 335–370 px (86–95 %) | 125 px | 120–140 px |
| 360×800 | 347 px (96 %) | 310–342 px (86–95 %) | 115 px | 120–140 px |

Phone is already spatially generous; the change there is restraint (86–95 %),
not enlargement. Desktop is where the optics must grow. These targets are set
through existing stage sizing / `fitScale` values only.

### 8.4 Frames and lines
- **1 px only** for rules; no 2 px borders except active album/accent bars.
- Hairlines: `line-hair`. Dividers between chapters: `line-soft`. Active state:
  `line-strong` or `blue-core` at 55 %.
- Corner radii: **0 px** for image frames and slates; **999 px** only for the
  audio control, availability dot and dock.
- Images: `object-fit: contain`, natural ratio, no fixed-ratio boxes, no border
  thicker than 1 px, no shadow larger than `0 24px 60px rgba(0,0,0,.35)`.
- Captions sit on `surface-raised` with a 1 px top rule, min height 44 px,
  12 px text, index left / title or file right.
- Slate component: 1 px top rule; 12 px mono; 44 px minimum height; index,
  title, role, year, count columns; never more than two rows of metadata.

---

## 9. GRAPHIC LANGUAGE

All graphic marks are **generative CSS/SVG, static unless listed**, and never
overlay a master’s focal area.

**Viewfinder.** Keep the authored EVF. Reduce line count ~25 %; labels ≥10 px;
metadata only for real values. Idle: absent. Focus/Enter: reveal over 650 ms.
Escape/leave: fade 450 ms. Never auto-play on load.

**Orbital geometry.** Allowed **only inside the Photography sphere chapter**, as
three static orbital arcs/ticks around the sphere. It must **not** appear in the
photography archive, filmography archive, viewers or any other chapter. 1 px,
10–14 % opacity, no particles, no full-viewport field, no cursor response. This
respects the owner’s removal of the cosmic background while retaining the sphere’s
astronomical logic.

**Registration marks.** 8 px L-shaped corner ticks at chapter seams, 1 px,
`line-soft`, maximum four per viewport, never on archive content or images. They
frame the page like a film gate, not a HUD.

**Project slates.** A reusable component fed entirely from existing film
metadata: `{index} / {credit}`, `{year} · {format} · {stills.length} STILLS`,
a 24–40 px accent rule, title. No hard-coded per-film values; the example
`01 / DIRECTOR & SCREENWRITER · 2026 · 29 STILLS` applies only to Delusion of
Negation. 12 px mono,
tabular numerals, 1 px rule above. This is the primary chapter-identification
device and replaces scattered one-off labels.

**Transitions.** Chapter enter: opacity 0→1 and translateY 12→0 over 560 ms,
`ease-expo`. Overlay open: 400 ms dissolve; close 320 ms. Stills/viewer image
change: 450 ms crossfade, no slide. Loading: existing loader retained, reduced
to a single hairline + count. No flying images, no page-flip, no particle bursts.

**Chapter distinction** comes from scale, accent and rhythm — not from different
fonts or decorative themes:
- Photography: largest spatial field, neutral blue/silver.
- Filmography: strongest type scale + three warm signals + slate rails.
- Featured: single framed artefact, Delusion signal.
- Archive: densest information, quietest colour.
- About/Contact: largest type, warmest silver-white, least graphic.

---

## 10. LIGHT, BLOOM, HAZE, GRAIN, REFLECTION

- **Base:** `surface-base #050709`; never pure black.
- **Atmosphere:** at most **two** static radial washes behind the page (sapphire
  6 % max, navy 4 % max), placed at edges/horizon. No centre bloom.
- **Bloom:** ≤5 % alpha, static; no breathing pulse; no hover state; never lifts
  blacks above ~#0B1118 in the centre field.
- **Haze:** one large radial layer ≤4 % alpha, `screen`; no cursor influence.
- **Grain:** two layers, combined opacity **0.05–0.08**, `overlay` + `soft-light`;
  step animation 0.9–1.2 s; disabled under reduced motion. No grain above faces
  at >0.06.
- **Reflection:** only as a subtle gradient on slate/panel surfaces (≤5 %), never
  beneath photographs, never a fake mirror.
- **Lighting:** keep the existing portrait key/fill intent, but no pointer-driven
  light. `LightingLayer` stays unmounted.
- **Reduced-motion contract (explicit):** under
  `prefers-reduced-motion: reduce`, **disable portrait breathing**, **disable all
  hover scaling** (including card/image `scale`), **disable animated grain**
  (static or off), and **disable every looping animation** (bloom, scanline
  drift, light band, cursor effects, marquee). Ribbon/sphere idle rotation pauses
  or becomes user-driven. Fades must not exceed 150 ms. All content remains
  visible and reachable.

---

## 11. MOTION AND INTERACTION FEEDBACK

| Event | Duration | Easing | Notes |
|---|---:|---|---|
| Hover border/label | 180–220 ms | ease-out | 1 px border to accent 35–55 %; optional image scale **1.012 max** inside a fixed frame |
| Press | 90–120 ms | ease-out | scale 0.99; no colour flash |
| Focus | immediate | — | 2 px `blue-bright` ring, 2 px offset; always visible on keyboard |
| Chapter reveal | 560 ms | `cubic-bezier(.16,1,.3,1)` | opacity + 12 px Y; once per view |
| Overlay open / close | 400 / 320 ms | `ease-expo` | dissolve, no slide |
| Image change in viewer | 450 ms | crossfade | no layout shift; no swipe hijack of vertical scroll |
| Ribbon idle / drag | engine-controlled | retained | no new loop; pause off-screen/hidden/covered |
| Sphere idle / drag | engine-controlled | retained | unchanged physics |
| Reduced motion | ≤150 ms | linear | portrait breathing off; hover scaling off; animated grain off; all looping motion off; no transforms that move content |

**Feedback rules:** hover must never be the only way to see information; every
action has focus and touch parity; no hover glow around the cursor; no sound
changes in this phase (sound identity retained, one engine).

---

## 12. KEY COMPOSITIONS (TEXTUAL)

**Desktop 1920 hero:** dark field; portrait columns 4–12 at full height; left
rail with chapter mark, 44 px Fraunces role line, italic thesis, availability;
thin slate strip along the bottom with four real data fields; nav on one clean
plane; viewfinder dormant. The image is the largest object; type is quiet.

**Desktop 1920 filmography:** a 56 px chapter title; then three bands, each
opening with a slate rail and a 48 px film title; ribbon stage 60 vw with
230–260 px frames; logline 17 px in a 46 ch column; three actions; each band
carries one warm signal only. Generous 128 px gaps make each film a place.

**Desktop 1920 archive:** 264 px album rail at `surface-panel`; 3-column light
table; 40 px album title; 15 px intro; 12 px captions; no decoration. The room
gets quieter as the archive gets denser.

**Mobile 390 hero:** 56 px nav; full-width portrait from y≈56 to ≈560; identity
plate in the band above the 60 px dock; 26 px Fraunces name; 14 px role; no
floating cards. One uninterrupted vertical gesture: image → identity → dock.

**Mobile 390 filmography:** stacked slate (30 px title), 92 vw ribbon with
120–140 px frames, 16 px logline, full-width 44 px actions; one accent per film.

---

## 13. VISUAL ACCEPTANCE CRITERIA

1. All essential text ≥ **12 px**; body ≥ **16 px**; zero essential text below
   4.5:1 contrast on its actual background.
2. Sphere cluster width ≥ **46 %** of viewport at ≥1600, ≥32 % at 1440, ≥84 %
   at 390; 36 cards; geometry and interaction unchanged.
3. Largest ribbon frame ≥ **230 px** at 1920 and ≥ **190 px** at 1440; 3 ribbons;
   122 frames; one engine; no per-film geometry flags.
4. No horizontal overflow and no nav/dock collisions at 1920, 1440, 1024, 768,
   390, 360 and 844×390 landscape.
5. Portrait face unobstructed; full-height portrait retained; natural 1312×1199.
6. Film accents appear only in index/rules/active frames/labels; total warm
   accent area ≤6 % per chapter; no tint on any image.
7. No cosmic background, no pointer light, no visible guide, no centre bloom.
8. Every interactive control has a visible focus state and ≥44×44 px touch area.
9. No overlay leaves body scroll locked; Escape and focus return verified.
10. Masters untouched: no crop, resize, filter, grade or recompression; all
    album and still relationships intact.
11. Reduced motion: all content visible, no looping motion, no grain animation.
12. Build remains one `dist/index.html`; no new runtime libraries.

---

## 14. IMPLEMENTATION MAPPING (for Phase 03 — not started)

- **Token layer:** replace/extend `:root` in `src/index.css` with the semantic
  tokens; hex first, `@supports` OKLCH override. Keep old aliases temporarily to
  avoid a wide-bang change.
- **Type layer:** add role utilities (`.type-display`, `.type-h2`, `.type-body`,
  `.type-meta`, `.type-caption`) and retire one-off tiny declarations.
- **Components (CSS-first):** `Nav.tsx`, `HeroText.tsx`, `MetaCard.tsx`,
  `Portrait.tsx`, `ScrollSphere.tsx` (scale/stage only), `FilmSections.tsx`,
  `FilmSpiral.tsx` (frame scale only), `PhotographyGallery.tsx`,
  `FeaturedProject.tsx`, `About.tsx`, `Footer.tsx`, `ChapterRail.tsx`,
  `MobileDock.tsx`, `ArchiveLinks.tsx`.
- **Data:** no manifest schema changes; no new media assets; film accents are
  tokens, not image-derived runtime code.
- **No new libraries.** No WebGL/Three/Rive. CSS/SVG only.
- **Performance:** keep 203 baked previews and the single-file output; avoid
  adding full-viewport blend layers beyond the existing set.
- **Verification:** repeat the Phase 01 six-viewport capture + landscape, run the
  interaction journeys and contrast/size checks, and diff against
  `evidence/phase-01/`.

**Explicitly out of scope:** sound changes, sphere/ribbon engine rewrites,
manifest migrations, loading strategy changes, contact/watch content (pending
owner input), deployment.

---

## 15. OWNER DECISIONS REQUIRED

1. **Route:** A (Calibrated Instrument) — recommended — or B (Darkroom Emulsion).
2. **Type floor:** approve essential metadata 12 px / body 16–17 px, which is a
   visible increase over the current 6.5–11 px microtype.
3. **Warm film signals — provisional:** the three sampled accents (`#D08C7E`,
   `#C9A46F`, `#E2AE74`) stay provisional until all three chapters have been
   compared against their actual stills in situ and the owner has seen them. They
   are limited to metadata/index/active-frame use meanwhile; if comparison fails,
   keep the film chapters blue and distinguish them by scale, slate and luminance.
4. **Hero recomposition:** approve removing the centre tagline at ≤1440 and the
   duplicated mobile caption, and introduce the bottom slate strip.
5. **Optics scale:** approve enlarging the sphere to the stated share and film
   frames to 230–260 px without changing geometry.
6. **Archive viewer:** approve the 62/38 light-table layout and 264 px album rail.
7. **Placeholder integrity:** unverified biography, availability, location,
   contact addresses, social URLs and film destinations are **preserved as
   placeholders** exactly as they exist. Do not invent or publish values. No
   fabricated link may be introduced by art direction or implementation.
8. **Delusion watch URL:** remains a placeholder destination (`#`) until the owner
   supplies a real link or an approved “Coming [month]” state.
9. **Phase 02 pending items 5–11** from the owner pre-flight remain unresolved:
   scope, watch URL, contact values, deployment token, canonical correction,
   portrait delivery copy, GitHub authorisation.

### 15.1 Decisions needed for Phase 03 (local visual foundation)

- Route A approval — **granted**.
- Type floor (12 px essential / 16–17 px body) — required to implement typography.
- Colour roles and ramps, including retiring `#495869` as text — required for tokens.
- Hero recomposition (rail, tagline removal ≤1180, bottom slate, no duplicate caption).
- Chapter labels/slates and section identities.
- Orbit marks restricted to the Photography sphere.
- Film accents used **provisionally** in metadata only.
- Reduced-motion contract.

### 15.2 Decisions deferred — do not block Phase 03

- **Contact chapter:** final biography, availability, location, emails and social
  URLs (placeholders preserved).
- **Featured Project / filmography:** real Delusion watch URL, screening links and
  any final film credits beyond existing metadata.
- **Deployment:** deed.page token or new slug, canonical URL correction, portrait
  delivery-copy acceptance, GitHub push/PR authorisation.
- Sphere/ribbon optics enlargement beyond foundation tokens and frame rules, and
  all archive-viewer layout changes, are staged for later implementation phases.

**Phase 03 may proceed locally on the foundation without any 15.2 item.** Contact,
Featured Project and Deployment remain blocked exactly as recorded, and no
fabricated values may be introduced to unblock them.

---

## 16. EVIDENCE

- `evidence/phase-01/screens/` — baseline captures and contact sheets.
- `evidence/phase-02/film-colour-sample.json` — sampled still colours (8/12/12).
- `evidence/phase-02/colour-sample.mjs` — reproducible sampler.
- `evidence/phase-02/palette-check.mjs` — OKLCH conversion and contrast checks.
- Current tokens and type declarations: `src/index.css`.
- Audit measurements and defect register: `PHASE-01-BASELINE-AUDIT.md`.

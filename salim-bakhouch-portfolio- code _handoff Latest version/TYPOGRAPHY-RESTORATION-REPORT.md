# TYPOGRAPHY RESTORATION + LAYOUT CORRECTIONS

Owner feedback addressed: restore the previous typography, fonts, sizes and the
colour-split serif treatment; fix the sphere/typography overlap; fix filmography
ribbon clipping above and below the scroll limit.

**Deployment:** none. Production untouched.

---

## 1. Typography restored to the original

The Phase 03 semantic scale (12 px metadata floor, 16–17 px body, larger
headings) is **removed**. The previous authored metrics are back exactly, read
from the original rules still present in `src/index.css`:

| Role | Restored value |
|---|---|
| Eyebrow / kicker | JetBrains Mono **8.5 px**, tracking 0.26 em |
| Chapter title (`spatial-title`) | Fraunces **clamp(1.7rem, 3vw, 2.6rem)** — 41.6 px at 1440 |
| Chapter subtitle | JetBrains Mono **8 px**, tracking 0.2 em |
| Film title | Fraunces **clamp(1.85rem, 4vw, 3.2rem)** — 51.2 px at 1440 |
| Film meta | JetBrains Mono **7.5 px**, tracking 0.2 em |
| Film logline | Space Grotesk **clamp(0.82rem, 1.05vw, 0.92rem)** |
| Film caption | JetBrains Mono **7 px** |
| Watch CTA | JetBrains Mono **8.5 px** |
| Album links / text actions | JetBrains Mono **7–7.5 px** |
| Muted colour | **`#495869`** (`--muted`) restored |
| Type family tokens | Fraunces / Space Grotesk / JetBrains Mono, unchanged |

**Colour-split typography restored:** italic display emphasis is again
`var(--accent-bright)` (`#7ec4ff`) — Photography, Filmography, film titles,
Featured title and About headline. Verified rendered colour:
`rgb(126, 196, 255)`.

The entire Phase 03 token block, `.type-*` role utilities, legibility floor and
all appended typography rules were removed from `src/index.css`. `:root` is back
to the original authored tokens, extended only with **non-visual aliases**
(`--surface-*`, `--text-*`, `--line-*`, `--blue-*`) and the three provisional film
accents. Previously-undefined but referenced aliases (`--ease-out`,
`--font-body`, `--accent-rgb`, `--bg-base`) are now declared — these fix latent
broken references without changing appearance.

## 2. Sphere / typography overlap — fixed

**Cause:** the Photography chapter header was absolutely positioned inside the
section, and the sphere cards are absolutely positioned and vertically centred in
the full section height. At larger content or shorter viewports the sphere's upper
cards sat behind the header text (measured previously as negative gaps).

**Fix (structural, `src/index.css`):**
- `#photography.sphere-section` becomes a column flex layout.
- `#photography .spatial-header` is placed **in flow** (`position: relative`,
  `top: auto`) with its own reserved padding.
- `.sphere-wrap` becomes `flex: 1 1 auto` with `position: relative; inset: auto`,
  so the sphere occupies the remaining band only.
- Sphere engine, card distribution, geometry and interaction untouched.

**Measured after fix (header bottom → first card top):**

| Viewport | Header bottom | First card | Gap | Overlap |
|---|---:|---:|---:|---|
| 1920×1080 | 218 | 514 | **296** | No |
| 1440×900 | 204 | 381 | **178** | No |
| 1024×768 | 182 | 302 | **121** | No |
| 768×1024 | 199 | 384 | **185** | No |
| 390×844 | 168 | 319 | **151** | No |
| 360×800 | 165 | 304 | **139** | No |
| 844×390 | 156 | 268 | **113** | No |

36 cards render at every viewport; card click opens the album viewer
(`.ps-viewer` count = 1). Sphere is visibly larger because it now owns the band
that the header previously covered.

## 3. Filmography ribbon clipping — fixed

**Causes:**
1. `.film-section { overflow: hidden }` clipped anything beyond the section box.
2. Fixed `::before`/`::after` gradient masks (150 px top, ~90 px bottom) sat above
   the ribbons at `z-index: 22`, hiding the upper and lower frames.
3. Each row centered the ribbon in a fixed-height stage whose cards overflow above
   and below the orbit, with no scroll landing margin.

**Fix (structural, scoped to `#filmography`):**
- `#filmography.film-section { overflow: visible }`.
- Removed the section's top/bottom gradient masks.
- Rows and ribbons set to `overflow: visible`; each row has
  `scroll-margin-top: clamp(4.5rem, 9vh, 7rem)` so a chapter never lands under the
  fixed header.
- Ribbon stage height increased (`clamp(520px, 68svh, 820px)`, tablet 470–660,
  phone 430–560) and rows separated by `clamp(1.5rem, 4vh, 3rem)`.
- Ribbon geometry, winding, frame count and RAF engine untouched.

**Measured after fix:** all three rows at all seven viewports report
`clippedAbove: false`, `clippedBelow: false`, `overflow: visible` — every visible
frame lies inside its stage (top margin ≈298 px at 1440).

## 4. Other retained fixes (non-typographic)

- Header collision guard kept: centre tagline hidden below 1440 px. Zero nav
  overlaps at all seven viewports (was 3–5 at tablet/landscape).
- Keyboard focus outline (2 px `--accent-bright`).
- Explicit reduced-motion contract: portrait breathing, hover scaling, animated
  grain and looping motion disabled.
- Film chapter accents retained as provisional **colour only** (index dot,
  active-frame outline, caption accent) — no type or layout change.
- `text-wrap: balance` on display headings, `pretty` on body copy.

## 5. Verification

| Test | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass — one `dist/index.html`, 2,401,648 bytes |
| Horizontal overflow | **0** at 1920, 1440, 1024, 768, 390, 360, 844×390 |
| Console / page errors | **0** on clean loads |
| Nav overlaps | **0** at all seven viewports |
| Sphere–header overlap | **0** at all seven viewports |
| Sphere cards | 36, clickable, viewer opens |
| Ribbon clipping | none above or below, all three films, all viewports |
| Archive / film viewers | open and close normally |
| Asset / manifest integrity | **untouched** — only `src/index.css` changed |
| Sphere / ribbon geometry | unchanged |

Screenshots: `evidence/phase-03/screens-after/` (42 captures, seven viewports ×
six sections) with comparison sheets
`restored-before-after-hero.jpg`, `restored-before-after-photo.jpg`,
`restored-before-after-film.jpg`, `restored-mobile.jpg`, plus focused
`sphere-check-1440.png`, `film-check-1440/1920/390.png`.

## 6. Deviations / notes

- Owner-requested restoration overrides the Phase 03 type-floor specification;
  the 12 px floor is no longer applied. Small metadata is intentionally back at
  7–8.5 px as authored.
- Film accents remain provisional and limited to colour.
- Deferred items unchanged: archive scroll-lock/Escape/focus defects, phone hero
  dead band, portrait delivery copy acceptance, canonical URL, deployment token.

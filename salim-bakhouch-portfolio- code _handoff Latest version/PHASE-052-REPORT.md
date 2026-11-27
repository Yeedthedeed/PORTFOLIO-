# PHASE 05.2 — CONTINUOUS FIELD: LIGHT SHAPES & RECTANGULAR BLOCKS REMOVED

**Public preview (live, verified):**
## https://etherealism-seamless.deed.page/

HTTP/2 200 · 2,423,304 bytes · prefix match **2,423,289 / 2,423,304** bytes
(only the 1,021-byte host badge differs). No canonical deployment.

---

## 1. The gap / light shape — what it actually was

Two distinct causes, both removed:

**A. A rotated SVG plane in the filmography geometry.**
`ChapterGeometry.tsx` rendered, for the filmography preset:

```svg
<rect x="-120" y="180" width="640" height="820" transform="rotate(9 …)" fill="url(#plane-filmography)" />
<line … stroke="url(#edge-filmography)" />
<path d="M 980 120 A 300 300 0 0 1 1580 420" … />
```

That large tilted rectangle, its lit diagonal edge and the arc were the visible
"light shape" sitting between the chapter header and the first ribbon, and it
varied per row because each of the three chapters rendered its own copy.
**The filmography preset now renders no geometry at all** (documented in the
component with the reason). No plane, no edge line, no arc, no floor rule.

**B. Per-row chromatic blocks.**
Each film row had its own `::before` counterlight — a positioned radial plus a
linear gradient with `inset: -6% -10%` and a scroll-linked opacity animation.
Because it was inset beyond the row, it produced a soft rectangular edge exactly
where the chapter began and ended. **All three `::before`/`::after` overlays were
removed** (`content: none`), and the rows are now fully transparent.

## 2. Rectangular borders removed

| Removed | Detail |
|---|---|
| `.film-section-row` `border-top` | Was a chapter rule per film |
| Row separators (`… + …::before`) | A 1 px hairline at the top of rows 2 and 3 |
| Row `background` / `background-image` | Was a distinct gradient per chapter |
| Row `box-shadow` | Was present on some states |
| Filmography geometry | Plane, edge stroke, arc, floor rule |

Verified in the live build: **all three rows report `border-top-width: 0px`,
`background: transparent`, `background-image: none`, `box-shadow: none`, and
`::before { content: none }`.** `#filmography` has **0** geometry shapes.

## 3. What replaced them: one continuous field

The whole filmography — header, all three ribbons and the space between them —
now sits on a **single vertical blue gradient**:

```
#050912 → #081629 → #0d2340 → #123858 → #0d2340 → #081629 → #050912
```

Deep at the edges, mineral in the middle. It is one element background, so there
is no boundary that can form a gap or a block. Chapters contribute no background
at all. Film identity still arrives through the four accent marks
(index, 32 px rule, active-frame outline, logline label).

The header received dedicated breathing room
(`padding-top: clamp(4.5rem, 9vh, 6.5rem)`) so it is never clipped: measured
108 px of clear space above it on desktop, 101 px on phone.

Rhythm between chapters is now **spacing only** (`padding-top: clamp(3rem, 7vh,
5.5rem)`), which reads as a transition rather than a divider.

## 4. Verification

| Check | Result |
|---|---|
| Row border widths (3 rows) | **0 px / 0 px / 0 px** |
| Row background / image / shadow | none / none / none |
| Row `::before` content | **none** |
| Filmography geometry shapes | **0** |
| Per-frame captions | **0** (landing and archive) |
| Frames | 122 |
| Horizontal overflow | **0** at 1920, 1440, 1024, 768, 390, 360, 844×390 |
| Console errors | **0** |
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, 2,423,304 bytes, sha `ff2af161…` |
| Manifests, previews, media resolver, sound engine, photographs | untouched |

Evidence: `evidence/phase-052/` — `seamless-transitions.jpg`,
`seamless-mobile.jpg`, `header-clean` captures, 28 transition screenshots
(four scroll positions × seven viewports), `verify.json`, plus live captures
`LIVE-1440.png` / `LIVE-390.png`.

## 5. Files changed

| File | Change |
|---|---|
| `src/components/ChapterGeometry.tsx` | Filmography geometry composition removed |
| `src/index.css` | Row borders/backgrounds/separators/overlays removed; single filmography gradient; header padding; row rhythm |

No change to photography, manifests, media resolver, sound, typography, ribbon
geometry, physics, ordering or content.

## 6. Known limitations

- The retired `.film-spiral-caption` CSS rule still exists in the stylesheet as an
  inert guard (`display: none`), but **no caption element is created** anywhere.
- The photography and featured sections keep their own chapter geometry; only the
  filmography had the intrusive plane.
- Accent tiers (ice / copper / burnt) remain provisional pending owner review.

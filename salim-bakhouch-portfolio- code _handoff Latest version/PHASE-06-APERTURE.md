# PHASE 06 — BLUE HOUR: THE LIGHT SCORE
## Optical Aperture background · consolidated grain · scroll choreography

**Public preview (live, verified):**
## https://etherealism-aperture.deed.page/

HTTP/2 200 · 2,429,639 bytes · matches local build for **2,428,603 of 2,428,618 bytes**
(the only difference is the 1,021-byte deed.page badge). Canonical site untouched.

---

## 1. Deployment / source verification — a real discrepancy

| Source | What it serves |
|---|---|
| `https://etherealism-preview.deed.page/` (the URL in the brief) | **Older build**: no orange tokens, still contains the filmography SVG plane |
| Current source in this workspace | Newer: orange family, no filmography plane, captions removed, seamless field |
| **New preview published** | `https://etherealism-aperture.deed.page/` — this build |

I did **not** restore the older deployed version. I built forward from the newer
source and published a fresh preview.

### Two conflicting prompts
Phase 05 as re-pasted specifies **LUMINOUS LICHEN** (`#D7E66A`). Phase 06 states
the **"monochromatic blue foundation, contrasting orange accents"** should
remain. You approved the orange replacement in 05.1. I therefore treated the
lichen palette as **superseded**, kept the approved orange family, and
implemented Phase 06's background. Nothing orange-to-yellow was reintroduced.

## 2. Audit of the previous background

| Old layer | Verdict |
|---|---|
| Multiple blue-black base gradients | Consolidated into one base + two light planes |
| Sapphire bloom + counter-bloom | **Removed** (they were the centre-glow defect) |
| Cursor-responsive light diffusion | **Already removed**, stays removed |
| Three procedural haze fields | Replaced by two asymmetric diagonal light planes |
| 200×200 noise canvas | **Removed** |
| Two global animated SVG grain layers | Replaced by **one static grain inside the background** |
| 32 moving particles | **Removed** |
| 12 procedural contour curves | Replaced by the structured aperture |
| 35mm perforations | **Not present** (verified) |
| Separate vignette + scanlines | **Removed** |
| `.grain` at z-index 90 above all content | **Relocated** into the background at z-index 0 |

Verified live: **0** global overlays (`.grain`, `.scanlines`, `.vignette`,
`.bloom`), **0** canvases, background field at **z-index 0**, content at **10**.

## 3. The Optical Aperture — composition

One dominant structure, one secondary relationship, one warm intersection,
large negative space. Rendered as **36 lightweight SVG nodes** — no canvas, no
particles, no line fields.

| Element | Specification |
|---|---|
| **Primary aperture** | Three incomplete concentric arcs, r = 536 / 612 / 702, centred off-axis at `1236,188` (upper-right, mostly outside frame). Strokes 0.7–1.15 px; dash arrays create deliberate gaps. No obvious centre target. |
| **Optical halo** | Directional sapphire illumination masked to a **single short arc run** (420 of 3840 units), 9 px soft + 1.35 px core. Asymmetric, falling off along the arc — never a glowing ring. |
| **Secondary relationship** | A 620-radius arc entering from the lower-left plus its diagonal axis, dashed and restrained. Balances the primary. |
| **Warm intersection** | One 86 px warm line where the aperture meets the diagonal axis, plus a 1.7 px apricot point. The only orange in the background. |
| **Light planes** | Two full-bleed diagonal gradients (114° key, 296° fill) at 0.05–0.30 alpha, suggesting light crossing an architectural surface. |
| **Environmental pool** | One soft mineral ellipse anchored upper-right; never centred, never over the content column. |

Opacity calibration was raised from negligible to the ranges in the brief
(principal 0.46–0.95 stroke opacity against 0.9 alpha gradient stops, halo
0.45–1.0 animated, warm 0.18–1.0 animated). The field-only capture
(`evidence/phase-06/screens/1440__field-only.png`) proves the geometry reads as a
composed aperture, not a gradient.

## 4. Grain — fine nocturnal emulsion

One static texture, generated from `feTurbulence` at `baseFrequency 0.92`,
2 octaves, `stitchTiles`, tinted cool, `mix-blend-mode: overlay`.

| Viewport | Opacity | Tile |
|---|---:|---:|
| Desktop | 0.042 | 240 px |
| Tablet | 0.036 | 200 px |
| Phone | 0.030 | 180 px |
| Reduced motion | unchanged (it is already static) | — |

**Architectural correction:** the grain now lives *inside* `.optical-field` at
z-index 0, beneath every photograph, still, portrait, title and control. It
previously sat at z-index 90 **above all photography** — that is fixed.
Verified: `animation: none`, no flicker, no canvas redraw.

## 5. Scroll choreography

One shared scroll signal, no React state, no RAF, no second engine:

```css
.oa-aperture    { animation: oa-drift;            animation-timeline: scroll(root); }
.oa-secondary   { animation: oa-secondary-drift;   animation-timeline: scroll(root); }
.oa-plane--key  { animation: oa-plane-shift;       animation-timeline: scroll(root); }
.oa-halo        { animation: oa-halo-breathe;      animation-timeline: scroll(root); }
.oa-intersection{ animation: oa-intersection-fade; animation-timeline: scroll(root); }
```

Transform-only animations (translate/rotate/scale/opacity), so they run on the
compositor. The aperture drifts −2.6 % and rotates 4.2° across the entire page —
deliberately far slower than the scroll. The halo brightens through the
filmography. The warm intersection is faint in the hero (0.18), strongest through
the films (1.0), and recedes to 0.22 by the contact section, matching the
prescribed narrative progression.

`CSS.supports('animation-timeline','scroll()')` verified **true**; where it is
unsupported the composition renders complete and static.

## 6. Visual hierarchy

- Hero: aperture mostly outside frame, no warm light — restraint and depth.
- Photography: more arcs revealed, geometry kept behind the sphere.
- Filmography: halo at its strongest, warm intersection present.
- Featured: composition shifts, the poster dominates.
- Archive / About / Contact: highlights recede, back to stillness.

The field sits at z-index 0 with `pointer-events: none`; content at 10. No
luminous line crosses a photograph because all geometry is behind the content
layer, and opacity was calibrated down wherever it competed.

## 7. Responsive composition

| Breakpoint | Composition |
|---|---|
| Desktop | Full optical composition: aperture, halo, secondary arc, both planes, intersection |
| ≤1180 px | Secondary arc hidden, fill plane reduced to 0.7 — fewer simultaneous elements |
| ≤720 px | Aperture scaled and re-anchored (72 % / 18 %), secondary arc + intersection + fill plane hidden, one light plane at a gentler angle, grain lighter |
| ≤1000 px & ≤520 px height | Geometry removed entirely; base field only, so the portrait owns the frame |

## 8. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, 2,428,618 bytes, sha `ab5331cc…` |
| Overflow | **0** at all seven viewports |
| Console errors | **0** |
| Global overlays above content | **0** |
| Canvases | **0** |
| SVG nodes | 36 |
| Background z-index / pointer-events | 0 / none |
| Sphere / ribbons / frames | 36 / 3 / 122 |
| Contrast (actual surfaces) | hero 11.27, nav 11.27, photo eyebrow 5.00, film index 10.65, film meta 6.31, logline 11.27, about 11.27, contact 6.31 — **all pass AA** |
| Manifests, resolver, sound engine, photographs | untouched |

Screenshots: `evidence/phase-06/screens/` — 7 viewports × 5–7 scroll positions
(49 captures), plus `1440__field-only.png` (background isolated) and
`1440__calib-*`. Sheets: `aperture-hero-desktop.jpg`, `aperture-scroll.jpg`,
`aperture-responsive.jpg`.

## 9. Files changed

| File | Change |
|---|---|
| `src/components/Background.tsx` | Rewritten as the Optical Aperture: SVG geometry, light planes, masked halo, warm intersection, static grain |
| `src/App.tsx` | Global `.scanlines`, `.vignette`, `.grain` removed — texture now lives behind the content |
| `src/index.css` | Aperture styles, scroll choreography, responsive variants, grain, retired global overlays |

No change to photographs, stills, manifests, URLs, ordering, album
relationships, sphere geometry, ribbon geometry/animation, sound engine,
typography or section order.

## 10. Known limitations

- `animation-timeline: scroll()` is not universal (Safari < 26). The fallback is a
  complete static composition — verified by disabling the animation.
- The field-only capture reports a white computed stroke on one circle: browsers
  return `rgb(255,255,255)` for gradient-stroked SVG in `getComputedStyle`. The
  rendered arcs are cool blue, as the screenshot shows.
- The brief's `etherealism-preview` URL serves an older build and cannot be
  updated in place without its token; this phase's preview is a new permanent slug.
- Per-film accent tiers remain provisional.

# PHASE 05.1 — CHROMATIC REFINEMENT, RIBBON CLEANUP, CINEMATIC FRAME LIGHTING

**Public preview (live, verified):**
## https://etherealism-thebirthpermit.deed.page/

HTTP/2 200 · 2,425,544 bytes · matches the local build for **2,424,502 of
2,424,517 bytes** (only the 1,027-byte deed.page badge differs).
**No deployment of the canonical site.**

---

## 1. Per-frame captions — removed at source

The captions were created in `buildFrame()` inside `FilmSpiral.tsx`:

```ts
const caption = document.createElement("span");
caption.className = "film-spiral-caption";
caption.textContent = `${pad(index + 1)} · ${film.film}`;
```

I removed the caption element, the hold-note element and the now-unused `pad()`
helper from the frame-construction logic. No opacity tricks, no visibility
hiding, no repositioning — **the nodes are never created**, so there is no
caption box and no reserved spacing.

Verified at every viewport, on the landing filmography and in the full archive:

| Check | Result |
|---|---|
| `.film-spiral-caption` nodes | **0** |
| `.film-spiral-note` nodes | **0** |
| Card text elements | **0** |
| Visible caption boxes | **0** |
| Archive captions (all 3 ribbons) | **0** |
| Frames still present | 244 landing (2 per still across layers) / 122 archive |

**Preserved:** film titles, credits, indices, still counts, format, year,
loglines, watch action, album action, GitHub action, navigation, ribbon geometry,
physics and keyboard behaviour. The chapter header carries all film information;
each frame's accessible name is on the card's `aria-label`.

## 2. Yellow/gold → monochromatic orange

Every yellow-green and antique-gold value was replaced. **0** occurrences of
`#d7e66a`, `#b7c455`, `#e6ef9e`, `rgba(208,188,145,…)`, `rgba(180,160,120,…)` or
`rgba(190/202,168/178,126/134,…)` remain in the source or the live build.

| Token | Value | Role |
|---|---|---|
| `--c-ember` | `#793921` | deepest |
| `--c-burnt` | `#a94f32` | Birth Permit tier |
| `--c-copper` | `#cd6742` | primary / Zakia tier |
| `--c-tangerine` | `#e58359` | light |
| `--c-apricot` | `#f2b18f` | lightest / counter-rim |

All five sit in one hue arc (OKLCH ≈ 41–53°). No yellow, mustard, gold, lemon or
amber. Applied to: chapter indices, eyebrow rules, logline labels, frame
counterlights, selected dividers and interaction indicators.

**Hierarchy preserved:** pearl/white principal titles, silver-blue supporting
type, sapphire/ice primary identity, orange only as the warm counterpoint.
Delusion keeps the ice accent (its frames are achromatic); Zakia uses copper,
Birth Permit burnt — a coherent family, not three themes.

## 3. Monochromatic blue progression

Seven-step ladder in `:root`: `#050912` → `#081629` → `#0d2340` → `#123858` →
`#174b70` → `#286b9b` → `#7ec4ff`.

Measured rendered chapter planes:

| Section | Background |
|---|---|
| Delusion | `rgb(8, 22, 41)` — deep navy |
| Zakia | `rgb(13, 35, 64)` — midnight blue |
| Birth Permit | `rgb(18, 56, 88)` — mineral blue |
| Featured | `rgb(8, 22, 41)` — recovery |
| About | `rgb(5, 9, 18)` — abyss |

The passage from Delusion → Zakia → Birth Permit genuinely lightens through three
perceptually distinct blues, then recovers to navy and abyss afterwards. No warm
background blocks, no rainbow, no generic radial spot.

## 4. Cinematic frame lighting

Lighting lives on the **frame edge and its surrounding environment** only:

- **Neutral:** cool, quiet edge at 0.10–0.16 alpha. No colour, no lift.
- **Hover / keyboard focus:** key light from the upper-left (cool ice), warm
  orange counterlight on the right and bottom edges, a soft environmental pool
  behind the frame (pseudo-element), a 2 px lift.
- **Active:** same grammar with greater presence — the frame reads as the
  principal subject without disturbing the orbit.
- **Departure:** all properties transition back over 380–420 ms; no flicker.
- **Keyboard:** `:focus-visible` receives the identical lighting plus a 1 px ice
  outline at 5 px offset, so state is not colour-only.

Measured on a hovered frame: top `rgba(196,230,255,0.72)`, left
`rgba(174,220,255,0.58)`, right `rgba(242,177,143,0.62)`, bottom
`rgba(205,103,66,0.50)` — cool key facing the light, warm rim opposing it.

### Two genuine violations found and fixed during verification

1. **A `brightness()/contrast()` filter was being applied to the photograph on
   hover and active states.** That is prohibited image grading. Both filters were
   removed; a final authority block now asserts `filter: none !important` on
   every ribbon and still image, verified as **0 filtered frames**.
2. **A competing rule flattened the frame edge to a single colour**, so the
   directional lighting was invisible. Removed, and longhand edge colours are
   now declared last so they cannot be overridden by depth or chapter rules.

## 5. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, 2,424,517 bytes, sha `9536787f…` |
| Overflow | **0** at 1920, 1440, 1024, 768, 390, 360, 844×390 |
| Console errors | **0** |
| Captions / notes | **0 / 0** at all viewports, landing and archive |
| Filtered photographs | **0** |
| Archive | opens, 3 ribbons, 122 frames, 0 captions |
| Images, manifests, media resolver, sound engine | untouched (checksums unchanged) |
| Ribbon geometry / physics / order | untouched |

Evidence: `evidence/phase-051/` — 5 comparison sheets
(`01-captions-removed`, `02-blue-progression`, `03-frame-lighting`,
`04-responsive`, `05-archive`), 26 viewport captures (three films × seven
viewports + archive), `verify.json`, `final.json`, live HTML.

## 6. Modified files

| File | Change |
|---|---|
| `src/components/FilmSpiral.tsx` | Caption and hold-note creation removed from `buildFrame`; unused `pad()` removed |
| `src/index.css` | Orange family replaces lichen/gold; blue ladder; chapter planes; frame lighting; image-filter prohibition; caption styles retired |

No change to any photograph, still, manifest, URL, ordering, album relationship,
ribbon geometry, sphere engine, sound engine or typography size.

## 7. Known limitations

- Film-tier assignment (ice / copper / burnt) is my reading of the stills from
  Phase 05 and remains **provisional** pending your approval.
- The orange appears in four marks per film plus frame interaction; it is
  deliberately not used for backgrounds (the environment must stay blue).
- The canonical deployment is untouched; the preview is a separate permanent slug.

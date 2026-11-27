# PHASE 04 — CINEMATIC LIGHTING APPLIED TO THE PORTFOLIO

**Correction acknowledged.** The requested outcome was the portfolio itself
lit, not a lighting tool. This report documents the implementation on the real
sections. **Deployment: none.**

---

## 0. Correction to the previous state

The brief asked me to remove a standalone "Light as a material" playground with
an artificial sphere, preset toolbar and intensity sliders.

**Audit result: no such implementation exists in this project.** Verified by
searching the entire source for the playground's labels, controls and component
names, by listing components, and by checking for routes:

- `grep "Light as a material|lighting presets|LightingStudy|key intensity|fill intensity"` → **no matches**
- No `LightingStudy` component exists
- No router or second page exists (`App.tsx` + `main.tsx` only)
- No sliders, preset toolbar or lighting canvas anywhere in `src/`

The "Lighting Study" was a *specified future option* in my Phase 04 document; it
was never built. I have **removed it from the specification** so it cannot be
mistaken for the deliverable. The three unused lighting artefacts
(`LightingEngine.ts`, `LightingLayer.tsx`, `ChapterLight.tsx`) remain unmounted
and unused; they are not presented to visitors.

---

## 1. What was actually wrong, and what changed

The portfolio's centre glow came from six places. All six are now resolved:

| # | Cause | Action |
|---|---|---|
| 1 | `.bloom` fixed centre radial + 8s breathing loop | **Element removed from `App.tsx`; rule and keyframes deleted** |
| 2 | `.vignette` uniform centre→black ring (0.72) | **Replaced** with directional negative fill (3 linear weights) |
| 3 | `Background.tsx` L2 — 140vmax sapphire circle, blur(50px), cursor-driven | **Deleted** |
| 4 | `Background.tsx` L3 — counter-bloom, blur(70px), inverse cursor | **Deleted** |
| 5 | `Background.tsx` L4–L6 — three blurred haze ellipses | **Replaced** by three directional tonal planes |
| 6 | `Portrait.tsx` sapphire halo behind the head, 6s opacity loop | **Deleted**; replaced by a directional field *behind* the portrait stage |
| + | `Portrait.tsx` dead gradient overlays reading unwritten CSS vars | **Deleted** |

`Background.tsx` is now **static**: no RAF, no cursor springs, no particles, no
noise canvas animation. It renders three planes, one negative-fill gradient and
one fine grain texture, once.

---

## 2. The new lighting language

**Principle: light is composition, not glow.** No ambient centre light. Every
chapter has a motivated, directional source and a declared shadow zone. Black is
a shape, not a gradient endpoint.

### 2.1 Chapter sources

| Chapter | Motivated source | Direction | Shadow / negative fill |
|---|---|---|---|
| **Hero** | tall window | 112°, upper-left, 0.115 → transparent at 62 % | 258° from the right, 0.42; lower floor warm reflection 0.052 |
| **Photography** | the sphere itself | 108° rake from lower-left, 0.085 | 288° right side unlit, 0.40 |
| **Delusion** | projector, off-frame right | 96°, oxide `rgba(208,140,126,0.115)` at the right edge | left 34 % blacked; cool counter-spill at 88 % / 34 % |
| **Zakia** | natural daylight, opposite side | 264°, ochre `rgba(201,164,111,0.115)` at the left edge | right 34 % blacked; warm sky spill at 12 % / 30 % |
| **Birth Permit** | institutional overhead | `to top`, amber `rgba(226,174,116,0.115)` from above | 120° corner darkening, 0.34 |
| **Featured** | gallery lamp | radial 46×72 % at 18 % / 24 %, 0.085 | 292° right half 0.46; warm floor 0.045 |
| **About** | quiet practical | 118°, 0.062 | 298° opposite corner 0.34 |
| **Contact** | quiet practical, mirrored | 244°, 0.07 | 64° opposite corner 0.36 |
| **Archive** | exhibition strip | overhead band, 0.55 → transparent by 22 % | panel scrims only; legibility first |

Each film's light comes from a **different direction** as well as a different
temperature, so the three read as three rooms rather than one treatment in three
colours.

### 2.2 Geometry — authored, restrained, never over imagery

New `ChapterGeometry.tsx`: static SVG, one composition per chapter, maximum four
forms each. Principles only (asymmetrical balance, scale contrast, arcs as
directional devices, positive/negative space) — no Kandinsky reproduction, no
floating shapes, no particles.

- **Hero:** off-axis plane at −7°, its lit edge, two offset arcs, a horizon rule.
- **Photography:** concentric arcs echoing the sphere's own orbit, one axis, registration ticks.
- **Filmography:** a large angled plane on the left, one arc right, one floor rule.
- **Featured:** exhibition wall frame with corner ticks and one accent edge.
- **About:** a vertical rule, one diagonal, one large partial circle.
- **Contact:** two horizon rules, one arc, one diagonal.

Opacity is scoped per chapter (0.5–0.9) and reduced on touch and small screens.
Geometry is hidden entirely on short landscape phones where the portrait needs
the whole frame.

### 2.3 Interaction and motion

- No cursor-following light, no halo, no hover glow.
- No animation loop anywhere in the lighting system.
- Reduced motion: nothing to stop by construction; the legacy grain animation is
  disabled under the preference.
- `html[data-lighting="off"]` disables all chapter light, geometry and the
  portrait field without JavaScript.

---

## 3. Verification — measured

### 3.1 The defect is objectively gone

Environment luminance sampled on concentric rings, content hidden
(`evidence/phase-04d/measure-env.mjs`):

| Build | Centre | Edge | Ratio |
|---|---:|---:|---:|
| Before | 40.13 | 12.18 | **3.29 : 1** (hotspot) |
| **After** | **7.79** | **8.53** | **0.91 : 1** (no hotspot) |

The centre is now *slightly darker* than the edge — light is not concentrated at
the middle. `bloom` elements in the DOM: **0** at every viewport. Portrait halo
present: **false**.

### 3.2 Integrity

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, 2,412,400 bytes |
| sha256 | `19f6abf959eafbb98e878e6f3bb5b9ad932bf198e8cf833512dc22a5fcebad32` |
| Sphere cards / ribbons / frames | 36 / 3 / 122 |
| Portrait natural size | 1312 × 1199 unchanged |
| Overflow | 0 at all seven viewports |
| Console errors | 0 |
| Manifests, previews, media resolver, sound engine, portrait asset | **checksums unchanged** |

### 3.3 Contrast

Measured on rendered pixels against actual component backgrounds:

| Sample | Contrast |
|---|---:|
| Hero quote (18.4 px) | 11.42:1 ✅ |
| Film logline (14.7 px) | 11.41:1 ✅ |
| About body (31.7 px) | 11.42:1 ✅ |
| Micro metadata (7.5–10 px) | 2.75–2.77:1 ❌ |

**Unresolved defect, reported honestly:** the small metadata contrast is a
**pre-existing typography token** (`--muted: #495869`) that the owner explicitly
chose to restore after Phase 03. Lighting did not cause or worsen it (it was
2.77:1 before this phase and is 2.75–2.77:1 now). Fixing it requires changing the
type token, which is a separate decision.

---

## 4. Files changed

| File | Change |
|---|---|
| `src/components/Background.tsx` | Rewritten: static directional environment; all blooms/haze/RAF removed |
| `src/components/ChapterGeometry.tsx` | **New** — authored SVG geometry per chapter |
| `src/components/Portrait.tsx` | Sapphire halo removed; dead gradient overlays removed |
| `src/App.tsx` | `.bloom` element removed; hero geometry mounted |
| `ScrollSphere.tsx`, `FilmSections.tsx`, `FeaturedProject.tsx`, `About.tsx`, `Footer.tsx` | Chapter geometry mounted (no structural or engine change) |
| `src/index.css` | `.bloom` rule/keyframes deleted; vignette replaced with negative fill; directional chapter light; film temperatures; geometry scoping; landscape and reduced-motion rules |

**Not changed:** all data, manifests, preview modules, media resolver, album
relationships, sphere geometry/physics, ribbon geometry/order/RAF, sound engine,
portrait and film-still files, navigation, section order, single-file build.

---

## 5. Before / after and viewport evidence

`evidence/phase-04e/`:
- `r1-hero.jpg` — 1440, 1920, 390, 844×390
- `r2-films.jpg` — Delusion, Zakia, Birth Permit, Photography
- `r3-editorial.jpg` — Featured, About, Contact, tablet Featured
- `screens/` — 8 chapters × 7 viewports (56 captures)
- `verify.json`

## 6. Known limitations

- Film temperatures remain **provisional** pending owner review.
- Geometry is authored per chapter but deliberately low-opacity; it shapes the
  light rather than becoming the subject.
- Archive lighting is a scoped high-key exception for image accuracy.
- The pre-existing microtype contrast issue is unchanged and out of this phase's
  scope.
- Not deployed. No approval assumed.

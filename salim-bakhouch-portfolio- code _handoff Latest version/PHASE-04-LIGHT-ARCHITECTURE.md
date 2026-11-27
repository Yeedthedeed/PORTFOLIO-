# PHASE 04 — CINEMATIC LIGHT ARCHITECTURE
## Stages 04.1–04.4: Audit · Research · Specification · Architecture

**Status: NO CODE HAS BEEN MODIFIED.** This document completes the four
no-code stages and stops at the approval gate before Stage 04.5.

Measured on the real build at 1440×900. Evidence:
`evidence/phase-04d/environment-radial.json`.

---

# STAGE 04.1 — LIGHTING AUDIT

## 1.1 What is actually mounted

`src/App.tsx` mounts four fixed atmosphere overlays in this order:

```tsx
<Background />                                  // component-level atmosphere
<div className="bloom" aria-hidden />           // ← centre glow
<div className="scanlines" aria-hidden />       // texture
<div className="vignette" aria-hidden />        // ← centre-to-black falloff
<div className="grain" aria-hidden />           // texture
```

**Not mounted:** `LightingLayer.tsx`, `ChapterLight.tsx`, `CustomCursor.tsx`,
`LightingEngine.ts` (the engine exists but nothing calls it).

The prior Phase 04 attempts left three inert artefacts: a 415-line engine, a
122-line overlay component and a 54-line section rig, none consuming CPU, none
rendering. They must be resolved, not left as dead weight.

## 1.2 Exactly which code produces the centre glow

The complaint is **factually correct**, and it has four separate causes. Each is
narrow and removable:

| # | File / selector | What it does | Verdict |
|---|---|---|---|
| 1 | `src/index.css` `.bloom` (l.145–158) | Fixed full-viewport `radial-gradient(ellipse 80% 60% at 50% 46%, rgba(61,159,255,.08) …, transparent 65%)`, `mix-blend-mode:screen`, plus an 8s `bloomBreathe` opacity/scale loop. **This is the literal centre glow.** | **Remove** |
| 2 | `src/index.css` `.vignette` (l.134–142) | `radial-gradient(ellipse at 50% 52%, transparent 28%, rgba(0,0,0,.72) 100%)` plus a second centre blue radial. **This is the uniform centre-to-black falloff.** | **Replace** with directional negative fill |
| 3 | `Background.tsx` L2 “Primary sapphire bloom” | 140vmax circle, `left:50% top:50%`, `filter:blur(50px)`, translated by cursor spring (`x:gx,y:gy`). Centre glow **and** pointer light. | **Remove** |
| 4 | `Background.tsx` L3 “Counter-bloom” | 90vmax circle at 50%/58%, `blur(70px)`, inverse cursor translation. Adds a second concentric wash. | **Remove** |
| 5 | `Background.tsx` L4/L5/L6 | Three blurred ellipses (0.055 / 0.04 / 0.018 alpha, 62–78px blur) at fixed corners. Softer, but they are still generic radial haze. | **Replace** with authored planes |
| 6 | `Portrait.tsx` “Sapphire halo” | `radial-gradient(ellipse at 45% 42%, rgba(61,159,255,.14) …)`, `blur(58px)`, opacity animating **0.8→1→0.8 over 6s**, counter-parallaxed to cursor. **This is the glowing circle behind the head.** | **Remove** |
| 7 | `index.css` `#work, #photography, #filmography…` chapter light (l.4424+) | My previous attempt: section-level radial gradients. Seam-free, but still *centred radials* per section — the same language one scale down. | **Supersede** by the new spec |
| 8 | `Portrait.tsx` key/fill/shadow overlays | Read `--light-gradient` / `--fill-gradient` / `--shadow-gradient`, which **only `LightingEngine` writes** — and it is unmounted. These are inert overlays with `background:none`. | **Remove as dead code** |

## 1.3 Measured proof of the problem

Environment only (page content hidden), luminance sampled on six concentric rings
from the composition centre (1440×900):

| Radius | 0 % | 20 % | 40 % | 60 % | 80 % | 100 % |
|---|---:|---:|---:|---:|---:|---:|
| Current build | **40.13** | 35.94 | 31.73 | 26.16 | 17.94 | **12.18** |

**Centre/edge ratio 3.29 : 1**, with an almost linear monotonic decline. That is
the signature of a single centred radial plus a uniform vignette — exactly the
"generic radial-gradient background" reading.

Isolating the two culprits:

| Variant | Centre | Edge | Effect |
|---|---:|---:|---|
| Current | 40.13 | 12.18 | — |
| `.bloom` hidden | 33.12 | 11.63 | bloom supplies **7.0 luminance at centre (17 % of it)** |
| `.vignette` hidden | 33.98 | 16.85 | vignette removes **4.7 luminance at edge (28 % of it)** |
| Both hidden | 26.90 | 16.18 | residual is `Background.tsx` L2/L3/L4–L6 |

So the vignette is doing **28 % of the edge darkening** and the bloom **17 % of
the centre lift**. Removing both reduces the centre/edge ratio from 3.29 to
**1.66** — still not acceptable, because `Background.tsx` carries the rest.

## 1.4 Other audit findings

- `Background.tsx` runs **one RAF loop** for gradient drift, haze parallax, dust
  particles and a noise canvas. The cursor spring is read every frame. It is
  single-loop and correctly cleaned up, but it is **continuous motion with no
  compositional purpose** — the brief forbids this.
- `.scanlines` (two repeating gradients) and `.grain` (two animated SVG-noise
  layers at 0.9–1.2 s steps) are texture, not light. Grain is legitimate;
  scanlines at 0.5 opacity contribute a screen-door feel that fights the
  painterly goal.
- `LightingEngine.ts` writes 10 CSS variables **per frame** while running. Nothing
  consumes them. It is accurate but unused and would duplicate the intended
  system if mounted as-is.
- No lighting-related accessibility targets exist; contrast failures already
  logged in Phase 01 are typography, not light.
- No pointer light should survive.

## 1.5 Proposed changes (04.5 onward — not implemented)

1. **Delete** `.bloom` element and rule; delete `bloomBreathe`.
2. **Delete** `Background.tsx` L2/L3 (both cursor blooms) and their spring/motion
   wiring.
3. **Replace** L4–L6 haze with the authored three-plane environment (below).
4. **Replace** `.vignette` with directional negative fill: two corner weights at
   different values, no radial ring.
5. **Delete** the portrait sapphire halo and its 6 s opacity loop; keep rim/key
   photo overlays only if wired to real tokens, otherwise delete as dead code.
6. **Retire** my Phase 04C section radials in favour of the new geometry-first
   environment.
7. **Resolve** the three inert lighting artefacts: one becomes the preset data
   source, the others are deleted (decision in 04.4).
8. **Add** the isolated Lighting Study (04.7).

---

# STAGE 04.2 — RESEARCH AND VISUAL DIRECTION

## 2.1 Principles extracted (not copied)

**Rembrandt / chiaroscuro.** Light is *selective*, not environmental. The subject
is modelled by one directional source; shadow is a composed shape, not an absence.
A small triangular catch on the shadow side tells you the source's height and
angle. Reflected light is faint and comes from a believable surface. Negative
space is *load-bearing*: darkness next to the subject is what makes the subject
luminous.

**Caravaggio / tenebrism.** Extreme subject isolation. The frame is mostly dark
by choice; illumination is an event. Transitions are controlled edges, not long
gradients. Use only where the content *is* theatrical: arrival, film
introductions, the featured poster.

**Kandinsky / geometric composition.** Asymmetric balance, scale contrast,
intersecting planes, arcs as directional devices, positive and negative space as
equal partners. Geometry must be *authored* — three or four forms with intent —
never random shapes or a field of particles.

**Cinematography.** Keys have direction and height; fill is motivated and
weaker; rims separate a subject from its background at an edge only; negative
fill is as important as fill; motivated sources (window, practical, projector)
justify every pool; colour contrast is warm/cool *within* a coherent palette.

Translated rules for a website: **there is no ambient centre light.** Every
illuminated region must be attributable to a named source with a position and a
reason. Black is a shape.

## 2.2 Three genuinely different directions

### Route A — **THE LIGHT TABLE** (high-key optical instrument)

A bright, precise, silver-grey environment. Large softbox illumination from the
upper left, pale planes, thin calibration marks, minimal shadow. Photography and
archive are *high-key*: light surfaces, low contrast, images read like prints on
a white table. Hero is the exception, graded a half-stop down.

- **Feels like:** a conservation studio, a contact-sheet lightbox, a Swiss
  optical catalogue.
- **Strengths:** maximum legibility, superb for 81 photographs and 122 stills,
  very "instrument", low risk to text contrast.
- **Weaknesses:** departs furthest from the current midnight identity; risks
  looking like a technical catalogue rather than a cinematic portfolio; white
  planes can overpower the muted film stills; the brief's chiaroscuro and
  tenebrism direction largely disappears.
- **Complexity:** medium. Mostly surfaces + typography contrast rework.

### Route B — **THE DARK STAGE** (chiaroscuro, negative fill)

Deep, intentional black. **No global glow, no vignette ring.** Three to five
localised, motivated sources across the whole page, each with a hard-ish edge and
short falloff. The portrait is lit from camera-left with a rim on the right; the
hero background is a *near-black plane with one diagonal gradient edge*. Chapters
are separated by darkness, not borders. Film chapters get one warm practical
each. Archive switches to a slightly higher key so images stay readable.

- **Feels like:** a stage before the cue, a darkroom, a Rembrandt in a black room.
- **Strengths:** exactly the requested language; strongest artistic signature;
  preserves the identity; black becomes compositional; the portrait gains
  presence without a halo; distinct from every template.
- **Weaknesses:** hardest on small type (already a known Phase 01 issue);
  requires disciplined per-section authoring; risk of "too dark" on phone
  outdoors; archive needs an explicit high-key exception.
- **Complexity:** medium-high, but CSS/SVG only.

### Route C — **THE PROJECTION ROOM** (motivated cinema)

A low-key environment organised around *projected* light: soft trapezoidal
shafts, film-temperature colour (oxide / ochre / amber), visible cone edges,
dust-in-beam only where a projector is implied, poster lit like a screen.

- **Feels like:** a screening room, a 35 mm projector, a film poster in a lobby.
- **Strengths:** most literally "cinematic"; gives the three films a strong,
  immediate identity; shafts are a memorable motif; excellent for Feature and
  filmography.
- **Weaknesses:** shafts over text are a legibility hazard; can read as an
  effect rather than composition; colour cast risks fighting the blue identity;
  hard to keep heroic and archive sections coherent; hardest to keep seam-free.
- **Complexity:** high.

## 2.3 Comparison against the current portfolio

| Criterion | Current | A Light Table | B Dark Stage | C Projection Room |
|---|---|---|---|---|
| Removes centre glow | — | Yes | **Yes, by design** | Partly (shafts are directional) |
| Chiaroscuro depth | Poor | Weak | **Strong** | Strong |
| Preserves midnight identity | — | Low | **High** | Medium |
| Text legibility | Known issue | **Strong** | Medium (must be gated) | Weak–medium |
| Archive image fidelity | Good | **Excellent** | Good (needs high-key exception) | Medium |
| Film distinction | Weak | Low | Medium | **Strong** |
| Hero portrait improvement | Halo | Clean but clinical | **Strongest** | Strong |
| Risk of "effect" look | High | Low | Low–medium | **High** |
| Implementation complexity | — | Medium | Medium-high | High |
| Seam/artifact risk | High | Low | **Low** | High |

## 2.4 Recommendation

**Adopt Route B — THE DARK STAGE — with two controlled borrowings:**

1. **Archive chapters adopt Route A's higher key** (a documented, scoped
   exception): the archive is a reading surface; images must not sit in tenebrism.
2. **Film chapters adopt one device from Route C**: a *single*, soft, edge-anchored
   projection wash in each film's sampled temperature, never crossing text and
   never over a still.

This gives one coherent grammar — **selective illumination on deep,
intentional black** — with two motivated exceptions that follow from content.
Rejected: A as the spine (loses the requested chiaroscuro and the identity), C as
the spine (high artifact and legibility risk; shafts become an effect).

---

# STAGE 04.3 — LIGHTING DESIGN SPECIFICATION

## 3.0 Shared grammar

Every chapter obeys five rules:

1. **No ambient centre light.** Nothing is illuminated "because it is the middle".
2. **One named source per chapter**, plus negative fill. A second source must be
   motivated (practical, window, projector, reflection).
3. **Edges, not washes.** Light enters from a frame edge or behind a subject and
   falls off within 35–55 % of the frame; it never crosses a text column.
4. **Black is a shape.** Each chapter declares where darkness stays — a lower-left
   corner, a left band, a bottom third. Darkness is never a uniform vignette.
5. **No motion.** Lighting is static. Only the Lighting Study (04.7) is
   interactive, and it lives outside the portfolio environment.

**Tonal hierarchy per chapter:** subject (1.00) → title (0.62) → metadata (0.30)
→ environment plane (0.12–0.20) → deep shadow (0.02–0.05 relative luminance
contribution). Nothing else is lit.

**Geometry:** maximum **four** authored forms per chapter — one large plane, one
arc, one rule, one corner weight. They exist to shape light, not to decorate. No
random shapes, no particles, no constellation fields.

## 3.1 Hero — “The Arrival”

- **Motivated source:** a tall window, camera-left, slightly behind the subject
  (`x ≈ 22 %, y ≈ 34 %`), colour 6200 K, intensity 0.22, spread 48 % × 78 %,
  falloff exponent ≈ 2.2 (short).
- **Rim:** a narrow cool edge on the **right** edge only (`x = 100 %`, width
  16 %, height 62 %), 0.14, temperature 9000 K. This separates the portrait's
  right side from black *without* a halo.
- **Negative fill:** the lower-left quarter stays at base black. A second,
  weaker warm floor reflection (0.05) sits at the bottom centre.
- **Geometry:** one large off-centre plane (rotated 8°) at 0.10 alpha behind the
  lower right; one fine diagonal rule; the existing chapter rail remains.
- **Portrait:** unchanged file. No halo, no glow, no hover bloom. The existing
  key/fill overlays are removed as dead code.
- **Typography:** unchanged.
- **What stays black:** left third above the meta caption; the bottom 12 %.

## 3.2 Photography — “The Light Table” (Route B, marginally lifted)

- **Motivated source:** the sphere itself. A soft silver-blue spill directly
  behind the cluster (`50 %, 66 %`), 0.10, spread 60 % × 46 %, short falloff.
- **Second source:** a faint overhead calibration light at `y = 8 %`, 0.04,
  purely to separate the chapter title from the field.
- **Negative fill:** corners at 0.06; the space *between* the header and sphere
  is intentionally dark, which is what makes the sphere read as luminous.
- **Geometry:** two concentric arcs (partial, 1 px, 12 % alpha) echoing the
  sphere's own orbital logic, and four corner registration ticks. Static.
- **Constraint:** no light over any card; sphere geometry/order/interaction
  untouched.
- **What stays black:** a wide band around the stage.

## 3.3 Filmography — “Three Temperatures”

Shared skeleton, three scoped accents:

- **Motivated source:** a projector implied outside frame-right, entering as a
  soft trapezoid at `x ≈ 92 %`, 0.12–0.16 depending on film, short falloff,
  never reaching the logline column.
- **Rim:** the film's accent as a 1 px edge on the right of each ribbon stage.
- **Negative fill:** the entire left third stays black; the logline area is
  deliberately unlit so text contrast is guaranteed.
- **Geometry:** one horizontal rule per film row; one small index mark.
- **Temperatures (from the stills, provisional):**
  - Delusion — oxide `#D08C7E`, cool counterpoint `#8FC3DC`.
  - Zakia — field ochre `#C9A46F`.
  - Birth Permit — sodium amber `#E2AE74`.
- **What stays black:** between rows, and the left column.

## 3.4 Featured Project — “The Frame”

- **Motivated source:** a gallery lamp above-left of the poster (`20 %, 26 %`),
  0.24, narrow spread (38 % × 46 %), so the poster is *lit as an object* and the
  wall behind it is not.
- **Rim:** 0.12 accent along the poster's right edge.
- **Negative fill:** the right half, where the title sits, receives **no** light
  beyond a 0.03 wash — contrast comes from the poster, not the background.
- **Geometry:** a single wall plane, one shadow under the poster frame (soft,
  short, directional), no shafts.
- **What stays black:** the floor and the right-hand third.

## 3.5 Archive — “The Cabinet” (Route A exception, scoped)

- **Motivated source:** an overhead diffused strip along the top of the overlay,
  0.10, even, with a very short falloff.
- **Key:** slightly higher than the rest of the site (`+0.05`), so thumbnails
  read accurately; this is the deliberate high-key exception.
- **Negative fill:** only the edges; the rail is separated from content by a
  1 px line, not by darkness.
- **Geometry:** none beyond the rail and hairlines.
- **Constraint:** no light over any tile; no blend modes.

## 3.6 About / Contact — “Colophon”

- **Motivated source:** a single practical, upper right (contact) / upper left
  (about), 0.10, wide and soft, falling off before the body column.
- **Negative fill:** the opposite corner.
- **Geometry:** one plane, one rule.
- **Rule:** the Contact headline is *the* brightest type on the page; no
  competing light behind it.

## 3.7 Visual explanation — how each section uses light differently

| Section | Source | Direction | Key | Shadow | Why it differs |
|---|---|---|---|---:|---|
| Hero | window | left, behind | 0.22 | deep lower-left | portrait modelled, not haloed |
| Photography | the sphere | behind cluster | 0.10 | wide surround | light *emitted* by the instrument |
| Filmography | projector | right edge | 0.12–0.16 | left third black | three temperatures, edge-only |
| Featured | gallery lamp | above-left | 0.24 | directional cast below | poster is an artefact on a wall |
| Archive | diffused strip | overhead | 0.15 | edges only | reading surface, high key |
| About | practical | upper-left | 0.10 | opposite corner | quiet, editorial |
| Contact | practical | upper-right | 0.10 | opposite corner | headline is the light |

## 3.8 Lighting Study (04.7) — specification

An **optional, isolated** chapter after About, before Contact, presented as a
single restrained panel — not a dashboard.

- **Scene:** one abstract geometric subject (a bevel-less sphere/cone/plane
  composition) rendered in **SVG** with vector gradients. Never the owner's
  photographs.
- **Controls (maximum six, all keyboard accessible, 44 px targets):** technique
  selector (Rembrandt, Split, Butterfly, Loop, High-key, Low-key, Cross, Rim);
  key intensity; fill intensity; key direction (0–180°); temperature (warm↔cool);
  shadow depth. Reset.
- **Technique behaviour:** each preset repositions the SVG key ellipse, changes
  its spread/opacity, moves the shadow polygon, and adjusts fill — a *credible
  interpretation*, clearly labelled as such.
- **Feedback:** the selected technique is stated in text as well as visually; no
  colour-only state; `aria-live` announces changes; `prefers-reduced-motion`
  removes interpolation, not the result.
- **Non-interactive fallback:** a static triptych of three authored setups for
  users without pointer/keyboard or with JS disabled.
- **Isolation:** the Study owns its own local state. It must not import the
  portfolio lighting system or introduce a second global loop.

---

# STAGE 04.4 — LIGHTING ARCHITECTURE

## 4.1 Single system, no duplication

The site will have **one lighting system** with three clearly separated tiers.
The three inert artefacts are resolved as follows:

| Artefact | Decision | Reason |
|---|---|---|
| `src/lighting/LightingEngine.ts` | **Demote + repurpose** as the *preset data source only* (`PRESETS`). Remove RAF/cursor machinery entirely in 04.5. | Presets are useful; its loop is not, and it is currently inert. |
| `src/components/LightingLayer.tsx` | **Delete** | A full-viewport overlay caused the seam artifacts; the architecture no longer needs a layer. |
| `src/components/ChapterLight.tsx` | **Delete** (superseded) | Section backgrounds now carry the light directly. |

Result: no overlay mounts, no second engine, no dead files pretending to work.

## 4.2 The three tiers

**Tier 1 — Environment (global, static, in `Background.tsx`).**
Three authored planes, one directional gradient edge, one fine rule, no centre
bloom, no vignette ring. One static composition; no RAF, no cursor. Replaces L0–L6
entirely.

**Tier 2 — Chapter light (per section, `background-image` only).**
Proven seam-free in Phase 04C. Each chapter's `background-image` stack encodes its
named source. A shared set of semantic tokens makes the parameters consistent:

```
--light-key-position / -size / -intensity
--light-rim-width / -intensity
--light-fill
--light-reflection
--light-atmosphere
--light-shadow
--light-temperature
--light-falloff
```

Only the roles each chapter uses are declared; no blind token sprawl.
Film temperature overrides are scoped by chapter id, exactly as now.

**Tier 3 — Lighting Study (isolated, local).**
Its own SVG scene and local React state. No shared runtime, no global tokens
leaking into the portfolio, no loop.

## 4.3 Proposed file map

| File | Change | Stage |
|---|---|---|
| `src/index.css` | Delete `.bloom`, `bloomBreathe`; replace `.vignette`; gate contrast; add chapter light geometry/tokens | 04.5 / 04.6 |
| `src/components/Background.tsx` | Rewrite to three static planes; remove RAF, cursor springs, blooms, haze, particles; keep or simplify grain canvas | 04.5 |
| `src/App.tsx` | Remove `.bloom` element; keep scanlines decision; mount nothing new | 04.5 |
| `src/components/Portrait.tsx` | Delete sapphire halo, its loop and dead gradient overlays | 04.5 |
| `src/lighting/LightingEngine.ts` | Reduce to preset data; delete loop | 04.5 |
| `src/components/LightingLayer.tsx` | Delete | 04.5 |
| `src/components/ChapterLight.tsx` | Delete | 04.5 |
| `src/components/LightingStudy.tsx` | Add (isolated SVG scene + controls) | 04.7 |
| `src/components/{ScrollSphere,FilmSections,FeaturedProject,ArchiveLinks,About,Footer}.tsx` | Not structurally changed; light arrives via scoped CSS | 04.6 |
| `src/hooks/useDeviceLayout.ts` | Possibly expose a reduced-light flag | 04.5 |
| Manifests, `utils/media.ts`, sound engine, assets, sphere/ribbon geometry | **Untouched** | — |

## 4.4 Performance and accessibility contract

- No RAF anywhere in Tiers 1–2. Static CSS/SVG only.
- No full-screen `blur()` filters, no `backdrop-filter`, no blend-mode-over-photo.
- At most **two** extra painted layers per chapter (both in `background-image`).
- Reduced motion: nothing to disable in Tiers 1–2 by construction; the Study
  drops interpolation.
- Contrast gate: any lit background region under text must be measured, not
  assumed. Target ≥ 4.5:1 for body, ≥ 3:1 for display.
- Seam gate (from Phase 04C) remains mandatory: smoothed horizontal luminance
  scan with content hidden, lit vs unlit, max column jump **< 2**.
- Colour is never the only indicator in the Study.

## 4.5 Implementation stages and gates

| Stage | Content | Gate |
|---|---|---|
| 04.5 | Remove the five centre-glow causes; Tier 1 environment; Hero | Owner visual approval of hero before proceeding |
| 04.6 | Photography, Filmography ×3, Featured, Archive, About/Contact | Seam gate + contrast gate per chapter |
| 04.7 | Lighting Study | Keyboard/touch/reduced-motion test |
| 04.8 | Optimisation, all seven viewports, before/after, report | Full acceptance list |

---

# OWNER APPROVAL REQUIRED BEFORE STAGE 04.5

1. **Direction:** Route B (Dark Stage) with the archive high-key exception and one
   film-temperature projection wash — or Route A / C.
2. **Intensity:** confirm the target is a genuinely dark, selective page. If you
   want a brighter page overall, Route B needs a scoped amendment first.
3. **Archive exception:** approve the archive being visibly lighter than the
   portfolio so images stay accurate.
4. **Portrait halo removal:** the current 6 s breathing sapphire halo behind the
   head will be removed (replaced by directional left key + right rim).
5. **Lighting Study placement:** after About, before Contact; optional and
   non-blocking.
6. **Film temperatures:** confirmed provisional (oxide / ochre / amber) pending
   in-situ review.
7. **Scanlines:** remove, or keep as texture at reduced opacity.

**No code has been written for this phase.** Awaiting approval of direction and
the seven points above before Stage 04.5.

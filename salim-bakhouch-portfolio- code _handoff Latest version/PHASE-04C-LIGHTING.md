# PHASE 04C — CHAPTER LIGHT, PAINTED INTO THE SECTIONS

**Status:** implemented, seam-gated, verified. **Not deployed.**
**Previous attempts:** rejected (global overlay) and withdrawn (overlay rig with
a clipped-gradient seam). This is the third approach and the first that passes
an objective seam test.

---

## 1. What changed conceptually

No lighting elements are mounted at all. There is **no `.chapter-light` DOM, no
`.lighting-layer`, no blend modes, no blur, no RAF and no pointer input**. Light
is expressed entirely as **additional background gradients on the chapter that
owns it**:

```css
#work   { background-image: radial-gradient(...), radial-gradient(...); }
#photography { background-image: radial-gradient(...), radial-gradient(...); }
#delusion-of-negation, #zakias-clock, #the-birth-permit { ... }
#featured-project { ... }   #about { ... }   #contact { ... }
```

Composition order is `background-image → section content`, so light can only ever
sit **behind** the subject. It cannot overlay type or imagery, cannot be clipped
by a foreign box, and cannot reveal a rectangular edge — the failure mode of the
previous rig.

## 2. The rig, chapter by chapter

| Chapter | Light idea | Accent |
|---|---|---|
| Hero `#work` | Window source upper-right, 0.085 max; warm floor reflection 0.055 | cool silver-blue |
| Photography `#photography` | Broad spill behind the sphere cluster, 0.085; low cool floor | sapphire |
| Delusion `#delusion-of-negation` | Edge source upper-right at 0.068 + warm floor | oxide `208 140 126` |
| Zakia’s Clock `#zakias-clock` | Same geometry, own temperature | field ochre `201 164 111` |
| The Birth Permit `#the-birth-permit` | Same geometry, own temperature | sodium amber `226 174 116` |
| Featured `#featured-project` | Gallery lamp over the poster 0.07; far accent; warm floor | Delusion oxide |
| About `#about` | Quiet directional ambient 0.052 | cool blue |
| Contact `#contact` | Directional source upper-right 0.058 + faint floor | cool blue |

All stops terminate at **transparent 100%** inside their own section box, so
there is no discontinuity at any boundary.

Mobile widens each field (120–150%) and lowers intensity, so the phone reads as
even atmosphere rather than a spot.

## 3. Seam gate — the acceptance test that previous attempts failed

Method: hide all section children, screenshot the painted background only, take
a horizontal luminance scan across the chapter, smooth it (k=12), and measure the
largest adjacent-column jump. Run for every chapter, at 1920/1440/390, with
lighting **on** and **off**.

| Run | Max column jump | Mean |
|---|---:|---:|
| Lighting **on** | **0.42** | 0.29 |
| Lighting **off** (control) | **0.41** | 0.29 |

The lit background is statistically identical to the unlit background in
smoothness — **0.01 difference**. The gate that rejected the previous rig
(9–19 jumps at a fixed x) now passes with a 50× margin.

Raw data: `evidence/phase-04c/seam-control.json`, `seam-pure.json`.

## 4. Contrast

Measured on rendered pixels, identical to the unlit site:

| Sample | Size | Contrast |
|---|---:|---:|
| Hero quote | 18.4 px | 11.42:1 |
| Film logline | 14.72 px | 11.42:1 |
| About body | 31.68 px | 11.42:1 |

Low microtype remains the pre-existing authored style (`--muted` = 2.77:1), which
this phase neither changes nor addresses.

## 5. Integrity and regression

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, 2,411,394 bytes |
| sha256 | `12139b62b4e13eefc2d921f262b4f3990aac06b3166e4ce572868db74c126d0a` |
| Mounted lighting DOM | **0** — no rig, no layer |
| Overflow | 0 at all seven viewports |
| Console errors | 0 |
| Sphere / ribbons / frames | 36 / 3 / 122 |
| Film viewer | opens |
| Photography archive | opens, 16 albums |
| Bottom dock | still removed |
| Sound engine, manifests, assets | untouched |

Screenshots: `evidence/phase-04c/screens/` — eight chapters at seven viewports,
plus `__off` controls; contact sheets `lit-hero.jpg`, `lit-chapters.jpg`,
`lit-editorial.jpg`.

## 6. Disable switch

```css
html[data-lighting="off"] #work,
html[data-lighting="off"] #photography,
… { background-image: none; }
```

No JavaScript is involved. The preserved `LightingEngine.ts` and
`ChapterLight.tsx` remain in the repo, unused, for a future approved direction.

## 7. Honest limitations

- The light is intentionally subtle. At 0.05–0.09 alpha it adds depth and
  chapter temperature without becoming an effect. If the owner wants it stronger,
  raising alpha is a one-line change per section, but must be re-run through the
  seam gate and visually reviewed.
- Film accents remain provisional.
- Carried defects untouched: film-archive scroll lock, phone hero band,
  canonical URL, deployment token.

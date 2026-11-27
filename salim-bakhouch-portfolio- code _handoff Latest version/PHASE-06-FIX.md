# PHASE 06 · CORRECTION — APERTURE VISIBLE BEHIND THE FILMOGRAPHY, RESIDUAL SPACE REMOVED

**Public preview (live, verified):**
## https://etherealism-aperture-v2.deed.page/

HTTP/2 200 · 2,429,285 bytes · prefix match **2,428,246 / 2,428,261** bytes
(only the 1,024-byte host badge).

---

## 1. Why the aperture was invisible behind the filmography

It was **not** placed above the content — it was **completely covered by it**.

Measured before the fix:

| Element | Computed background | z-index |
|---|---|---|
| `.optical-field` (aperture) | base blue | **0** |
| `#work` | `rgb(5, 9, 18)` opaque | 10 |
| `#photography` | `rgb(13, 35, 64)` opaque | 10 |
| `#filmography` | `rgb(5, 9, 18)` + opaque gradient | 10 |
| `#featured-project` | `rgb(8, 22, 41)` opaque | 10 |
| `#about` | `rgb(5, 9, 18)` + gradient | 10 |
| `#contact` | `rgb(5, 9, 18)` + gradient | 10 |

Every section painted an **opaque** blue at z-10 over the field at z-0, so the
aperture was fully occluded outside the hero. That is why it appeared to exist
only in some places and to sit "above" the filmography — it was the only place
any part of it survived, and it read as disconnected.

### The fix
All sections now paint **translucent tints** (0.24–0.82 alpha) over the single
continuous field, so the aperture is genuinely the environment behind the whole
page. The filmography's blue progression became a translucent ladder
(0.55 → 0.82 → 0.55) instead of opaque bands.

### Proof, not assertion
Hiding only `.oa-svg` and diffing the two screenshots at the same scroll
position inside Zakia's Clock:

```
mean pixel delta: 13.63
changed pixels:   12.61 %
```

The aperture now demonstrably alters **12.6 % of the filmography frame**. Before
this correction the differential was zero.

## 2. The residual space where the light-shape was

The shape was removed in the previous pass, but its **spacing remained stacked**.
Measured before:

| Source | Value |
|---|---|
| `.film-sections` `gap` | `clamp(4rem, 9vh, 8rem)` — 4–8 rem between chapters |
| `.film-sections` `margin-top` | `clamp(1.5rem, 4vh, 3rem)` |
| Row `margin-top` | `clamp(1.5rem, 4vh, 3rem)` = 36 px |
| Row `padding-top` | `clamp(3rem, 7vh, 5.5rem)` = 31.5 px |
| Header `padding-top` | `clamp(4.5rem, 9vh, 6.5rem)` |
| Ribbon margin / height | `0.75rem + 1.1rem`, up to 820 px |

Together these produced the empty band that used to be occupied by the plane.

### After
| Source | Value |
|---|---|
| `.film-sections` `gap` | **27 px** (`clamp(1.25rem, 3vh, 2.25rem)`) |
| `.film-sections` `margin-top` | **13.5 px** |
| Row `margin-top` | **12–24 px** |
| Row `padding-top` | **24–44 px** |
| Header `padding` | **48–68 px** top |
| Ribbon margin / height | **0.35 / 0.4 rem**, 480–720 px |

Measured result: rows **1000 / 1090 / 1090 px** (were 1078 / 1109 / 1109),
gap after header **18 px**, gap between rows **45 px**, whole filmography
**3540 px** — the dead band is gone while the chapters keep a clear breath.

Ribbon geometry, winding, frame count and interaction are untouched: this is
spacing only.

## 3. Verification

| Check | Result |
|---|---|
| Section backgrounds | all `rgba(0,0,0,0)` — translucent tints only |
| Aperture differential behind filmography | **13.63 mean / 12.61 % pixels** |
| Filmography gaps | 27 px row gap · 18 px after header · 45 px between rows |
| Frame count | 122 |
| Overflow | **0** at all seven viewports |
| Console errors | **0** |
| Contrast (live surfaces) | hero 11.27 · nav 11.27 · photo eyebrow 6.31 · film index 10.65 · film meta 6.31 · logline 11.27 · about 11.27 · contact 6.31 — **all pass AA** |
| `npx tsc --noEmit` | clean |
| `npm run build` | one `dist/index.html`, 2,428,261 bytes, sha `8210f4e6…` |
| Photographs / manifests / resolver / sound engine / geometry | untouched |

Live capture: `evidence/phase-06/screens/LIVE-v2-films.png`.
Sheets: `aperture-behind-films.jpg`, `aperture-page.jpg`.
Measurement: `evidence/stack.mjs`, `evidence/prove.mjs`.

## 4. Files changed

| File | Change |
|---|---|
| `src/index.css` | Sections made translucent so the field reads through; filmography spacing compacted (gap, margins, paddings, ribbon margins) |

No component, data, asset, manifest, geometry or typography change.

## 5. Known limitations

- The aperture now reaches every section; if it ever competes with a photograph,
  the per-viewport opacity rules in the field remain the lever.
- The earlier `etherealism-aperture` slug is superseded by `-v2`.
- Film accent tiers remain provisional.

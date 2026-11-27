# PHASE 05 — BLUE HOUR / CHROMATIC COUNTERLIGHT

**Public preview (live, verified):**
## https://etherealism-bluehour-blue.deed.page/

HTTP/2 200 · 2,421,802 bytes · matches local build for 2,420,765 bytes, the only
difference being the 1,027-byte deed.page badge. Permanent site, HTTPS.
**No deployment of the canonical site was made.**

---

## 1. Verified deployment and source version

| Check | Result |
|---|---|
| Preview at start of phase | `https://etherealism-preview.deed.page/` — HTTP 200, 2,417,847 bytes, sha `f7779a81…` |
| Local source at start | **Ahead**: contained the uncommitted Phase 03.2 One Warm Light correction (2,416,827 bytes) |
| Discrepancy | **Confirmed.** The live preview was the older 04G build; the local tree was newer. I kept the newer local source and did not restore from an older snapshot. |
| Git | Not initialised in this workspace (environment resets); no commit history to compare. Version identity is by build hash. |
| Final preview | `etherealism-bluehour-blue.deed.page` — permanent slug publishing the final build. Two intermediate slugs (`etherealism-bluehour`, `etherealism-bluehour-final`) were created while correcting a surviving warm stroke and a contrast failure; they are superseded and should not be used as references. |

An earlier attempt to update `etherealism-preview` in place was **rejected** (no
update token for that slug). A fresh slug was used instead; the older preview
remains untouched.

## 2. Visual colour audit of the baseline

Measured on the rendered build before Phase 05:

- **Environment:** a single flat near-black field; the three film chapters had
  inherited per-film blue gradients from 04G, plus a warm `citrine` signal from
  03.2 applied to four micro elements per film.
- **Problem inherited:** the 03.2 One Warm Light introduced a yellow-green accent
  that had not been reconciled with the film identities. The 04G blue ladders were
  still in place. The result was two competing systems.
- **Photography, About, Contact:** already restrained — sapphire, pearl, silver.
- Measured accent colours: `#7ec4ff`, `#d7e66a`, `#b7c455`.
- No centre bloom remained (0 nodes).

## 3. Film-specific colour study

Six representative stills per film, sampled from the project's own baked preview
module, converted to OKLCH. Raw data: `evidence/phase-05-stills.json`.

| Film | Chroma share | Mean chroma | Warm : cool | Dominant hue families | Highlights |
|---|---:|---:|---:|---|---|
| **Delusion of Negation** | 8.2 % | **0.014** | 0.75 | 30–60° 27 %, 210–240° 25 %, 240–270° 23 % | 197°, 180°, 240° — cool |
| **Zakia's Clock** | **64.1 %** | 0.035 | 1.09 | 210–240° **32 %**, 60–90° **25 %**, 150–180° 12 % | 130°, 87°, 102°, 83° — yellow-green |
| **The Birth Permit** | 47.0 % | 0.035 | **6.71** | 30–60° 32 %, 60–90° 30 %, 90–120° 19 % | 95°, 82°, 109°, 49° — warm ochre |

### Decisions and justification

- **Delusion — retains the shared ice identity (`#7ec4ff`).** Its frames are
  almost achromatic (mean chroma 0.014, only 8 % chromatic pixels) and its
  highlights are cool. Assigning it a distinct accent would have been invented,
  not derived.
- **Zakia — Luminous Lichen (`#d7e66a`).** 36 % of its chromatic content sits in
  the yellow-green families with yellow-green highlights. This is the film whose
  stills most clearly *earn* the counterlight.
- **Birth Permit — deeper lichen (`#b7c455`).** The most chromatic film
  (warm:cool 6.7:1) but its warmth is ochre-green, not orange. A deeper step of
  the same family keeps it distinct without introducing a new hue family.
- **Featured — ice**, derived from the poster's own blue field.

**Consequence:** one contrasting family only. No orange, brown or purple
interface identity was introduced; a single `#d08c7e` stroke survived in the
Featured background geometry from an earlier phase and was found and replaced
with ice during verification.

## 4. Implemented palette (Blue Hour)

All values in `:root`, hex with OKLCH documented; ground and ink tokens preserved
as names but re-pointed to the new environment.

| Role | Value | OKLCH | Share |
|---|---|---|---:|
| Abyss | `#050912` | 0.135 0.020 262 | environment |
| Midnight navy | `#09172c` | 0.223 0.048 258 | environment |
| Mineral blue | `#173d5b` | 0.345 0.070 245 | environment |
| Sapphire | `#3d9fff` | 0.691 0.168 251 | structure |
| Ice blue | `#7ec4ff` | 0.790 0.112 240 | structure + Delusion accent |
| Pearl | `#edf3f8` | 0.958 0.008 240 | neutral |
| Silver | `#a9bbd0` | 0.784 0.032 250 | neutral |
| Silver mist | `#7f93aa` | 0.646 0.034 252 | neutral |
| **Luminous lichen** | `#d7e66a` | 0.884 0.140 116 | **accent, ≤4 %** |
| Lichen deep | `#b7c455` | 0.786 0.112 114 | accent |
| Lichen pale | `#e6ef9e` | 0.921 0.088 118 | accent |

Distribution achieved: deep blue/navy environment dominates every chapter;
neutral typography is pearl/silver; the lichen family appears only on four marks
per film chapter (index numeral, 32 px rule, active-frame outline, logline
label). `--muted` is now `#7f93aa` (was `#495869`).

## 5. What changed on the site

| Area | Change |
|---|---|
| Hero | Blue-Hour plane: mineral → navy → abyss, plus negative fill. Portrait untouched. |
| Photography | Mineral-blue base, ice counterlight behind the sphere. Sphere geometry/physics unchanged. |
| Filmography | One continuous blue field for all three chapters; chromatic character supplied by a scroll-linked counterlight per film in that film's derived accent. No full-screen tint, no overlay on stills. |
| Featured | Sapphire exhibition wall; poster untouched and unfiltered. |
| Archive | Navy → abyss header/scrim, ice active-state and watch control. Same ribbon architecture. |
| About / Contact | Return to sapphire + silver; no accent. |
| Accents | Delusion ice, Zakia lichen, Birth deep lichen. Four marks each. |

**Scroll progression:** `#delusion-of-negation::before`, `#zakias-clock::before`,
`#the-birth-permit::before` carry the chapter's counterlight and use CSS
`animation-timeline: view()` to rise and recede across the chapter
(0.12 → 0.72 → 0.12 opacity). No JavaScript, no RAF, no pointer input, no second
engine. Reduced motion keeps the colour but fixes opacity at 0.5. Browsers
without scroll-timeline support get a static 0.55 field.

## 6. Accessibility

Contrast measured against each element's real background
(`evidence/phase-05/contrast.json`):

| Sample | Size | Contrast | Result |
|---|---:|---:|---|
| Hero quote | 18.4 px | 11.42:1 | pass |
| Nav link | 12 px | 11.42:1 | pass |
| Film chapter index (ice / lichen / deep lichen) | 10 px | **10.65 / 14.62 / 10.47:1** | pass |
| Film metadata | 7.5 px | 6.31:1 | pass |
| Film logline | 14.7 px | 11.41:1 | pass |
| About body | 31.7 px | 11.42:1 | pass |
| Contact metadata / legal | 9–10 px | 6.31:1 | pass |

**One failure was found and fixed:** `.spatial-subtitle` measured **2.21:1** on
its real surface. It now uses `--c-silver` at 0.86 opacity — a colour-only change,
type size and family untouched. Re-audit: **0 failures.**

Accents are never the only signal: chapter index numeral, rule, active-frame
outline and label also carry position and weight; active state additionally has
an outline offset, not colour alone.

## 7. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass — one `dist/index.html`, **2,420,776 bytes**, sha `18686353d06bd5a8439325f3f559112f913e67e8e3eba35ef952791f25f957b0` |
| Overflow | **0** at 1920, 1440, 1024, 768, 390, 360, 844×390 |
| Console errors | **0** |
| Bloom nodes | **0** |
| Sphere / ribbons / frames | 36 / 3 / 122 |
| Old warm identities in build | **0** (`#d08c7e`, `#e2ae74`, `#c9a46f` absent) |
| Manifests, previews, media resolver, sound engine, portrait | checksums unchanged |
| Images | no crop, resize, filter, grade or recompression |

Screenshots: `evidence/phase-05/screens/` — seven viewports × (hero, photography,
featured, about, contact) plus **all three films at start, middle and end**
of each chapter. Sheets: `bh-films.jpg`, `bh-shell.jpg`, `bh-progression.jpg`,
`bh-responsive.jpg`.

## 8. Known limitations

- In-place updates of the earlier `etherealism-preview` slug are not possible
  without its token; the current preview is a new permanent slug.
- `animation-timeline: view()` is not universally supported; the static fallback
  is intentional and looks correct.
- Film accent derivation used 6 frames per film from the delivered preview
  derivatives, not the full 122 masters; it is a documented sample, not a
  complete grade analysis.
- The canonical deployment remains untouched and on its older build.
- Film accents remain subject to owner approval.

## 9. Modified files

- `src/index.css` — Blue Hour tokens, environment, film counterlight system,
  accent grammar, archive/featured/about/contact colour, subtitle contrast lift.
- `src/components/ChapterGeometry.tsx` — one warm stroke replaced with ice.
- No layout, typography size, motion, data, manifest or asset change.

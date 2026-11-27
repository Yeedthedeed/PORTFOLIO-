# PHASE 03 — VISUAL FOUNDATION · DELIVERY REPORT

**Scope delivered:** semantic colour tokens, typography roles, global
spacing/grid, shared frames/dividers, graphic rules, chapter labels and base
section identities. **Not delivered (out of scope):** lighting-engine changes,
sphere/ribbon engine rewrites, sphere/ribbon geometry or scale, sound redesign,
manifest migrations, contact/watch content, deployment.

**Baseline:** `07dc6a4a5c016b8719db2b128ca4b6e497cad106`, reconstructed and
verified against the Phase 01 frozen source fingerprints before any edit.
**Phase 03 commit:** `e444b5c` — working tree clean.
**Deployment:** none. The public site is untouched.

---

## 1. Continuity gate (completed before any code change)

| Check | Result |
|---|---|
| `.git` present | **No** — destroyed by another workspace reset |
| Phase 01 bundle/archive/pointer | **Destroyed** — `/home/user/phase-01-*` missing |
| Surviving source identity | **Matches frozen fingerprints exactly** (`App.tsx c7c56889…`, `index.css 322bc6c8…`, `media.ts 4a2306c1…`, `SoundEngine.ts c3c973dc…`, `Background.tsx ca66acf7…`, `MediaImage.tsx da678d4e…`, `portraitInline.ts 11e1ed4e…`, `index.html 057a7ae3…`) |
| Action | Reconstructed a clean repository at `07dc6a4`, branch/tag `phase-03-baseline` |
| Durable backup | `/home/user/phase-03-baseline.bundle` (54 MiB) and `/home/user/phase-03-baseline-evidence.tar.gz` (51 MiB), SHA-256 recorded in `/home/user/phase-03-SHA256SUMS.txt`; `git bundle verify` → okay, complete history |
| Phase 01 evidence | **Preserved** under `evidence/phase-01/` (80 captures + 4 sheets + logs) |

The original frozen commit `cc37496…` could not be restored because its bundle
was destroyed; the new commit preserves identical application source and all
Phase 01 evidence. This limitation is recorded, not hidden.

## 2. Specification corrections applied before implementation

All requested corrections were committed to `PHASE-02-ART-DIRECTION.md`:

1. Tablet ribbon frames unified at **140–160 px (provisional)** in both §5.3 and §8.3.
2. Orbital marks restricted to the **Photography sphere only**; archives explicitly excluded.
3. Film slates required to be **data-driven** from existing metadata; reusing Delusion values forbidden.
4. **Reduced-motion contract** added: portrait breathing, hover scaling, animated grain and all looping motion disabled.
5. Contrast must be verified against **actual component backgrounds**, not the base colour alone.
6. Film accents remain **provisional** pending in-situ comparison of all three chapters.
7. Unverified biography, availability, location, contact and film destinations **preserved as placeholders**; no invented values or links.
8. Phase 03 decisions **separated** from Contact, Featured Project and Deployment decisions (§15.1 / §15.2) so local work is not blocked.

## 3. Changed files

| File | Change |
|---|---|
| `src/index.css` | Only implementation file. Token layer, typography roles, chapter/section identities, frames, archive chrome type, reduced-motion contract, header collision guard, legibility floor. Additive at the end of the cascade; existing rules extended, not replaced. |
| `PHASE-02-ART-DIRECTION.md` | Owner corrections (documentation). |
| `evidence/phase-03/` | New: 43 viewport PNGs, 6 comparison sheets, capture/contrast/regression/nav scripts, JSON logs. |
| `PHASE-03-REPORT.md` | This report. |

**No application code outside `src/index.css` changed.** No `.tsx` logic edits,
no data, no assets, no build config.

## 4. Token table (implemented)

Semantic roles in `:root`, hex fallback plus `@supports (oklch)` override.

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `--surface-void` | `#03060a` | `0.119 0.013 247.6` | overlay ground |
| `--surface-base` | `#050709` | `0.127 0.007 243.8` | page ground |
| `--surface-raised` | `#08111b` | `0.174 0.025 251.5` | slates, cards |
| `--surface-panel` | `#0b1724` | `0.201 0.031 251.5` | archive rail |
| `--surface-instrument` | `#0f2133` | `0.242 0.042 250.0` | active rail/header |
| `--text-primary` | `#eef3fa` | `0.962 0.011 256.7` | headings |
| `--text-secondary` | `#c9d5e3` | `0.868 0.023 252.2` | body |
| `--text-tertiary` | `#9daec3` | `0.745 0.036 253.8` | captions/meta |
| `--text-quiet` | `#7c8fa6` | `0.643 0.041 253.3` | lowest emphasis |
| `--line-hair/soft/strong` | `#1a2633` / `#253546` / `#3a5168` | — | 1 px rules, dividers, active |
| `--blue-core/bright/deep/ink` | `#3d9fff` / `#8fd2ff` / `#1b5fb8` / `#03101d` | — | sapphire accent, focus |
| `--film-delusion` | `#d08c7e` | `0.705 0.086 32.1` | **provisional** |
| `--film-delusion-cool` | `#8fc3dc` | `0.790 0.065 229.2` | **provisional** |
| `--film-zakia` | `#c9a46f` | `0.740 0.082 75.9` | **provisional** |
| `--film-birth` | `#e2ae74` | `0.786 0.096 68.7` | **provisional** |
| `--silver-gelatin` | `#d6dee8` | `0.897 0.016 253.9` | italic chapter emphasis |

Compatibility aliases retained so existing components keep working:
`--bg`, `--bg-2/3`, `--bg-base`, `--ink*`, `--accent*`, plus previously
**undefined** `--ease-out`, `--font-body` and `--accent-rgb`, which are now
declared. `--muted` (was `#495869`, 2.77:1) now maps to `--text-tertiary`.

Film accents are assigned by **chapter scope**, never by hard-coded component
values:

```css
#delusion-of-negation { --film-accent: var(--film-delusion); … }
#zakias-clock         { --film-accent: var(--film-zakia); … }
#the-birth-permit     { --film-accent: var(--film-birth); … }
#featured-project     { --film-accent: var(--film-delusion); … }
```

## 5. Typography and scale summary

| Role | Family | Size |
|---|---|---|
| Display / chapter title | Fraunces 350 | `clamp(2.4rem, 4.4vw, 3.9rem)` |
| Film title | Fraunces 350 | `clamp(2.1rem, 4.2vw, 3.5rem)` |
| Hero quote | Fraunces | `clamp(1.0625rem, 1.35vw, 1.25rem)` |
| Lead / logline | Space Grotesk 300 | 17 px desktop / 16 px phone, 1.68 |
| Body | Space Grotesk 300 | 16 px phone, 17 px desktop, 1.7 |
| Caption | Space Grotesk 300 | 12–13 px, 1.5 |
| Metadata / eyebrow | JetBrains Mono 400 | **12 px floor**, 0.12–0.22 em tracking |
| Registration marks | JetBrains Mono | 10 px, non-information only |

**Essential-text floor enforced:** measured at all seven viewports, visible
text nodes below 12 px = **0**. Before Phase 03 it was 33–96 per viewport.

## 6. Contrast — measured on rendered pixels

Sampled against each component’s actual opaque ancestor background, with
composited OKLCH resolved through a canvas.

| Sample | Size | Contrast | AA |
|---|---:|---:|---|
| Hero kicker | 12 px | 8.91:1 | Pass |
| Hero quote | 18.4 px | 13.56:1 | Pass |
| MetaCard label | 12 px | 8.91:1 | Pass |
| Nav tagline | 12 px | 8.91:1 | Pass |
| Photography eyebrow | 12 px | 8.91:1 | Pass |
| Photography subtitle | 12 px | 8.91:1 | Pass |
| Film eyebrow / meta / caption | 12 px | 8.91:1 | Pass |
| Film logline | 17 px | 13.56:1 | Pass |
| Featured kicker | 12 px | 8.91:1 | Pass |
| About body | 16 px | 13.56:1 | Pass |
| About stat label | 12 px | 8.91:1 | Pass |
| Contact meta / legal | 12 px | 8.91:1 | Pass |
| Chapter rail | 12 px | 6.09:1 | Pass |
| Archive link | 79.2 px | 18.10:1 | Pass |

Lowest sampled essential combination: **6.09:1**, above AA 4.5:1. Raw data:
`evidence/phase-03/contrast.json`.

## 7. Screenshots

`evidence/phase-03/screens/` — **43 PNGs**, seven viewports × six sections
(1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×800, 844×390) plus
interaction states. Labelled comparison sheets:

- `before-after-hero.jpg`
- `before-after-photo.jpg`
- `before-after-film.jpg`
- `before-after-editorial.jpg`
- `phase03-responsive.jpg`
- `phase03-mobile-sections.jpg`

Phase 01 baseline remains in `evidence/phase-01/` for direct comparison.

## 8. Test results

| Test | Result |
|---|---|
| `npx tsc --noEmit` | **Pass** (exit 0) |
| `npm run build` | **Pass** — one file `dist/index.html`, 2,413,111 bytes, sha256 `dbf5f572…7856` |
| Horizontal overflow | **0** at all seven viewports |
| Console/page errors | **0** on clean loads |
| Visible text < 12 px | **0** at all seven viewports |
| Header overlaps | **0** at all seven viewports (was 3–5 at tablet/landscape) |
| Photography archive | Opens, 16 albums, tiles, lightbox, Esc closes, scroll restored |
| Film viewer → stills | Opens, Esc closes, navigation intact |
| Film slates | 29 / 50 / 43 stills, per-film credits and accents — data-driven |
| Sphere / ribbons | 36 cards, 3 ribbons, 122 frames — unchanged |
| Reduced motion | Rules present; develop visible, grain/bloom loop stopped |

**Asset / manifest integrity (diff vs baseline):** empty for
`src/data`, `src/assets`, `src/utils/media.ts`, `index.html`, `package.json`,
`vite.config.ts`. Counts re-verified from source: 81 photographs, 16 albums,
10 collections, 36 sphere entries, 79 + 43 = 122 stills, 203 previews.
**No original asset, manifest, URL, sequence or album relationship was touched.**
No new dependency. Sphere and ribbon geometry untouched.

## 9. Deviations from the approved specification

1. **Sphere enlargement and ribbon scale were not implemented.** Phase 03 was
   scoped to foundation; the approved optics targets belong to the next
   implementation step. Current measured sizes are unchanged (sphere 11 % of
   viewport width at 1920).
2. **Archive light-table restructure not implemented.** Only archive chrome
   typography and borders changed; the 62/38 viewer split and 264 px rail are
   staged.
3. **Film accents applied provisionally**, only to index dots/rules/captions —
   no re-tint or wash. Owner visual review still required.
4. **Hero bottom slate and rail recomposition not implemented.** Only type and
   linework values changed; layout restructure is staged.
5. **Orbital marks not added.** Kept out to avoid a cosmetic graphic layer
   before the sphere-scale decision; specification allows them only in the
   Photography sphere.
6. **Header collision fix** added as a regression guard (centre tagline hidden
   below 1440) — directly caused by the approved larger type.

## 10. Unresolved regressions / carried defects

- **Filmography archive scroll lock** still does not restore `body.overflow`
  after close (pre-existing, confirmed again). Phase 04 input.
- **Photography archive Escape** remains state-dependent (pre-existing).
- **Focus restoration** after archive close still lands on `body`.
- **Phone hero dead band** remains; portrait ends 561 px, caption starts 737 px.
  Composition change is staged.
- **Featured Project on phone** still runs content beneath the dock.
- **Portrait delivery copy** (embedded 1312×1199 WebP) remains pending owner
  acceptance.
- Live canonical URL still points to the superseded site; unchanged.
- No deployment token; the public build is untouched.
- The original Phase 01 frozen commit remains unrestorable; a verified
  reconstruction is committed instead.

## 11. Status

**GO for Phase 04 visual-optics work** (sphere/ribbon scale, archive
composition, hero recomposition) **with explicit owner scope approval.**
**NO-GO for deployment** and for Contact/Featured content finalisation until
the deferred owner decisions are supplied. Phase 03 is complete and committed
at `e444b5c`; working tree clean; production untouched.

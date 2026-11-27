# PHASE 04G — MONOCHROME COLOUR SCIENCE, SEAMLESS SURFACES, LIVE PREVIEW

**Public preview URL (live, verified):**
## https://etherealism-preview.deed.page/

Permanent deed.page site · HTTP/2 200 · serves this exact build (common prefix
2,416,812 of 2,416,827 bytes; only the host badge differs).

---

## 1. The colour problem and the correction

The filmography landing pages mixed warm oxide, ochre and amber washes into a
blue field. Warm + blue mixing at low chroma produces **muddy brown/purple
midtones** — that is exactly what the owner saw. The problem was not the hues
themselves but **warm pigment used as environmental light**.

### New system: monochromatic ladders + true complements

Each film keeps one **blue-family hue** for its environment, separated by
lightness/chroma and, more importantly, by **light direction**. The complement
is used only as a surgical accent at micro scale.

| Film | Environment hue | Deep tone | Opposite (micro only) | Light direction |
|---|---|---|---|---|
| Delusion | `oklch(0.74 0.098 250)` low-key sapphire | `oklch(0.30 0.072 252)` | `oklch(0.83 0.115 70)` amber | **from the right**, 96° |
| Zakia | `oklch(0.80 0.072 205)` glacier | `oklch(0.34 0.052 208)` | `oklch(0.84 0.094 25)` ember | **from the left**, 264° |
| Birth Permit | `oklch(0.72 0.090 268)` ink royal | `oklch(0.28 0.066 270)` | `oklch(0.85 0.100 88)` citron | **from above**, `to top` |

Why this is coherent colour science:
- All three environment hues sit in a **narrow blue arc (205°–268°)** and are
  separated by lightness and chroma, so they read as one family.
- Warmth is *never* in the field. It exists only in three micro locations: the
  eyebrow rule (18 px), the 4 px metadata dot, and a 1 px active-frame outline.
  Total warm area is **under 2 %** of any chapter.
- The accent is a **true opposite** in OKLCH hue terms, so it reads as chromatic
  relief against the blue rather than as a competing tint.
- Every gradient resolves back to the shared base `#05070A`, so no coloured edge
  is created at a chapter boundary.

Verified in-browser at every viewport: accents resolve to
`oklch(74% .098 250)` / `oklch(80% .072 205)` / `oklch(72% .09 268)`; the old
warm RGB values (`208,140,126`, `201,164,111`, `226,174,116`) occur **0 times**
in the stylesheet.

## 2. Seamless surface transitions

Two layers of work:

**Chapter joins.** All chapters now share the base ink `#05070A` and use
`isolation: isolate`; gradients terminate at that base rather than at an edge.
The hard `border-top` on film rows was replaced with a hairline that **dissolves
at both ends** (transparent → 6 % → transparent), so the join reads as light
falling off, not a rule.

**Portfolio ↔ archive.** New `src/utils/transition.ts` uses the browser View
Transitions API to morph between surfaces:

```ts
runSurfaceTransition(() => setShowPhotography(true));
```

- 320 ms matched crossfade on a 2 px blur, `cubic-bezier(.16,1,.3,1)`.
- Old and new roots are both forced to `#050709`, so there is **no white flash**
  and no slide — one surface settling into another.
- Degrades gracefully: if the API is absent, state updates immediately (no
  broken intermediate frame).
- Wired to all six surfaces: photography open/close and filmography open/close.
- `prefers-reduced-motion` disables it entirely.

## 3. Public preview URL

**https://etherealism-preview.deed.page/**

| | |
|---|---|
| Status | HTTP/2 200, HTTPS, publicly reachable, no auth |
| Size | 2,417,847 bytes (host badge included) |
| Identity | matches local build for 2,416,812 bytes; difference is the 1,020-byte deed.page badge |
| Title | Salim Bakhouch Portfolio Website |
| Contains | monochrome film tokens, chapter geometry, zero bloom elements |
| Local build | 2,416,827 bytes · sha256 `4dabade8ae2db77b561936552ea8a0329e6d2e7519d01f20e2e37b9f0a5764b4` |

The preview is a **separate slug** from the primary
`salim-bakhouch-etherealism.deed.page` site, because no update token exists in
this environment. The primary site is untouched. This is deliberate: previews
are published without altering the canonical deployment.

## 4. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | pass, single `dist/index.html` |
| Overflow | **0** at 1920, 1440, 1024, 768, 390, 360, 844×390 |
| Console errors | **0** |
| Bloom elements | **0** |
| Chapter geometry mounted | **8** |
| Sphere / ribbons / frames | 36 / 3 / 122 |
| Photography archive opens | yes |
| Film viewer opens | yes |
| View Transitions API | available and used |
| Manifests, previews, resolver, sound engine, portrait asset | checksums unchanged |

Contrast unchanged from the previous phase: display/body 11.41–11.42:1; the
pre-existing micro metadata remains 2.75–2.77:1 (owner-owned type token).

## 5. Files changed

| File | Change |
|---|---|
| `src/index.css` | Film colour ladders (env + deep + opposite), surgical accent application, seamless chapter joins, view-transition styles |
| `src/utils/transition.ts` | **New** — `runSurfaceTransition` with graceful fallback |
| `src/App.tsx` | Six surface opens/closes routed through the transition helper |

Not changed: any photograph or still, manifests, media resolver, sphere or ribbon
geometry/animation, sound engine, section order, single-file build.

Screenshots: `evidence/phase-04f/mono-films.jpg`, `mono-editorial.jpg`,
`screens/` (4 viewports × 5 chapters), `regress.json`.

## 6. Known limitations

- No update token was supplied, so the canonical site could not be updated in
  place; the preview is a new permanent slug.
- Micro-metadata contrast remains the pre-existing typography issue.
- Film micro-accents remain provisional pending owner review of the complements.

# CONTINUATION — paste this into a new chat/model

You are continuing **ETHEREALISM — Salim Bakhouch Portfolio**. Do not rebuild,
redesign or replace the identity. Read `HANDOFF.md` in full first, then
`README.md`, `docs/PROJECT-STATE.md`, `docs/ARCHITECTURE.md` and the latest
phase report.

## State

- Approved build: 2,428,266 bytes, sha `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c`, `tsc` clean.
- Review deployment: **https://etherealism-final.deed.page/** (byte-verified).
- Workspace is not a Git repository (resets between sessions); the build hash is
  the identity check. Verify `npm run build` reproduces that sha before editing.
- Photos: 81 / 16 albums / 10 collections / 36 sphere. Films: 3, 122 stills.
  203 baked previews.

## Approved and in force

Optical Aperture background (incomplete arcs + masked sapphire halo + one warm
intersection + two light planes + static grain inside the field at z-0); sections
translucent so the field reads through; original typography with the blue–white
split; filmography as one continuous field with captions, borders and the
rotated plane removed; frame hover/focus lighting with ice key and orange
counterlight on edges only; **no image filters**; contact-sheet stills album
separated from the still viewer; View Transitions between portfolio and
archives; single audio engine; sphere/ribbon engines untouched.

## Rejected — do not reintroduce

Phase 03 type scale / 12 px floor · Luminous Lichen yellow-green ·
oxide/ochre/amber background washes · global lighting overlay, cursor light,
centre bloom, vignette ring · lighting simulator/playground/sliders · cosmic
fields, particles, contour grids · bottom dock · visible interaction guides.

## Completed since the approved handoff

**Filmography residual vertical space.** Diagnosis (verified): each
`.film-section-row` still renders an empty `.chapter-geometry` wrapper, and the
broad rule `.film-section-row > * { position: relative; z-index: 1 }` overrides
its intended absolute positioning, so the empty wrapper reserves ~188 px of flow
height per row. Fix by removing that mount in `FilmSections.tsx` (it renders no
shapes for the filmography) or forcing it `position: absolute`, then re-measure
row heights. **No other spacing work is approved** — do not "improve" rhythm
without owner sign-off.

## Open items

Canonical URL still points at the superseded `…e0d2e5c9` site · footer contact
emails are placeholders · Delusion watch link points to the featured section ·
film accent tiers provisional · portrait delivery copy needs formal acceptance ·
no physical-device, screen-reader or audition testing done.

## Rules

Never modify masters or manifests. Preserve sphere and ribbon geometry and
animation. One audio engine, one background system. Keep the single-file build.
Verify with `npx tsc --noEmit`, `npm run build`, seven viewports (1920×1080,
1440×900, 1024×768, 768×1024, 390×844, 360×800, 844×390), contrast, reduced
motion and asset checksums. Do not deploy without explicit approval. Report
honestly, including what was not tested.

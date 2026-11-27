# CONTINUATION — MASTER TAKEOVER PROMPT FOR A NEW AI AGENT

You are taking over **ETHEREALISM — Salim Bakhouch Portfolio**. This is an existing owner-reviewed website. Your first job is to understand, verify and preserve the current project, not to rebuild or redesign it.

## 1. Mandatory first reads

From the authoritative project folder, read in full:

1. HANDOFF.md
2. README.md
3. docs/PROJECT-STATE.md
4. docs/ARCHITECTURE.md
5. docs/DEPLOYMENT.md
6. docs/QA-CHECKLIST.md
7. docs/CHANGELOG.md
8. The latest phase reports relevant to the task.

The project folder is:
`salim-bakhouch-portfolio- code _handoff Latest version/`

It is inside the public repository:
https://github.com/Yeedthedeed/PORTFOLIO-

The repository root is not the Vite application root. Do not use the older folder named `Salim Bakhouch Portfolio code documents previous version` as the active source.

## 2. Current website and source identity

Owner-designated current working/review URL:

**https://etherealism-final.deed.page/**

Open this exact URL in a real browser. Do not substitute an older preview slug if a text fetch or cache lookup fails.

The project’s approved review record identifies the deployed website as byte-matching the approved build except for the Deed hosting badge.

Approved build recorded by the project:
- dist/index.html
- 2,428,266 bytes
- SHA-256: 77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c

Repository main head inspected before the documentation refresh:
`447b4cda948a7ab3afe44f95705bb9ad5ec19b1e`

The SEO canonical, og:url and structured-data URL still point at the older e0d2e5c9 slug. This is a documented defect, not a request to repoint the canonical domain. Do not change it or deploy without explicit owner approval.

## 3. Current creative direction — approved and in force

ETHEREALISM’s approved identity is:

**ONE BLUE WORLD. SILVER/PEARL TYPOGRAPHY. ONE RESTRAINED ORANGE COUNTERLIGHT. THE PHOTOGRAPHS ARE THE SUBJECT.**

The established blue palette, pearl/silver type and restrained orange family are documented in README.md and HANDOFF.md.

The background already implements **OPTICAL APERTURE / BLUE HOUR: THE LIGHT SCORE**:
- off-axis incomplete concentric aperture geometry;
- a short masked sapphire highlight;
- two diagonal light planes;
- a secondary arc and axis;
- one small warm-orange intersection;
- a subtle mineral-blue pool;
- one static fine-grain texture inside the background.

The background has no canvas and no background RAF. Scroll choreography uses CSS scroll-driven animation, with a complete static fallback and reduced-motion support. The background is at z-index 0 and grain is below all content.

Do not add another set of circles, floating particles, starfields, contour grids, luminous bubbles, central radial blooms or a second background engine.

## 4. Filmography state — preserve it

The filmography contains three stacked films:
- Delusion of Negation — 29 stills.
- Zakia’s Clock — 50 stills.
- The Birth Permit — 43 stills.

The three films use the existing shared ribbon architecture. Total: 122 stills.

Per-frame captions and repeated labels were removed at source in FilmSpiral.buildFrame(). No caption or hold-note text nodes should be recreated. Film titles, credits, index, still count, format, year, logline and actions remain in the chapter header/content.

The filmography is a continuous blue field. Per-row blocks, borders, separators, overlays and the rotated SVG plane were removed. The filmography geometry preset intentionally renders no shapes. Filmography spacing was corrected; the prior empty-wrapper/dead-band task is completed. Do not reopen that issue without fresh evidence and owner approval.

Frame interaction lighting is edge/environment-only: cool ice key on the top/left, restrained orange counterlight on the right/bottom, a small active lift and smooth recovery. Keyboard focus gets equivalent treatment. **No CSS filter or image alteration is permitted on any still.**

## 5. Rejected directions — do not reintroduce

- Luminous Lichen / yellow-green interface accents.
- Yellow, gold, mustard, amber or antique-gold typography.
- Brown, purple, oxide, ochre or amber environmental washes.
- Per-film full-screen colour themes.
- Central luminous bubble, centre glow or uniform vignette ring.
- Cursor-following global lighting.
- Global lighting overlay or the rejected scene-anchored lighting rig.
- Lighting simulator, artificial sphere, slider controls or preset laboratory.
- Cosmic/constellation/starfield background, random particles or contour fields.
- Repeated frame captions below ribbon stills.
- Filmography rotated SVG plane, row backgrounds, separators or decorative blocks.
- Global grain overlay above photographs.
- Rejected Phase 03 enlarged type scale and 12 px typography floor.
- Replacement of the photography sphere or film ribbons with generic grids/carousels.

Historical phase prompts may contain proposals that were later rejected. Always follow the latest approved state in HANDOFF.md and docs/PROJECT-STATE.md.

## 6. Non-negotiable technical invariants

- Never crop, resize, recompress, recolour, filter, grade, retouch, regenerate or overwrite original master photographs, film stills or poster artwork.
- Do not change manifest schemas, URLs, image order, IDs or album relationships.
- Preserve the 36-image sphere and shared ribbon geometry, physics, motion and interactions.
- Preserve baked previews and the sole image resolver at src/utils/media.ts.
- Keep one audio engine in src/audio/SoundEngine.ts.
- Keep one background system.
- Keep one self-contained dist/index.html production output.
- Preserve keyboard access, focus restoration, Escape behaviour, scroll restoration, contrast and reduced-motion behaviour.
- Never commit hosting tokens or credentials.
- Do not deploy, create a new slug, change canonical metadata or repoint a domain without explicit owner approval.

## 7. Initial takeover procedure

Before making any change:

1. Open https://etherealism-final.deed.page/ in a real browser.
2. Inspect the page from hero through photography, all three films, featured project, archive, About and Contact.
3. Inspect mobile as well as desktop.
4. Verify GitHub main and work in the authoritative project folder.
5. Run npm install, npx tsc --noEmit and npm run build.
6. Confirm dist/ contains exactly index.html.
7. Record the build size and SHA-256.
8. Compare against the approved build identity above.
9. Inspect the current source for any differences from the project handoff before assuming a reported component or behaviour is still mounted.
10. Report what you actually inspected and what remains unverified.

If the build differs from the approved hash, diagnose dependency, source or environment differences before editing. Never “fix” the discrepancy by restoring an older folder.

## 8. Required viewport and QA matrix

Test:
- 1920 × 1080
- 1440 × 900
- 1024 × 768
- 768 × 1024
- 390 × 844
- 360 × 800
- 844 × 390

Verify:
- 0 horizontal overflow and no console errors.
- 36 sphere cards, 3 ribbons, 122 stills.
- 0 per-frame caption/hold-note text nodes.
- Original photographs/stills are not filtered.
- Optical Aperture is visible behind the intended translucent sections.
- Contrast remains WCAG AA on the sampled foreground/background pairs.
- Reduced-motion mode displays a complete static background.
- Archive/viewer opening, Escape, focus return and scroll restoration work.
- Manifests, baked previews, media resolver, masters and audio engine remain unchanged.

Physical iOS/Android/WebKit testing, full screen-reader review, CPU-throttled testing and audio audition are not recorded as complete. Do not claim they passed without performing them.

## 9. Open owner decisions — do not invent answers

- Canonical/SEO URL correction (requires owner approval and authorised deployment).
- Placeholder footer contact identity/socials.
- A direct Delusion screening link, if the owner supplies one.
- Final approval of film-specific accent tiers.
- Formal acceptance of the embedded portrait delivery copy.
- Physical-device, screen-reader, CPU-throttled and audio-audition QA.

Do not fabricate an email address, social account, screening link, credit, location, date or biographical fact.

## 10. How to proceed after takeover

Your first deliverable is a concise verification report: exact live URL inspected, source commit, build/type-check results, actual visual status, discrepancies and unverified tests.

Then wait for the owner's next requested priority. Do not invent a new redesign phase or continue experimenting with the background simply because earlier phase briefs exist.

For an authorised change, make the smallest coherent modification in the current architecture, show before/after evidence, run the full QA matrix and report precisely what changed and what was not tested.

**Preserve the approved website first. Improve only what the owner asks you to improve. Never deploy without explicit approval.**

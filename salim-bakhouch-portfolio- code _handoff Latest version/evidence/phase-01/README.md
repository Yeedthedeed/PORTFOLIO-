# Phase 01 evidence

Read-only baseline audit evidence for ETHEREALISM.

**Capture source:** all screenshots and measurements were taken from the
identical **local production build** served at `http://127.0.0.1:4173/`, not
from an interactive session against the public deed.page URL. The public URL was
verified separately by HTTP retrieval and byte comparison. No application code
was changed by the audit.

## Contents

- `screens/` — 80 PNG captures:
  - `{viewport}__hero|photography|filmography|featured|about|contact.png`
  - interaction captures (sphere viewer, archives, lightboxes, stills album,
    viewfinder, focus states, mobile archive, reduced motion, landscape)
  - `sheet-desktop-a.jpg`, `sheet-desktop-b.jpg`, `sheet-responsive.jpg`,
    `sheet-mobile-details.jpg` labelled contact sheets
- `SUMMARY.json` — condensed viewport/interaction/perf/accessibility results.
- `data/` — 9 JSON logs and the 18 Playwright capture scripts used.

## Viewports

1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×800, plus 844×390
landscape.

## Status

No implementation files were changed. Source checksums after the audit match
the `HANDOFF.md` §12 fingerprints. Full findings and the defect register are in
`../../PHASE-01-BASELINE-AUDIT.md`.

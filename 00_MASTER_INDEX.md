# Portfolio Archive — Editorial Index

**Owner:** Salim Bakhouch  
**Purpose:** Canonical source archive for the Framer portfolio and future editorial / development work.

This repository is the source of truth for the current portfolio imagery. The original image files are preserved; editorial titles in the companion documents are display titles, not destructive file renames.

## Editorial documents

- [Editorial direction](Editorial%20Notes/01_EDITORIAL_DIRECTION.md) — the portfolio's overall tone, two visual registers, and Framer presentation principles.
- [Youthful Exuberance](Editorial%20Notes/02_YOUTHFUL_EXUBERANCE.md) — the dedicated creative statement and sequence for the nine-scene photography series.
- [Album and image title map](Editorial%20Notes/03_ALBUM_AND_IMAGE_TITLE_MAP.md) — proposed album, subfolder, and individual image display titles mapped to the canonical filenames.
- [Standalone images](Editorial%20Notes/04_STANDALONE_IMAGES.md) — independent photographs that must remain visible as individual works.
- [Film stills and posters](Editorial%20Notes/05_FILM_STILLS_AND_POSTERS.md) — refined film-project titles, all 45 film stills, and poster export handling.

## Asset archive

- `Film Stills/` — stills from *Delusion of Negation* and *Zakia's Clock*.
- `Films Posters/` — poster artwork and available export formats.
- `Phtotgraphy sphere assets/` — photography albums, subfolders, and independent photographs.

> The legacy directory spelling `Phtotgraphy sphere assets` is intentionally preserved in this pass so existing paths do not break. A future cleanup can rename it after Framer references have been checked.

## Asset handling rules

1. Preserve original image bytes and the current source filenames until visual review and Framer-link verification are complete.
2. Use the editorial titles in the title map for on-page headings, captions, CMS names, and accessible gallery labels.
3. Keep original film-still filenames where their sequence identifiers are useful for production traceability.
4. Never omit a source image merely because it does not belong to a named album. Standalone works have their own presentation.
5. Do not invent factual alt text from filenames. Write descriptive alt text only after the image itself has been inspected.

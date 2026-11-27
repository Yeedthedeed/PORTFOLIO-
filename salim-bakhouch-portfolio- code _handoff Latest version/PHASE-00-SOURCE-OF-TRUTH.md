# PHASE 00 — SOURCE-OF-TRUTH LOCK

**Completed:** read-only audit. No implementation file was edited, renamed,
cleaned up or rebuilt by this phase.
**Re-verified at Phase 01 close-out:** live URL and build identity.

---

## 1. Authoritative repository path and commit

| Item | Value |
|---|---|
| Repository of record | `https://github.com/Yeedthedeed/PORTFOLIO-` |
| Default branch | `main` |
| Head at audit | **`9940d1fa3fc1`** — “do” — 2026-11-26T14:25:19Z |
| Previous commit | `dbddea4bebb3` (the older handoff reference) |
| Branches | `main` `9940d1fa`; `Yeedthedeed-patch-1` `91c5c48a`; `curation/36-image-sphere-bible` `9bb86610`; `editorial/portfolio-photography-refinement` `57c28992` |
| Open PRs | #3 curation (16 ahead / 12 behind, 8 files, curation notes only); #1 “Create Nibghthawks” (2 ahead / 57 behind, two image files) |
| Latest main commit | Removed `Landing page profile pictuer - Copy/1.jpg` and `2 .png`; no code change |
| Project folder | `Salim Bakhouch Portfolio code documents latets version/` |
| Runnable root | that folder (primary `src/`) |
| Workspace Git | **not a Git repository** during Phases 00–01. A first checkpoint at close-out was lost to a workspace reset; the baseline was reconstructed and frozen at close-out (see HANDOFF §11) |

**Workspace delta vs repository `main`:** 70 files vs 67 in `src/`.
Added: `src/assets/portraitInline.ts`, `src/hooks/useLightboxBridge.ts`,
`src/lib/lightbox.tsx`.
Modified: `App.tsx`, `audio/SoundEngine.ts`,
`components/{About,AudioToggle,Background,FilmDetail,Footer,HeroText,MediaImage,Portrait}.tsx`,
`index.css`, `main.tsx`, `utils/media.ts`.
The repository cannot reproduce the live build. The workspace is the
deployment-line source.

**Full-project duplication:** primary folder 97 files; `portfolio-current/`
96. The only file present in primary but not the snapshot is **`MANIFEST.md`**.
No symlinks observed. `dist/` is generated and absent from the repository.

---

## 2. Active stylesheet and proof

| Copy | Bytes | Git blob | SHA-256 |
|---|---:|---|---|
| **Primary `src/index.css`** | **116,646** | `35d3fb98…` | `8f345c34…` |
| Snapshot `portfolio-current/src/index.css` | 114,807 | `473b59e8…` | `ce58faf3…` |
| Workspace deployment-line `src/index.css` | 117,031 | uncommitted | `322bc6c8…` |

Primary vs snapshot: 67 source files each, 66 identical, only `index.css`
differs (80 diff lines). The primary contains the later stills-showcase
caption/open-cue rules and `overflow: visible`; the snapshot lacks
`.stills-showcase-open`. Both last changed in the same commit, so history does
not separate them — content and live fingerprints do. The live document carries
the primary-lineage rules.

**Decision: primary stylesheet lineage is canonical. `portfolio-current/` is
stale and must not overwrite primary.** The exact live stylesheet is the
workspace 117,031 B version, not the repository primary.

---

## 3. Deployment contract and proof

- Build: `npm run build` → **`dist/index.html` only** via
  `vite-plugin-singlefile`.
- CI: type-check, build, single-file assertion, baked-preview check
  (`>= 169`, stale; actual 203). **CI does not deploy.**
- Static hosts: `netlify.toml` and `vercel.json` both publish `dist`.
- Actual publisher: `scripts/deploy.sh` → deed.page
  `PUT https://deed.page/v1/sites?slug=…`, one HTML file.
- Update token is issued once, stored outside the repo at
  `~/.config/deed-page/token`.
- **The token is not present in this environment.** The current site cannot be
  updated in place from here. A token-less run may create a new URL.

**Public URL:** `https://salim-bakhouch-etherealism.deed.page/` — HTTPS,
HTTP/2 200, 2,398,993 bytes including host badge. It predates Phase 00 and was
**not republished** during Phases 00/01. Verified at close-out to contain the
local audited build for its first 2,397,951 bytes; the only difference is the
1,027-byte `data-deed-badge` host injection. The owner has confirmed that the
platform “Deployed the project” status was a **preview**, not a production
publish; no separate preview URL is recorded.

**Older site:** `https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/` is live
but serves an older 1,955,112-byte build. It is not the current reference.

**Known canonical defect:** the current live page’s
`<link rel="canonical">` / `og:url` still point to the older
`…e0d2e5c9.deed.page`. This must be corrected in an approved phase and
republished with a token.

---

## 4. Live URL status and retrieval limitation

- Retrieval: HTTP 200, HTML fetched successfully. The site is online.
- No browser binary was installed during the read-only phase; HTML/HTTP
  verification only at that moment. Phase 01 later installed Chromium and
  rendered the identical local production build at six viewports.
- No authentication is required to view the site.
- Do not replace the current URL with an older URL.

---

## 5. Contradictory or stale documentation found

| Location | Stale claim | Verified state |
|---|---|---|
| Root `README.md`, `HANDOFF.md`, `docs/DEPLOYMENT.md` | Live = `…portfolio-e0d2e5c9` | Older build; current is `…salim-bakhouch-etherealism` |
| `docs/DEPLOYMENT.md` | Simultaneously “published/verified” and “not republished / serves an older build” | Both statements describe different URLs; contradictory within one document |
| Docs / CI | 169 previews | 203 |
| `docs/PROJECT-STATE.md` | “not yet publicly published” | Public URL exists and predates Phase 00; platform “Deployed” status was a preview, not a production publish |
| `docs/DATA.md` | `FILM_STILLS` = 45 | 79 (29 + 50); 122 with Birth Permit |
| Root README | “79 film stills across three films” | 79 covers only two films; total 122 |
| `docs/MEDIA.md` | “originals only”, no portrait derivative | Live hero uses embedded 1312×1199 WebP delivery copy |
| `docs/DEVICES.md` | “Ilian Voss” nameplate | Owner identity is Salim Bakhouch |
| Repo `src/utils/media.ts`, `index.html` | portrait `3 .png` | File absent from `main`; only `the main portfolio picture.png` exists → clean repo build has a broken portrait |
| Repo `index.html` | canonical/og:url = legacy Arena URL | Stale |
| Repo `App.tsx` | mounts `CustomCursor` + `LightingLayer` | Both unmounted; owner-requested removal |
| `portfolio-current/` | “complete copy of the whole project” | Missing `MANIFEST.md`; stale CSS |
| Footer | `ilianvoss.com` emails, generic socials | Placeholder identity; owner input required |

Repository README/HANDOFF do not mention the current live URL at all.

---

## 6. Critical modules and data files

Shell: `src/main.tsx`, `src/App.tsx`, `index.html`, `src/index.css`.
Spatial/photography: `Background.tsx`, `ScrollSphere.tsx`,
`PhotographyGallery.tsx`, `AlbumOriginal.tsx`, `DevelopReveal.tsx`.
Film: `FilmSphere.tsx`, `FilmSections.tsx`, `FilmSpiral.tsx`,
`FilmRibbonPair.tsx`, `FilmographyGallery.tsx`, `FilmStillsShowcase.tsx`,
`FilmDetail.tsx`.
Hero/navigation: `Nav.tsx`, `HeroText.tsx`, `MetaCard.tsx`, `Portrait.tsx`,
`Viewfinder.tsx`, `MediaImage.tsx`, `Loader.tsx`, `MobileDock.tsx`,
`ChapterRail.tsx`.
Close: `FeaturedProject.tsx`, `ArchiveLinks.tsx`, `About.tsx`, `Footer.tsx`.
Viewer: `src/lib/lightbox.tsx`, `src/hooks/useLightboxBridge.ts`.
Audio: `src/audio/SoundEngine.ts`, `AudioToggle.tsx`, `useSoundEvents.ts`.
Media: `src/utils/media.ts`, `src/assets/portraitInline.ts`, preview modules.
Data: `photographyManifest.ts`, `filmStills.ts`, `birthPermit.ts`,
`birthPermitRibbon.ts`.

Verified inventory: **81** photographs, **81** unique source URLs, **16**
albums, **10** collections, **36** sphere entries, **4** nested albums,
**79 + 43 = 122** film stills, **203** baked previews, **3** films.
Master media at `main`: 206 files / ≈1,334.5 MB (81 photography, 122 film
stills, 2 posters, 1 portrait).

---

## 7. Safe branch / checkpoint plan

1. Create a local Git repository with the audited workspace as the baseline
   (reconstructed at Phase 01 close-out after a reset destroyed the first
   checkpoint: branch/lightweight tag `phase-01-audited-baseline`).
2. Exclude `node_modules/`, `dist/`, preview screenshots not intended for
   evidence, and all secrets. Include the audit evidence.
3. Never push or force-push without authorisation. The outer repository holds
   original masters and its own history.
4. Create implementation branches from the checkpoint, reconcile with
   repository `main` separately, and open a normal PR when authorised.
5. Keep `~/.config/deed-page/token` outside Git.

---

## 8. Risks that must be resolved before implementation

1. **Unversioned workspace delta** — recover and checkpoint before editing.
2. **Missing deployment token** — current URL cannot be updated in place.
3. **Canonical URL mismatch** — live canonical points to the old site.
4. **Portrait delivery derivative** — embedded WebP must be formally accepted
   under the media-integrity rule, or replaced with another delivery strategy.
5. **Broken repo portrait path** — a clean repo build references a deleted file.
6. **Stylesheet ambiguity** — do not use `portfolio-current/`.
7. **Placeholder identity/contact data** — owner input needed.
8. **Stale docs/CI** — preview count and stills count are wrong.
9. **Open curation/editorial branches** — unreviewed content, do not merge.
10. **No live-browser verification at Phase 00** — Phase 01 closed this gap for
    the identical local build; live interactive verification still depends on
    the published artifact.

---

## SOURCE-OF-TRUTH DECISION

- **Repository of record:** `Yeedthedeed/PORTFOLIO-`, `main` @ `9940d1fa3fc1`.
- **Canonical runnable base:** nested folder primary `src/`, **not**
  `portfolio-current/`.
- **Deployment-line implementation:** workspace primary lineage (13 modified +
  3 added files).
- **Stylesheet:** workspace primary-lineage CSS; snapshot rejected as stale.
- **Current public reference:** `https://salim-bakhouch-etherealism.deed.page/`;
  the older `…e0d2e5c9` site is historical.
- **Status:** Phase 00 complete. Phase 01 completed with a baseline audit and
  P0/P1 register. Phase 02 remains blocked pending owner scope approval and the
  open decisions above.

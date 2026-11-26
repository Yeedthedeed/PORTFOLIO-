# Salim Bakhouch Portfolio Website

An immersive, cinematic portfolio for **Salim Bakhouch** — cinematographer, director of
photography and director. Built with React 19, Vite 7, TypeScript, Framer Motion, Lenis and
hand-written CSS, it presents three short films, their stills, and an 81-photograph archive as
one continuous spatial experience.

**Live:** https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ — published over HTTPS, verified logged-out.

> **New here?** Read [HANDOFF.md](HANDOFF.md) first — it is the master brief, current status,
> invariants and QA checklist. This README is the map; the handoff is the contract.

---

## Current state

| | |
| --- | --- |
| Version | 1.0.0 |
| Status | Feature-complete, production build passing |
| Public deployment | **Live:** https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ (verified) |
| Legacy URL | `https://01a1a690-8b5f-7f62-a465-2ba7b2bc36fb.arena.site/` still serves a **previous** build |
| Build artefact | `dist/index.html` — one self-contained file, ≈1.94 MB (≈1.11 MB gzipped) |
| Media | 203 baked gallery previews inlined; masters served byte-for-byte from GitHub CDN |
| Type gate | `npx tsc --noEmit` clean |
| Node | 20+ · no env vars, keys or secrets |

---

## What the site contains

1. **Arrival** — full-height transparent portrait with cursor parallax, a sapphire halo, a
   cinema **viewfinder** HUD on the face region, a project slate and editorial captions.
2. **Photography** — a 36-frame 3D sphere. Drag, swipe, cursor-steer or keyboard; opening a
   photo runs a ring animation and reveals the full album curation (title, subtitle, intro,
   image note, album filmstrip, source link).
3. **Filmography** — three vertically stacked, centre-aligned film ribbons, each with its own
   logline, credit, stills album and watch link:
   - *Delusion of Negation* — Director & Screenwriter (29 stills)
   - *Zakia's Clock* — Director of Photography & Colorist (50 stills) · Google Drive screening
   - *The Birth Permit* — First Assistant Director (43 stills) · Vimeo link
4. **Featured project** — the real *Delusion of Negation* poster, credits and full-resolution link.
5. **Archives** — large entry links to a 16-album photography browser and a film archive overlay.
6. **Profile & contact** — biography, still tools list, contact addresses and socials.
7. **Throughout** — global cinematic sound, chapter rail with reading progress, darkroom develop
   reveals, depth-led frame lighting, photographic hover sheen, phone dock and a dedicated tablet
   composition.

---

## Quick start

```bash
npm install
npm run dev          # local development
npx tsc --noEmit     # type gate
npm run build        # production build → dist/index.html
npm run preview      # preview the production build
```

Deploy: upload `dist/` to Netlify, Vercel, Cloudflare Pages or any static host. No server or
image storage is required. Full instructions: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## The one rule that must never be broken

> **Master photographs are never edited.**

Originals live in the GitHub repository and are served byte-for-byte. Nothing in this codebase
crops, resizes, re-exports, re-compresses, re-colours or filters a master. Small WebP previews
exist only so the galleries paint instantly; they are display derivatives, baked into
`src/data/previewAssets.ts` and `src/data/birthPermitPreviews.ts`. Every full-screen viewer
loads the original. Details: [docs/MEDIA.md](docs/MEDIA.md).

---

## Project structure

```text
.
├── README.md                  ← this file
├── HANDOFF.md                 ← master handoff: status, invariants, QA, publishing
├── CONTRIBUTING.md            working agreements + pre-PR checks
├── MANIFEST.md                generated inventory of every file
├── .github/workflows/ci.yml   type-check, build, artefact verification
├── index.html                 entry document, metadata, device bootstrap
├── netlify.toml / vercel.json  static-host configuration
├── docs/                      architecture, data, media, performance, devices, a11y, runbook
├── scripts/                   preview generation + baking
├── portfolio-current/         self-contained snapshot of the whole project
└── src/
    ├── App.tsx                composition, overlays, page shell
    ├── index.css              tokens, layout systems, device compositions, new interface layer
    ├── audio/SoundEngine.ts   single audio engine (ambient, SFX, volume, mute)
    ├── components/            galleries, ribbons, viewers, chrome  (see components/README.md)
    ├── data/                  canonical curation + baked previews (see data/README.md)
    ├── hooks/                 mouse, Lenis, sound events, device layout
    ├── lighting/              procedural three-point lighting engine
    ├── utils/media.ts         the only image-URL resolver
    └── main.tsx               React entry
```

---

## Documentation

| Document | Contents |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | **Master brief**: state, invariants, file map, publishing, QA |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Working agreements, change map, pre-PR checklist |
| [MANIFEST.md](MANIFEST.md) | Generated inventory of every file in the snapshot |
| [docs/REPOSITORY.md](docs/REPOSITORY.md) | Remote, branches, CI, release tagging, what not to commit |
| [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md) | Definitive snapshot: mounted files, content counts, build facts |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Component tree, engines, media resolution, z-index contract |
| [docs/DATA.md](docs/DATA.md) | Manifest schemas, film data, preview accessors, invariants |
| [docs/MEDIA.md](docs/MEDIA.md) | Master vs preview policy, CDN strategy, regeneration, MIME repair |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | RAF discipline, loading order, budgets, regressions |
| [docs/DEVICES.md](docs/DEVICES.md) | Phone / tablet / desktop compositions and detection |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Keyboard model, dialogs, ARIA, reduced motion |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Publishing, post-deploy verification, limitations |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Common tasks, troubleshooting, pre-ship checklist |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Decision log and iteration history |
| [src/components/README.md](src/components/README.md) | Every component's contract |
| [src/data/README.md](src/data/README.md) | Every data module's contract |
| [scripts/README.md](scripts/README.md) | Preview generation and baking |
| [docs/README.md](docs/README.md) | Documentation index |

---

## Content data at a glance

- **81 photographs**, **16 albums**, **10 collections** (`photographyManifest.ts`).
- **36** curated for the sphere (`SPHERE_SELECTION`, ordered by `sphere_slot`).
- **79 film stills** across three films (`filmStills.ts`): 29 Delusion, 50 Zakia.
- **43** additional stills for *The Birth Permit* (`birthPermit.ts`).
- **203 baked previews** inlined into the build.
- Masters remain in the repository's original formats (JPG/PNG), untouched.

---

## Working agreements

1. Do not edit master images. Do not change manifest schemas.
2. Gallery previews are baked TypeScript, not runtime files — regenerate with the scripts.
3. One audio engine (`src/audio/SoundEngine.ts`); one RAF loop per spatial surface.
4. Gallery transform order is `translate3d → translate(-50%,-50%) → scale`.
5. The full film viewer must use `resolveOriginalUrl` (handles >20 MB files and MIME repair).
6. Production output stays a single `dist/index.html`; verify with `ls dist`.
7. After any change: `npx tsc --noEmit && npm run build`.

---

## Deployment & repository

- **Deploy:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- **Repository of record:** <https://github.com/Yeedthedeed/PORTFOLIO->
- This snapshot is a fresh git repository (one commit) with **no remote configured** and no
  credentials present. Push instructions are in [HANDOFF.md §8](HANDOFF.md).
- **Snapshot for the next host/AI:** [`portfolio-current/`](portfolio-current) — complete,
  independently buildable copy (verified inside the folder with `npx tsc --noEmit` +
  `npm run build`).
- **CI:** `.github/workflows/ci.yml` type-checks, builds, verifies the single-file artefact and
  uploads `dist/` as an artefact. See [docs/REPOSITORY.md](docs/REPOSITORY.md).

---

## Project history

The project was originally generated in Arena and refined through successive passes: sphere
gallery, film ribbons, album curation, aspect-ratio integrity, image-quality restoration,
persistent previews, three-film restructuring, Zakia's Clock still refresh, ribbon refinement,
and the immersive interaction/audio pass. The full decision log lives in
[docs/CHANGELOG.md](docs/CHANGELOG.md).

---

© Salim Bakhouch. Photography and direction by the portfolio owner. Poster by Rayen Bakhouch.

---

## Deployment state (updated)

| Item | Status |
| --- | --- |
| Production build | `dist/index.html`, single file, served live at the URL above |
| Baked gallery previews | 203 inlined |
| Local git | one commit, 192 tracked files, clean tree, **no remote configured** |
| Snapshot | `portfolio-current/` (96 files) — builds independently |
| Live URL | https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ — verified live |
| Action required | none for publication; push the commit for source control (HANDOFF §8) |

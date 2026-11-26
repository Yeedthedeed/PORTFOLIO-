# HANDOFF — Salim Bakhouch Portfolio Website

**Version:** 1.0.0 · **State:** feature-complete, production-ready, **not yet pushed**
**Owner:** Salim Bakhouch · **Contact:** studio@salimbakhouch.com
**Repository of record:** <https://github.com/Yeedthedeed/PORTFOLIO->
**Live deployment:** https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ — this exact build, published over HTTPS and verified logged-out.
**Legacy URL:** `https://01a1a690-8b5f-7f62-a465-2ba7b2bc36fb.arena.site/` still serves an older Arena build.

> This document is the master brief. If you read only one file, read this one, then
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/MEDIA.md](docs/MEDIA.md).

---

## 1. Executive summary

An immersive, cinematic photography and film portfolio built with **React 19, Vite 7,
TypeScript, Framer Motion, Lenis and hand-written CSS**. It presents:

- an editorial hero with a transparent portrait and a cinema **viewfinder** interaction;
- a **3D photography sphere** of 36 curated photographs, opening into an album viewer;
- **three independent film-still ribbons** — *Delusion of Negation* (29 stills),
  *Zakia's Clock* (50 stills), *The Birth Permit* (43 stills) — each with logline, credits,
  GitHub stills album and a watch/screening link;
- a featured-project block with the real *Delusion of Negation* poster;
- large archive entry links, a profile section and contact footer;
- a global cinematic soundscape with persisted mute and volume.

The build is **one self-contained `index.html`** (≈1.94 MB, ≈1.11 MB gzipped) containing the
app, styles and 203 baked gallery previews. Masters load from the public GitHub CDN at runtime.

---

## 2. What is done (confirmed)

| Area | State |
| --- | --- |
| Hero + portrait + viewfinder | Complete, desktop/tablet/phone |
| Photography sphere (36) | Complete; previews, album viewer, keyboard, ring-open animation |
| Photography archive | Complete; 16 albums, album rail, contact sheet, lightbox, curation text |
| Filmography (3 ribbons) | Complete; shared engine, still-count spacing, hold-to-discover |
| Film archive overlay | Complete; split-pair layout |
| Featured project poster | Complete; real artwork, full-resolution link |
| Film watch links | Vimeo (Birth Permit), Google Drive screening (Zakia's Clock) |
| Sound design | Ambient on by default, gesture unlock, persisted mute, volume, section colouring |
| Device layouts | Desktop, tablet (own composition), phone (own composition + dock) |
| Chapters / progress | Desktop `ChapterRail`, phone/tablet dock hairline |
| Develop reveal | CSS darkroom reveal on editorial type |
| Documentation | README + HANDOFF + CONTRIBUTING + MANIFEST + 12 docs + 3 folder READMEs |
| Accessibility | Keyboard model, focus trapping, ARIA, reduced motion |
| Build | `npx tsc --noEmit` clean, `npm run build` clean |

---

## 3. What is NOT done / requires the next owner

1. **Publishing updates.** The site is live; re-publish with `./scripts/deploy.sh`. The update
   token lives outside the repo (`~/.config/deed-page/token`). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
2. **Pushing to GitHub.** This snapshot is a fresh, push-ready git repository (one commit).
   Run the push commands in section 8 from a machine with repository write access.
3. **Signed-off visual/audio QA on real devices.** No browser engine was available during
   development; validation was via TypeScript, production builds, geometry simulation and
   HTTP smoke tests. Perform the checklist in section 9 before announcing.
4. **Delusion of Negation direct watch link.** Currently anchors to the on-site featured
   project. If a Vimeo/screener URL exists, replace `watch.href` in
   `src/components/FilmSections.tsx`.
5. **Optional cleanup of 19 unmounted legacy components.** They are preserved deliberately;
   see section 6.

---

## 4. Non-negotiable invariants

1. **Never modify the master photographs.** All originals live in the GitHub repository and are
   served byte-for-byte. No crop, resize, re-export, re-compression, colour grade or filter.
2. **Gallery previews are baked, not fetched.** `src/data/previewAssets.ts` and
   `src/data/birthPermitPreviews.ts` hold Base64 WebP display derivatives. Binary asset folders
   do **not** survive every environment, which previously broke the galleries — do not
   reintroduce a runtime dependency on `src/assets/previews/**`.
3. **Do not change the manifest schemas** in `photographyManifest.ts` or `filmStills.ts`.
4. **One audio engine.** Extend `src/audio/SoundEngine.ts`; never add a second audio system.
5. **One RAF loop per spatial surface.** Sphere: one. Each ribbon: one. Background: one.
6. **Ribbon shape is canonical.** All three films share height 720 / radius 240 / depth 165 and
   a winding cap of `MAX_TURNS = 4.35` (The Birth Permit's shape). Do not reintroduce per-film
   geometry flags; a longer film inherits the same shape with its frames slightly closer.
7. **Transform order** on gallery cards is
   `translate3d(...) translate(-50%,-50%) scale(...)` — scale after the percentage translate,
   otherwise cards drift by half their size.
8. **Film viewer must use the resolver**, not a raw master `<img>`, because some repository
   files exceed jsDelivr's 20 MB limit and are served with a non-image MIME type.
9. **The production artefact stays a single HTML file.** Verify with `ls dist`.

---

## 5. Architecture at a glance

```
App
├── MouseProvider · Background · Loader
├── Nav · main(#work #photography #filmography #featured-project #about #contact)
├── MobileDock · ChapterRail
├── LightingLayer · bloom · scanlines · vignette · grain · CustomCursor
├── PhotographyGallery (overlay, portal)
└── FilmographyGallery (overlay)
```

Key modules:

| File | Role |
| --- | --- |
| `src/components/ScrollSphere.tsx` | 36-frame sphere engine + album viewer |
| `src/components/FilmSpiral.tsx` | The ribbon engine (used by all three films) |
| `src/components/FilmSections.tsx` | Landing filmography: 3 stacked films + loglines + links |
| `src/components/PhotographyGallery.tsx` | Album browser + lightbox |
| `src/components/AlbumOriginal.tsx` | Master-image loader: viewport-gated, 4 concurrent, multi-host, blob repair |
| `src/utils/media.ts` | The only place image URLs are resolved |
| `src/audio/SoundEngine.ts` | Single audio engine (ambient, SFX, volume, mute) |
| `src/hooks/useDeviceLayout.ts` | Phone / tablet / desktop classification |
| `src/data/*.ts` | Canonical curation, preview baking |

Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 6. File map — mounted vs. unmounted

**Mounted (45 files).** Exact list: `/docs/PROJECT-STATE.md`.

**Unmounted but preserved (`src/components/`)** — not imported by `App`; kept for reference,
not rendered, not in the bundle:

`Arrival`, `AtmosphereCanvas`, `Cursor`, `Endcard`, `ForegroundLayer`, `Index`, `Presence`,
`Sequence`, `SoundToggle`, `Statement`, `Works`, `layers/*`.
Also unused: `src/motion.ts`, `src/utils/cn.ts`.

If you delete them, run `npx tsc --noEmit` and `npm run build` afterwards. Leaving them is safe.
`smoke-test`: nothing in the mounted graph imports them.

---

## 7. Local setup

```bash
npm install
npm run dev        # http://localhost:5173
npx tsc --noEmit   # type gate — must be clean
npm run build      # → dist/index.html (single file)
npm run preview    # serve the production build
```

Node 20+. No environment variables, API keys or secrets are required or present.

---

## 8. Publishing

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Netlify Drop, Vercel, Cloudflare/Pages and
Arena instructions plus the post-deploy checklist. Shortest path:

```bash
npm run build
# drag dist/ onto https://app.netlify.com/drop  → public HTTPS URL
```

### Pushing this snapshot to GitHub

This folder is a **fresh git repository with one commit** and no remote. From a machine with
write access:

```bash
git remote add origin https://github.com/Yeedthedeed/PORTFOLIO-.git
git branch -M main
git push --force-with-lease origin main
```

> `--force-with-lease` is required only if you intend to replace the remote history; otherwise
> create a new branch (`git push origin main:portfolio-current`) and open a PR. The remote
> currently also contains master image folders and earlier commits that this snapshot does not
> include — review before force-pushing.

---

## 9. Pre-announcement QA checklist

Run against the **deployed URL in a private window**:

- [ ] Intro completes; portfolio visible; no console errors.
- [ ] Hero portrait loads; viewfinder reveals on face hover/focus.
- [ ] Sphere rotates by drag, swipe, wheel-less cursor, arrow keys; a photo opens.
- [ ] Sphere viewer shows album title + subtitle + intro + caption; prev/next works; Esc closes.
- [ ] Photography archive: album switching, 2/3-column grid, lightbox, full-resolution view.
- [ ] Landing filmography: "Open stills album →" opens the in-site showcase for that film.
- [ ] Filmography archive: two split ribbons, then scroll down to the centred Birth Permit ribbon;
      each panel's "Stills album" opens the showcase.
- [ ] Sphere: click a photo, then pick another from the viewer filmstrip — the previous image must
      never linger while the next loads.
- [ ] All three ribbons render with even spacing at 1440, 1024, 768 and 390 px.
- [ ] Film archive scrolls on desktop **and** tablet; the Birth Permit ribbon is reachable.
- [ ] Clicking a ribbon still (without dragging) opens the viewer; dragging only rotates.
- [ ] Hold a still → note appears, viewer does **not** open; `I` does the same by keyboard.
- [ ] Frames nearest the viewer catch a warmer rim/deeper shadow as the ribbon rotates.
- [ ] The intro can be skipped instantly by clicking or pressing any key.
- [ ] Album titles develop, and changing album emits one transition tone.
- [ ] Delusion logline, Zakia's logline + Drive link, Birth Permit logline + Vimeo link.
- [ ] Audio: begins after first gesture; mute persists across reload and navigation; volume works.
- [ ] Phone opens directly in the phone composition; tablet shows the floating dock.
- [ ] No failed image requests; no broken `/assets` paths.
- [ ] Keyboard-only pass through header, rails, galleries and viewers.
- [ ] `prefers-reduced-motion` renders all content instantly.

---

## 10. Known limitations

1. **Master images are huge** (3–25 MB). First open of a full-resolution viewer can take
   seconds; this is inherent to keeping originals untouched. Galleries use baked previews.
2. **Some repository files exceed 20 MB** (e.g. several Zakia's Clock stills, Yan/Willy photos).
   jsDelivr rejects them; the resolver falls through to GitHub raw and repairs the MIME type
   with a Blob. This is why the viewer never binds a master URL directly.
3. **Binary asset folders are volatile** in some AI/CI sandboxes. Previews are therefore baked
   into TypeScript — treat `previewAssets.ts` as source, not build output.
4. **No automated visual regression** exists; add Playwright screenshots if the project grows.
5. **The old Arena deployment is stale.** Do not mistake it for this codebase.

---

## 11. Where to change what

| Task | File |
| --- | --- |
| Add/replace a photograph or album | `src/data/photographyManifest.ts` (schema unchanged) |
| Add/replace a film still | `src/data/filmStills.ts` |
| The Birth Permit content | `src/data/birthPermit.ts` |
| Watch / screening links, credits, loglines | `src/components/FilmSections.tsx` |
| Ribbon geometry, motion, hold interaction | `src/components/FilmSpiral.tsx` |
| Sphere behaviour | `src/components/ScrollSphere.tsx` |
| Site metadata, title, fonts | `index.html` |
| Sound design, ambient, volume | `src/audio/SoundEngine.ts` |
| Device layouts / breakpoints | `src/index.css`, `src/hooks/useDeviceLayout.ts` |
| Documentation | `README.md`, `HANDOFF.md`, `docs/` |

---

## 12. Snapshot folder

`portfolio-current/` contains a complete, independently runnable copy of this project at the
same commit (source, configs, docs, scripts, generated preview modules — no `node_modules`,
no `dist`). It was verified by symlinking dependencies and running the full type-check and
production build inside the folder.

- `portfolio-current/MANIFEST.md` lists every file and size.
- The repository root also carries `MANIFEST.md`, `CONTRIBUTING.md` and
  `.github/workflows/ci.yml`.
- Regeneration and verification commands are in [docs/REPOSITORY.md](docs/REPOSITORY.md).

Verify equality:

```bash
diff -r --exclude=node_modules --exclude=dist --exclude=.git . portfolio-current
```

---

## Deployment state (updated)

| Item | Status |
| --- | --- |
| Production build | `dist/index.html`, single file, verified served locally (HTTP 200) |
| Baked gallery previews | 203 inlined |
| Local git | one commit, 192 tracked files, clean tree, **no remote configured** |
| Snapshot | `portfolio-current/` (96 files) — builds independently |
| Live URL | https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ — verified, permanent |
| Action required | push the commit for source control (HANDOFF §8); publication is done |

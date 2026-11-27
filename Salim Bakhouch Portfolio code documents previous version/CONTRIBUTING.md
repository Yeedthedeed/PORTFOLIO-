# Contributing / working agreements

**Project:** Salim Bakhouch Portfolio Website · **Owner:** Salim Bakhouch

This project is a finished, client-owned portfolio. Before changing anything, read
[HANDOFF.md](HANDOFF.md) and [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md).

## The five unbreakables

1. **Never modify a master image.** No crop, resize, re-export, re-compression, grade or filter.
   Display derivatives live only in baked preview modules (see [docs/MEDIA.md](docs/MEDIA.md)).
2. **Do not change the manifest schemas** in `src/data/photographyManifest.ts` or
   `src/data/filmStills.ts`.
3. **One audio engine** — extend `src/audio/SoundEngine.ts`; never add a second audio system.
4. **One RAF loop per spatial surface** — sphere, each ribbon, background.
5. **Production output is a single file.** `dist/` must contain only `index.html`.

## Before you open a pull request

```bash
npx tsc --noEmit
npm run build
ls dist          # index.html only
```

Then confirm:

- [ ] Gallery cards still use baked previews (`photoThumb` / `filmThumb`), not masters.
- [ ] Full-screen viewers still load masters (`photoSrc` / `filmSrc` + `resolveOriginalUrl`).
- [ ] Ribbon transform order is `translate3d → translate(-50%,-50%) → scale`.
- [ ] Keyboard, focus, Escape and reduced-motion behaviour still work.
- [ ] Phone, tablet and desktop layouts still pass [docs/DEVICES.md](docs/DEVICES.md) checks.
- [ ] No credentials, tokens or private URLs were added.

## Style

- TypeScript strict; no `any` unless unavoidable and commented.
- Prefer editing existing components over adding parallel ones.
- Keep the Etherealism palette and typography. No generic theme changes.
- Document decisions in `docs/CHANGELOG.md` when behaviour changes.
- Add a doc row for any new module in the relevant `README.md`.

## Content edits

| Change | File |
| --- | --- |
| Photographs / albums | `src/data/photographyManifest.ts` |
| Film stills | `src/data/filmStills.ts` |
| The Birth Permit | `src/data/birthPermit.ts` |
| Loglines, credits, watch links | `src/components/FilmSections.tsx` |
| Site title / metadata | `index.html` |

After adding images, regenerate previews and re-bake:

```bash
node scripts/generate-previews.cjs
node scripts/generate-birth-permit-previews.cjs
npm run build
```

## Licensing

No open-source licence has been granted for the photography or the site code. Treat the
repository as all rights reserved unless the owner states otherwise in writing.

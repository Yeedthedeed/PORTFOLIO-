# Maintenance runbook

## Commands

```bash
npm install
npm run dev
npx tsc --noEmit
npm run build
npm run preview
```

## Deployment

`npm run build` produces a **single** `dist/index.html`. Deploy that file. Because previews are
inlined, there is no separate image directory to configure. Masters load from jsDelivr/GitHub,
so the deployment environment needs no image storage.

After every build, verify:

```bash
ls dist                                    # contains index.html
grep -c "data:image/webp" dist/index.html  # equals the baked preview count
```

## Common tasks

### Add a film still
1. Upload the untouched master to `Film Stills/` in the repository.
2. Add a record to `src/data/filmStills.ts` with the correct `film` value.
3. If it's a new film, add a definition to `FilmRibbonPair.tsx` and a stills album link.
4. `node scripts/generate-previews.cjs`
5. `npm run build`

### Add a photograph
1. Upload the untouched master to the repository.
2. Add the record/album in `src/data/photographyManifest.ts` (schema unchanged).
3. Add to `SPHERE_SELECTION` if it should appear in the sphere (keep it at 36 or update `N`).
4. Regenerate previews, build.

### Change the sphere drag feel
Constants live in `ScrollSphere.tsx`:

```ts
const CUR_H = 0.12;   // cursor horizontal influence
const CUR_V = 0.07;
const DRAG_M = 0.90;  // multiplied by 0.1 on pointer movement
const FRIC = 0.84;    // momentum decay
const MIN_V = 0.004;  // idle floor
```

Keep the `× 0.1` in the pointer math; without it the sphere becomes ~10× too sensitive.

### Change ribbon density
`FilmSpiral.tsx` → `ribbonGeometry(count)`. `REFERENCE_STILLS = 29` is the reference. Fewer
stills produce fewer turns, keeping neighbour spacing consistent.

### Re-bake previews without refetching
```bash
node scripts/bake-previews.cjs
```

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Gallery cards blank | preview assets module missing/stale | run both preview scripts, rebuild |
| Cards load slowly | previews not baked; falling back to masters | confirm `previewAssets.ts` has entries |
| Sphere too fast/slow | drag multiplier changed | restore `DRAG_M*0.1` math |
| Full archive does not scroll | missing `data-lenis-prevent` | check overlay markup |
| Film page cannot scroll | wheel captured in landing section | `onWheel` should return unless `fullscreen` |
| Poster missing | CDN path or network | fallback to `POSTER_ORIGINAL_URL` should fire |
| Viewer stays on spinner | master blocked | fallback URL should load; check labels |
| Phone shows desktop | bootstrap blocked or old cached HTML | hard refresh; verify inline script |
| Tablet dock covers footer | bottom padding removed | restore safe-area padding |

## Do not

- Do not edit `src/data/previewAssets.ts` by hand.
- Do not modify, resize, re-export or overwrite any master image.
- Do not change the manifest schema.
- Do not add a second RAF loop to an existing gallery.
- Do not reintroduce blur/LQIP placeholders.
- Do not edit `vite.config.ts` or install a second framework.

## Verification before shipping

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` clean; `dist` contains one file
- [ ] Sphere drag feels like `0.9 × 0.1` per pixel
- [ ] Every sphere card eventually shows its master (class `is-original`)
- [ ] Film ribbons show 29 / 50 / 43 stills with equal frame spacing
- [ ] Viewers show album title + subtitle + intro + image notes
- [ ] Phone composition appears automatically at ≤720px
- [ ] Tablet composition (floating dock + nameplate) at 721–1180px / iPad
- [ ] Keyboard-only path works through both galleries and viewers

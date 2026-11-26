# Performance

## Principles

1. Never alter an original image to make it smaller.
2. Fetch as few originals as possible, as late as possible.
3. Keep animation loops off the main thread budget.
4. Never show a broken or half-decoded image.

## Budgets

| Item | Value |
| --- | --- |
| Production document | ~644 KB, ~178 KB gzipped |
| Inline raster images | 0 |
| External image requests at first paint | portrait only (high priority) |
| Archive concurrent original downloads | 3 site-wide |
| Sphere concurrent original downloads | 2 |
| Film ribbon concurrent original downloads | 2 |

## Why the bundle is small

All derivative image data has been removed. The document contains only application code, CSS
and the small SVG film grain. Every photograph is fetched from the original host.

## Archive

- Only the selected album's photographs are mounted.
- `OriginalImage` uses an `IntersectionObserver` with a 450 px margin.
- Three concurrent downloads site-wide.
- `fetchPriority` prioritises the first row.
- Neutral skeletons reserve geometry, preventing layout shift.
- Repeat album visits are served from the browser cache.

## Sphere landing page

- 4 priority frames (3 on touch) at mount.
- Two-request queue; additional frames unlock only after rotation past the depth threshold.
- All 36 cards keep their CSS transforms, which are cheap and GPU-composited.
- Loop pauses off-screen, on hidden documents, and while a viewer or archive covers it.
- Coarse pointers run at ~30 fps with pointer-proximity effects disabled.

## Film ribbons

- 3 opening frames queued; the rest load as depth increases.
- One RAF loop per ribbon, paused when covered.
- Wheel advances the reel only inside the archive, never on the landing page.

## RAF and GPU

- One `Background` loop, one sphere loop, one loop per ribbon.
- Ribbon idle motion reads a shared reel clock instead of accumulating private state, so
  three ribbons cost the same as one and stay phase-locked.
- Depth lighting is quantised into five bands; the DOM attribute is touched only on a band
  change, so it adds no measurable work to frames that are already writing transforms.
- The hover sheen and develop sweep are paint-only pseudo-element animations; no extra RAF,
  no extra canvas, no image filters.
- `LightingEngine` is disabled on touch and paused on document hide.
- No React state updates inside animation frames; typed arrays and direct style writes.
- Photographic filters (blur, brightness, contrast, grayscale) are never applied to gallery
  images.

## Measuring

```bash
npm run build
npx tsc --noEmit
ls dist            # must contain only index.html
```

In DevTools → Network (Img): on first paint only the portrait should be requested. Opening the
archive should request only the visible tiles, at most three at once.

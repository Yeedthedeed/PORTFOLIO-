# Media policy — originals only

## Two image classes

| Class | Purpose | Delivery |
| --- | --- | --- |
| **Original master** | full quality, viewers | jsDelivr → GitHub raw → statically |
| **Baked preview** | small gallery cards, sphere, film ribbons, archive grid | Base64 WebP inside the document |

The masters are never modified. Previews are separate display derivatives generated only for
the tiny cards; they are baked into `src/data/previewAssets.ts` and delivered with the
application document, so they cannot 404 or be slow. Every viewer loads the master.

A single command regenerates them:

```bash
node scripts/generate-previews.cjs
```

## Sources

| Image | URL |
| --- | --- |
| Photographs | `photo.source_url` from `photographyManifest.ts` |
| Film stills | `film.url` from `filmStills.ts` |
| Portrait | `Landing page profile pictuer - Copy/3 .png` |
| Poster | `Films Posters/DELUSION OF NEGATION - Short Film Poster.jpg` |

## Delivery

`src/utils/media.ts` is the only place that resolves image URLs.

1. **`originalHosts(url)`** returns the same file on up to three hosts, best first:
   - jsDelivr GitHub cache (`cdn.jsdelivr.net/gh/Yeedthedeed/PORTFOLIO-@main/...`)
   - GitHub raw (`raw.githubusercontent.com/...`)
   - statically CDN (`cdn.statically.io/gh/...`)
2. **`resolveOriginalUrl(url)`** walks those hosts, and for files GitHub mislabels as
   `application/octet-stream` it fetches the identical bytes and wraps them in an image Blob.
   It resolves to a URL or an empty string — it never leaves an image hanging.
3. **`preloadOriginal(url)`** decodes a master once and reuses it.

## Loading strategy

Because the masters are 3–22 MB each, the grids do not request them. They use the baked inline
previews, which are already in memory:

- Photography archive grid — **originals only** via `AlbumOriginal`; no compressed preview is
  rendered there. A neutral skeleton holds the frame until the master decodes.
- Sphere landing cards — inline previews, six-request queue, eight priority frames.
- Film ribbon frames — inline previews, twelve opening frames primed.
- All viewers (photography, film) — the original master, loaded on open.
- The album header reports progress: `Loading originals · n / total` counts the tiles painted.

`photoThumb()` / `filmThumb()` resolve previews for the sphere, ribbons, portrait and poster.
The photography archive deliberately bypasses them: `AlbumOriginal` resolves `photoSrc()` and
renders only the master.

### Photography archive loader

- IntersectionObserver at 800px; nothing loads off-screen.
- Four concurrent downloads, site-wide, shared by the grid and viewer.
- In-memory cache (40 entries, Blob URLs revoked) so revisiting an album is instant; the browser
  HTTP cache covers full reloads.
- Hosts are tried jsDelivr first (fast, correct MIME), then GitHub raw, then statically.
- Files mislabelled as `application/octet-stream` are re-wrapped as image Blobs.
- A pulsing neutral skeleton is shown until the original decodes — never a broken image or a
  compressed placeholder.

## Sphere landing page

The sphere also uses originals, but it is the most bandwidth-sensitive surface, so it is the
most strictly gated:

- Only **4 frames (3 on touch)** are eligible on mount.
- A **two-request** queue.
- Further frames load only once the user rotates past a depth threshold.
- Masters are cached after first view.

## Adding images

1. Upload the original, unmodified file to the repository.
2. Add its record to the relevant manifest (schema unchanged).
3. Run `node scripts/generate-previews.cjs` (creates the preview and re-bakes).
4. Run `npm run build`.

## Do not

- Do not modify, crop, recolour or overwrite a master.
- Do not hand-edit `src/data/previewAssets.ts`; it is generated.
- Do not point the preview generator at an output path inside the master folders.
- Do not render a full master in the grids.

# Data model

Two manifest modules are canonical. Neither schema may be altered without updating the
components listed in [ARCHITECTURE.md](ARCHITECTURE.md).

## `src/data/photographyManifest.ts`

```ts
type Photo = {
  photo_id: string;          // e.g. "ARCH-001"
  source_filename: string;
  source_path: string;       // repository path
  source_url: string;        // pristine original URL
  display_title: string;
  caption: string;
  album_id: string;
  album_title: string;
  collection_id: string;
  parent_album_id: string | null;
  category: string;
  sequence: number;
  year: string | null;
  alt_text: string | null;
  featured_in_sphere: boolean;
  sphere_slot: number | null;
};

type Album = {
  album_id: string;
  collection_id: string;
  parent_album_id: string | null;
  display_title: string;
  subtitle: string;
  intro: string;
  category: string;
  photo_count: number;
  cover_photo_id: string;
  photo_ids: string[];
  year: string | null;
};
```

Exports:

- `COLLECTIONS` — 10 collections.
- `ALBUMS` — 16 albums (some nested via `parent_album_id`).
- `PHOTOGRAPHS` — all 81 photographs.
- `SPHERE_SELECTION` — the 36 curated sphere photographs, ordered by `sphere_slot`.
- `getPhoto(id)`, `getAlbum(id)`, `getAlbumPhotos(id)`, `getAlbumCover(id)`,
  `getCollectionTitle(id)`, `collectionSourceUrl(id)`, `ARCHIVE_SOURCE_URL`.

Rules:

1. Never rebuild `source_url`; it is copied verbatim from the canonical manifest.
2. `SPHERE_SELECTION` must remain exactly 36 entries; `ScrollSphere` slices to 36.
3. Viewer navigation steps through `getAlbumPhotos(album_id)`, so album grouping drives the
   viewer filmstrip and prev/next behaviour.
4. The overlay must show album **title + subtitle + intro + photo caption** — this is a product
   requirement, not decoration.

## `src/data/filmStills.ts`

```ts
type FilmStill = {
  id: string;
  title: string;
  film: string;
  year: string;
  format: string;
  note: string;
  url: string;   // pristine master
};
```

Exports:

- `FILM_STILLS` — 45 frames.
  - `Delusion of Negation`: 29 stills.
  - `Zakia's Clock`: 50 stills (refreshed 2026-11-11).
- `DELUSION_POSTER`, `FEATURED_FILM`, `FILM_SOURCE_URL`.
- `FEATURED_FILM` drives the featured-project copy.

`FilmRibbonPair` groups stills by the `film` field. Adding a new film requires:

1. Appending its stills with a consistent `film` value.
2. Adding a definition in `src/components/FilmRibbonPair.tsx` (`DEFINITIONS`).
3. Regenerating previews (`node scripts/generate-previews.cjs`).

## `src/data/birthPermit.ts`

The third film shown in the filmography: **The Birth Permit** (Salim Bakhouch — First Assistant
Director).

- `BIRTH_PERMIT` — title, credit, format, year, logline, Vimeo URL and GitHub album URL.
- `BIRTH_PERMIT_STILLS` — 43 untouched originals.
- `birthPermitPreviews.ts` — baked display derivatives for the ribbon frames only
  (regenerate with `node scripts/generate-birth-permit-previews.cjs`).
- `BIRTH_PERMIT_STILLS` — all 43 stills from
  `Film Stills/The Birth permit __ Short Film __ Stills`, each with its untouched repository
  URL and byte size.

The list is generated from the GitHub contents API; no image is downloaded, resized or
re-encoded to create it. The stills are rendered by `BirthPermitRibbon` through the shared
`FilmSpiral` engine, using `originalHosts()` for delivery.

## `src/data/previews.ts` and `src/data/previewAssets.ts`

- `previewAssets.ts` is **auto-generated** and holds the Base64 WebP previews.
  Do not edit it by hand; regenerate with the scripts.
- `previews.ts` is the accessor:

```ts
photoPreviewUrl(photo_id)
filmPreviewUrl(film_id)
hasPhotoPreview(photo_id)
hasFilmPreview(film_id)
```

The previews are display derivatives, never masters. The sphere upgrades to the master after
the preview paints, and viewers always request the master.

## Invariants

- `PHOTOGRAPHS.length === 81`
- `new Set(PHOTOGRAPHS.map(p => p.photo_id)).size === 81`
- `SPHERE_SELECTION.length === 36`
- Every `ALBUMS[*].photo_ids` resolves inside `PHOTOGRAPHS`.
- `FILM_STILLS` film counts: 29 / 50.
- Every photo/film id has a baked preview; the build-time generator reports failures.

## Where the UI reads data

| UI | Data |
| --- | --- |
| Hero stats | `PHOTOGRAPHS.length`, `ALBUMS.length`, `FILM_STILLS.length` |
| Sphere | `SPHERE_SELECTION` |
| Sphere viewer | `getAlbum`, `getAlbumPhotos`, `getCollectionTitle` |
| Film ribbons | `FILM_STILLS`, grouped by film in `FilmRibbonPair` |
| Film detail | `FILM_STILLS[current]`, `FILM_SOURCE_URL` |
| Photography archive | `ALBUMS`, `getAlbumPhotos` |
| Featured project | `FEATURED_FILM`, poster asset |

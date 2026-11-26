# Scripts

Node scripts that generate the gallery **display derivatives** and bake them into TypeScript
modules. They never touch a master file.

## `generate-previews.cjs`

```bash
node scripts/generate-previews.cjs
```

- Reads `PHOTOGRAPHS` from `src/data/photographyManifest.ts` and `FILM_STILLS` from
  `src/data/filmStills.ts`.
- Fetches **new** 320px WebP previews through `images.weserv.nl` (a resizing proxy). The master
  files in the repository are only read, never written.
- Writes `src/assets/previews/photos/*.webp` and `src/assets/previews/films/*.webp`.
- Invokes the baking step, which writes `src/data/previewAssets.ts`.

Run it after adding or replacing photographs or Delusion/Zakia film stills.

## `bake-previews.cjs`

```bash
node scripts/bake-previews.cjs
```

- Reads the WebP files in `src/assets/previews/**`.
- Writes `src/data/previewAssets.ts` with Base64 data URIs (`PHOTO_PREVIEW_DATA`,
  `FILM_PREVIEW_DATA`).

Baking makes the previews independent of binary folders and of separate HTTP requests. The
previous failure mode was a missing `src/assets/previews` folder in an ephemeral environment,
which left every gallery card blank.

## `generate-birth-permit-previews.cjs`

```bash
node scripts/generate-birth-permit-previews.cjs
```

- Reads the 43 records in `src/data/birthPermit.ts`.
- Fetches 320px WebP previews, verifies each decodes, and writes
  `src/data/birthPermitPreviews.ts` (`BIRTH_PERMIT_PREVIEWS`).

The Birth Permit has its own module because its records are separate from `FILM_STILLS`.

## Order of operations

```bash
node scripts/generate-previews.cjs                 # photographs + Delusion/Zakia
node scripts/generate-birth-permit-previews.cjs    # Birth Permit
npm run build
```

Both baking scripts are idempotent: existing previews are reused if present and valid.

## Rules

- Never point these scripts at a path inside the master asset folders.
- Never overwrite files in the GitHub master directories.
- Keep preview width at 320px and quality around 72 — sufficient for the small 3D cards.
- `delusion-28` is an almost-black frame; a very small WebP is expected and valid.
- The baked `.ts` modules are **committed** source, not build output. They are the reason the
  galleries cannot 404.
- `src/assets/previews/**` itself is optional at runtime; deleting it does not break the site,
  but you must regenerate before re-baking.

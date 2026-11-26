/**
 * GALLERY PREVIEWS
 *
 * Display derivatives baked into `previewAssets.ts` as Base64 WebP, so they
 * travel inside the application document. They cannot 404 and cannot be slow.
 * Masters remain untouched and are used only by the full-screen viewers.
 */
import { FILM_PREVIEW_DATA, PHOTO_PREVIEW_DATA } from "./previewAssets";
import { BIRTH_PERMIT_PREVIEWS } from "./birthPermitPreviews";

export const photoPreviewUrl = (id: string): string =>
  PHOTO_PREVIEW_DATA[id] ?? "";

/**
 * Film-frame previews. Every ribbon — Delusion of Negation, Zakia's Clock and
 * The Birth Permit — resolves through this one function, so they share exactly
 * the same delivery path, sizing and loading behaviour.
 */
export const filmPreviewUrl = (id: string): string => {
  const key = id.replace(/'/g, "");
  return FILM_PREVIEW_DATA[key] ?? BIRTH_PERMIT_PREVIEWS[key] ?? "";
};

export const hasPhotoPreview = (id: string): boolean =>
  Boolean(PHOTO_PREVIEW_DATA[id]);

export const hasFilmPreview = (id: string): boolean =>
  Boolean(filmPreviewUrl(id));

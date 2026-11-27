import type { FilmStill } from "./filmStills";
import { BIRTH_PERMIT, BIRTH_PERMIT_STILLS } from "./birthPermit";

/**
 * The Birth Permit stills adapted to the shared `FilmStill` contract so the
 * same `FilmSpiral` engine can present them. URLs remain the untouched
 * repository originals; ribbon frames resolve through the baked previews
 * (`filmThumb` merges BIRTH_PERMIT_PREVIEWS internally).
 */
export const BIRTH_PERMIT_RIBBON_STILLS: FilmStill[] = BIRTH_PERMIT_STILLS.map(
  (still) => ({
    id: still.id,
    title: still.filename,
    film: BIRTH_PERMIT.title,
    year: BIRTH_PERMIT.year,
    format: BIRTH_PERMIT.format,
    note: BIRTH_PERMIT.logline,
    url: still.url,
  })
);

export const BIRTH_PERMIT_META = {
  id: "the-birth-permit",
  title: "The Birth",
  emphasis: "Permit",
  credit: BIRTH_PERMIT.credit,
  format: BIRTH_PERMIT.format,
  year: BIRTH_PERMIT.year,
  album: BIRTH_PERMIT.album,
  watch: BIRTH_PERMIT.vimeo,
  logline: BIRTH_PERMIT.logline,
} as const;

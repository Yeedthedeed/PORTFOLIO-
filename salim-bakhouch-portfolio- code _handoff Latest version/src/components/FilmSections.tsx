import { useCallback, useId, useRef, useState } from "react";
import FilmSpiral from "./FilmSpiral";
import DevelopReveal from "./DevelopReveal";
import FilmStillsShowcase from "./FilmStillsShowcase";
import { FILM_STILLS, type FilmStill } from "../data/filmStills";
import { BIRTH_PERMIT, BIRTH_PERMIT_STILLS } from "../data/birthPermit";

/**
 * FILM SECTIONS — the landing filmography
 *
 * Three films, stacked vertically and centred, one below the other:
 *
 *   1. Delusion of Negation — Director & Screenwriter
 *   2. Zakia's Clock         — DOP & Colorist
 *   3. The Birth Permit      — First Assistant Director
 *
 * Each section contains its own ribbon, credits, logline, stills link and a
 * watch action. Every ribbon runs the same FilmSpiral engine, so movement,
 * interaction and load behaviour are identical. Ribbon frames use the baked
 * inline previews; opening a frame loads the untouched original.
 */

type FilmSection = {
  id: string;
  index: string;
  title: string;
  emphasis: string;
  credit: string;
  year: string;
  format: string;
  logline: string;
  stills: FilmStill[];
  album: string;
  watch: { label: string; href: string; note?: string };
};

const byFilm = (name: string): FilmStill[] =>
  FILM_STILLS.filter((still) => still.film === name);

const albumFor = (stills: FilmStill[], fallback: string): string => {
  const first = stills[0];
  if (!first) return fallback;
  const folder = first.url.slice(0, first.url.lastIndexOf("/"));
  return folder.replace(
    "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/",
    "https://github.com/Yeedthedeed/PORTFOLIO-/tree/main/"
  );
};

const DELUSION_STILLS = byFilm("Delusion of Negation");
const ZAKIA_STILLS = byFilm("Zakia's Clock");

/** Adapt The Birth Permit archive records to the ribbon contract. */
const BIRTH_STILLS: FilmStill[] = BIRTH_PERMIT_STILLS.map((still) => ({
  id: still.id,
  title: still.filename,
  film: BIRTH_PERMIT.title,
  year: BIRTH_PERMIT.year,
  format: BIRTH_PERMIT.format,
  note: BIRTH_PERMIT.logline,
  url: still.url,
}));

const FILMS: FilmSection[] = [
  {
    id: "delusion-of-negation",
    index: "01",
    title: "Delusion",
    emphasis: "of Negation",
    credit: "Director & Screenwriter",
    year: "2026",
    format: "Short Film",
    logline:
      "A reclusive artist suffering from Cotard’s Syndrome becomes the subject of her psychiatrist’s unethical experiment, as his pursuit of psychological discovery and artistic pursuits accelerates her descent toward self-destruction.",
    stills: DELUSION_STILLS,
    album: albumFor(DELUSION_STILLS, "https://github.com/Yeedthedeed/PORTFOLIO-"),
    watch: {
      label: "Watch the film",
      href: "#featured-project",
      note: "Featured project · official poster and screening details",
    },
  },
  {
    id: "zakias-clock",
    index: "02",
    title: "Zakia’s",
    emphasis: "Clock",
    credit: "Director of Photography & Colorist",
    year: "2026",
    format: "Short Film",
    logline:
      "The daughter of an authoritarian watchmaker inherits a defining gesture, a watch clasped to her wrist, and a secret mistake that will turn time into a lasting obsession.",
    stills: ZAKIA_STILLS,
    album: albumFor(ZAKIA_STILLS, "https://github.com/Yeedthedeed/PORTFOLIO-"),
    watch: {
      label: "Watch the film",
      href: "https://drive.google.com/file/d/1c9mrOUBP92CuX9-AKg4dZaXPSq5IqSqC/view?usp=drive_link",
      note: "Screening copy · Google Drive",
    },
  },
  {
    id: "the-birth-permit",
    index: "03",
    title: "The Birth",
    emphasis: "Permit",
    credit: "First Assistant Director",
    year: "2026",
    format: "Short Film",
    logline: BIRTH_PERMIT.logline,
    stills: BIRTH_STILLS,
    album: BIRTH_PERMIT.album,
    watch: {
      label: "Watch the film",
      href: BIRTH_PERMIT.vimeo,
      note: BIRTH_PERMIT.vimeo,
    },
  },
];

export default function FilmSections({ paused = false }: { paused?: boolean }) {
  const groupId = useId();
  const [detailOpen, setDetailOpen] = useState(false);
  const [showcase, setShowcase] = useState<
    { film: FilmSection; index: number | null } | null
  >(null);
  const openRef = useRef<Set<string>>(new Set());

  const onDetailChange = useCallback(
    (id: string, open: boolean) => {
      if (open) openRef.current.add(id);
      else openRef.current.delete(id);
      setDetailOpen(openRef.current.size > 0);
    },
    []
  );

  /**
   * One permanently stable callback per film. Rebuilding these between renders
   * would tear down the FilmSpiral engine and reset the ribbon mid-interaction.
   */
  const detailHandlers = useRef(
    new Map(
      FILMS.map((film) => [
        film.id,
        (open: boolean) => onDetailChange(film.id, open),
      ])
    )
  ).current;

  return (
    <div className="film-sections" aria-label="Filmography">
      {FILMS.map((film) => {
        const headingId = `${groupId}-${film.id}`;
        const isExternal = /^https?:/.test(film.watch.href);
        return (
          <section
            key={film.id}
            className="film-section-row"
            aria-labelledby={headingId}
            id={film.id}
          >
            <header className="film-section-head">
              <p className="eyebrow">
                <span className="eyebrow-line" aria-hidden />
                <DevelopReveal><span className="film-chapter-index">{film.index}</span> · {film.credit}</DevelopReveal>
              </p>
              <h3 id={headingId} className="film-section-title">
                <DevelopReveal as="span" delay={90}>
                  {film.title} <em>{film.emphasis}</em>
                </DevelopReveal>
              </h3>
              <p className="film-section-meta">
                {String(film.stills.length).padStart(2, "0")} stills
                <span aria-hidden> · </span>
                {film.format}
                <span aria-hidden> · </span>
                {film.year}
              </p>
            </header>

            <div className="film-section-ribbon">
              <FilmSpiral
                films={film.stills}
                paused={paused || detailOpen}
                compact
                onDetailChange={detailHandlers.get(film.id)}
                onOpenAlbum={(index) => setShowcase({ film, index })}
              />
            </div>

            <div className="film-section-info">
              <div className="film-section-logline">
                <p className="eyebrow">Logline</p>
                <p>{film.logline}</p>
              </div>

              <div className="film-section-actions">
                <a
                  className="film-watch"
                  href={film.watch.href}
                  {...(isExternal
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  data-cursor="hover"
                >
                  <span className="film-watch-dot" aria-hidden />
                  {film.watch.label}
                  <span aria-hidden>{isExternal ? "↗" : "→"}</span>
                </a>
                {film.watch.note && (
                  <p className="film-watch-note">{film.watch.note}</p>
                )}
                <button
                  type="button"
                  className="film-album-link film-album-link--album"
                  onClick={() => setShowcase({ film, index: null })}
                  data-cursor="hover"
                >
                  View full album <span aria-hidden>→</span>
                </button>
                <a
                  className="film-album-link film-album-link--external"
                  href={film.album}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub masters ↗
                </a>
              </div>
            </div>
          </section>
        );
      })}

      {showcase && (
        <FilmStillsShowcase
          title={`${showcase.film.title} ${showcase.film.emphasis}`}
          credit={showcase.film.credit}
          stills={showcase.film.stills}
          albumUrl={showcase.film.album}
          watch={showcase.film.watch}
          initialIndex={showcase.index}
          onClose={() => setShowcase(null)}
        />
      )}
    </div>
  );
}

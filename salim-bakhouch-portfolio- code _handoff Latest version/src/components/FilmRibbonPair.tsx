import { useCallback, useId, useMemo, useRef, useState } from "react";
import FilmSpiral from "./FilmSpiral";
import { FILM_STILLS, type FilmStill } from "../data/filmStills";

/**
 * FILM RIBBON PAIR
 *
 * Two films, two spirals, one shared spatial language. Each ribbon receives
 * only its own stills and runs the complete FilmSpiral engine inside its own
 * half of the layout, so movement, drag, focus and opening behave identically
 * on both sides. Used by the landing filmography and the archive overlay.
 */

type RibbonDefinition = {
  id: string;
  film: string;
  title: string;
  emphasis: string;
  year: string;
  format: string;
  watch: { label: string; href: string; external: boolean };
};

const DEFINITIONS: RibbonDefinition[] = [
  {
    id: "delusion",
    film: "Delusion of Negation",
    title: "Delusion",
    emphasis: "of Negation",
    year: "2026",
    format: "Short Film",
    watch: { label: "Watch the film", href: "#featured-project", external: false },
  },
  {
    id: "zakia",
    film: "Zakia's Clock",
    title: "Zakia's",
    emphasis: "Clock",
    year: "2026",
    format: "Short Film",
    watch: {
      label: "Watch the film",
      href: "https://drive.google.com/file/d/1c9mrOUBP92CuX9-AKg4dZaXPSq5IqSqC/view?usp=drive_link",
      external: true,
    },
  },
];

const BY_FILM = FILM_STILLS.reduce<Record<string, FilmStill[]>>((acc, still) => {
  (acc[still.film] ??= []).push(still);
  return acc;
}, {});

export const FILM_RIBBONS = DEFINITIONS.map((definition) => ({
  ...definition,
  stills: BY_FILM[definition.film] ?? [],
  albumUrl: albumUrlFor(BY_FILM[definition.film]?.[0]),
}));

function albumUrlFor(still?: FilmStill): string {
  if (!still) return "https://github.com/Yeedthedeed/PORTFOLIO-";
  const raw = still.url;
  const folder = raw.slice(0, raw.lastIndexOf("/"));
  return folder.replace(
    "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/",
    "https://github.com/Yeedthedeed/PORTFOLIO-/tree/main/"
  );
}

export default function FilmRibbonPair({
  immediate = false,
  fullscreen = false,
  paused = false,
  onDetailChange,
  onOpenStills,
  onOpenAlbumFor,
  onWatchInternal,
  variant = "landing",
}: {
  immediate?: boolean;
  fullscreen?: boolean;
  paused?: boolean;
  onDetailChange?: (open: boolean) => void;
  /** Open the in-site stills showcase for a film. Falls back to GitHub. */
  onOpenStills?: (film: string) => void;
  /** Open a film's album directly on one still (from the viewer). */
  onOpenAlbumFor?: (film: string, index: number) => void;
  /** Delusion has no external screening copy; its watch action returns to the featured film. */
  onWatchInternal?: () => void;
  variant?: "landing" | "archive";
}) {
  const groupId = useId();
  const openRibbons = useRef(new Set<string>());
  const [detailOpen, setDetailOpen] = useState(false);

  const updateDetailState = useCallback(
    (id: string, open: boolean) => {
      if (open) openRibbons.current.add(id);
      else openRibbons.current.delete(id);
      const anyOpen = openRibbons.current.size > 0;
      setDetailOpen(anyOpen);
      onDetailChange?.(anyOpen);
    },
    [onDetailChange]
  );

  const handlers = useMemo(
    () =>
      FILM_RIBBONS.map((ribbon) => (open: boolean) =>
        updateDetailState(ribbon.id, open)
      ),
    [updateDetailState]
  );

  return (
    <div className={`film-ribbon-pair is-${variant}`} data-film-ribbons>
      {FILM_RIBBONS.map((ribbon, index) => {
        const headingId = `${groupId}-${ribbon.id}-heading`;
        return (
          <section
            key={ribbon.id}
            className="film-ribbon-panel"
            aria-labelledby={headingId}
            data-film={ribbon.film}
          >
            <header className="film-ribbon-panel-head">
              <div className="film-ribbon-panel-meta">
                <span>
                  {String(index + 1).padStart(2, "0")} / {ribbon.format}
                </span>
                <div className="film-ribbon-panel-actions">
                  {onOpenStills && (
                    <button
                      type="button"
                      onClick={() => onOpenStills(ribbon.film)}
                      aria-label={`View the full ${ribbon.film} stills album`}
                      data-cursor="hover"
                    >
                      View album <span aria-hidden>→</span>
                    </button>
                  )}
                  {ribbon.watch.external ? (
                    <a
                      href={ribbon.watch.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="hover"
                    >
                      <span className="film-watch-dot" aria-hidden />
                      {ribbon.watch.label} <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={onWatchInternal}
                      data-cursor="hover"
                    >
                      <span className="film-watch-dot" aria-hidden />
                      {ribbon.watch.label} <span aria-hidden>→</span>
                    </button>
                  )}
                  <a
                    href={ribbon.albumUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open the ${ribbon.film} masters on GitHub`}
                    data-cursor="hover"
                  >
                    GitHub <span aria-hidden>↗</span>
                  </a>
                </div>
              </div>
              <h3 id={headingId} className="film-ribbon-panel-title">
                {ribbon.title} <em>{ribbon.emphasis}</em>
              </h3>
              <p className="film-ribbon-panel-sub">
                {String(ribbon.stills.length).padStart(2, "0")} stills
                <span aria-hidden> · </span>
                {ribbon.year}
                <span aria-hidden> · </span>
                {ribbon.format}
              </p>
            </header>

            <div className="film-ribbon-canvas">
              <FilmSpiral
                films={ribbon.stills}
                immediate={immediate}
                fullscreen={fullscreen}
                paused={paused || detailOpen}
                compact
                onDetailChange={handlers[index]}
                onOpenAlbum={
                  onOpenAlbumFor
                    ? (stillIndex) => onOpenAlbumFor(ribbon.film, stillIndex)
                    : undefined
                }
              />
            </div>
          </section>
        );
      })}
      <span className="film-ribbon-pair-divider" aria-hidden />
    </div>
  );
}

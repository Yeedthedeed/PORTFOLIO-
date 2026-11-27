import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import AudioToggle from "./AudioToggle";
import FilmRibbonPair from "./FilmRibbonPair";
import FilmSpiral from "./FilmSpiral";
import FilmStillsShowcase from "./FilmStillsShowcase";
import { FILM_SOURCE_URL, FILM_STILLS, type FilmStill } from "../data/filmStills";
import {
  BIRTH_PERMIT_META,
  BIRTH_PERMIT_RIBBON_STILLS,
} from "../data/birthPermitRibbon";

/**
 * FILMOGRAPHY ARCHIVE
 *
 * This is the full-page filmography view (opened from the landing section).
 * It keeps the split pair exactly as before — Delusion of Negation and
 * Zakia's Clock side by side — and adds a scroll-down third ribbon for
 * The Birth Permit, centred, using the same engine and geometry.
 *
 * The landing filmography is untouched: it still stacks all three films.
 */
export default function FilmographyGallery({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const handleDetailChange = useCallback(
    (open: boolean) => setDetailOpen(open),
    []
  );

  const [showcase, setShowcase] = useState<{
    title: string;
    credit?: string;
    stills: FilmStill[];
    albumUrl: string;
    index: number | null;
  } | null>(null);

  /* Lookup for the two split films, so the showcase receives the full records. */
  const byFilm = useMemo(
    () => ({
      "Delusion of Negation": FILM_STILLS.filter(
        (still) => still.film === "Delusion of Negation"
      ),
      "Zakia's Clock": FILM_STILLS.filter(
        (still) => still.film === "Zakia's Clock"
      ),
      "The Birth Permit": BIRTH_PERMIT_RIBBON_STILLS,
    }),
    []
  );

  const albumFor = useCallback((film: string) => {
    const first = (byFilm as Record<string, FilmStill[]>)[film]?.[0];
    if (!first) return FILM_SOURCE_URL;
    const folder = first.url.slice(0, first.url.lastIndexOf("/"));
    return folder.replace(
      "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/",
      "https://github.com/Yeedthedeed/PORTFOLIO-/tree/main/"
    );
  }, [byFilm]);

  const openStills = useCallback(
    (film: string, index: number | null = null) => {
      const stills = (byFilm as Record<string, FilmStill[]>)[film] ?? [];
      setShowcase({
        title: film === "The Birth Permit" ? "The Birth Permit" : film,
        credit:
          film === "Delusion of Negation"
            ? "Director & Screenwriter"
            : film === "Zakia's Clock"
              ? "Director of Photography & Colorist"
              : BIRTH_PERMIT_META.credit,
        stills,
        albumUrl:
          film === "The Birth Permit" ? BIRTH_PERMIT_META.album : albumFor(film),
        index,
      });
    },
    [albumFor, byFilm]
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !detailOpen && !showcase) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOpen, showcase, onClose]);

  return (
    <motion.div
      className="film-archive film-archive--scroll"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="film-archive-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="film-archive-header">
        <button
          ref={closeRef}
          type="button"
          className="text-action"
          onClick={onClose}
          aria-label="Back to the portfolio"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <polyline points="8,2 4,6 8,10" />
          </svg>
          Portfolio
        </button>

        <div className="film-archive-heading">
          <p className="eyebrow">Three films · Three spirals · Archive</p>
          <h2 id="film-archive-title" className="spatial-title">
            Film<em>ography</em>
          </h2>
        </div>

        <div className="film-archive-tools">
          <a className="text-action" href={FILM_SOURCE_URL} target="_blank" rel="noreferrer">
            Stills album ↗
          </a>
          <AudioToggle />
        </div>
      </header>

      {/* The two original ribbons, still side by side. */}
      <div className="film-archive-pair-zone">
        <FilmRibbonPair
          immediate
          variant="archive"
          onDetailChange={handleDetailChange}
          onOpenStills={openStills}
          onOpenAlbumFor={(film, index) => openStills(film, index)}
          onWatchInternal={() => {
            onClose();
            window.setTimeout(() => {
              document.getElementById("featured-project")?.scrollIntoView({ behavior: "smooth" });
            }, 80);
          }}
        />
      </div>

      {/* Scroll down: the third ribbon, centred, archive view only. */}
      <section
        className="film-archive-birth"
        aria-labelledby="film-archive-birth-title"
      >
        <header className="film-archive-birth-head">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden />
            03 · {BIRTH_PERMIT_META.credit}
          </p>
          <h3 id="film-archive-birth-title" className="film-archive-birth-title">
            {BIRTH_PERMIT_META.title} <em>{BIRTH_PERMIT_META.emphasis}</em>
          </h3>
          <p className="film-archive-birth-meta">
            {BIRTH_PERMIT_RIBBON_STILLS.length} stills
            <span aria-hidden> · </span>
            {BIRTH_PERMIT_META.format}
            <span aria-hidden> · </span>
            {BIRTH_PERMIT_META.year}
          </p>
        </header>

        <div className="film-archive-birth-ribbon">
          <FilmSpiral
            films={BIRTH_PERMIT_RIBBON_STILLS}
            immediate
            paused={detailOpen || Boolean(showcase)}
            compact
            onDetailChange={handleDetailChange}
            onOpenAlbum={(index) => openStills("The Birth Permit", index)}
          />
        </div>

        <div className="film-archive-birth-actions">
          <button
            type="button"
            className="film-album-link"
            onClick={() => openStills("The Birth Permit")}
          >
            View full album →
          </button>
          <a
            className="film-watch"
            href={BIRTH_PERMIT_META.watch}
            target="_blank"
            rel="noreferrer"
          >
            <span className="film-watch-dot" aria-hidden />
            Watch the film
            <span aria-hidden>↗</span>
          </a>
          <a
            className="film-album-link film-album-link--external"
            href={BIRTH_PERMIT_META.album}
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </section>

      {showcase && (
        <FilmStillsShowcase
          title={showcase.title}
          credit={showcase.credit}
          stills={showcase.stills}
          albumUrl={showcase.albumUrl}
          watch={showcase.title === "The Birth Permit"
            ? { label: "Watch the film", href: BIRTH_PERMIT_META.watch }
            : showcase.title === "Zakia's Clock"
              ? { label: "Watch the film", href: "https://drive.google.com/file/d/1c9mrOUBP92CuX9-AKg4dZaXPSq5IqSqC/view?usp=drive_link" }
              : undefined}
          initialIndex={showcase.index}
          onClose={() => setShowcase(null)}
        />
      )}
    </motion.div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import AlbumOriginal from "./AlbumOriginal";
import FilmDetailOverlay from "./FilmDetail";
import { filmSrc } from "../utils/media";
import type { FilmStill } from "../data/filmStills";

/**
 * FILM STILLS SHOWCASE
 *
 * The in-site album view for a film's stills. Selecting a stills album — from
 * the landing filmography or the filmography archive — opens this, so the
 * album is browsable inside the portfolio instead of sending the visitor away.
 *
 * Every tile is the untouched original file, viewport-gated and capped at four
 * concurrent downloads by `AlbumOriginal`; opening a tile reuses the same
 * `FilmDetail` viewer as the ribbons.
 */
export default function FilmStillsShowcase({
  title,
  credit,
  stills,
  albumUrl,
  onClose,
  initialIndex = null,
}: {
  title: string;
  credit?: string;
  stills: FilmStill[];
  albumUrl?: string;
  onClose: () => void;
  /**
   * The still a ribbon click asked for.
   *
   * Selecting a frame opens that photograph **in full view** straight away; the
   * album sits behind it and is reached by closing the viewer, or by swiping
   * through the rest of the album. Opening via the "Open stills album" button
   * passes no index, so the grid is what appears.
   */
  initialIndex?: number | null;
}) {
  const closeViewer = useCallback(() => setOpenIdx(null), []);
  const [openIdx, setOpenIdx] = useState<number | null>(
    initialIndex !== null &&
      initialIndex !== undefined &&
      initialIndex >= 0 &&
      initialIndex < stills.length
      ? initialIndex
      : null
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  /*
   * Each still's own aspect ratio, measured the first time its original loads.
   * The tile then reserves exactly that shape before the file arrives, so the
   * album has no layout shift and the still is never letterboxed or cropped.
   */
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const measured = useRef(new Set<string>());

  const measure = (id: string, width: number, height: number) => {
    if (!width || !height || measured.current.has(id)) return;
    measured.current.add(id);
    setRatios((current) => ({ ...current, [id]: width / height }));
  };

  /* Bring the selected still into view and mark it briefly. */
  useEffect(() => {
    if (
      initialIndex === null ||
      initialIndex === undefined ||
      initialIndex < 0 ||
      initialIndex >= stills.length
    ) {
      return;
    }
    setFocusedIdx(initialIndex);
    const grid = gridRef.current;
    const tile = grid?.querySelector<HTMLElement>(
      `[data-still-index="${initialIndex}"]`
    );
    if (tile && grid) {
      const top = tile.offsetTop - grid.clientHeight / 3;
      grid.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    }
    const timer = window.setTimeout(() => setFocusedIdx(null), 2600);
    return () => window.clearTimeout(timer);
  }, [initialIndex, stills.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (openIdx === null) onClose();
        else setOpenIdx(null);
        return;
      }
      /* Left/right step through the album when the viewer is closed, mirroring
         the ribbons and the viewer. */
      if (openIdx !== null) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const grid = gridRef.current;
        const tiles = grid
          ? Array.from(grid.querySelectorAll<HTMLElement>(".stills-showcase-tile"))
          : [];
        const next = tiles[focusedIdx === null ? 0 : (focusedIdx + 1) % tiles.length];
        next?.focus();
        setFocusedIdx(tiles.indexOf(next));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const grid = gridRef.current;
        const tiles = grid
          ? Array.from(grid.querySelectorAll<HTMLElement>(".stills-showcase-tile"))
          : [];
        const i = focusedIdx === null ? 0 : focusedIdx;
        const prev = tiles[(i - 1 + tiles.length) % tiles.length];
        prev?.focus();
        setFocusedIdx(tiles.indexOf(prev));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, openIdx]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <motion.div
        className="stills-showcase"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={`${title} stills showcase`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="stills-showcase-header">
          <button
            ref={closeRef}
            type="button"
            className="text-action"
            onClick={onClose}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <polyline points="8,2 4,6 8,10" />
            </svg>
            Back
          </button>
          <div className="stills-showcase-heading">
            {credit && <p className="eyebrow">{credit}</p>}
            <h2 className="stills-showcase-title">{title}</h2>
            <p className="stills-showcase-meta">
              {String(stills.length).padStart(2, "0")} stills · original files
            </p>
          </div>
          {albumUrl && (
            <a
              className="text-action"
              href={albumUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          )}
        </header>

        {/*
           * FULL-VIEW SEQUENCE
           * One still per row, shown at its own aspect ratio and as large as the
           * album column allows. Nothing is cropped, scaled, letterboxed or
           * resized: `object-fit: contain` plus `height: auto`, and the width is
           * derived from the still's own 16:9 shape rather than imposed by the
           * grid.
           *
           * Originals load through AlbumOriginal (viewport-gated, 4 concurrent),
           * so every tile is the untouched repository file at full quality.
           */}
        <div className="stills-showcase-grid" ref={gridRef}>
          {stills.map((still, index) => (
            <button
              key={still.id}
              type="button"
              data-still-index={index}
              className={`stills-showcase-tile${
                focusedIdx === index ? " is-focused" : ""
              }${openIdx === index ? " is-open" : ""}`}
              onClick={() => setOpenIdx(index)}
              aria-label={`Open still ${index + 1} of ${stills.length}: ${still.title}`}
              aria-current={openIdx === index ? "true" : undefined}
            >
              <span
                className="stills-showcase-media"
                style={
                  ratios[still.id]
                    ? { aspectRatio: `${ratios[still.id].toFixed(4)}` }
                    : undefined
                }
              >
                <AlbumOriginal
                  photoId={still.id}
                  src={filmSrc(still)}
                  alt={`${still.film} — still ${index + 1}`}
                  priority={index < 3}
                  onDimensions={(w, h) => measure(still.id, w, h)}
                />
                <span
                  className="stills-showcase-open"
                  aria-hidden
                >
                  Open full view <span aria-hidden>→</span>
                </span>
              </span>
              <span className="stills-showcase-caption">
                <span className="stills-showcase-index">
                  {String(index + 1).padStart(2, "0")}
                  <i aria-hidden> / </i>
                  {String(stills.length).padStart(2, "0")}
                </span>
                <span className="stills-showcase-name">{still.film}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <FilmDetailOverlay
        index={openIdx}
        films={stills}
        onClose={closeViewer}
      />
    </>,
    document.body
  );
}

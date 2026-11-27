import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import AlbumOriginal from "./AlbumOriginal";
import FilmDetailOverlay from "./FilmDetail";
import { filmSrc } from "../utils/media";
import type { FilmStill } from "../data/filmStills";

/**
 * FILM STILLS ALBUM
 *
 * The dedicated in-site album for one film. It is opened only by an explicit
 * "View full album" action — selecting a frame in a ribbon opens the single
 * still viewer, which then offers this album as a separate destination.
 *
 * Every tile is the untouched original, viewport-gated through AlbumOriginal.
 * Nothing is cropped, re-encoded or re-sequenced.
 */
export default function FilmStillsShowcase({
  title,
  credit,
  stills,
  albumUrl,
  watch,
  onClose,
  initialIndex = null,
}: {
  title: string;
  credit?: string;
  stills: FilmStill[];
  albumUrl?: string;
  watch?: { label: string; href: string };
  onClose: () => void;
  /** A still to locate when the album opens from a viewer. Never auto-opens it. */
  initialIndex?: number | null;
}) {
  const closeViewer = useCallback(() => setOpenIdx(null), []);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [ratios, setRatios] = useState<Record<string, number>>({});
  const measured = useRef(new Set<string>());

  const measure = (id: string, width: number, height: number) => {
    if (!width || !height || measured.current.has(id)) return;
    measured.current.add(id);
    setRatios((current) => ({ ...current, [id]: width / height }));
  };

  /* Bring a still passed from the viewer into view and mark it briefly. */
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
    const timer = window.setTimeout(() => setFocusedIdx(null), 2800);
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
      if (openIdx !== null) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const grid = gridRef.current;
      const tiles = grid
        ? Array.from(grid.querySelectorAll<HTMLElement>(".stills-showcase-tile"))
        : [];
      if (!tiles.length) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = tiles[focusedIdx === null ? 0 : (focusedIdx + 1) % tiles.length];
        next?.focus();
        setFocusedIdx(tiles.indexOf(next));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
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
      triggerRef.current?.focus?.({ preventScroll: true });
    };
  }, [onClose, openIdx, focusedIdx]);

  if (typeof document === "undefined") return null;

  const watchExternal = watch?.href?.startsWith("http");

  return createPortal(
    <>
      <motion.div
        className="stills-showcase"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={`${title} stills album`}
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
              {String(stills.length).padStart(2, "0")} stills · full album · original files
            </p>
          </div>

          <div className="stills-showcase-tools">
            {watch?.href && (
              <a
                className="stills-showcase-watch"
                href={watch.href}
                {...(watchExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="film-watch-dot" aria-hidden />
                {watch.label || "Watch the film"}
              </a>
            )}
            {albumUrl && (
              <a
                className="text-action"
                href={albumUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub masters ↗
              </a>
            )}
          </div>
        </header>

        <div className="stills-showcase-bar" aria-hidden={false}>
          <span className="stills-showcase-bar-label">Contact sheet</span>
          <span className="stills-showcase-bar-rule" aria-hidden />
          <span className="stills-showcase-bar-count">
            {String(stills.length).padStart(2, "0")} frames · click any still for full view
          </span>
        </div>

        {/* Album grid: whole stills, own proportions, several per screen. */}
        <div className="stills-showcase-grid" ref={gridRef}>
          {stills.map((still, index) => (
            <button
              key={still.id}
              type="button"
              data-still-index={index}
              className={`stills-showcase-tile${
                focusedIdx === index ? " is-focused" : ""
              }`}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setOpenIdx(index);
              }}
              aria-label={`Open still ${index + 1} of ${stills.length}: ${still.title}`}
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
                  priority={index < 4}
                  onDimensions={(w, h) => measure(still.id, w, h)}
                />
                <span className="stills-showcase-open" aria-hidden>
                  Full view <span aria-hidden>→</span>
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

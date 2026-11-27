import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FILM_STILLS, FILM_SOURCE_URL, type FilmStill } from "../data/filmStills";
import { filmSrc, resolveOriginalUrl } from "../utils/media";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function FilmDetailOverlay({
  index,
  onClose,
  films = FILM_STILLS,
}: {
  index: number | null;
  onClose: () => void;
  films?: FilmStill[];
}) {
  const [current, setCurrent] = useState(index ?? 0);
  const [displaySrc, setDisplaySrc] = useState("");
  /* Swipe state — refs so a gesture never re-renders the viewer. */
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeAxis = useRef<"none" | "x" | "y">("none");
  const [imageState, setImageState] = useState<"loading" | "ready" | "failed">(
    "loading"
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (index === null) return;
    setCurrent(index);
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrent((value) => Math.max(0, value - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrent((value) => Math.min(films.length - 1, value + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [index, films.length, onClose]);

  const film = films[current];

  /**
   * Resolve the master image safely.
   *
   * Several repository originals exceed jsDelivr's 20 MB limit and GitHub
   * serves them with a non-image MIME type, which browsers refuse to render.
   * `resolveOriginalUrl` walks the mirrors and re-wraps those bytes as an image
   * Blob, so every still in every film is actually displayable.
   */
  useEffect(() => {
    if (!film) return;
    let cancelled = false;
    setDisplaySrc("");
    setImageState("loading");
    resolveOriginalUrl(filmSrc(film)).then((url) => {
      if (cancelled) return;
      if (url) {
        setDisplaySrc(url);
      } else {
        setImageState("failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [film]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {index !== null && film && (
        <motion.div
          className="film-detail"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="film-detail-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="film-detail-inner"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <button
              ref={closeRef}
              className="overlay-close"
              onClick={onClose}
              aria-label="Close film still"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <line x1="1" y1="1" x2="10" y2="10" />
                <line x1="10" y1="1" x2="1" y2="10" />
              </svg>
              Close
            </button>

            <div
              className="film-detail-frame"
              /*
               * Swiping the album: horizontal drags step one still, vertical
               * drags are left to the page. `touch-action: pan-y` lets the
               * browser keep vertical scrolling while we own horizontal.
               */
              style={{ touchAction: "pan-y" }}
              onPointerDown={(event) => {
                if (event.pointerType === "mouse" && event.button !== 0) return;
                swipeStart.current = {
                  x: event.clientX,
                  y: event.clientY,
                  id: event.pointerId,
                };
                swipeAxis.current = "none";
              }}
              onPointerMove={(event) => {
                const start = swipeStart.current;
                if (!start || start.id !== event.pointerId) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (swipeAxis.current === "none") {
                  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
                    swipeAxis.current = "x";
                  } else if (Math.abs(dy) > 12) {
                    swipeAxis.current = "y";
                  }
                }
              }}
              onPointerUp={(event) => {
                const start = swipeStart.current;
                swipeStart.current = null;
                if (!start || start.id !== event.pointerId) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                const horizontal =
                  Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3;
                swipeAxis.current = "none";
                if (!horizontal) return;
                if (dx < 0 && current < films.length - 1) {
                  setCurrent((value) => value + 1);
                } else if (dx > 0 && current > 0) {
                  setCurrent((value) => value - 1);
                }
              }}
              onPointerCancel={() => {
                swipeStart.current = null;
                swipeAxis.current = "none";
              }}
            >
              {displaySrc ? (
                <img
                  src={displaySrc}
                  alt={`${film.film} — selected still ${current + 1}`}
                  className="film-detail-original"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setImageState("ready")}
                  onError={() => setImageState("failed")}
                />
              ) : (
                <div className="film-detail-placeholder" aria-hidden />
              )}
              {imageState === "loading" && (
                <span className="film-detail-status" role="status">
                  <span className="film-detail-spinner" aria-hidden />
                  Loading original still
                </span>
              )}
              {imageState === "failed" && (
                <span className="film-detail-status" role="status">
                  Still unavailable here —{" "}
                  <a href={film.url} target="_blank" rel="noreferrer">
                    open the original ↗
                  </a>
                </span>
              )}
            </div>

            <div className="film-detail-copy">
              <div>
                <p className="eyebrow">
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(films.length).padStart(2, "0")}
                  <span aria-hidden> · </span>
                  {film.format}
                </p>
                <h2
                  id="film-detail-title"
                  className="font-display"
                  style={{ fontStyle: "italic" }}
                >
                  {film.film}
                </h2>
                <p className="film-detail-note">{film.note}</p>
              </div>
              <dl className="film-detail-meta">
                <div>
                  <dt>Year</dt>
                  <dd>{film.year}</dd>
                </div>
                <div>
                  <dt>Source frame</dt>
                  <dd className="film-detail-filename" title={film.title}>
                    {film.title}
                  </dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a href={FILM_SOURCE_URL} target="_blank" rel="noreferrer">
                      Stills album ↗
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="film-detail-nav">
              <button
                type="button"
                onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                disabled={current === 0}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden
                >
                  <polyline points="7.5,2 3.5,6 7.5,10" />
                </svg>
                Previous
              </button>
              <span aria-live="polite" className="film-detail-counter">
                {String(current + 1).padStart(2, "0")} / {String(films.length).padStart(2, "0")}
                <span className="film-detail-swipe-hint" aria-hidden>
                  {" "}· swipe
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrent((value) => Math.min(films.length - 1, value + 1))
                }
                disabled={current === films.length - 1}
              >
                Next
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden
                >
                  <polyline points="4.5,2 8.5,6 4.5,10" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

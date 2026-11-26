import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AudioToggle from "./AudioToggle";
import {
  ALBUMS,
  getAlbum,
  getAlbumPhotos,
  getCollectionTitle,
  collectionSourceUrl,
  type Album,
  type Photo,
} from "../data/photographyManifest";
import { photoSrc } from "../utils/media";
import { sfx } from "../audio/SoundEngine";
import AlbumOriginal from "./AlbumOriginal";
import DevelopReveal from "./DevelopReveal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function PhotographyGallery({ onClose }: { onClose: () => void }) {
  const [albumId, setAlbumId] = useState(ALBUMS[0].album_id);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tileTriggers = useRef<HTMLElement | null>(null);

  const album = getAlbum(albumId) as Album;
  const photos = useMemo(() => getAlbumPhotos(albumId), [albumId]);
  const [loadedCount, setLoadedCount] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  /* Album changes start a clean progress count and scroll back to the top,
     so a phone/tablet album always opens at its heading. */
  useEffect(() => {
    setLoadedCount(0);
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
    /* One soft cut per album change — the same transition language as the
       loader and the viewers, on the single shared audio engine. */
    sfx.transition();
  }, [albumId]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

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
      if (event.key === "Escape" && lightbox === null) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, onClose]);

  useEffect(() => {
    if (lightbox === null && tileTriggers.current) {
      tileTriggers.current.focus({ preventScroll: true });
      tileTriggers.current = null;
    }
  }, [lightbox]);

  const collection = getCollectionTitle(album.collection_id);

  return (
    <motion.div
      className="archive"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <header className="archive-header">
        <button
          ref={closeRef}
          type="button"
          className="text-action"
          onClick={onClose}
          aria-label="Back to the portfolio"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <polyline points="8,2 4,6 8,10" />
          </svg>
          Portfolio
        </button>
        <div className="archive-brand">
          <span>Photography archive</span>
          <span className="archive-brand-count">81 photographs · 16 albums</span>
        </div>
        <div className="archive-header-tools">
          <AudioToggle />
        </div>
      </header>

      <div className="archive-body">
        <aside
          className="archive-albums"
          aria-label="Photography albums"
          data-lenis-prevent
        >
          <p className="eyebrow">Albums</p>
          <div className="archive-album-list">
            {ALBUMS.map((item) => {
              const isCurrent = item.album_id === albumId;
              return (
                <button
                  key={item.album_id}
                  type="button"
                  className={`archive-album${isCurrent ? " is-current" : ""}${
                    item.parent_album_id ? " is-nested" : ""
                  }`}
                  onClick={() => {
                    setAlbumId(item.album_id);
                    setLightbox(null);
                  }}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <span className="archive-album-index">
                    {String(ALBUMS.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                  <span className="archive-album-name">
                    {item.display_title}
                    <small>
                      {item.category} · {item.photo_count}
                    </small>
                  </span>
                  <span className="archive-album-arrow" aria-hidden>
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="archive-main" data-lenis-prevent ref={mainRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={album.album_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="archive-album-head">
                <div>
                  <p className="eyebrow" style={{ justifyContent: "flex-start" }}>
                    {collection}
                    <span aria-hidden>·</span>
                    {album.category}
                    <span aria-hidden>·</span>
                    {album.photo_count} photographs
                  </p>
                  <h2 id="archive-title" className="archive-title">
                    <DevelopReveal key={album.album_id} as="span">
                      {album.display_title}
                    </DevelopReveal>
                  </h2>
                  <p className="archive-subtitle">{album.subtitle}</p>
                  <p className="archive-intro">{album.intro}</p>
                </div>
                <div className="archive-album-tools">
                  <p className="archive-quality-note is-hd">
                    Original resolution · untouched
                  </p>
                  <p className="archive-progress" aria-live="polite">
                    <span
                      className="archive-progress-bar"
                      style={{
                        transform: `scaleX(${
                          photos.length ? loadedCount / photos.length : 0
                        })`,
                      }}
                      aria-hidden
                    />
                    {loadedCount < photos.length
                      ? `Loading originals · ${loadedCount} / ${photos.length}`
                      : `All ${photos.length} originals loaded`}
                  </p>
                  <a
                    href={collectionSourceUrl(album.collection_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="archive-source"
                  >
                    Source archive ↗
                  </a>
                </div>
              </div>

              <div className="archive-grid">
                {photos.map((photo, index) => (
                  <button
                    key={photo.photo_id}
                    type="button"
                    className="archive-tile"
                    onClick={(event) => {
                      tileTriggers.current = event.currentTarget;
                      setLightbox(index);
                    }}
                    aria-label={`Open ${photo.display_title} from ${photo.album_title}`}
                  >
                    <span className="archive-tile-media">
                      {/* Only the untouched original is rendered here — no
                          compressed preview in the photography archive. */}
                      <AlbumOriginal
                        photoId={photo.photo_id}
                        src={photoSrc(photo)}
                        alt={`${photo.display_title} — ${photo.album_title}`}
                        priority={index < 3}
                        onLoaded={() =>
                          setLoadedCount((count) =>
                            count < photos.length ? count + 1 : count
                          )
                        }
                      />
                    </span>
                    <span className="archive-tile-caption">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span className="archive-tile-name">
                        {photo.display_title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <ArchiveLightbox
            key={albumId}
            photo={photos[lightbox]}
            album={album}
            photos={photos}
            index={lightbox}
            onIndex={setLightbox}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ArchiveLightbox({
  photo,
  album,
  photos,
  index,
  onIndex,
  onClose,
}: {
  photo: Photo;
  album: Album;
  photos: Photo[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [photo.photo_id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (index > 0) onIndex(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (index < photos.length - 1) onIndex(index + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onIndex]);

  return (
    <motion.div
      className="ps-viewer archive-lightbox"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-photo-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="overlay-close ps-viewer-close"
        onClick={onClose}
        aria-label="Close photograph"
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
        className="ps-viewer-grid"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.figure
          key={photo.photo_id}
          className="ps-viewer-image"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div
            className="ps-viewer-stage"
            style={{ touchAction: "pan-y" }}
            onPointerDown={(event) => {
              swipeStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
            }}
            onPointerUp={(event) => {
              const start = swipeStart.current;
              swipeStart.current = null;
              if (!start || start.id !== event.pointerId) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
              if (dx < 0 && index < photos.length - 1) onIndex(index + 1);
              else if (dx > 0 && index > 0) onIndex(index - 1);
            }}
          >
            {/* Same original-only loader, so the viewer reuses the cache. */}
            <AlbumOriginal
              photoId={photo.photo_id}
              src={photoSrc(photo)}
              alt={`${photo.display_title} — ${photo.album_title}`}
              priority
            />
            <a
              className="ps-viewer-original-link"
              href={photo.source_url}
              target="_blank"
              rel="noreferrer"
            >
              Open original ↗
            </a>
          </div>
          <figcaption>
            <span>
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <span>{photo.photo_id}</span>
          </figcaption>
        </motion.figure>

        <aside className="ps-viewer-panel">
          <p className="eyebrow">
            {getCollectionTitle(photo.collection_id) || "Archive"}
            <span aria-hidden>·</span>
            {photo.category}
          </p>
          <h3 className="ps-album-title">{photo.album_title}</h3>
          <p className="ps-album-subtitle">{album.subtitle}</p>
          <p className="ps-album-intro">{album.intro}</p>

          <div className="ps-photo-notes">
            <p className="eyebrow">Image notes</p>
            <h4 id="archive-photo-title">{photo.display_title}</h4>
            <p>{photo.caption}</p>
          </div>

          <div className="ps-viewer-nav">
            <button
              type="button"
              onClick={() => onIndex(index - 1)}
              disabled={index === 0}
              aria-label="Previous photograph"
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
              Prev
            </button>
            <span aria-live="polite">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => onIndex(index + 1)}
              disabled={index === photos.length - 1}
              aria-label="Next photograph"
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

          <a
            className="ps-source-link"
            href={collectionSourceUrl(photo.collection_id)}
            target="_blank"
            rel="noreferrer"
          >
            Source archive ↗
          </a>
        </aside>
      </div>
    </motion.div>
  );
}

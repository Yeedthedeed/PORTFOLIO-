import { useEffect, useRef, useState } from "react";
import { originalHosts, resolveOriginalUrl } from "../utils/media";

/**
 * ALBUM ORIGINAL — used exclusively by the photography archive.
 *
 * Displays ONLY the untouched master photograph. No compressed preview is ever
 * rendered in the archive grid.
 *
 * Speed comes from delivery rather than from altering the file:
 *
 *   • Nothing is requested until the tile is within 800px of the viewport.
 *   • A global queue caps simultaneous downloads at four.
 *   • Resolved files are kept in an in-memory cache, so returning to an album
 *     paints instantly (the browser HTTP cache backs this up across reloads).
 *   • Hosts are tried in order: jsDelivr → GitHub raw → statically mirror.
 *   • Files GitHub mislabels as octet-stream are re-wrapped as image Blobs.
 *   • A neutral skeleton fills the frame while loading — never a broken image.
 */

const MAX_CONCURRENT = 4;
const CACHE_LIMIT = 40;

type Task = () => void;
const queue: Task[] = [];
let running = 0;

/** Album-scoped cache of renderable original URLs. */
const resolved = new Map<string, string>();
const revision = new Set<(url: string) => void>();

function remember(key: string, url: string) {
  resolved.set(key, url);
  if (resolved.size > CACHE_LIMIT) {
    const oldest = resolved.keys().next().value;
    if (oldest && oldest !== key) {
      const stale = resolved.get(oldest);
      if (stale?.startsWith("blob:")) URL.revokeObjectURL(stale);
      resolved.delete(oldest);
    }
  }
  revision.forEach((listener) => listener(url));
}

function pump() {
  while (running < MAX_CONCURRENT && queue.length) {
    const task = queue.shift();
    if (!task) break;
    running += 1;
    task();
  }
}

function release() {
  running = Math.max(0, running - 1);
  pump();
}

function loadOriginal(sourceUrl: string): Promise<string> {
  const cached = resolved.get(sourceUrl);
  if (cached) return Promise.resolve(cached);

  return new Promise<string>((resolve) => {
    /* jsDelivr is the fastest host and returns a correct image MIME type for
       nearly every file. Try it first, then the remaining mirrors. */
    const hosts = originalHosts(sourceUrl).sort((a, b) =>
      a.includes("cdn.jsdelivr.net") ? -1 : b.includes("cdn.jsdelivr.net") ? 1 : 0
    );
    let index = 0;

    const attempt = () => {
      if (index >= hosts.length) {
        /* Bytes may be served with a non-image MIME type. Re-wrap them. */
        resolveOriginalUrl(sourceUrl).then((url) => {
          if (url) {
            remember(sourceUrl, url);
            resolve(url);
          } else {
            resolve("");
          }
        });
        return;
      }
      const url = hosts[index++];
      const probe = new Image();
      probe.decoding = "async";
      probe.onload = () => {
        remember(sourceUrl, url);
        resolve(url);
      };
      probe.onerror = attempt;
      probe.src = url;
    };
    attempt();
  });
}

export default function AlbumOriginal({
  photoId,
  src,
  alt,
  priority = false,
  onLoaded,
  /** Called once with the delivered file's natural dimensions. */
  onDimensions,
}: {
  photoId: string;
  src: string;
  alt: string;
  priority?: boolean;
  onLoaded?: () => void;
  /** (width, height) of the untouched original as delivered. */
  onDimensions?: (width: number, height: number) => void;
}) {
  const [display, setDisplay] = useState<string>(() => resolved.get(src) ?? "");
  const [loaded, setLoaded] = useState(() => resolved.has(src));
  const ref = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cancelled = useRef(false);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    cancelled.current = false;
    const cached = resolved.get(src);
    if (cached) {
      setDisplay(cached);
      setLoaded(true);
      return () => {
        cancelled.current = true;
      };
    }
    setDisplay("");
    setLoaded(false);

    const listener = (url: string) => {
      if (cancelled.current || resolved.get(src) !== url) return;
      setDisplay(url);
    };
    revision.add(listener);

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      queue.push(() => {
        if (cancelled.current) {
          release();
          return;
        }
        loadOriginal(src)
          .then((url) => {
            if (cancelled.current) return;
            if (url) setDisplay(url);
          })
          .finally(release);
      });
      pump();
    };

    const node = ref.current;
    if (priority || typeof IntersectionObserver === "undefined" || !node) {
      start();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            start();
          }
        },
        { rootMargin: "800px 0px" }
      );
      observer.observe(node);
      return () => {
        cancelled.current = true;
        revision.delete(listener);
        observer.disconnect();
      };
    }

    return () => {
      cancelled.current = true;
      revision.delete(listener);
    };
  }, [src, priority]);

  return (
    <span
      ref={ref}
      className={`album-original${loaded ? " is-loaded" : ""}`}
      data-photo={photoId}
    >
      {!loaded && <span className="album-original-skeleton" aria-hidden />}
      {display && (
        <img
          ref={imageRef}
          src={display}
          alt={alt}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          draggable={false}
          onLoad={(event) => {
            setLoaded(true);
            onLoadedRef.current?.();
            const node = event.currentTarget;
            if (onDimensions && node.naturalWidth > 0) {
              onDimensions(node.naturalWidth, node.naturalHeight);
            }
          }}
          onError={() => {
            setDisplay("");
            setLoaded(false);
          }}
        />
      )}
    </span>
  );
}

import { useEffect, useRef, useState } from "react";

/**
 * MEDIA IMAGE — a display surface for an original archive file.
 * The primary source is tried first, then the central resolver's mirrors and
 * MIME repair. Nothing is ever cropped, filtered or re-compressed.
 */
export default function MediaImage({
  src,
  fallbackSrc,
  alt,
  className,
  style,
  loading = "lazy",
  fetchPriority,
  draggable,
  width,
  height,
  onLoad,
  sizes,
  onFinalError,
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  draggable?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  onLoad?: (naturalWidth: number, naturalHeight: number) => void;
  onFinalError?: () => void;
}) {
  const [current, setCurrent] = useState(src);
  const tried = useRef(new Set<string>([src]));
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    tried.current = new Set([src]);
    setCurrent(src);
    setLoaded(false);
  }, [src]);

  /*
   * An image that is already decoded (an embedded data URI, or a warm HTTP
   * cache) can finish before React attaches its load listener. Checking
   * `complete` here prevents the portrait ever remaining at opacity 0.
   */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      onLoad?.(img.naturalWidth, img.naturalHeight);
    }
    const t = window.setTimeout(() => setLoaded(true), 1600);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const step = () => {
    if (fallbackSrc && !tried.current.has(fallbackSrc)) {
      tried.current.add(fallbackSrc);
      setCurrent(fallbackSrc);
      return;
    }
    onFinalError?.();
  };

  return (
    <img
      ref={imgRef}
      src={current}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      draggable={draggable}
      decoding="async"
      data-loaded={loaded ? "true" : "false"}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.55s ease",
      }}
      onLoad={(event) => {
        setLoaded(true);
        const img = event.currentTarget;
        onLoad?.(img.naturalWidth, img.naturalHeight);
      }}
      onError={step}
    />
  );
}

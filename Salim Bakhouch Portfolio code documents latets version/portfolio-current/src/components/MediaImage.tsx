import { useEffect, useRef, useState } from "react";

/**
 * An image element for the *unmodified original* file.
 *
 * Nothing here alters the picture. It only coordinates delivery:
 *   • optional deferred source assignment (so a 45-image ribbon does not
 *     download hundreds of megabytes at once)
 *   • a neutral, non-image placeholder while bytes arrive
 *   • a host fallback that serves the exact same file
 */
export default function MediaImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  style,
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  decoding = "async",
  draggable = false,
  onFinalError,
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "sync" | "auto";
  draggable?: boolean;
  onFinalError?: () => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (ref.current?.complete && ref.current.naturalWidth > 0) setReady(true);
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      draggable={draggable}
      data-ready={ready ? "true" : "false"}
      onLoad={() => setReady(true)}
      onError={(event) => {
        const img = event.currentTarget;
        if (fallbackSrc && img.dataset.fallback !== "1") {
          img.dataset.fallback = "1";
          img.src = fallbackSrc;
        } else {
          onFinalError?.();
        }
      }}
    />
  );
}

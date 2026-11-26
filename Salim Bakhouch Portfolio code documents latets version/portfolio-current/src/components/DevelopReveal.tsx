import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "../audio/SoundEngine";

/**
 * DEVELOP REVEAL
 *
 * A photographic interpretation of a shader text reveal, built with CSS masks
 * and gradients rather than WebGL: the line begins in darkness, a soft
 * darkroom light sweeps across it once, and the type settles.
 *
 * Nothing is distorted and no image is involved, so it costs one paint per
 * reveal and respects reduced motion.
 */
export default function DevelopReveal({
  children,
  delay = 0,
  as: Tag = "span",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "span" | "div" | "h2" | "h3" | "p";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setShown(true);
          /* Synchronised with the light sweep; the engine throttles overlap. */
          sfx.develop();
        }
      },
      { rootMargin: "-12% 0px -12% 0px" }
    );
    observer.observe(node);

    /* Safety net: type must never stay hidden if observation is interrupted
       (anchor jumps, overlay restores, bfcache). */
    const fallback = window.setTimeout(() => setShown(true), 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`develop${shown ? " is-developed" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      data-develop
    >
      {children}
    </Tag>
  );
}

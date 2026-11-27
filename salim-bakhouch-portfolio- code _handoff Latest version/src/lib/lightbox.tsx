import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { registerLightbox } from "../hooks/useLightboxBridge";
import { AnimatePresence, motion } from "framer-motion";

/* A single, shared viewing surface for every full-resolution original. */

export type LightboxItem = {
  src: string;
  title: string;
  eyebrow?: string;
  caption?: string;
  href?: string;
};

type ViewerState = {
  items: LightboxItem[];
  index: number;
  album?: string;
  albumHref?: string;
} | null;

const LightboxContext = createContext<{
  open: (items: LightboxItem[], index?: number, meta?: { album?: string; albumHref?: string }) => void;
}>({ open: () => {} });

export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ViewerState>(null);

  const open = useCallback(
    (items: LightboxItem[], index = 0, meta?: { album?: string; albumHref?: string }) => {
      setState({ items, index: Math.max(0, Math.min(index, items.length - 1)), ...meta });
    },
    []
  );

  const step = useCallback((delta: number) => {
    setState((current) =>
      current
        ? { ...current, index: (current.index + delta + current.items.length) % current.items.length }
        : current
    );
  }, []);

  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    registerLightbox(open);
    return () => registerLightbox(null);
  }, [open]);

  const value = useMemo(() => ({ open }), [open]);
  const item = state?.items[state.index];

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {state && item && (
          <motion.div
            className="lb"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} — full view`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
              if (event.key === "ArrowRight") step(1);
              if (event.key === "ArrowLeft") step(-1);
            }}
            tabIndex={-1}
            autoFocus
          >
            <div className="lb-bar">
              <div>
                <span className="lb-eyebrow">{item.eyebrow || "ORIGINAL FRAME"}</span>
                <h2 className="lb-title">{item.title}</h2>
              </div>
              <div className="lb-tools">
                <span className="lb-count">
                  {String(state.index + 1).padStart(2, "0")} / {String(state.items.length).padStart(2, "0")}
                </span>
                <a className="lb-link" href={item.src} target="_blank" rel="noreferrer">
                  Original ↗
                </a>
                <button type="button" className="lb-close" onClick={close} aria-label="Close full view">
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                    <path d="M2 2l8 8M10 2l-8 8" />
                  </svg>
                  Close
                </button>
              </div>
            </div>

            <div className="lb-stage">
              {state.items.length > 1 && (
                <button type="button" className="lb-nav lb-nav--prev" onClick={() => step(-1)} aria-label="Previous image">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                </button>
              )}
              <motion.img
                key={item.src}
                src={item.src}
                alt={item.caption || item.title}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                draggable={false}
              />
              {state.items.length > 1 && (
                <button type="button" className="lb-nav lb-nav--next" onClick={() => step(1)} aria-label="Next image">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </button>
              )}
            </div>

            <div className="lb-foot">
              <p>{item.caption || "Original file · untouched"}</p>
              <div className="lb-foot-right">
                {state.album && <span className="lb-album">{state.album}</span>}
                {state.albumHref && (
                  <a className="lb-link" href={state.albumHref} target="_blank" rel="noreferrer">
                    Source album ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}

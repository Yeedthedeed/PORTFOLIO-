/**
 * A tiny browser-level bridge so preserved, unmounted-in-App surfaces (the
 * photography gallery, for example) can open the one shared full-view viewer
 * without duplicating a lightbox implementation.
 */
export type BridgeItem = {
  src: string;
  title: string;
  eyebrow?: string;
  caption?: string;
};

type BridgeHandler = (
  items: BridgeItem[],
  index?: number,
  meta?: { album?: string; albumHref?: string }
) => void;

let handler: BridgeHandler | null = null;

export function registerLightbox(next: BridgeHandler | null) {
  handler = next;
}

export function openLightbox(
  items: BridgeItem[],
  index = 0,
  meta?: { album?: string; albumHref?: string }
) {
  handler?.(items, index, meta);
}

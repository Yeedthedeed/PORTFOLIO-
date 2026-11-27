import type { Photo } from "../data/photographyManifest";
import type { FilmStill } from "../data/filmStills";
import { filmPreviewUrl, photoPreviewUrl } from "../data/previews";
import { PORTRAIT_INLINE } from "../assets/portraitInline";

/**
 * ORIGINAL MEDIA ONLY
 *
 * Every image shown by this website is the original file exactly as it exists
 * in the source archive. There are no resized, re-encoded, cropped, filtered
 * or regenerated copies anywhere in the project.
 *
 * Delivery is what makes this usable:
 *   1. jsDelivr's GitHub cache — global, immutable, byte-identical.
 *   2. GitHub raw — the same original bytes, used as a fallback.
 *   3. statically.io — a third mirror for the same bytes.
 *
 * Browsers cache originals after the first view, so repeat visits are instant.
 */

const RAW_PREFIX =
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/";
const CDN_PREFIX = "https://cdn.jsdelivr.net/gh/Yeedthedeed/PORTFOLIO-@main/";
const STATICALLY_PREFIX =
  "https://cdn.statically.io/gh/Yeedthedeed/PORTFOLIO-/main/";

/**
 * Files above jsDelivr's 20 MB limit (plus four that GitHub mislabels as
 * `application/octet-stream`). Requested from the raw origin first.
 */
const RAW_FIRST = new Set<string>([
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Architectural%20Photography/LR-8.jpg",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Comertial%20shooting/Cosmito%20shooting%20colored/_DSC8892-2.jpg",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Elring/DSC_0058.jpg",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Untitled-3.jpg",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Mael/LR-67.JPG",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Yan/3.png",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Yan/4.JPG",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Youthful%20exuberance/SCENE-5-.png",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Youthful%20exuberance/Scene-7-.png",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Willy/LR-62_3_.jpg",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Willy/LR-79.JPG",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Phtotgraphy%20sphere%20assets/Skate%20up/Yan/1.JPG",
  "https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/Film%20Stills/DELUSION%20OF%20NEGATION%20short%20film%20Stills/Copie%20de%20Still%202026-01-28%20151436_1.41.1.png",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function mimeFor(url: string): string {
  const clean = url.split("?")[0];
  const ext = clean.slice(clean.lastIndexOf(".") + 1).toLowerCase();
  return MIME_BY_EXTENSION[ext] ?? "image/jpeg";
}

function toCdn(url: string): string {
  return url.startsWith(RAW_PREFIX)
    ? CDN_PREFIX + url.slice(RAW_PREFIX.length)
    : url;
}

function toStatically(url: string): string {
  return url.startsWith(RAW_PREFIX)
    ? STATICALLY_PREFIX + url.slice(RAW_PREFIX.length)
    : url;
}

/** All hosts for the identical original bytes, best first. */
export function originalHosts(sourceUrl: string): string[] {
  const rawFirst = RAW_FIRST.has(sourceUrl);
  const list = rawFirst
    ? [sourceUrl, toCdn(sourceUrl), toStatically(sourceUrl)]
    : [toCdn(sourceUrl), sourceUrl, toStatically(sourceUrl)];
  return Array.from(new Set(list.filter(Boolean)));
}

/** Primary original URL (byte-identical, globally cached). */
export const photoSrc = (photo: Photo): string => originalHosts(photo.source_url)[0];
export const filmSrc = (film: FilmStill): string => originalHosts(film.url)[0];

/* ── Inline gallery previews ──────────────────────────────────
 * Baked Base64 WebP delivered inside the document. Used by the small
 * gallery cards, sphere and film ribbons. Viewers use the originals.
 * Masters are never modified.
 * ------------------------------------------------------------ */
export const photoThumb = (photo: Photo): string =>
  photoPreviewUrl(photo.photo_id) || originalHosts(photo.source_url)[0];

export const filmThumb = (film: FilmStill): string =>
  filmPreviewUrl(film.id) || originalHosts(film.url)[0];

/*
 * The landing portrait is the owner-designated master
 * "Landing page profile pictuer - Copy/the main portfolio picture.png".
 * It is byte-identical to the previously referenced `3 .png`; naming it
 * explicitly keeps the source of the hero photograph traceable.
 */
const PORTRAIT_PATH =
  "Landing%20page%20profile%20pictuer%20-%20Copy/the%20main%20portfolio%20picture.png";
const POSTER_PATH =
  "Films%20Posters/DELUSION%20OF%20NEGATION%20-%20Short%20Film%20Poster.jpg";

/* The hero is embedded with the document so it is always visible, including on
 * a slow network or when the external GitHub mirrors are blocked. */
export const PORTRAIT_SRC = PORTRAIT_INLINE;
export const PORTRAIT_ORIGINAL_URL = RAW_PREFIX + PORTRAIT_PATH;
export const POSTER_SRC = CDN_PREFIX + POSTER_PATH;
export const POSTER_ORIGINAL_URL = RAW_PREFIX + POSTER_PATH;
export const POSTER_ORIGINAL_SRC = POSTER_SRC;
export const POSTER_SLATE_SRC = POSTER_SRC;

const blobCache = new Map<string, Promise<string>>();

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  return fetch(url, { mode: "cors", credentials: "omit", signal: controller.signal })
    .finally(() => window.clearTimeout(timer));
}

/**
 * Returns a renderable URL for the untouched original. Mirrors are tried in
 * order; mislabelled files are re-wrapped as image Blobs (identical bytes).
 * Always resolves to a URL or an empty string — never hangs indefinitely.
 */
export function resolveOriginalUrl(url: string, timeoutMs = 30000): Promise<string> {
  const hosts = originalHosts(url);
  const key = hosts[0];
  const cached = blobCache.get(key);
  if (cached) return cached;

  const job = (async () => {
    for (const host of hosts) {
      try {
        const response = await fetchWithTimeout(host, timeoutMs);
        if (!response.ok) continue;
        const type = (response.headers.get("content-type") ?? "").toLowerCase();
        if (type.startsWith("image/")) return host;
        const blob = await response.blob();
        if (blob.size < 512) continue;
        return URL.createObjectURL(new Blob([blob], { type: mimeFor(url) }));
      } catch {
        /* next host */
      }
    }
    return "";
  })();

  blobCache.set(key, job);
  return job;
}

const originalCache = new Map<string, Promise<void>>();

/** Decode an original once and reuse it. */
export function preloadOriginal(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const cached = originalCache.get(url);
  if (cached) return cached;

  const job = resolveOriginalUrl(url).then(
    (display) =>
      new Promise<void>((resolve) => {
        if (!display) return resolve();
        const img = new Image();
        img.decoding = "async";
        const done = () =>
          typeof img.decode === "function"
            ? img.decode().then(() => resolve(), () => resolve())
            : resolve();
        img.onload = done;
        img.onerror = () => resolve();
        img.src = display;
      })
  );

  originalCache.set(url, job);
  return job;
}

/** Simple bounded loader shared by every gallery. */
export class ImageLoadQueue {
  private jobs: (() => void)[] = [];
  private inflight = 0;
  constructor(private readonly max = 3) {}
  push(job: () => void) {
    this.jobs.push(job);
    this.drain();
  }
  settle() {
    this.inflight = Math.max(0, this.inflight - 1);
    this.drain();
  }
  private drain() {
    while (this.inflight < this.max && this.jobs.length) {
      const job = this.jobs.shift();
      if (!job) break;
      this.inflight += 1;
      job();
    }
  }
}

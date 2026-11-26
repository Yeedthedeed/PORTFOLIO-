/// <reference types="vite/client" />

/* Vite URL imports that must remain separate files (never base64-inlined). */
declare module "*?url&no-inline" {
  const src: string;
  export default src;
}

interface Window {
  /** Set by the static-shell bootstrap when ?static=1 is requested. */
  __portfolioStatic?: boolean;
  /** Machine-readable portfolio summary for automated inspectors. */
  __PORTFOLIO__?: {
    name: string;
    owner: string;
    role: string;
    films: { title: string; credit: string; stills: number; watch?: string }[];
    photography: { photographs: number; albums: number };
    contact: string;
  };
}

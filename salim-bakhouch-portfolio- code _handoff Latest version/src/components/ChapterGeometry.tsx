/**
 * CHAPTER GEOMETRY — authored background architecture.
 *
 * Kandinsky-informed composition principles only: asymmetrical balance, scale
 * contrast, intersecting planes, arcs as directional devices, positive/negative
 * space. These are static structural surfaces that shape how light reads against
 * each chapter; they are not decorative objects and they never cross content.
 *
 * No animation, no pointer input, no randomness. Pure SVG, aria-hidden.
 */

export type GeometryPreset =
  | "hero"
  | "photography"
  | "filmography"
  | "featured"
  | "profile"
  | "contact";

export default function ChapterGeometry({ preset }: { preset: GeometryPreset }) {
  return (
    <div className={`chapter-geometry chapter-geometry--${preset}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="presentation">
        <defs>
          <linearGradient id={`plane-${preset}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#bcd9f6" stopOpacity="0.055" />
            <stop offset="0.55" stopColor="#5f92c9" stopOpacity="0.018" />
            <stop offset="1" stopColor="#0a1018" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`edge-${preset}`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor="#9fd0ff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#9fd0ff" stopOpacity="0.30" />
            <stop offset="1" stopColor="#9fd0ff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {preset === "hero" && (
          <g>
            <rect x="540" y="-180" width="1220" height="900" transform="rotate(-7 540 -180)"
              fill={`url(#plane-hero)`} />
            <line x1="540" y1="-180" x2="1760" y2="660" stroke={`url(#edge-hero)`} strokeWidth="1" />
            <path d="M -40 720 A 430 430 0 0 1 470 300" fill="none"
              stroke="#9fd0ff" strokeOpacity="0.11" strokeWidth="1" />
            <path d="M 20 790 A 500 500 0 0 1 540 320" fill="none"
              stroke="#9fd0ff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="2 9" />
            <line x1="150" y1="905" x2="1450" y2="905" stroke="#c9d5e3" strokeOpacity="0.07" />
            <circle cx="1318" cy="212" r="3" fill="#cfe9ff" fillOpacity="0.5" />
          </g>
        )}

        {preset === "photography" && (
          <g>
            <path d="M 120 160 A 470 470 0 0 1 1060 160" fill="none"
              stroke="#8fd2ff" strokeOpacity="0.13" strokeWidth="1" />
            <path d="M 186 222 A 400 400 0 0 1 994 222" fill="none"
              stroke="#8fd2ff" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="3 11" />
            <line x1="0" y1="500" x2="1600" y2="500" stroke="#c9d5e3" strokeOpacity="0.045" />
            <line x1="800" y1="40" x2="800" y2="270" stroke="#c9d5e3" strokeOpacity="0.05" />
            <rect x="1180" y="708" width="420" height="1" fill="#c9d5e3" opacity="0.08" />
            <circle cx="1280" cy="163" r="2.5" fill="#cfe9ff" fillOpacity="0.55" />
          </g>
        )}

        {/* Filmography: intentionally no geometry. The film chapters are one
            continuous field; any plane or arc here reads as a rectangle or a
            seam between the chapter header and the first ribbon. */}

        {preset === "featured" && (
          <g>
            <rect x="120" y="70" width="1180" height="880" fill="none"
              stroke="#c9d5e3" strokeOpacity="0.055" />
            <line x1="120" y1="70" x2="120" y2="150" stroke="#c9d5e3" strokeOpacity="0.16" />
            <line x1="120" y1="70" x2="215" y2="70" stroke="#c9d5e3" strokeOpacity="0.16" />
            <path d="M 1000 120 L 1520 120 L 1520 640" fill="none"
              stroke="var(--c-ice)" strokeOpacity="0.16" strokeWidth="1" />
            <line x1="120" y1="905" x2="1520" y2="905" stroke="#c9d5e3" strokeOpacity="0.07" />
          </g>
        )}

        {preset === "profile" && (
          <g>
            <line x1="72" y1="120" x2="72" y2="900" stroke="#c9d5e3" strokeOpacity="0.06" />
            <path d="M 1100 -60 L 1720 560" stroke="#9fd0ff" strokeOpacity="0.055" strokeWidth="1" />
            <circle cx="1290" cy="740" r="250" fill="none"
              stroke="#9fd0ff" strokeOpacity="0.05" />
            <line x1="72" y1="900" x2="1520" y2="900" stroke="#c9d5e3" strokeOpacity="0.05" />
          </g>
        )}

        {preset === "contact" && (
          <g>
            <line x1="0" y1="240" x2="1600" y2="240" stroke="#c9d5e3" strokeOpacity="0.06" />
            <path d="M 1180 980 L 1660 420" stroke="#9fd0ff" strokeOpacity="0.07" strokeWidth="1" />
            <circle cx="1180" cy="980" r="330" fill="none"
              stroke="#9fd0ff" strokeOpacity="0.05" />
            <line x1="0" y1="760" x2="1600" y2="760" stroke="#c9d5e3" strokeOpacity="0.05" />
          </g>
        )}
      </svg>
    </div>
  );
}

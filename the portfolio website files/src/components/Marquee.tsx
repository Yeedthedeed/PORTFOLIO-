/**
 * MARQUEE — restored original discipline ticker.
 *
 * Acts as the transition between the landing atmosphere and the work.
 * Calm, confident pace (50s). Never a distraction.
 * Not a chapter title. Not a quote. Not an archive index.
 */

const WORDS = [
  "Cinematographer",
  "Director of Photography",
  "35mm",
  "Large Format",
  "Anamorphic",
  "Colorist",
  "Visual Storyteller",
];

const DOT = (
  <svg
    viewBox="0 0 8 8"
    aria-hidden="true"
    style={{
      width: 5,
      height: 5,
      color: "var(--accent)",
      flexShrink: 0,
      opacity: 0.7,
    }}
    fill="currentColor"
  >
    <circle cx="4" cy="4" r="2.5" />
  </svg>
);

export default function Marquee() {
  /* Double the list so the loop is seamless */
  const loop = [...WORDS, ...WORDS];

  return (
    <section
      aria-label="Disciplines"
      style={{
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
        borderTop: "1px solid rgba(238,243,250,0.08)",
        borderBottom: "1px solid rgba(238,243,250,0.08)",
        padding: "clamp(1rem, 2vw, 1.75rem) 0",
        background: "var(--bg)",
      }}
    >
      <div
        className="marquee-track"
        style={{ display: "flex", width: "max-content", alignItems: "center" }}
      >
        {loop.map((word, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center" }}
          >
            <span
              style={{
                padding: "0 clamp(1.25rem, 2.5vw, 2rem)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 350,
                fontSize: "clamp(1.5rem, 3.5vw, 3.5rem)",
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {word}
            </span>
            {DOT}
          </div>
        ))}
      </div>
    </section>
  );
}

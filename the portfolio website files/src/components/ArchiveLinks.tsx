import { motion } from "framer-motion";
import { useState } from "react";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * ARCHIVELINKS
 *
 * Two large editorial hyperlinks — Filmography / Photography —
 * centred directly below the portrait marquee.
 *
 * Hover behaviour:
 *   - Hovered item: full opacity, slight italic shift
 *   - Sibling dims to 30% — classic editorial focus technique
 *   - Sapphire accent line grows from left under the hovered item
 *   - Cursor expands to "hover" variant automatically via data-cursor
 */

const LINKS = [
  { label: "Filmography", href: "#filmography", key: "filmography" },
  { label: "Photography", href: "#photography", key: "photography" },
];

export default function ArchiveLinks({ onPhotographyOpen, onFilmographyOpen }: { onPhotographyOpen?: () => void; onFilmographyOpen?: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: E }}
      style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "clamp(2.5rem, 8vw, 7rem)",
        padding: "clamp(3.5rem, 8vw, 7rem) var(--gutter)",
      }}
    >
      {LINKS.map(({ label, href, key }) => {
        const isHovered  = hovered === label;
        const isDimmed   = hovered !== null && !isHovered;

        return (
          <a
            key={label}
            href={href}
            data-cursor="hover"
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
            onClick={e => {
              if (key === "photography" && onPhotographyOpen) {
                e.preventDefault();
                onPhotographyOpen();
              }
              if (key === "filmography" && onFilmographyOpen) {
                e.preventDefault();
                onFilmographyOpen();
              }
            }}
            style={{
              position:       "relative",
              display:        "inline-block",
              fontFamily:     "var(--font-display)",
              fontWeight:     350,
              fontSize:       "clamp(2.2rem, 5.5vw, 6rem)",
              lineHeight:     1,
              letterSpacing:  "-0.03em",
              color:          "var(--ink)",
              textDecoration: "none",
              opacity:        isDimmed ? 0.28 : 1,
              fontStyle:      isHovered ? "italic" : "normal",
              transition:     "opacity 0.5s var(--ease-expo), font-style 0.01s",
            }}
          >
            {label}

            {/* Animated underline — sapphire accent */}
            <motion.span
              style={{
                position:   "absolute",
                left:       0,
                bottom:     "-4px",
                height:     "1px",
                background: "var(--accent)",
                display:    "block",
                transformOrigin: "left center",
              }}
              animate={{ width: isHovered ? "100%" : "0%" }}
              transition={{ duration: 0.55, ease: E }}
            />
          </a>
        );
      })}
    </motion.section>
  );
}

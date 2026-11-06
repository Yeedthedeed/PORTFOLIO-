import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * METACARD — film slate metadata panel, bottom-left.
 *
 * Hidden on mobile (< 768px) to prevent overlap with portrait
 * and page content. Visible on md+ where there is genuine space.
 */
export default function MetaCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.9, duration: 1.2, ease: E }}
      /* hidden on mobile, visible on md+ */
      className="hidden md:block"
      style={{
        position: "fixed",
        bottom: "clamp(1.5rem, 3vh, 2.5rem)",
        left: "var(--gutter)",
        zIndex: 30,
        width: "clamp(160px, 13vw, 200px)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "clamp(0.75rem, 1.5vw, 1rem)",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(238,243,250,0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Accent tab */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 0,
            height: 1,
            width: "38%",
            background: "var(--accent)",
          }}
        />

        {/* Label */}
        <div
          className="font-mono text-[9px] uppercase"
          style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
        >
          Now Filming
        </div>

        {/* Film strip icon */}
        <div
          style={{
            margin: "0.65rem 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 72 44"
            style={{ width: 56, height: 34, color: "rgba(238,243,250,0.65)" }}
          >
            <rect
              x="2" y="5" width="68" height="34"
              fill="none" stroke="currentColor" strokeWidth="1"
            />
            {Array.from({ length: 7 }).map((_, i) => (
              <rect
                key={`t${i}`}
                x={6 + i * 9} y="7"
                width="5" height="5"
                fill="currentColor" fillOpacity="0.5"
              />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <rect
                key={`b${i}`}
                x={6 + i * 9} y="32"
                width="5" height="5"
                fill="currentColor" fillOpacity="0.5"
              />
            ))}
            <rect
              x="16" y="16" width="40" height="12"
              fill="none" stroke="currentColor" strokeWidth="0.7"
            />
          </svg>
        </div>

        {/* Project placeholder */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "0.88rem",
            lineHeight: 1.3,
            color: "var(--ink)",
          }}
        >
          [Project Placeholder]
        </div>
        <div
          className="font-mono mt-1 text-[9px] uppercase"
          style={{ letterSpacing: "0.2em", color: "var(--muted)" }}
        >
          Feature · 35mm · 2026
        </div>

        {/* Studio mark */}
        <div
          style={{
            marginTop: "0.75rem",
            paddingTop: "0.6rem",
            borderTop: "1px solid rgba(238,243,250,0.07)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            viewBox="0 0 16 16"
            style={{ width: 12, height: 12, color: "var(--accent)" }}
            fill="currentColor"
          >
            <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" />
          </svg>
          <span
            className="font-mono text-[9px] uppercase"
            style={{ letterSpacing: "0.2em", color: "var(--ink-dim)", lineHeight: 1.4 }}
          >
            SB Studio<br />Est. MMXVIII
          </span>
        </div>
      </div>
    </motion.div>
  );
}

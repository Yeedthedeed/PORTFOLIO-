import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/**
 * WORKS — Version B (repaired)
 *
 * Editorial split layout — Option B per brief.
 * Large media dominates. Text anchors beside or below.
 * Alternating media position (left/right) on desktop via
 * explicit 2-column named-area grid — reliable at all breakpoints.
 * Mobile: always stacks naturally (media top, text below).
 *
 * Scroll reveal: fade + translate IN only.
 * No fade-out. Content stays visible once revealed.
 *
 * Real project data: none found in codebase.
 * All entries are honest editorial placeholders.
 * Missing: titles, years, roles, media URLs, descriptions.
 */

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Project = {
  id:     string;
  title:  string;
  year:   string;
  role:   string;
  format: string;
  desc:   string;
  flip:   boolean;  // true = media on right (text left) on desktop
};

const PROJECTS: Project[] = [
  {
    id:     "01",
    title:  "[Project Title Placeholder]",
    year:   "2026",
    role:   "Director of Photography",
    format: "35mm · 2.39:1 · Feature Film",
    desc:   "[Short editorial description of the project. Replace with authentic context when available.]",
    flip:   false,
  },
  {
    id:     "02",
    title:  "[Project Title Placeholder]",
    year:   "2025",
    role:   "Cinematographer",
    format: "ALEXA 35 · Short Film",
    desc:   "[Short editorial description. Replace with authentic context when available.]",
    flip:   true,
  },
  {
    id:     "03",
    title:  "[Project Title Placeholder]",
    year:   "2025",
    role:   "DP / Operator",
    format: "RED V-Raptor · Fashion Film",
    desc:   "[Short editorial description. Replace with authentic context when available.]",
    flip:   false,
  },
  {
    id:     "04",
    title:  "[Project Title Placeholder]",
    year:   "2024",
    role:   "Cinematographer",
    format: "16mm + Digital · Documentary",
    desc:   "[Short editorial description. Replace with authentic context when available.]",
    flip:   true,
  },
];

/* ── Media placeholder ───────────────────────────────────── */
function MediaBlock({ id }: { id: string }) {
  return (
    <div
      className="placeholder-media"
      role="img"
      aria-label={`Project ${id} — media placeholder`}
      style={{
        width: "100%",
        /* 16:9 aspect — cinematic */
        aspectRatio: "16 / 9",
        position: "relative",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Cinematic frame corners */}
      {[
        { top: "10%",    left: "5%",   borderTop: "1px solid rgba(238,243,250,0.18)", borderLeft: "1px solid rgba(238,243,250,0.18)" },
        { top: "10%",    right: "5%",  borderTop: "1px solid rgba(238,243,250,0.18)", borderRight: "1px solid rgba(238,243,250,0.18)" },
        { bottom: "10%", left: "5%",   borderBottom: "1px solid rgba(238,243,250,0.18)", borderLeft: "1px solid rgba(238,243,250,0.18)" },
        { bottom: "10%", right: "5%",  borderBottom: "1px solid rgba(238,243,250,0.18)", borderRight: "1px solid rgba(238,243,250,0.18)" },
      ].map((s, i) => (
        <div
          key={i}
          aria-hidden
          style={{ position: "absolute", width: 16, height: 16, ...s }}
        />
      ))}
      <span
        className="font-mono"
        style={{
          position: "absolute",
          bottom: "0.75rem",
          left: "1rem",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(238,243,250,0.22)",
        }}
      >
        {id} — Replace with real media
      </span>
    </div>
  );
}

/* ── Single project item ─────────────────────────────────── */
function ProjectItem({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 30%"],
  });

  /*
   * Reveal only — items stay visible once in view.
   * No fade-out on scroll. No disappearing content.
   */
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y       = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <motion.article
      ref={ref}
      style={{ opacity, y }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          padding: "clamp(2.5rem,5vw,5rem) var(--gutter)",
          borderBottom: "1px solid rgba(238,243,250,0.07)",
        }}
      >
        {/*
         * Layout grid:
         *   Mobile (<768px): single column, media first.
         *   Desktop (≥768px): two equal columns.
         *     flip=false → media left, text right
         *     flip=true  → text left, media right
         *
         * Using named grid-template-areas for reliable column swap.
         */}
        <div
          style={{
            display: "grid",
            gap: "clamp(2rem, 4vw, 4rem)",
            alignItems: "center",

            /* Mobile: single column */
            gridTemplateColumns: "1fr",
            gridTemplateAreas: `"media" "text"`,
          }}

          /* Desktop override via inline responsive hack using min() */
          className="works-grid"
          data-flip={project.flip ? "true" : "false"}
        >
          {/* Media */}
          <div style={{ gridArea: "media" }}>
            <motion.div
              style={{ overflow: "hidden", borderRadius: 1 }}
              animate={{ scale: hovered ? 1.015 : 1 }}
              transition={{ duration: 1.4, ease: E }}
            >
              <MediaBlock id={project.id} />
            </motion.div>
          </div>

          {/* Text */}
          <div
            style={{
              gridArea: "text",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(0.85rem, 1.5vw, 1.4rem)",
            }}
          >
            {/* Number + role pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
              <span
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", opacity: 0.65 }}
              >
                {project.id}
              </span>
              <span
                className="tag"
                style={{
                  color: hovered ? "var(--accent-bright)" : "var(--muted)",
                  borderColor: hovered ? "rgba(61,159,255,0.28)" : undefined,
                  transition: "color 0.5s ease, border-color 0.5s ease",
                }}
              >
                {project.role}
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-display"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 3.5rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
              }}
            >
              {project.title}
            </h3>

            {/* Format · Year */}
            <div
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <span>{project.format}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{project.year}</span>
            </div>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "clamp(0.875rem, 1.1vw, 0.975rem)",
                lineHeight: 1.7,
                color: "var(--ink-faint)",
                maxWidth: "42ch",
              }}
            >
              {project.desc}
            </p>

            {/* Action link — always visible */}
            <a
              href="#"
              data-cursor="hover"
              data-cursor-label="OPEN"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.65rem",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: hovered ? "var(--accent-bright)" : "var(--ink-faint)",
                transition: "color 0.5s ease",
                textDecoration: "none",
                width: "fit-content",
                marginTop: "0.25rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  height: 1,
                  width: hovered ? 32 : 18,
                  background: "currentColor",
                  transition: "width 0.5s ease",
                }}
              />
              View Project
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Section header ──────────────────────────────────────── */
function WorksHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div
      ref={ref}
      style={{
        padding: "clamp(3rem,6vw,6rem) var(--gutter) clamp(1.5rem,3vw,2.5rem)",
        borderBottom: "1px solid rgba(238,243,250,0.08)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <motion.div style={{ y: headY }}>
        <div
          className="font-mono flex items-center gap-2 text-[10px] uppercase"
          style={{
            letterSpacing: "0.28em",
            color: "var(--muted)",
            marginBottom: "clamp(0.6rem,1.2vw,1rem)",
          }}
        >
          <span
            style={{ display: "inline-block", width: 18, height: 1, background: "var(--accent)" }}
          />
          Selected Works
        </div>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 6.5rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.035em",
            fontStyle: "italic",
          }}
        >
          Filmography
        </h2>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: E }}
        className="hidden font-mono text-[10px] uppercase md:block"
        style={{ letterSpacing: "0.28em", color: "var(--muted)", paddingBottom: "0.3rem" }}
      >
        {PROJECTS.length} Entries
      </motion.span>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export default function Works() {
  return (
    <>
      {/*
       * Inline <style> for the desktop grid swap.
       * This is the cleanest way to handle named grid-area
       * responsive swap without adding a Tailwind plugin or
       * breaking SSR-safe inline styles.
       */}
      <style>{`
        @media (min-width: 768px) {
          .works-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .works-grid[data-flip="false"] {
            grid-template-areas: "media text" !important;
          }
          .works-grid[data-flip="true"] {
            grid-template-areas: "text media" !important;
          }
        }
      `}</style>

      <section
        id="work-section"
        style={{ position: "relative", zIndex: 10 }}
      >
        <WorksHeader />
        {PROJECTS.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </section>
    </>
  );
}

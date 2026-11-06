import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * SECTION 3 — SEQUENCE (variable height)
 *
 * 4 projects, each occupying 100–130vh.
 * Layout rotation: A → B → D → C
 * Between: 60–80vh chapter breaks with a single italic line.
 *
 * No grid. No index. No "Selected Work" heading. No view links.
 * Each project is revealed by scroll progress — image first, then text.
 *
 * PLACEHOLDER IMAGE RULE:
 *   All project visuals use placeholder-img shimmer only.
 *   Real MP4 loops and stills will be inserted by client.
 *   Aspect ratios locked: 2.39:1 / 16:9 / 4:3 only.
 */

/* ── Slate metadata component ────────────────────────────── */
function Slate({ roll, scene, year, desc, format }: {
  roll: string; scene: string; year: string; desc: string; format: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div className="t-mono" style={{ color: "var(--ink-dim)", opacity: 0.7 }}>
        ROLL {roll}&nbsp;&nbsp;/&nbsp;&nbsp;SCENE {scene}&nbsp;&nbsp;/&nbsp;&nbsp;{year}
      </div>
      <div className="t-mono" style={{ color: "var(--ink-dim)", opacity: 0.55 }}>
        {desc}
      </div>
      <div className="t-mono" style={{ color: "var(--ink-dim)", opacity: 0.55 }}>
        {format}
      </div>
    </div>
  );
}

/* ── Placeholder visual with shimmer ─────────────────────── */
function PlaceholderVisual({
  aspectRatio,
  style,
}: {
  aspectRatio: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio,
        background: `linear-gradient(
          90deg,
          rgba(255,255,255,0.025) 0%,
          rgba(255,255,255,0.06)  50%,
          rgba(255,255,255,0.025) 100%
        )`,
        backgroundSize: "200% 100%",
        animation: "shimmer 4s ease-in-out infinite",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Phantom frame mark */}
      <div
        style={{
          position: "absolute",
          inset: "8% 6%",
          border: "1px solid rgba(237,232,225,0.06)",
          pointerEvents: "none",
        }}
      />
      <span
        className="t-mono"
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "1rem",
          color: "rgba(237,232,225,0.2)",
          fontSize: 9,
        }}
      >
        [Visual Placeholder — replace with real asset]
      </span>
    </div>
  );
}

/* ── Scroll-revealed project wrapper ─────────────────────── */
function ProjectReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const sectionOp = useTransform(scrollYProgress, [0, 0.18, 0.8, 1], [0.15, 1, 1, 0.35]);
  const sectionY  = useTransform(scrollYProgress, [0, 0.18], [40, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity: sectionOp, y: sectionY, willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Layout A — Full Bleed Cinemascope ───────────────────── */
function LayoutA({ title, slate }: { title: string; slate: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgOp    = useTransform(scrollYProgress, [0.05, 0.32, 0.8, 0.95], [0.18, 1, 1, 0.4]);
  const titleOp  = useTransform(scrollYProgress, [0.36, 0.5], [0, 1]);
  const titleY   = useTransform(scrollYProgress, [0.36, 0.5], [16, 0]);
  const metaOp   = useTransform(scrollYProgress, [0.42, 0.55], [0, 0.6]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: "130vh",
        display: "flex",
        alignItems: "center",
        padding: "8vh 0",
        position: "relative",
      }}
    >
      {/* Full-bleed 2.39:1 with letterbox bars */}
      <div style={{ width: "100%", position: "relative" }}>
        <motion.div style={{ opacity: imgOp, position: "relative" }} className="letterbox-bars">
          <PlaceholderVisual aspectRatio="2.39 / 1" />
        </motion.div>

        {/* Title — bottom left */}
        <motion.div
          style={{
            opacity: titleOp,
            y: titleY,
            position: "absolute",
            bottom: "clamp(1.5rem, 5vh, 4rem)",
            left: "var(--gutter)",
            zIndex: 10,
          }}
        >
          <h2
            className="t-display"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 7rem)",
              color: "var(--ink)",
            }}
          >
            {title}
          </h2>
        </motion.div>

        {/* Metadata — bottom right */}
        <motion.div
          style={{
            opacity: metaOp,
            position: "absolute",
            bottom: "clamp(1.5rem, 5vh, 4rem)",
            right: "var(--gutter)",
            textAlign: "right",
            zIndex: 10,
          }}
        >
          {slate}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Layout B — Split Frame 60/40 ────────────────────────── */
function LayoutB({ title, sub, slate }: { title: string; sub: string; slate: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgOp   = useTransform(scrollYProgress, [0.05, 0.32, 0.8, 0.95], [0.18, 1, 1, 0.4]);
  const textOp  = useTransform(scrollYProgress, [0.38, 0.52], [0, 1]);
  const textY   = useTransform(scrollYProgress, [0.38, 0.52], [16, 0]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        padding: "6vh 0",
      }}
    >
      {/* Image — 60% */}
      <motion.div style={{ flex: "0 0 60%", opacity: imgOp }}>
        <PlaceholderVisual
          aspectRatio="4 / 3"
          style={{ height: "100%", aspectRatio: "unset" }}
        />
      </motion.div>

      {/* Text — 40% */}
      <motion.div
        style={{
          flex: "0 0 40%",
          opacity: textOp,
          y: textY,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 var(--gutter) clamp(2rem, 6vh, 5rem)",
        }}
      >
        <h2
          className="t-display"
          style={{ fontSize: "clamp(2rem, 4.5vw, 5.5rem)", color: "var(--ink)", marginBottom: "1rem" }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
            color: "var(--ink-dim)",
            lineHeight: 1.5,
            marginBottom: "2rem",
            maxWidth: "28ch",
          }}
        >
          {sub}
        </p>
        {slate}
      </motion.div>
    </div>
  );
}

/* ── Layout D — Letterbox + Pull Quote ───────────────────── */
function LayoutD({ title, quote, slate }: { title: string; quote: string; slate: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgOp    = useTransform(scrollYProgress, [0.05, 0.32, 0.8, 0.95], [0.18, 1, 1, 0.4]);
  const quoteOp  = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const quoteY   = useTransform(scrollYProgress, [0.42, 0.58], [16, 0]);
  const metaOp   = useTransform(scrollYProgress, [0.5, 0.62], [0, 0.6]);

  return (
    <div ref={ref} style={{ minHeight: "130vh", padding: "6vh 0 0" }}>
      {/* 16:9 image */}
      <motion.div style={{ opacity: imgOp }}>
        <PlaceholderVisual aspectRatio="16 / 9" />
      </motion.div>

      {/* Below image — pull quote + meta */}
      <div
        style={{
          padding: "clamp(2rem, 6vh, 5rem) var(--gutter)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "3rem",
          minHeight: "40vh",
        }}
      >
        <motion.div style={{ opacity: quoteOp, y: quoteY, flex: "0 0 42%" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(1.2rem, 2.2vw, 2rem)",
              lineHeight: 1.4,
              color: "var(--ink-dim)",
              maxWidth: "40ch",
            }}
          >
            &ldquo;{quote}&rdquo;
          </p>
          <p
            className="t-mono"
            style={{ color: "var(--ink-dim)", opacity: 0.5, marginTop: "1.2rem" }}
          >
            {title}
          </p>
        </motion.div>

        <motion.div style={{ opacity: metaOp, alignSelf: "flex-end" }}>
          {slate}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Layout C — Diptych ──────────────────────────────────── */
function LayoutC({ title, slate }: { title: string; slate: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgOp   = useTransform(scrollYProgress, [0.05, 0.32, 0.8, 0.95], [0.18, 1, 1, 0.4]);
  const titleOp = useTransform(scrollYProgress, [0.4, 0.54], [0, 1]);
  const metaOp  = useTransform(scrollYProgress, [0.48, 0.62], [0, 0.6]);

  return (
    <div ref={ref} style={{ minHeight: "110vh", padding: "8vh var(--gutter)" }}>
      {/* Two stills side by side */}
      <motion.div
        style={{
          opacity: imgOp,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(0.5rem, 1.5vw, 1.5rem)",
          position: "relative",
        }}
      >
        <PlaceholderVisual aspectRatio="4 / 3" />
        <PlaceholderVisual aspectRatio="4 / 3" />

        {/* Title — floating between frames, centered */}
        <motion.div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: titleOp,
            textAlign: "center",
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <h2
            className="t-display"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 4rem)",
              color: "var(--ink)",
              textShadow: "0 2px 40px rgba(11,10,9,0.9)",
              background: "rgba(11,10,9,0.4)",
              padding: "0.3em 0.6em",
            }}
          >
            {title}
          </h2>
        </motion.div>
      </motion.div>

      {/* Metadata below */}
      <motion.div
        style={{
          opacity: metaOp,
          paddingTop: "clamp(1.5rem, 3vh, 2.5rem)",
          textAlign: "center",
        }}
      >
        {slate}
      </motion.div>
    </div>
  );
}

/* ── Chapter Break ───────────────────────────────────────── */
function ChapterBreak({ text, height = "80vh" }: { text: string; height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0.2, 0.45, 0.65, 0.85], [0, 0.4, 0.4, 0]);

  return (
    <div
      ref={ref}
      style={{
        height,
        display: "flex",
        alignItems: "center",
        padding: "0 var(--gutter)",
        background: "var(--bg-base)",
      }}
    >
      <motion.p
        style={{ opacity }}
        className="t-display"
      >
        <span
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(1.2rem, 2.5vw, 2.4rem)",
            color: "var(--ink)",
            display: "block",
            maxWidth: "38ch",
          }}
        >
          {text}
        </span>
      </motion.p>
    </div>
  );
}

/* ── Black dissolve between projects ─────────────────────── */
function Dissolve() {
  return (
    <div
      aria-hidden
      style={{ height: "60vh", background: "var(--bg-base)" }}
    />
  );
}

/* ── Main Sequence ───────────────────────────────────────── */
export default function Sequence() {
  return (
    <section id="sequence" style={{ position: "relative", zIndex: 10 }}>

      {/* PROJECT 01 — Layout A */}
      <ProjectReveal>
        <LayoutA
          title="[Feature Film Placeholder]"
          slate={
            <Slate
              roll="04" scene="12" year="2024"
              desc="DIRECTED, SHOT"
              format="35MM · 2.39:1"
            />
          }
        />
      </ProjectReveal>

      <Dissolve />

      {/* PROJECT 02 — Layout B */}
      <ProjectReveal>
        <LayoutB
          title="[Short Film Placeholder]"
          sub="[One-line editorial description of the project's thematic and visual approach — placeholder.]"
          slate={
            <Slate
              roll="02" scene="08" year="2025"
              desc="SHOT"
              format="ALEXA 35 · 4.6K · 1.66:1"
            />
          }
        />
      </ProjectReveal>

      {/* Chapter break A→D */}
      <ChapterBreak
        text="Work that taught me how to see."
        height="80vh"
      />

      {/* PROJECT 03 — Layout D */}
      <ProjectReveal>
        <LayoutD
          title="[Documentary Placeholder]"
          quote="[Pull quote from director's notes — a sentence about the image or the subject. One thought, held in space.]"
          slate={
            <Slate
              roll="01" scene="21" year="2024"
              desc="DIRECTED, SHOT, EDITED"
              format="16MM + DIGITAL · 1.66:1"
            />
          }
        />
      </ProjectReveal>

      <Dissolve />

      {/* PROJECT 04 — Layout C */}
      <ProjectReveal>
        <LayoutC
          title="[Fashion Film Placeholder]"
          slate={
            <Slate
              roll="07" scene="03" year="2025"
              desc="SHOT"
              format="RED V-RAPTOR · 8K · 2.39:1"
            />
          }
        />
      </ProjectReveal>

    </section>
  );
}

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * ABOUT — repaired.
 * Clean, readable two-column profile section.
 * No overdesign. Consistent with the original site identity.
 * Placeholder content clearly marked for replacement.
 */
export default function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -25]);

  return (
    <section
      ref={ref}
      id="about"
      style={{
        position: "relative",
        zIndex: 10,
        padding: "clamp(4rem,8vw,8rem) var(--gutter)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(3rem,7vw,7rem)",
          alignItems: "start",
        }}
      >
        {/* ── Left column: heading + stats ───────────────── */}
        <motion.div style={{ y: y1 }}>
          {/* Section label */}
          <div
            className="font-mono flex items-center gap-2 text-[10px] uppercase"
            style={{
              letterSpacing: "0.28em",
              color: "var(--muted)",
              marginBottom: "clamp(1rem, 2vw, 1.5rem)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 1,
                background: "var(--accent)",
              }}
            />
            Profile
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 350,
              fontSize: "clamp(2rem, 5vw, 5.5rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            Light is a{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              language
            </span>
            .<br />
            I write with it.
          </h2>

          {/* Stats grid */}
          <div
            style={{
              marginTop: "clamp(2rem, 4vw, 3.5rem)",
              paddingTop: "clamp(1.5rem, 3vw, 2.5rem)",
              borderTop: "1px solid rgba(238,243,250,0.08)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(1.25rem, 2.5vw, 2rem)",
            }}
          >
            {[
              { n: "—", l: "Years on set" },
              { n: "—", l: "Projects shot" },
              { n: "—", l: "Festival selections" },
              { n: "—", l: "Continents filmed" },
            ].map((s) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, ease: E }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 350,
                    fontSize: "clamp(1.75rem, 3.5vw, 3.5rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "var(--ink)",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="font-mono mt-2 text-[10px] uppercase"
                  style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
                >
                  {s.l}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Right column: bio + tools ───────────────────── */}
        <motion.div
          style={{ y: y2, display: "flex", flexDirection: "column", gap: "clamp(1.25rem, 2.5vw, 2rem)" }}
        >
          {/* Opening statement — italic display */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.1, ease: E }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 350,
              fontSize: "clamp(1.15rem, 2.2vw, 2rem)",
              lineHeight: 1.32,
              color: "var(--ink-dim)",
            }}
          >
            [Biography Placeholder]
          </motion.p>

          {/* Body paragraphs */}
          {[
            "[Extended biography — first paragraph. Training, influences, cinematic identity. Replace with authentic text.]",
            "[Second paragraph. Aesthetic approach: light, film stocks, collaboration philosophy. Replace with authentic text.]",
            "[Third paragraph. Current practice, ongoing projects, future direction. Replace with authentic text.]",
          ].map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08, duration: 1, ease: E }}
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "clamp(0.88rem, 1.2vw, 1rem)",
                lineHeight: 1.75,
                color: i === 0 ? "var(--ink-dim)" : "var(--muted)",
              }}
            >
              {para}
            </motion.p>
          ))}

          {/* Tools — compact pill list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.9, ease: E }}
            style={{
              paddingTop: "clamp(1rem, 2vw, 1.75rem)",
              borderTop: "1px solid rgba(238,243,250,0.08)",
            }}
          >
            <div
              className="font-mono mb-3 text-[10px] uppercase"
              style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
            >
              Tools &amp; Equipment
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {[
                "ARRI ALEXA 35",
                "ALEXA Mini LF",
                "RED V-Raptor",
                "Sony Venice 2",
                "35mm Vision3",
                "16mm Eterna",
                "Baselight",
              ].map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

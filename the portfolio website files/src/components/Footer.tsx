import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * FOOTER — repaired contact section.
 * Clean conclusion. No giant empty scroll space.
 * The "Let's shoot." CTA scales up naturally on scroll entry.
 * Contact info clearly accessible. Socials listed plainly.
 */
export default function Footer() {
  const ref  = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale   = useTransform(scrollYProgress, [0, 0.6], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <footer
      ref={ref}
      id="contact"
      style={{
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
        padding:
          "clamp(4rem,8vw,8rem) var(--gutter) clamp(2rem,4vw,3.5rem)",
      }}
    >
      <div
        style={{
          borderTop: "1px solid rgba(238,243,250,0.08)",
          paddingTop: "clamp(3rem,6vw,6rem)",
        }}
      >
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: E }}
          className="font-mono flex items-center gap-2 text-[10px] uppercase"
          style={{
            letterSpacing: "0.28em",
            color: "var(--muted)",
            marginBottom: "clamp(1.5rem, 3vw, 3rem)",
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
          Contact
        </motion.div>

        {/* CTA headline */}
        <motion.div style={{ scale, opacity, transformOrigin: "bottom left" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 350,
              fontSize: "clamp(4rem, 13vw, 14rem)",
              lineHeight: 0.86,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
            }}
          >
            Let's{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              shoot
            </span>
            .
          </h2>
        </motion.div>

        {/* Contact details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "clamp(1.5rem, 3vw, 3rem)",
            marginTop: "clamp(3rem, 6vw, 6rem)",
            paddingTop: "clamp(1.5rem, 3vw, 2.5rem)",
            borderTop: "1px solid rgba(238,243,250,0.08)",
          }}
        >
          {[
            { label: "Enquiries",      val: "[email@placeholder.com]" },
            { label: "Press",          val: "[press@placeholder.com]" },
            { label: "Representation", val: "[rep@placeholder.com]" },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.07, duration: 0.9, ease: E }}
            >
              <div
                className="font-mono mb-2 text-[10px] uppercase"
                style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
              >
                {c.label}
              </div>
              <a
                href="#"
                className="link-underline"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 350,
                  fontSize: "clamp(0.9rem, 1.6vw, 1.3rem)",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                {c.val}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: 0.12, duration: 0.9, ease: E }}
          style={{
            marginTop: "clamp(2rem, 4vw, 3.5rem)",
            paddingTop: "clamp(1.5rem, 3vw, 2.5rem)",
            borderTop: "1px solid rgba(238,243,250,0.08)",
          }}
        >
          <div
            className="font-mono mb-4 text-[10px] uppercase"
            style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
          >
            Elsewhere
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(1.25rem, 2.5vw, 2rem)",
            }}
          >
            {["Vimeo", "Instagram", "IMDb", "Letterboxd", "Are.na"].map(
              (s) => (
                <a
                  key={s}
                  href="#"
                  className="link-underline"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 350,
                    fontSize: "clamp(1rem, 1.6vw, 1.5rem)",
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                >
                  {s}
                </a>
              )
            )}
          </div>
        </motion.div>

        {/* Legal bar */}
        <div
          style={{
            marginTop: "clamp(2.5rem, 5vw, 4.5rem)",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(238,243,250,0.07)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {[
            "© MMXXVI — Salim Bakhouch",
            "Cinematographer · DOP",
            "Etherealism v2",
          ].map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] uppercase"
              style={{ letterSpacing: "0.24em", color: "var(--muted)", opacity: 0.6 }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

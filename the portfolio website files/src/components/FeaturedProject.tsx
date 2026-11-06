import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useMouse } from "../hooks/useMouse";

/**
 * FEATURED PROJECT — "DELUSION OF NEGATION"
 *
 * Editorial split composition:
 *   LEFT  — the official film poster, framed like a museum piece,
 *           with scroll parallax and a subtle cursor tilt.
 *   RIGHT — title, director credit, cast and key credits,
 *           set in the site's editorial type system.
 *
 * Poster asset lives at /delusion-poster.jpg — drop the original
 * artwork file there to ship the real poster.
 */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * The film's viewing link — replace this single constant with the
 * real URL (Vimeo / festival / screening page) once it is uploaded.
 * While it is "#", clicks are safely neutralised.
 */
const FILM_URL = "#";

function Reveal({
  children,
  delay = 0,
  y = 26,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 1.1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function FeaturedProject() {
  const sectionRef = useRef<HTMLElement>(null);
  const [posterMissing, setPosterMissing] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Poster drifts up gently as the section scrolls — museum weight */
  const posterY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const posterScale = useTransform(scrollYProgress, [0, 0.5], [0.97, 1]);

  /* Subtle cursor tilt on the poster (kept well under 1deg) */
  const { hx, hy } = useMouse();
  const tiltX = useTransform(hy, [-1, 1], [0.7, -0.7]);
  const tiltY = useTransform(hx, [-1, 1], [-0.9, 0.9]);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured Project — Delusion of Negation"
      className="relative z-10 overflow-hidden"
      style={{ padding: "clamp(5rem, 10vw, 9rem) var(--gutter)" }}
    >
      {/* Section header */}
      <Reveal>
        <div
          className="mb-12 flex items-center gap-4 md:mb-16"
          style={{ color: "var(--muted)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-label">
            002 — Featured Project
          </span>
          <span
            className="h-px flex-1"
            style={{ background: "var(--hairline)" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-label">
            Feature Film
          </span>
        </div>
      </Reveal>

      <div className="mx-auto grid max-w-[1500px] items-center gap-14 md:grid-cols-[minmax(300px,480px)_1fr] md:gap-20 lg:gap-28">
        {/* ——— POSTER (LEFT) ——— */}
        <motion.div
          style={{ y: posterY, scale: posterScale }}
          className="relative mx-auto w-full max-w-[420px] md:max-w-none"
        >
          {/* Ambient blue bloom behind poster */}
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(61,159,255,0.13), transparent 65%)",
              filter: "blur(50px)",
            }}
          />
          <motion.figure
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
              transformPerspective: 1400,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: EASE }}
            className="group relative"
          >
            <a
              href={FILM_URL}
              target={FILM_URL.startsWith("http") ? "_blank" : undefined}
              rel={FILM_URL.startsWith("http") ? "noreferrer" : undefined}
              onClick={(e) => {
                if (FILM_URL === "#") e.preventDefault();
              }}
              data-cursor="hover"
              data-cursor-label="WATCH"
              aria-label="Watch Delusion of Negation"
              className="group relative block"
              style={{
                boxShadow:
                  "0 40px 90px rgba(0,0,0,0.65), 0 8px 32px rgba(0,0,0,0.5), 0 0 60px rgba(61,159,255,0.07)",
              }}
            >
              {/* The official poster — displayed exactly as supplied:
                  natural aspect ratio, no crop, no overlays, no filters. */}
              {posterMissing ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 px-8 text-center"
                  style={{
                    aspectRatio: "5 / 7",
                    border: "1px solid var(--hairline)",
                    background:
                      "linear-gradient(180deg, #0d1522 0%, #070a0f 100%)",
                  }}
                >
                  <span
                    className="font-mono text-[9px] uppercase"
                    style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
                  >
                    Official Poster
                  </span>
                  <span className="font-display text-xl italic" style={{ color: "var(--ink-dim)" }}>
                    Delusion of Negation
                  </span>
                  <span
                    className="max-w-[26ch] font-mono text-[9px] leading-relaxed"
                    style={{ letterSpacing: "0.14em", color: "var(--muted)" }}
                  >
                    Official poster — Delusion of Negation
                  </span>
                </div>
              ) : (
                <img
                  /* The exact original poster, served byte-identical from
                     the production repo — never recreated or modified. */
                  src="https://raw.githubusercontent.com/Yeedthedeed/PORTFOLIO-/main/DELUSION%20OF%20NEGATION%20-%20Short%20Film%20Poster.jpg"
                  alt="Delusion of Negation — official film poster. A woman with closed eyes inside a golden frame, flowers blooming from her chest."
                  className="block h-auto w-full"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes("/delusion-poster.jpg")) {
                      /* Fallback to the local copy in public/ */
                      img.src = "/delusion-poster.jpg";
                    } else {
                      setPosterMissing(true);
                    }
                  }}
                />
              )}
            </a>
            <figcaption
              className="mt-4 flex items-center justify-between font-mono text-[9px] uppercase"
              style={{ letterSpacing: "0.24em", color: "var(--muted)" }}
            >
              <span>Official Poster</span>
              <span style={{ color: "var(--accent)" }}>Poster by Rayen Bakhouch</span>
            </figcaption>

            {/* Watch cue — part of the poster link */}
            <a
              href={FILM_URL}
              target={FILM_URL.startsWith("http") ? "_blank" : undefined}
              rel={FILM_URL.startsWith("http") ? "noreferrer" : undefined}
              onClick={(e) => {
                if (FILM_URL === "#") e.preventDefault();
              }}
              data-cursor="hover"
              data-cursor-label="WATCH"
              className="group mt-5 inline-flex items-center gap-3 font-mono text-[10px] uppercase"
              style={{ letterSpacing: "0.28em", color: "var(--ink-dim)" }}
            >
              <span
                className="inline-block h-px transition-all duration-500 group-hover:w-12"
                style={{ width: 28, background: "var(--accent)" }}
              />
              <span className="transition-colors duration-500 group-hover:text-[var(--accent)]">
                Watch the film
              </span>
              <span
                aria-hidden
                className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                style={{ color: "var(--accent)" }}
              >
                ↗
              </span>
            </a>
          </motion.figure>
        </motion.div>

        {/* ——— CREDITS (RIGHT) ——— */}
        <div>
          <Reveal delay={0.1}>
            <p
              className="font-mono text-[10px] uppercase tracking-label"
              style={{ color: "var(--accent)" }}
            >
              A Film By Salim Bakhouch
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <h2
              className="font-display mt-5"
              style={{
                fontSize: "clamp(2.6rem, 6vw, 5.6rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              DELUSION
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 320 }}>
                of Negation
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.26}>
            <div
              className="mt-8 h-px w-24"
              style={{ background: "rgba(212,175,55,0.55)" }}
            />
          </Reveal>

          <Reveal delay={0.32}>
            <p
              className="mt-8 max-w-[52ch] font-display text-[clamp(1.05rem,1.6vw,1.3rem)] italic leading-[1.6]"
              style={{ color: "var(--ink-dim)" }}
            >
              A reclusive artist suffering from Cotard&rsquo;s Syndrome
              becomes the subject of her psychiatrist&rsquo;s unethical
              experiment, as his pursuit of psychological discovery and
              artistic pursuits accelerates her descent toward
              self-destruction.
            </p>
          </Reveal>

          <Reveal delay={0.42}>
            <p
              className="mt-10 font-mono text-[9px] uppercase leading-relaxed"
              style={{ letterSpacing: "0.22em", color: "var(--muted)" }}
            >
              With the support of Ambassade de France en Tunisie · Institut
              Français · CNC
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

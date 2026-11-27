import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "../audio/SoundEngine";

/**
 * CHAPTER RAIL
 *
 * A single fine-line instrument at the edge of the composition: the six
 * chapters, the current one, and reading progress. Deliberately quiet —
 * hairlines and digits, no panels, no background blocks.
 *
 * It never gates navigation: every chapter is also reachable from the header
 * menu, the archive links and the phone dock.
 */

const TONES: Record<string, number> = {
  work: 0.12,
  photography: 0.34,
  filmography: 0.52,
  "featured-project": 0.68,
  about: 0.82,
  contact: 1,
};

const CHAPTERS = [
  { id: "work", label: "Arrival" },
  { id: "photography", label: "Photography" },
  { id: "filmography", label: "Filmography" },
  { id: "featured-project", label: "Featured" },
  { id: "about", label: "Profile" },
  { id: "contact", label: "Contact" },
];

export default function ChapterRail() {
  const [active, setActive] = useState("work");
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const frame = useRef(0);
  const lastTone = useRef<string | null>(null);

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          const id = visible.target.id;
          setActive(id);
          if (lastTone.current !== id) {
            lastTone.current = id;
            sfx.section(TONES[id] ?? 0.5);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <nav className="chapter-rail" aria-label="Chapters">
      <div className="chapter-rail-track" aria-hidden>
        <motion.span
          className="chapter-rail-fill"
          animate={{ scaleY: Math.max(0.02, progress) }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="chapter-rail-list">
        {CHAPTERS.map((chapter, i) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={`chapter-rail-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onMouseEnter={() => {
                  setHovered(chapter.id);
                  sfx.hover();
                }}
                onFocus={() => setHovered(chapter.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="chapter-rail-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="chapter-rail-label">
                  {hovered === chapter.id || isActive ? chapter.label : ""}
                </span>
                <span className="chapter-rail-mark" aria-hidden />
              </a>
            </li>
          );
        })}
      </ol>

      <span className="chapter-rail-progress" aria-hidden>
        {String(Math.round(progress * 100)).padStart(2, "0")}
      </span>
    </nav>
  );
}

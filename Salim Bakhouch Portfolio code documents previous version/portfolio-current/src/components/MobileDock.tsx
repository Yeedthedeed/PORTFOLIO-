import { useEffect, useState } from "react";

/**
 * PHONE NAVIGATION
 *
 * A persistent, thumb-reachable dock for the whole portfolio on small
 * screens. Replaces hover-only navigation with real touch targets and
 * tracks the active chapter while the page scrolls.
 */

const ITEMS = [
  {
    id: "work",
    label: "Work",
    icon: (
      <path d="M3 9.5 12 3l9 6.5V21H3V9.5Zm6 11.5v-6h6v6" />
    ),
  },
  {
    id: "photography",
    label: "Photos",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <circle cx="12" cy="12" r="3.4" />
      </>
    ),
  },
  {
    id: "filmography",
    label: "Films",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
        <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
      </>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    icon: <path d="M3 6.5h18v11H3v-11Zm0 .5 9 6.5L21 7" />,
  },
];

export default function MobileDock() {
  const [active, setActive] = useState("work");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.15, 0.5, 1] }
    );
    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className="mobile-dock" aria-label="Portfolio chapters">
      <span
        className="mobile-dock-progress"
        style={{ transform: `scaleX(${Math.max(0.004, progress)})` }}
        aria-hidden
      />
      <div className="mobile-dock-inner">
        {ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`mobile-dock-link${active === item.id ? " is-active" : ""}`}
            aria-current={active === item.id ? "true" : undefined}
            onClick={() => setActive(item.id)}
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

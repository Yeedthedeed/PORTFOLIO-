import { useEffect, useState } from "react";
import { lightingEngine, type ChapterName } from "../lighting/LightingEngine";

/**
 * LIGHTING LAYER
 *
 * Mounts the single cinematic lighting engine and renders its six composited
 * surfaces. Light is anchored to chapters and content states — there is no
 * cursor listener, no hover glow and no idle animation loop.
 *
 *   .light-key      screen   broad key pool, upper-left of the chapter anchor
 *   .light-fill     screen   opposite fill, lower-right, weaker
 *   .light-rim      screen   cool/accent backlight, top-right edge
 *   .light-bounce   screen   warm ground reflection, bottom edge
 *   .light-shadow   multiply opposing shadow
 *   .light-ao       multiply ambient occlusion at the frame edges
 *
 * z-index 75: above atmosphere, below type and grain (90). All surfaces are
 * pointer-events:none and edge-biased so the reading centre stays clean.
 */

const CHAPTER_FOR_ID: Record<string, ChapterName> = {
  work: "hero",
  photography: "photography",
  filmography: "filmography",
  "featured-project": "featured",
  about: "profile",
  contact: "contact",
};

const FILM_FOR_ID: Record<string, ChapterName> = {
  "delusion-of-negation": "delusion",
  "zakias-clock": "zakia",
  "the-birth-permit": "birth",
};

export default function LightingLayer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    );
    /* Low-power / touch: keep the authored static atmosphere and skip the
       engine so mobile GPUs never composite six full-viewport layers. */
    const lowPower = coarse || saveData || (navigator.hardwareConcurrency ?? 8) <= 2;
    if (lowPower) {
      document.documentElement.dataset.lighting = "static";
      return;
    }

    /* Reduced motion still gets the light, but only as one static frame. */
    document.documentElement.dataset.lighting = reduce ? "reduced" : "active";
    setEnabled(true);
    lightingEngine.setPreset("hero", "idle");

    /* Chapter presets follow the section that owns the reading area. */
    const sections = [
      ...Object.keys(CHAPTER_FOR_ID)
        .map((id) => document.getElementById(id))
        .filter(Boolean),
      ...Object.keys(FILM_FOR_ID)
        .map((id) => document.getElementById(id))
        .filter(Boolean),
    ] as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = (visible.target as HTMLElement).id;
        const chapter = FILM_FOR_ID[id] ?? CHAPTER_FOR_ID[id];
        if (chapter) lightingEngine.setPreset(chapter);
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: [0.05, 0.25, 0.5, 0.75] }
    );
    sections.forEach((section) => observer.observe(section));

    /* Selected-image / selected-film emphasis. Components dispatch a single
       event; no component owns a second lighting loop. */
    const onLightState = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: "idle" | "selected"; chapter?: ChapterName }>).detail;
      if (!detail) return;
      if (detail.chapter) lightingEngine.setChapterAndMode(detail.chapter, detail.mode ?? "selected");
      else lightingEngine.setMode(detail.mode ?? "idle");
    };
    window.addEventListener("etherealism:light", onLightState);

    return () => {
      window.removeEventListener("etherealism:light", onLightState);
      observer.disconnect();
      lightingEngine.stop();
    };
  }, []);

  if (!enabled) return null;

  const base: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 75,
    transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div className="lighting-layer" aria-hidden>
      <div className="light-key" style={{ ...base, background: "var(--light-gradient, none)", mixBlendMode: "screen" }} />
      <div className="light-fill" style={{ ...base, background: "var(--fill-gradient, none)", mixBlendMode: "screen" }} />
      <div className="light-rim" style={{ ...base, background: "var(--rim-gradient, none)", mixBlendMode: "screen" }} />
      <div className="light-bounce" style={{ ...base, background: "var(--light-bounce-gradient, none)", mixBlendMode: "screen" }} />
      <div className="light-shadow" style={{ ...base, background: "var(--shadow-gradient, none)", mixBlendMode: "multiply" }} />
      <div className="light-ao" style={{ ...base, background: "var(--ao-gradient, none)", mixBlendMode: "multiply" }} />
    </div>
  );
}

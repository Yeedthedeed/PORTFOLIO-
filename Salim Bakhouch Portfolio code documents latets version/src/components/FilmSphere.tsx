import FilmSections from "./FilmSections";
import { FILM_SOURCE_URL, FILM_STILLS } from "../data/filmStills";
import DevelopReveal from "./DevelopReveal";

export default function FilmSphere({
  onOpenGallery,
  overlayOpen = false,
}: {
  onOpenGallery?: () => void;
  overlayOpen?: boolean;
}) {
  return (
    <section
      id="filmography"
      className="film-section"
      aria-labelledby="filmography-title"
      style={{
        position: "relative",
        zIndex: 10,
        padding: "clamp(6rem, 12vh, 9rem) 0 clamp(4rem, 8vh, 7rem)",
      }}
    >
      <header className="spatial-header">
        <p className="eyebrow">
          <span className="eyebrow-line" aria-hidden />
          Three films · one continuous reel
        </p>
        <h2 id="filmography-title" className="spatial-title">
          <DevelopReveal as="span">Film<em>ography</em></DevelopReveal>
        </h2>
        <p className="spatial-subtitle">
          {FILM_STILLS.length + 43} stills · 3 short films · centered, stacked
        </p>
        <div className="spatial-header-actions">
          <a
            className="text-action"
            href={FILM_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
          >
            Full stills album on GitHub{" "}
            <span aria-hidden style={{ color: "var(--accent)" }}>
              ↗
            </span>
          </a>
          {onOpenGallery && (
            <button
              type="button"
              className="text-action"
              onClick={onOpenGallery}
              data-cursor="hover"
            >
              Open archive view{" "}
              <span aria-hidden style={{ color: "var(--accent)" }}>
                ↗
              </span>
            </button>
          )}
        </div>
      </header>

      <FilmSections paused={overlayOpen} />

    </section>
  );
}

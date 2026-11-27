/**
 * LAYER Z0 — Gradient Base
 * Rich charcoal radial gradient. Never flat. Never pure black.
 * This is the emotional temperature of the entire experience.
 */
export default function GradientBase() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: `
          radial-gradient(
            ellipse 120% 90% at 54% 48%,
            #100E0D 0%,
            #0E0D0C 40%,
            #0B0A09 100%
          )
        `,
      }}
    />
  );
}

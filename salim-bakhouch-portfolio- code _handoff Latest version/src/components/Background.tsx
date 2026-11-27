/**
 * THE OPTICAL APERTURE — ETHEREALISM's background identity.
 *
 * One oversized, incomplete optical structure that extends beyond the viewport,
 * one or two diagonal light planes, a restrained sapphire halo along a single
 * arc segment, and one short orange counterlight where two geometries meet.
 *
 * Composition rules:
 *   • one dominant structure, one secondary relationship, one warm intersection
 *   • large uninterrupted negative space; nothing distributes circles around the
 *     viewport
 *   • strokes 0.035–0.09, planes 0.015–0.055, orange 0.025–0.075 effective
 *   • purely decorative, no pointer events, no separate RAF engine, no canvases
 *
 * Motion: the geometry is driven by ONE scroll signal using CSS scroll-driven
 * animations (`animation-timeline: scroll(root)`) — no React state, no RAF, no
 * second engine. Where that is unsupported, or under reduced motion, the
 * composition renders complete and static.
 *
 * Depth: the grain lives HERE, behind the content, so it never sits over
 * photographs, stills, portraits, type or controls.
 */

export default function Background() {
  return (
    <div className="optical-field" aria-hidden="true">
      {/* ── Base: one deep blue field, darkness kept as a compositional shape ── */}
      <div className="oa-base" />

      {/* ── Diagonal light planes: light crossing an architectural surface ── */}
      <div className="oa-plane oa-plane--key" />
      <div className="oa-plane oa-plane--fill" />

      {/* ── The aperture: one oversized incomplete optical structure ── */}
      <svg
        className="oa-svg"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
        focusable="false"
      >
        <defs>
          <linearGradient id="oa-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7ec4ff" stopOpacity="0.55" />
            <stop offset="0.42" stopColor="#7ec4ff" stopOpacity="0.34" />
            <stop offset="1" stopColor="#286b9b" stopOpacity="0.20" />
          </linearGradient>
          <linearGradient id="oa-halo" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#7ec4ff" stopOpacity="0" />
            <stop offset="0.42" stopColor="#a9d8ff" stopOpacity="0.85" />
            <stop offset="0.72" stopColor="#7ec4ff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#7ec4ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="oa-warm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#cd6742" stopOpacity="0" />
            <stop offset="0.5" stopColor="#e58359" stopOpacity="0.9" />
            <stop offset="1" stopColor="#a94f32" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="oa-pool" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#286b9b" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="#174b70" stopOpacity="0.09" />
            <stop offset="1" stopColor="#050912" stopOpacity="0" />
          </radialGradient>
          <mask id="oa-halo-mask">
            <rect width="1600" height="1000" fill="black" />
            <circle cx="1236" cy="188" r="612" fill="none" stroke="white"
              strokeWidth="34" strokeLinecap="round"
              strokeDasharray="420 3420" strokeDashoffset="-300" />
          </mask>
        </defs>

        <g className="oa-aperture">
          {/* Primary aperture — off-axis, entering from the upper-right and
              extending well beyond the frame. Incomplete by design. */}
          <g stroke="url(#oa-stroke)" fill="none" strokeLinecap="round">
            <circle cx="1236" cy="188" r="612" strokeWidth="1.15" strokeOpacity="0.95"
              strokeDasharray="2380 1460" strokeDashoffset="120" />
            <circle cx="1236" cy="188" r="536" strokeWidth="0.85" strokeOpacity="0.72"
              strokeDasharray="1180 2188" strokeDashoffset="-620" />
            <circle cx="1236" cy="188" r="702" strokeWidth="0.7" strokeOpacity="0.46"
              strokeDasharray="980 3430" strokeDashoffset="240" />
          </g>

          {/* Optical halo — directional sapphire illumination on ONE arc segment,
              masked so only a short run of the structure catches light. */}
          <g mask="url(#oa-halo-mask)" className="oa-halo">
            <circle cx="1236" cy="188" r="612" fill="none" stroke="url(#oa-halo)" strokeWidth="9" />
            <circle cx="1236" cy="188" r="612" fill="none" stroke="#bfe4ff" strokeWidth="1.35"
              strokeOpacity="0.62" />
          </g>

          {/* Secondary relationship — a low arc entering from the left, plus its
              diagonal axis. Restrained; it exists to balance the primary. */}
          <g className="oa-secondary" fill="none" strokeLinecap="round">
            <path d="M -180 812 A 620 620 0 0 1 640 402" stroke="#286b9b"
              strokeOpacity="0.42" strokeWidth="0.9" strokeDasharray="760 420" />
            <line x1="-60" y1="1020" x2="900" y2="240" stroke="#7ec4ff"
              strokeOpacity="0.11" strokeWidth="0.7" />
          </g>

          {/* The intersection — the single warm counterlight, where the primary
              aperture and the diagonal axis meet. Short, low, never a glow. */}
          <g className="oa-intersection">
            <path d="M 1064 356 L 1150 292" stroke="url(#oa-warm)" strokeWidth="1.8"
              strokeLinecap="round" />
            <circle cx="1102" cy="328" r="1.7" fill="#f2b18f" fillOpacity="0.9" />
          </g>

          {/* Environmental depth: one soft mineral pool, edge-anchored, never a
              centred halo and never over the content column. */}
          <ellipse cx="1290" cy="250" rx="560" ry="470" fill="url(#oa-pool)" />
        </g>
      </svg>

      {/* ── Fine nocturnal emulsion. Static, monochromatic, behind the work. ── */}
      <div className="oa-grain" />
    </div>
  );
}

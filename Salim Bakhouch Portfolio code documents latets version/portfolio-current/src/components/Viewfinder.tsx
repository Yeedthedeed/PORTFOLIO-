import { motion } from "framer-motion";

/**
 * VIEWFINDER — ARRI/RED/Venice-inspired cinema EVF HUD.
 *
 * Render strategy:
 *   - Pure SVG, scales crisply at all DPR
 *   - Positioned absolute over the portrait container
 *   - Parent controls opacity/scale/rotate via `active` prop
 *
 * Reveal sequence (active → true):
 *   1. Outer 2.39:1 scope frame + letterbox bars  (delay 0s)
 *   2. Corner L-brackets animate in               (delay 0.05s)
 *   3. Rule-of-thirds grid                        (delay 0.15s)
 *   4. Safe-area dashed rects                     (delay 0.20s)
 *   5. Focus brackets + AF pulse                  (delay 0.25s)
 *   6. Centre crosshair + dot                     (delay 0.32s)
 *   7. All metadata text blocks                   (delay 0.38s+)
 *   8. Exposure meter + audio meters              (delay 0.42s)
 *
 * Exit: parent animates opacity → 0, scale → 0.96 smoothly.
 */

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

function fade(active: boolean, delay: number) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: active ? 1 : 0 },
    transition: { delay: active ? delay : 0, duration: 0.55, ease: E },
  };
}

export default function Viewfinder({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        style={{ color: "var(--accent-bright)" }}
      >
        <defs>
          {/* Sapphire bloom behind frame */}
          <radialGradient id="vfBloom" cx="55%" cy="38%" r="52%">
            <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="75%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Bloom fill ────────────────────────────────── */}
        <motion.rect
          x="0" y="0" width="1000" height="1000"
          fill="url(#vfBloom)"
          {...fade(active, 0)}
        />

        {/* ── Letterbox bars (2.39:1) ───────────────────── */}
        <motion.rect x="0" y="0"   width="1000" height="192" fill="#000" fillOpacity="0.50" {...fade(active, 0)} />
        <motion.rect x="0" y="808" width="1000" height="192" fill="#000" fillOpacity="0.50" {...fade(active, 0)} />

        {/* ── Outer scope frame ─────────────────────────── */}
        <motion.rect
          x="80" y="192" width="840" height="616"
          fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2"
          {...fade(active, 0.05)}
        />

        {/* ── Corner L-brackets ─────────────────────────── */}
        {([
          [80,  192,  1,  1],
          [920, 192, -1,  1],
          [80,  808,  1, -1],
          [920, 808, -1, -1],
        ] as [number,number,number,number][]).map(([cx,cy,fx,fy], i) => (
          <motion.g
            key={i}
            stroke="currentColor" strokeWidth="2.2" fill="none"
            {...fade(active, 0.05 + i * 0.02)}
          >
            <line x1={cx} y1={cy} x2={cx + fx * 32} y2={cy} />
            <line x1={cx} y1={cy} x2={cx} y2={cy + fy * 32} />
          </motion.g>
        ))}

        {/* ── Rule-of-thirds grid ───────────────────────── */}
        <motion.g
          stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75"
          {...fade(active, 0.15)}
        >
          <line x1="360" y1="192" x2="360" y2="808" />
          <line x1="640" y1="192" x2="640" y2="808" />
          <line x1="80"  y1="397" x2="920" y2="397" />
          <line x1="80"  y1="603" x2="920" y2="603" />
        </motion.g>

        {/* ── Safe areas ────────────────────────────────── */}
        <motion.rect
          x="136" y="238" width="728" height="524"
          fill="none" stroke="currentColor" strokeOpacity="0.30"
          strokeWidth="0.7" strokeDasharray="3 3"
          {...fade(active, 0.20)}
        />
        <motion.rect
          x="180" y="282" width="640" height="436"
          fill="none" stroke="currentColor" strokeOpacity="0.16"
          strokeWidth="0.55" strokeDasharray="2 5"
          {...fade(active, 0.22)}
        />

        {/* ── Focus brackets (AF pulse) ─────────────────── */}
        {([
          [370, 362,  1,  1],
          [630, 362, -1,  1],
          [370, 638,  1, -1],
          [630, 638, -1, -1],
        ] as [number,number,number,number][]).map(([bx,by,bfx,bfy], i) => (
          <motion.g
            key={`fb${i}`}
            stroke="currentColor" strokeWidth="1.8" fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? [0, 1, 0.75, 1] : 0 }}
            transition={{
              delay: active ? 0.25 + i * 0.04 : 0,
              duration: active ? 2.4 : 0.4,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <path d={`M ${bx} ${by + bfy*26} L ${bx} ${by} L ${bx + bfx*26} ${by}`} />
          </motion.g>
        ))}

        {/* ── Centre crosshair ──────────────────────────── */}
        <motion.g stroke="currentColor" strokeWidth="1.3" {...fade(active, 0.32)}>
          <line x1="488" y1="500" x2="512" y2="500" />
          <line x1="500" y1="488" x2="500" y2="512" />
          <circle cx="500" cy="500" r="10"  fill="none" strokeOpacity="0.7" />
          <circle cx="500" cy="500" r="26"  fill="none" strokeOpacity="0.22" strokeDasharray="2 5" />
        </motion.g>

        {/* ── REC dot (blinks) ──────────────────────────── */}
        <motion.circle
          cx="105" cy="175" r="5"
          fill="#ff4f4f"
          animate={{ opacity: active ? [1, 0.15, 1] : 0 }}
          transition={{ delay: active ? 0.38 : 0, duration: 1.6, repeat: Infinity, ease: "linear" }}
        />

        {/* ── Top-left HUD ──────────────────────────────── */}
        <motion.g
          fontFamily="JetBrains Mono, monospace"
          fontSize="17" fill="currentColor"
          {...fade(active, 0.38)}
        >
          <text x="120" y="178" fillOpacity="0.95">
            REC&nbsp;&nbsp;24.000fps
          </text>
          <text x="120" y="242" fontSize="13" fillOpacity="0.65">
            A007_C014_0212
          </text>
        </motion.g>

        {/* ── Top-right HUD ─────────────────────────────── */}
        <motion.g
          fontFamily="JetBrains Mono, monospace"
          fontSize="17" fill="currentColor" textAnchor="end"
          {...fade(active, 0.40)}
        >
          <text x="880" y="178" fillOpacity="0.95">ALEXA 35 · 4.6K 2.39:1</text>
          <text x="880" y="242" fontSize="13" fillOpacity="0.65">ISO 800 · ND 0.6 · 5600K</text>
        </motion.g>

        {/* ── Bottom-left HUD ───────────────────────────── */}
        <motion.g
          fontFamily="JetBrains Mono, monospace"
          fontSize="17" fill="currentColor"
          {...fade(active, 0.42)}
        >
          <text x="120" y="832" fillOpacity="0.95">50mm · T1.9</text>
          <text x="120" y="868" fontSize="13" fillOpacity="0.65">FOCUS 1.84m</text>
        </motion.g>

        {/* ── Bottom-right HUD ──────────────────────────── */}
        <motion.g
          fontFamily="JetBrains Mono, monospace"
          fontSize="17" fill="currentColor" textAnchor="end"
          {...fade(active, 0.42)}
        >
          <text x="880" y="832" fillOpacity="0.95">SHUTTER 180°</text>
          <text x="880" y="868" fontSize="13" fillOpacity="0.65">CARD B · 38:12</text>
        </motion.g>

        {/* ── Exposure meter (left edge) ────────────────── */}
        <motion.g stroke="currentColor" strokeWidth="1.1" fill="none" {...fade(active, 0.44)}>
          <line x1="55" y1="375" x2="55" y2="625" />
          {[-2,-1,0,1,2].map((s,i) => (
            <line key={i} x1="49" y1={500+s*30} x2="61" y2={500+s*30} />
          ))}
          <polygon points="55,492 49,506 61,506" fill="currentColor" fillOpacity="0.8" stroke="none" />
        </motion.g>

        {/* ── Audio meters (right edge) ─────────────────── */}
        <motion.g fill="currentColor" {...fade(active, 0.44)}>
          {Array.from({ length: 9 }).map((_,i) => (
            <motion.rect
              key={`a1${i}`}
              x="942" y={415 + i*15} width="6" height="9"
              fillOpacity={i < 6 ? 0.85 : 0.20}
              animate={active ? { height: [9,12,9], opacity: [0.85,1,0.85] } : {}}
              transition={{ duration: 1.8, delay: i*0.12, repeat: Infinity, ease:"easeInOut" }}
            />
          ))}
          {Array.from({ length: 9 }).map((_,i) => (
            <motion.rect
              key={`a2${i}`}
              x="952" y={415 + i*15} width="6" height="9"
              fillOpacity={i < 4 ? 0.85 : 0.20}
              animate={active ? { height: [9,11,9], opacity: [0.85,1,0.85] } : {}}
              transition={{ duration: 2.0, delay: i*0.10+0.3, repeat: Infinity, ease:"easeInOut" }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { sfx } from "../audio/SoundEngine";
import AudioToggle from "./AudioToggle";

const E: [number, number, number, number]      = [0.16, 1, 0.3, 1];
const CINEMA: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ── Menu dropdown ──────────────────────────────────────────── */
const MENU_LINKS = [
  { label:"Work",        href:"#work"        },
  { label:"Photography", href:"#photography" },
  { label:"Filmography", href:"#filmography" },
  { label:"About",       href:"#about"       },
  { label:"Contact",     href:"#contact"     },
];

const menuV: Variants = {
  hidden: { opacity:0, y:-10, scale:0.96 },
  show:   { opacity:1, y:0,   scale:1,   transition:{ duration:0.5, ease:E } },
  exit:   { opacity:0, y:-8,  scale:0.97,transition:{ duration:0.3, ease:CINEMA } },
};
const linkV: Variants = {
  hidden: { opacity:0, x:-6 },
  show:   (i:number) => ({ opacity:1, x:0, transition:{ delay:0.03+i*0.04, duration:0.38, ease:E } }),
  exit:   { opacity:0, x:-4, transition:{ duration:0.16, ease:CINEMA } },
};

/* ── Three-dot pull handle ──────────────────────────────────── */
function PullHandle({ onPull }: { onPull: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      transition={{ duration:0.5, ease:E }}
      onMouseEnter={() => { setHov(true); onPull(); }}
      onMouseLeave={() => setHov(false)}
      onClick={onPull}
      aria-label="Show navigation"
      style={{
        position:"fixed", top:0, left:"50%",
        transform:"translateX(-50%)",
        zIndex:50,
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"6px 20px 10px",
        cursor:"default", userSelect:"none",
      }}
    >
      <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
        {[0,1,2].map(i => (
          <motion.span key={i}
            style={{
              display:"block", width:4, height:4, borderRadius:"50%",
              background: hov ? "var(--accent)" : "rgba(238,243,250,0.38)",
              transition:"background 0.3s",
            }}
            animate={hov
              ? { scale:[1,1.4,1], opacity:[0.8,1,0.8] }
              : { scale:[1,1.1,1], opacity:[0.38,0.6,0.38] }
            }
            transition={{ duration:1.4, delay:i*0.15, repeat:Infinity, ease:"easeInOut" }}
          />
        ))}
      </div>
      <motion.div
        animate={{ y: hov ? 2 : [0,2,0], opacity: hov ? 0.9 : 0.4 }}
        transition={hov
          ? { duration:0.3, ease:E }
          : { duration:1.8, repeat:Infinity, ease:"easeInOut" }
        }
        style={{ marginTop:3 }}
      >
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
          <polyline points="1,1 6,6 11,1"
            stroke={hov ? "var(--accent)" : "rgba(238,243,250,0.45)"}
            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Nav ───────────────────────────────────────────────── */
const SCROLL_THRESHOLD = 80;

export default function Nav() {
  const [visible,  setVisible]  = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const forcedOpen = useRef(false);
  const forceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const forceShow = useCallback(() => {
    forcedOpen.current = true;
    setVisible(true);
    clearTimeout(forceTimer.current);
    forceTimer.current = setTimeout(() => {
      forcedOpen.current = false;
    }, 3000);
  }, []);

  /* Scroll-driven hide */
  useEffect(() => {
    const onScroll = () => {
      if (forcedOpen.current) return;
      setVisible(window.scrollY <= SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mouse entering top zone reveals nav */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientY >= SCROLL_THRESHOLD) return;
      forcedOpen.current = true;
      setVisible(true);
      clearTimeout(forceTimer.current);
      forceTimer.current = setTimeout(() => {
        forcedOpen.current = false;
        if (window.scrollY > SCROLL_THRESHOLD) setVisible(false);
      }, 2000);
    };
    window.addEventListener("mousemove", onMove, { passive:true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      {/* Pull handle — only when hidden */}
      <AnimatePresence>
        {!visible && <PullHandle key="pull" onPull={forceShow} />}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y:0, opacity:0 }}
        animate={{ y: visible ? 0 : "-110%", opacity: visible ? 1 : 0 }}
        transition={{
          y:       { type:"spring", stiffness:300, damping:34, mass:0.7 },
          opacity: { duration:0.4, ease: visible ? E : CINEMA },
        }}
        onMouseEnter={() => { forcedOpen.current=true; clearTimeout(forceTimer.current); }}
        onMouseLeave={() => {
          forceTimer.current = setTimeout(() => {
            forcedOpen.current = false;
            if (window.scrollY > SCROLL_THRESHOLD) setVisible(false);
          }, 800);
        }}
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between"
        style={{ padding:"clamp(1.25rem,2.5vw,2rem) var(--gutter)" }}
      >
        {/* Wordmark */}
        <motion.a href="#"
          initial={{ y:16, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ delay:0, duration:1.1, ease:E }}
          style={{ textDecoration:"none", display:"flex", flexDirection:"column", lineHeight:0.88 }}
        >
          <span style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.1rem,1.6vw,1.4rem)", color:"var(--ink)", fontWeight:350, letterSpacing:"-0.02em" }}>
            SALIM
          </span>
          <span style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.1rem,1.6vw,1.4rem)", color:"var(--accent)", fontStyle:"italic", fontWeight:350, letterSpacing:"-0.02em" }}>
            BAKHOUCH
          </span>
        </motion.a>

        {/* Centre tag */}
        <motion.div initial={{ y:16, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ delay:0.08, duration:1.1, ease:E }}
          className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <span className="font-mono text-[10px] uppercase" style={{ letterSpacing:"0.28em", color:"var(--muted)" }}>
            DOP — BERLIN / LISBON
          </span>
        </motion.div>

        {/* Right cluster */}
        <motion.div initial={{ y:16, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ delay:0.16, duration:1.1, ease:E }}
          className="flex items-center gap-3 md:gap-4"
        >
          {["Work","About","Contact"].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="link-underline hidden font-mono text-[11px] uppercase md:block"
              style={{ letterSpacing:"0.28em", color:"var(--ink-dim)" }}>
              {link}
            </a>
          ))}

          {/* Audio toggle — imported from shared component */}
          <div className="hidden md:flex">
            <AudioToggle />
          </div>

          {/* Reel */}
          <a href="#reel"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[10px] font-medium uppercase"
            style={{
              letterSpacing:"0.28em",
              background:"var(--accent)", color:"#02090f",
              boxShadow:"0 0 24px var(--accent-glow)",
              transition:"box-shadow 0.4s, transform 0.4s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform="translateY(-1px)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform="translateY(0)"}
          >
            <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background:"#02090f" }} />
            Reel
          </a>

          {/* Menu */}
          <div className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button aria-label="Open navigation" aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                border: menuOpen
                  ? "1px solid rgba(238,243,250,0.35)"
                  : "1px solid rgba(238,243,250,0.12)",
                transition:"border-color 0.4s",
              }}
            >
              <motion.span className="flex flex-col gap-[5px]"
                animate={menuOpen ? { rotate:90, opacity:0.6 } : { rotate:0, opacity:1 }}
                transition={{ duration:0.35, ease:E }}
              >
                <span className="block h-px w-[18px] bg-white" />
                <span className="block h-px bg-white"
                  style={{ width: menuOpen ? 18 : 14, transition:"width 0.35s" }} />
              </motion.span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div variants={menuV} initial="hidden" animate="show" exit="exit"
                  style={{
                    position:"absolute", top:"calc(100% + 0.75rem)", right:0,
                    minWidth:210,
                    background:"rgba(5,7,10,0.96)",
                    backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
                    border:"1px solid rgba(238,243,250,0.09)",
                    borderRadius:3, padding:"0.6rem 0", zIndex:50, overflow:"hidden",
                  }}
                >
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"var(--accent)", opacity:0.5 }} />
                  {MENU_LINKS.map((item, i) => (
                    <motion.a key={item.label} href={item.href}
                      variants={linkV} initial="hidden" animate="show" exit="exit" custom={i}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"0.65rem 1.2rem",
                        fontFamily:"var(--font-display)", fontWeight:350,
                        fontSize:"clamp(0.95rem,1.35vw,1.1rem)", letterSpacing:"-0.02em",
                        color:"var(--ink)", textDecoration:"none",
                        transition:"color 0.25s, background 0.25s",
                        borderBottom: i < MENU_LINKS.length-1
                          ? "1px solid rgba(238,243,250,0.05)" : "none",
                      }}
                      onMouseEnter={e => {
                        const el=e.currentTarget as HTMLElement;
                        el.style.color="var(--accent)"; el.style.background="rgba(61,159,255,0.045)";
                        sfx.hover();
                      }}
                      onMouseLeave={e => {
                        const el=e.currentTarget as HTMLElement;
                        el.style.color="var(--ink)"; el.style.background="transparent";
                      }}
                    >
                      <span>{item.label}</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                        stroke="currentColor" strokeWidth="1.2" style={{ opacity:0.35 }} aria-hidden>
                        <polyline points="2,2 8,5 2,8" />
                      </svg>
                    </motion.a>
                  ))}
                  <div style={{ padding:"0.55rem 1.2rem 0.15rem", borderTop:"1px solid rgba(238,243,250,0.05)", marginTop:"0.2rem" }}>
                    <AudioToggle />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.header>
    </>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MouseProvider } from "./hooks/useMouse";
import { useLenis } from "./hooks/useLenis";
import { useSoundEvents } from "./hooks/useSoundEvents";
import { useDeviceLayout } from "./hooks/useDeviceLayout";

import Background from "./components/Background";
import ChapterGeometry from "./components/ChapterGeometry";
import { runSurfaceTransition } from "./utils/transition";
import Loader from "./components/Loader";
import Nav from "./components/Nav";
import Portrait from "./components/Portrait";
import HeroText from "./components/HeroText";
import MetaCard from "./components/MetaCard";
import Marquee from "./components/Marquee";
import ScrollSphere from "./components/ScrollSphere";
import FilmSphere from "./components/FilmSphere";
import FeaturedProject from "./components/FeaturedProject";
import ArchiveLinks from "./components/ArchiveLinks";
import About from "./components/About";
import Footer from "./components/Footer";
import ChapterRail from "./components/ChapterRail";
import PhotographyGallery from "./components/PhotographyGallery";
import FilmographyGallery from "./components/FilmographyGallery";

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showPhotography, setShowPhotography] = useState(false);
  const [showFilmography, setShowFilmography] = useState(false);
  useLenis();
  useSoundEvents();
  useDeviceLayout();

  return (
    <MouseProvider>
      <div
        className="relative min-h-screen"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <div className="scroll-progress" aria-hidden />

        <Background />
        {/* Grain, scanlines and vignette were previously global overlays at
            z-84–90, above the photography. They now live inside the background
            so masters are never textured or dimmed. */}

        <AnimatePresence mode="wait">
          {loading && <Loader key="loader" onDone={() => setLoading(false)} />}
        </AnimatePresence>

        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: E }}
          >
            <Nav />
            <main id="main">
              <section
                id="work"
                aria-label="Salim Bakhouch — Cinematographer and Director of Photography"
                className="relative z-10 flex h-[100svh] w-full items-end justify-center overflow-hidden"
              >
                <ChapterGeometry preset="hero" />
                <MetaCard />
                <HeroText />
                <Portrait />
              </section>

              <Marquee />
              <ScrollSphere
                onOpenArchive={() => runSurfaceTransition(() => setShowPhotography(true))}
                paused={showPhotography || showFilmography}
              />
              <FilmSphere
                onOpenGallery={() => runSurfaceTransition(() => setShowFilmography(true))}
                overlayOpen={showPhotography || showFilmography}
              />
              <FeaturedProject />
              <ArchiveLinks
                onPhotographyOpen={() => runSurfaceTransition(() => setShowPhotography(true))}
                onFilmographyOpen={() => runSurfaceTransition(() => setShowFilmography(true))}
              />
              <About />
              <Footer />
            </main>
            <ChapterRail />
          </motion.div>
        )}


        <AnimatePresence>
          {showPhotography && (
            <PhotographyGallery
              key="photography"
              onClose={() => runSurfaceTransition(() => setShowPhotography(false))}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFilmography && (
            <FilmographyGallery
              key="filmography"
              onClose={() => runSurfaceTransition(() => setShowFilmography(false))}
            />
          )}
        </AnimatePresence>
      </div>
    </MouseProvider>
  );
}

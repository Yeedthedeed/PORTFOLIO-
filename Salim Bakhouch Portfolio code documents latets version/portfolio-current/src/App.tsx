import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MouseProvider } from "./hooks/useMouse";
import { useLenis } from "./hooks/useLenis";
import { useSoundEvents } from "./hooks/useSoundEvents";
import { useDeviceLayout } from "./hooks/useDeviceLayout";

import Background from "./components/Background";
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
import MobileDock from "./components/MobileDock";
import ChapterRail from "./components/ChapterRail";
import CustomCursor from "./components/CustomCursor";
import PhotographyGallery from "./components/PhotographyGallery";
import FilmographyGallery from "./components/FilmographyGallery";
import LightingLayer from "./components/LightingLayer";

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

        <Background />

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
                <MetaCard />
                <HeroText />
                <Portrait />
              </section>

              <Marquee />
              <ScrollSphere
                onOpenArchive={() => setShowPhotography(true)}
                paused={showPhotography || showFilmography}
              />
              <FilmSphere
                onOpenGallery={() => setShowFilmography(true)}
                overlayOpen={showPhotography || showFilmography}
              />
              <FeaturedProject />
              <ArchiveLinks
                onPhotographyOpen={() => setShowPhotography(true)}
                onFilmographyOpen={() => setShowFilmography(true)}
              />
              <About />
              <Footer />
            </main>
            <MobileDock />
            <ChapterRail />
          </motion.div>
        )}

        <LightingLayer />
        <div className="bloom" aria-hidden />
        <div className="scanlines" aria-hidden />
        <div className="vignette" aria-hidden />
        <div className="grain" aria-hidden />
        <CustomCursor />

        <AnimatePresence>
          {showPhotography && (
            <PhotographyGallery
              key="photography"
              onClose={() => setShowPhotography(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFilmography && (
            <FilmographyGallery
              key="filmography"
              onClose={() => setShowFilmography(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </MouseProvider>
  );
}

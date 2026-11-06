import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MouseProvider } from "./hooks/useMouse";
import { useLenis } from "./hooks/useLenis";
import { useSoundEvents } from "./hooks/useSoundEvents";

import Background          from "./components/Background";
import Loader              from "./components/Loader";
import Nav                 from "./components/Nav";
import Portrait            from "./components/Portrait";
import HeroText            from "./components/HeroText";
import MetaCard            from "./components/MetaCard";
import Marquee             from "./components/Marquee";
import ScrollSphere        from "./components/ScrollSphere";
import FilmSphere          from "./components/FilmSphere";
import FeaturedProject     from "./components/FeaturedProject";
import ArchiveLinks        from "./components/ArchiveLinks";
import About               from "./components/About";
import Footer              from "./components/Footer";
import CustomCursor        from "./components/CustomCursor";
import PhotographyGallery  from "./components/PhotographyGallery";
import FilmographyGallery  from "./components/FilmographyGallery";
import LightingLayer        from "./components/LightingLayer";
// ForegroundLayer removed
// SoundToggle removed — AudioToggle is now embedded in Nav

const E: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [loading,          setLoading]          = useState(true);
  const [showPhotography,  setShowPhotography]  = useState(false);
  const [showFilmography,  setShowFilmography]  = useState(false);
  useLenis();
  useSoundEvents();

  return (
    <MouseProvider>
      <div className="relative min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <Background />

        {/* Cinematic loader */}
        <AnimatePresence mode="wait">
          {loading && <Loader key="loader" onDone={() => setLoading(false)} />}
        </AnimatePresence>

        {/* Main portfolio */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: E }}
          >
            <Nav />
            <MetaCard />
            <HeroText />

            <section
              className="relative z-10 flex h-[100svh] w-full items-end justify-center overflow-hidden"
            >
              <Portrait />
            </section>

            <Marquee />
            {/* Scroll-driven sphere entrance — photography in page flow */}
            <ScrollSphere />
            {/* Filmography sphere — film negative frames */}
            <FilmSphere />
            {/* Featured Project — Delusion of Negation */}
            <FeaturedProject />
            {/* Archive navigation links */}
            <ArchiveLinks
              onPhotographyOpen={() => setShowPhotography(true)}
              onFilmographyOpen={() => setShowFilmography(true)}
            />
            <About />
            <Footer />
          </motion.div>
        )}

        {/* Cinematic lighting system — above bg, below grain */}
        <LightingLayer />
        {/* Global overlays */}
        <div className="bloom" />
        <div className="scanlines" />
        <div className="vignette" />
        <div className="grain" />
        <CustomCursor />

        {/* Photography gallery */}
        <AnimatePresence>
          {showPhotography && (
            <PhotographyGallery
              key="photography"
              onClose={() => setShowPhotography(false)}
            />
          )}
        </AnimatePresence>

        {/* Filmography gallery */}
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

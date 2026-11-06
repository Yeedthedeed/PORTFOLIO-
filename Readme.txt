# Cinematic Photography Portfolio

A visually immersive, spatial photography portfolio built with React, Vite, and Framer Motion. The site features a 3D-esque interactive sphere gallery for 36 curated photographs and a dedicated filmography section.

## 🛠 Tech Stack
- **Framework:** React
- **Animation:** Framer Motion, custom RequestAnimationFrame (rAF) DOM manipulation
- **Styling:** Inline CSS / Custom CSS
- **Data:** Local manifest (`photographyManifest.ts`)

## 📂 Key Architecture & Files
- `src/components/ScrollSphere.tsx`: The 3D photography sphere. Handles card generation, orientation, and the image viewer overlay.
- `src/components/FilmSphere.tsx`: The filmography landing page (spiral/ribbon layout).
- `src/components/FilmographyGallery.tsx`: The full filmography gallery (currently a sphere layout).
- `src/data/photographyManifest.ts`: The single source of truth for all album data, titles, subtitles, intros, and photo captions.

## 🚀 Local Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the local Vite server.

## ⚠️ Important Note for AI Agents
Please read `HANDOFF.md` before making any code changes. The current codebase has specific visual bugs and layout inconsistencies that need to be resolved without rewriting the core architecture.
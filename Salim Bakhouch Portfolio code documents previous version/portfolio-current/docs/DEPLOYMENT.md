# Deployment

## Live deployment (verified)

| | |
| --- | --- |
| **URL** | https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ |
| Status | **Published and publicly reachable — tested over HTTPS without authentication** |
| Host | deed.page (Cloudflare edge), permanent site, no expiry |
| Response | HTTP/2 200 · `text/html; charset=utf-8` · 1,151,198 bytes · `strict-transport-security` present |
| Contents | Current build: title “Salim Bakhouch Portfolio Website”, 81 inlined photography previews, stills showcase, archive third ribbon, three films, Vimeo and Drive links |
| Integrity | Live document equals `dist/index.html` plus one small host badge on publish |
| Note | The host appends a discreet “Published with deed.page” badge; it is not part of this repository |

Re-publish at any time with:

```bash
./scripts/deploy.sh                 # new slug
DEED_TOKEN=<token> ./scripts/deploy.sh <existing-slug>   # update in place
```

The update token for the current site is stored **outside the repository** at
`~/.config/deed-page/token`. Without it a new slug is created (the old site keeps working).

## Status of this build

The repository produces a complete, production-ready artefact. **It has not been
republished from this workspace**: no deployment credentials or host CLI are available
here. The existing public URL was tested and currently serves an older build (see
[Verified status](#verified-status)).

## Artefact

```bash
npm install
npm run build
```

Output: **`dist/index.html`** — a single self-contained document containing the
application, styles and the baked gallery previews. Masters are loaded from the
public GitHub CDN at runtime, so no image directory needs to be uploaded.

`dist/` is the only directory that must be published.

## Publish — pick one

### A. Netlify Drop (fastest, no account setup)

1. Run `npm run build`.
2. Open <https://app.netlify.com/drop>.
3. Drag the `dist` folder onto the page.
4. Netlify returns a public HTTPS URL immediately.
5. Site settings → change the site name for a cleaner URL, or add a custom domain.

### B. Vercel

```bash
npm i -g vercel
vercel          # first run links the project
vercel --prod   # production deployment
```

Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.

### C. Cloudflare Pages / GitHub Pages / any static host

Upload the contents of `dist/` as static files. No server runtime, database or
environment variables are required. Ensure HTTPS is enabled (all three hosts do
this automatically).

### D. Arena (the current host)

Use the platform's **Publish / Deploy** action on this project. The preview URL and
the public URL are different: a preview link stays private, while Publish promotes
the current build to the public address.

## After publishing — verification checklist

Replace `<URL>` with the new public address and run:

```bash
# 1. Publicly reachable over HTTPS, without authentication
curl -sI <URL> | head -5

# 2. Correct document
curl -s <URL> | grep -o '<title>[^<]*</title>'
#    expected: <title>Salim Bakhouch Portfolio Website</title>

# 3. Baked gallery previews present (169 expected)
curl -s <URL> | grep -c 'data:image/webp'

# 4. Original assets reachable
curl -sI 'https://cdn.jsdelivr.net/gh/Yeedthedeed/PORTFOLIO-@main/Landing%20page%20profile%20pictuer%20-%20Copy/3%20.png' | head -3
curl -sI 'https://cdn.jsdelivr.net/gh/Yeedthedeed/PORTFOLIO-@main/Phtotgraphy%20sphere%20assets/Architectural%20Photography/The%20Album%20Cover.jpg' | head -3
```

Then, in a **private browsing window** on desktop, tablet and phone:

- The intro plays and the portfolio appears.
- Hero portrait and viewfinder interaction work.
- Photography sphere rotates (drag / swipe / arrow keys) and opens a photo.
- Photography archive: album switching, tile view, lightbox, prev/next.
- Filmography: all three ribbons are centred and interactive; each has its logline,
  watch link and GitHub stills link.
- The Birth Permit "Watch on Vimeo" link opens the supplied Vimeo URL.
- The featured-project poster and full-resolution link work.
- Mobile dock navigation works on a phone; tablet shows the floating dock.
- No console errors and no failed network requests.

## Verified status

| Item | Result |
| --- | --- |
| Production build | passes (`npx tsc --noEmit`, `npm run build`) |
| Artefact | `dist/index.html`, single self-contained file |
| Baked gallery previews | 169 (126 photographs/stills + 43 Birth Permit) |
| Master assets | untouched in the repository, reachable via jsDelivr / GitHub raw |
| Legacy Arena URL | `https://01a1a690-8b5f-7f62-a465-2ba7b2bc36fb.arena.site/` still serves an **older** build; superseded by the live URL above |
| New public URL | https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/ — published, verified, permanent |

## Known limitations

1. **Publication requires host access.** This workspace can build but cannot
   authenticate to Netlify, Vercel, GitHub Pages or Arena.
2. **Master files are large.** Original photographs and stills are 3–25 MB each, so
   opening a full-resolution viewer for the first time can take several seconds. The
   galleries use baked display previews precisely so the site remains fast without
   touching the masters.
3. **Some repository files exceed 20 MB.** jsDelivr refuses those, and GitHub serves
   them as `application/octet-stream`. The film viewer resolves them through a
   multi-host loader that re-wraps the identical bytes as an image Blob. The
   photography archive does the same.
4. **Cross-device testing in this workspace** is limited to code-level verification
   and local HTTP serving; no browser engine is installed here for automated visual
   regression. The checklist above covers the manual passes to perform on the
   deployed URL.
5. **No secrets are embedded.** The frontend contains no API keys or credentials.

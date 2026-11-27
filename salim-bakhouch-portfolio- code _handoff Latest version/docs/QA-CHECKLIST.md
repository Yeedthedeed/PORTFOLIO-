# QA CHECKLIST

## Gate before any release claim

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` → `dist/` contains exactly `index.html`
- [ ] Record build sha256
- [ ] 0 console errors and 0 horizontal overflow at 1920×1080, 1440×900,
      1024×768, 768×1024, 390×844, 360×800, 844×390
- [ ] 36 sphere cards · 3 ribbons · 122 frames · 0 per-frame captions
- [ ] 0 filtered photographs · 0 film-row borders/backgrounds
- [ ] Aperture visible behind every section
- [ ] Portrait 1312×1199, unobstructed
- [ ] Archives and viewers open; Escape closes; focus returns; scroll restored
- [ ] Contrast AA on every sampled text/background pair
- [ ] Reduced motion: complete static background, no animation
- [ ] Masters, manifests, resolver and sound engine checksums unchanged

## Verified at this snapshot

`tsc` clean · build 2,428,261 bytes · 0 errors · 0 overflow · 122 frames ·
0 captions · 0 filtered · aperture effect behind filmography 12.6 % of pixels ·
contrast AA sampled · reduced motion static · asset checksums unchanged ·
live review URL byte-verified.

## Not tested

Physical iOS/Android/WebKit · screen readers · sound audition · CPU throttling.

# Device layouts

The portfolio has three deliberate compositions. Real devices are classified automatically;
the same presentation is available manually from the site menu.

## Detection

`src/hooks/useDeviceLayout.ts`:

```
phone   → short side < 600 with a coarse pointer, or width < 768
tablet  → coarse pointer up to 1400px, or fine pointer 768–1180px
desktop → everything else
```

- Writes `<html data-layout="phone|tablet|desktop">` and `data-pointer`.
- Listens to `resize` / `orientationchange`.
- A manual preference (`auto | phone | tablet | desktop`) is stored in `localStorage` under
  `iv-layout-preference` and can be set from the menu's **device preview** buttons.
- `index.html` contains an inline bootstrap that runs **before first paint**, so a phone opens
  directly in the mobile composition with no desktop flash.

Ribbon frames are sized from the orbit scale rather than fixed pixels, so the clearance
between stills stays proportional on every one of these layouts (measured air: 21px desktop,
16px laptop, 15px tablet, 12px phone).

Layout itself is implemented with CSS media queries in `src/index.css`; the attribute is used
for diagnostics, the menu switcher, and any future JS that needs the class.

## Phone (≤ 720px)

- Fixed bottom **chapter dock**: Work · Photos · Films · Contact, with active-section tracking,
  48px targets and `env(safe-area-inset-bottom)` padding.
- Header compressed; Reel hidden; menu tappable (click toggles, hover only on mouse).
- Hero portrait sits directly beneath the header (`--portrait-height` fills the upper section),
  with the caption below it and no duplicate scroll cue.
- Sphere cards smaller; hints and captions clear of the dock.
- **Filmography stacks both ribbons vertically** — each film gets its own full-width panel.
- Film archive becomes a scrollable stacked page with a sticky header.
- Photography archive uses a two-column contact sheet and a horizontal album rail. The grid is
  always instant; `View full resolution` upgrades the album on demand, exactly as on desktop.
- Featured project becomes a single column.
- Archive links, About and Footer stack with generous touch spacing.
- `viewport-fit=cover` and safe-area insets handle notched phones.

## Tablet / iPad (721–1180px, or coarse pointer up to 1400px)

Distinct from both other compositions:

- **Floating pill dock** at bottom centre (icon + label, rounded, blurred), not the phone bar.
- Hero gains a **tablet nameplate** (“Ilian Voss — Selected works 2018–2026”) above the portrait.
- Sphere uses a wider perspective and larger cards.
- Filmography keeps the two ribbons **side by side** with taller panels; the full film archive
  also keeps both ribbons visible simultaneously.
- Photography archive: narrower album rail + three-column contact sheet. The quality control and
  loading behaviour match desktop.
- Featured project remains a two-column editorial spread.
- Bottom padding clears the floating dock.

## Desktop (> 1180px fine pointer)

- Original editorial composition: header navigation, fixed hero captions, full-size sphere,
  side-by-side film ribbons, two-column featured project and approach.
- No dock; header nav and archive links drive navigation.

## Manual access

Two ways to see another composition without changing devices:

**Menu → Phone view / Tablet view** — opens the site in a 414×896 or 1024×768 window, which
triggers the matching composition through normal responsive rules. Real devices always receive
their composition automatically; these windows exist for desktop previewing.

## Testing

- Chrome/WebKit device emulation: iPhone 14 Pro (393×852) and iPad Pro (1024×1366).
- Rotate a phone: short-side detection keeps it in the phone composition.
- Rotate an iPad: tablet composition persists.
- Verify no content sits under the dock at the end of the page (footer bottom padding).
- Verify the sphere remains draggable with `touch-action: pan-y`.
- Verify overlays scroll with `data-lenis-prevent`.

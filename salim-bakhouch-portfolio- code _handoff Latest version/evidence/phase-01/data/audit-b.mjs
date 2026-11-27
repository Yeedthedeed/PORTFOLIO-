import { chromium } from 'playwright';
import fs from 'fs';
const BASE = 'http://127.0.0.1:4173/';
const OUT = 'evidence/phase-01/screens';
const results = {};
const browser = await chromium.launch();

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = []; const failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('requestfailed', r => failed.push({ url: r.url().slice(0, 150), reason: r.failure()?.errorText }));
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  return { ctx, page, errors, failed };
}

// FILM ARCHIVE via ArchiveLinks
{
  const { ctx, page, errors } = await open();
  const r = {};
  await page.evaluate(() => { const el = document.querySelector('.archive-links'); if (el) window.scrollTo(0, el.offsetTop); });
  await page.waitForTimeout(1200);
  const btns = await page.locator('.archive-links button').allInnerTexts().catch(() => []);
  r.archiveLinkButtons = btns;
  await page.locator('.archive-links button').first().click().catch(async () => { await page.getByRole('button', { name: /open archive/i }).last().click(); });
  await page.waitForTimeout(2200);
  r.filmArchive = await page.locator('.film-archive').count();
  r.filmArchiveRole = await page.locator('.film-archive').getAttribute('role').catch(() => null);
  r.archiveRibbons = await page.locator('.film-archive .film-spiral-root').count();
  r.archiveFrames = await page.locator('.film-archive .film-spiral-card').count();
  r.scroll = await page.evaluate(() => { const el = document.querySelector('.film-archive--scroll'); return el ? { sh: el.scrollHeight, ch: el.clientHeight, canScroll: el.scrollHeight > el.clientHeight } : null; });
  r.focus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName);
  await page.screenshot({ path: `${OUT}/1440x900__interaction-film-archive-pair.png` });
  // scroll archive to birth permit
  await page.evaluate(() => { const el = document.querySelector('.film-archive--scroll'); if (el) el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/1440x900__interaction-film-archive-birth.png` });
  r.birthVisible = await page.locator('.film-archive-birth').isVisible().catch(() => false);
  const birthAlbum = page.locator('.film-archive-birth .film-album-link').first();
  if (await birthAlbum.count()) {
    await birthAlbum.click(); await page.waitForTimeout(2400);
    r.birthShowcase = await page.locator('.stills-showcase').count();
    r.birthTiles = await page.locator('.stills-showcase-tile').count();
    await page.screenshot({ path: `${OUT}/1440x900__interaction-birth-stills.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  r.archiveClosedAfterEscape = await page.locator('.film-archive').count();
  results.filmArchive = { ...r, errors };

  // Featured project link/asset
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#featured-project').offsetTop));
  await page.waitForTimeout(1800);
  results.featured = {
    posterVisible: await page.locator('#featured-project img').first().isVisible().catch(() => false),
    posterSrc: await page.locator('#featured-project img').first().getAttribute('src').catch(() => null),
    links: await page.locator('#featured-project a').evaluateAll(as => as.map(a => ({ text: a.innerText.trim().slice(0, 40), href: a.getAttribute('href') }))),
  };
  await ctx.close();
}

// REDUCED MOTION + small viewport interactions + touch swipe
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const r = {};
  r.reducedMotion = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  r.developVisible = await page.evaluate(() => [...document.querySelectorAll('.develop')].every(el => +getComputedStyle(el).opacity > 0.5));
  r.loaderGone = await page.locator('.loader').count();
  r.heroPortrait = await page.evaluate(() => { const i = document.querySelector('.hero-portrait-stage img'); return i ? [+getComputedStyle(i).opacity, i.naturalWidth] : null; });
  await page.screenshot({ path: `${OUT}/390x844__reduced-motion-hero.png` });
  // dock navigation
  const dockLinks = page.locator('.mobile-dock a, .mobile-dock button');
  r.dockControls = await dockLinks.count();
  await page.locator('.mobile-dock a').nth(1).click().catch(() => {});
  await page.waitForTimeout(1400);
  r.scrollAfterDock = await page.evaluate(() => Math.round(scrollY));
  await page.screenshot({ path: `${OUT}/390x844__dock-nav.png` });
  // touch swipe on sphere
  await page.evaluate(() => { const el = document.querySelector('#photography'); window.scrollTo(0, el.offsetTop); });
  await page.waitForTimeout(1600);
  r.sphereCards = await page.locator('.ps-card').count();
  await page.touchscreen.tap(200, 500).catch(() => {});
  await page.waitForTimeout(1000);
  r.sphereViewerAfterTap = await page.locator('.ps-viewer').count();
  await page.screenshot({ path: `${OUT}/390x844__sphere-tap.png` });
  results.mobileReduced = { ...r, errors };
  await ctx.close();
}

// Touch target & focus visibility inventory
{
  const { ctx, page } = await open({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  results.touchTargets = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, a[href], input, [role="button"]')];
    const visible = els.filter(el => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    });
    const small = visible.map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, label: (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter(x => x.w < 44 || x.h < 44);
    return { visibleCount: visible.length, under44: small.length, sample: small.slice(0, 20) };
  });
  results.focusStyles = await page.evaluate(() => {
    const styleText = [...document.styleSheets].flatMap(sheet => { try { return [...sheet.cssRules].map(r => r.cssText); } catch { return []; } }).join('\n');
    return { hasFocusVisible: styleText.includes(':focus-visible'), hasOutlineNone: styleText.includes('outline: none') || styleText.includes('outline:none') };
  });
  await ctx.close();
}

fs.writeFileSync('evidence/phase-01/data/audit-b.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2).slice(0, 8000));
await browser.close();

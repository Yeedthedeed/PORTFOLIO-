import { chromium } from 'playwright';
import fs from 'fs';
const BASE = 'http://127.0.0.1:4173/';
const OUT = 'evidence/phase-01/screens';
const results = {};

const browser = await chromium.launch();

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const log = { errors: [], failed: [] };
  page.on('pageerror', e => log.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 300)); });
  page.on('requestfailed', r => log.failed.push(r.url().slice(0, 160)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  return { ctx, page, log };
}

const wait = (p, ms) => p.waitForTimeout(ms);

// ── Desktop: nav, audio, menu, hero viewfinder, sphere ───────────────────
{
  const { ctx, page, log } = await newPage();
  const r = {};
  r.audioInitial = await page.locator('header button[aria-pressed]').first().getAttribute('aria-pressed');
  const audio = page.locator('header button[aria-pressed]').first();
  const ab = await audio.boundingBox();
  await page.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2);
  await wait(page, 600);
  r.audioAfterClick = await page.locator('header button[aria-pressed]').first().getAttribute('aria-pressed');
  r.audioPersisted = await page.evaluate(() => localStorage.getItem('cine-audio'));
  // reopen audio for later
  await page.locator('header button[aria-pressed]').first().click({ force: true });

  // menu keyboard focus
  const menuBtn = page.getByRole('button', { name: 'Open navigation' });
  await menuBtn.focus();
  await page.keyboard.press('Enter');
  await wait(page, 700);
  r.menuOpen = await page.locator('#site-menu').isVisible().catch(() => false);
  r.menuItems = await page.locator('#site-menu [role="menuitem"]').count();
  r.focusInMenu = await page.evaluate(() => !!document.activeElement?.closest('#site-menu'));
  await page.keyboard.press('Escape');
  await wait(page, 400);
  r.menuAfterEscape = await page.locator('#site-menu').count();

  // viewfinder via keyboard
  const face = page.getByRole('button', { name: /viewfinder/i }).first();
  r.faceZone = await face.count();
  await face.focus().catch(() => {});
  await page.keyboard.press('Enter');
  await wait(page, 900);
  r.viewfinderPressed = await face.getAttribute('aria-pressed').catch(() => null);
  await page.screenshot({ path: `${OUT}/1440x900__interaction-viewfinder.png` });
  await page.keyboard.press('Escape');

  // sphere: keyboard rotation & card open
  await page.evaluate(() => { const el = document.querySelector('#photography'); window.scrollTo(0, el.offsetTop); });
  await wait(page, 2000);
  const card = page.locator('.ps-card').first();
  r.sphereCardCount = await page.locator('.ps-card').count();
  r.sphereTabIndices = await page.evaluate(() => [...document.querySelectorAll('.ps-card')].slice(0, 3).map(el => el.getAttribute('tabindex')));
  await card.evaluate(el => el.focus());
  await page.keyboard.press('Enter');
  await wait(page, 2500);
  r.sphereViewerOpen = await page.locator('.ps-viewer').count();
  r.sphereViewerRole = await page.locator('.ps-viewer').getAttribute('role').catch(() => null);
  r.sphereViewerTitle = await page.locator('.ps-album-title').first().innerText().catch(() => null);
  r.sphereFocusInDialog = await page.evaluate(() => !!document.activeElement?.closest('.ps-viewer'));
  await page.screenshot({ path: `${OUT}/1440x900__interaction-sphere-viewer.png` });
  await page.keyboard.press('Escape');
  await wait(page, 900);
  r.sphereViewerClosed = await page.locator('.ps-viewer').count();
  r.sphereFocusRestored = await page.evaluate(() => document.activeElement?.classList?.contains('ps-card'));

  // drag sphere
  const wrap = page.locator('.sphere-wrap');
  const wb = await wrap.boundingBox();
  await page.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2);
  await page.mouse.down();
  await page.mouse.move(wb.x + wb.width / 2 + 160, wb.y + wb.height / 2 + 20, { steps: 16 });
  await page.mouse.up();
  await wait(page, 700);
  r.sphereDragOk = true;

  results.desktopCore = { ...r, log };
  await ctx.close();
}

// ── Desktop: photography archive ─────────────────────────────────────────
{
  const { ctx, page, log } = await newPage();
  const r = {};
  await page.evaluate(() => { const el = document.querySelector('#photography'); window.scrollTo(0, el.offsetTop); });
  await wait(page, 1400);
  await page.getByRole('button', { name: /browse all albums/i }).first().click();
  await wait(page, 2500);
  r.archiveOpen = await page.locator('.archive').count();
  r.albumCount = await page.locator('.archive-album').count();
  r.albumNames = await page.locator('.archive-album-name').allInnerTexts();
  r.titleVisible = await page.locator('.archive-title').first().isVisible();
  r.titleText = await page.locator('.archive-title').first().innerText().catch(() => null);
  r.photoCountHeader = await page.locator('.archive-brand-count').innerText();
  r.gridTiles = await page.locator('.archive-tile').count();
  r.focusOnOpen = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await page.screenshot({ path: `${OUT}/1440x900__interaction-archive.png` });
  // open nested album
  const mermaid = page.locator('.archive-album', { hasText: 'Mermaid' }).first();
  if (await mermaid.count()) {
    await mermaid.click(); await wait(page, 1600);
    r.nestedAlbumTitle = await page.locator('.archive-title').first().innerText().catch(() => null);
    r.nestedTiles = await page.locator('.archive-tile').count();
  }
  // lightbox
  await page.locator('.archive-tile').first().click();
  await wait(page, 2500);
  r.lightboxOpen = await page.locator('.archive-lightbox').count();
  r.lightboxFocus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  r.lightboxAlt = await page.locator('.archive-lightbox img').first().getAttribute('alt').catch(() => null);
  await page.screenshot({ path: `${OUT}/1440x900__interaction-archive-lightbox.png` });
  await page.keyboard.press('ArrowRight'); await wait(page, 1600);
  r.lightboxCounterAfterArrow = await page.locator('.ps-viewer-nav span').first().innerText().catch(() => null);
  await page.keyboard.press('Escape'); await wait(page, 800);
  r.lightboxClosed = await page.locator('.archive-lightbox').count();
  await page.keyboard.press('Escape'); await wait(page, 700);
  r.archiveClosed = await page.locator('.archive').count();
  results.photoArchive = { ...r, log };
  await ctx.close();
}

// ── Desktop: film ribbons, stills album, still viewer, archive ───────────
{
  const { ctx, page, log } = await newPage();
  const r = {};
  await page.evaluate(() => { const el = document.querySelector('#filmography'); window.scrollTo(0, el.offsetTop + 500); });
  await wait(page, 2200);
  r.ribbonCount = await page.locator('.film-spiral-root').count();
  r.frameCount = await page.locator('.film-spiral-card').count();
  r.ribbonSizes = await page.evaluate(() => [...document.querySelectorAll('.film-spiral-wrap')].map(el => { const b = el.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
  // click a frame
  const frame = page.locator('.film-spiral-card[data-index="8"]').first();
  await frame.scrollIntoViewIfNeeded().catch(() => {});
  await wait(page, 800);
  const fb = await frame.boundingBox();
  if (fb) await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2);
  await wait(page, 2800);
  r.detailOpen = await page.locator('.film-detail').count();
  r.showcaseOpen = await page.locator('.stills-showcase').count();
  r.detailTitle = await page.locator('.film-detail h2, .film-detail-title').first().innerText().catch(() => null);
  r.detailRole = await page.locator('.film-detail [role="dialog"], .film-detail').first().getAttribute('role').catch(() => null);
  await page.screenshot({ path: `${OUT}/1440x900__interaction-still-viewer.png` });
  await page.keyboard.press('ArrowRight'); await wait(page, 900);
  r.detailCounter = await page.locator('.film-detail-counter').first().innerText().catch(() => null);
  await page.keyboard.press('Escape'); await wait(page, 1400);
  r.afterEscapeDetail = await page.locator('.film-detail').count();
  r.afterEscapeShowcase = await page.locator('.stills-showcase').count();
  r.showcaseTiles = await page.locator('.stills-showcase-tile').count();
  await page.screenshot({ path: `${OUT}/1440x900__interaction-stills-album.png` });
  await page.keyboard.press('Escape'); await wait(page, 900);
  r.showcaseClosed = await page.locator('.stills-showcase').count();
  await page.keyboard.press('Escape'); await wait(page, 600);
  r.archiveOpen = await page.locator('.film-archive').count();
  await page.screenshot({ path: `${OUT}/1440x900__interaction-film-archive.png` });
  if (r.archiveOpen) {
    r.archiveRibbons = await page.locator('.film-spiral-root').count();
    r.archiveScrollable = await page.evaluate(() => { const el = document.querySelector('.film-archive--scroll'); return el ? { scrollH: el.scrollHeight, clientH: el.clientHeight } : null; });
  }
  results.film = { ...r, log };
  await ctx.close();
}

fs.writeFileSync('evidence/phase-01/data/interaction-results.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2).slice(0, 6000));
await browser.close();

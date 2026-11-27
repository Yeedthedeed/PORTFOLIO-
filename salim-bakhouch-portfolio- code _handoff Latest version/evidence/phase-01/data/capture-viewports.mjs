import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'evidence/phase-01/screens';
const DATA = 'evidence/phase-01/data';
const BASE = 'http://127.0.0.1:4173/';

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1024x768', width: 1024, height: 768, mobile: false },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '360x800', width: 360, height: 800, mobile: true },
];

const SECTIONS = [
  ['hero', '#work', 0],
  ['photography', '#photography', 0],
  ['filmography', '#filmography', 0],
  ['featured', '#featured-project', 0],
  ['about', '#about', 0],
  ['contact', '#contact', 0],
];

const browser = await chromium.launch();
const summary = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('requestfailed', (r) => failed.push({ url: r.url().slice(0, 180), reason: r.failure()?.errorText }));

  const started = Date.now();
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  const info = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const fontSizeCounts = {};
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const node = walk.currentNode;
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
      const fs = Math.round(parseFloat(cs.fontSize) * 10) / 10;
      if (fs < 11) fontSizeCounts[fs] = (fontSizeCounts[fs] || 0) + 1;
    }
    return {
      title: document.title,
      layout: document.documentElement.dataset.layout,
      pointer: document.documentElement.dataset.pointer,
      scrollHeight: document.body.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hero: rect('#work'),
      photography: rect('#photography'),
      filmography: rect('#filmography'),
      featured: rect('#featured-project'),
      about: rect('#about'),
      contact: rect('#contact'),
      smallTextNodeCounts: fontSizeCounts,
      portrait: (() => {
        const img = document.querySelector('.hero-portrait-stage img');
        if (!img) return null;
        const r = img.getBoundingClientRect();
        return {
          file: decodeURIComponent(img.currentSrc.split('/').pop() || '').slice(0, 80),
          natural: [img.naturalWidth, img.naturalHeight],
          box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          opacity: getComputedStyle(img).opacity,
        };
      })(),
      sphereCards: document.querySelectorAll('.ps-card').length,
      filmRibbons: document.querySelectorAll('.film-spiral-root').length,
      filmFrames: document.querySelectorAll('.film-spiral-card').length,
      dockVisible: (() => { const d = document.querySelector('.mobile-dock'); return d ? getComputedStyle(d).display !== 'none' : false; })(),
      chapterRailVisible: (() => { const d = document.querySelector('.chapter-rail'); return d ? getComputedStyle(d).display !== 'none' : false; })(),
      navVisible: (() => { const d = document.querySelector('header'); return d ? getComputedStyle(d).display !== 'none' : false; })(),
    };
  });

  for (const [label, selector] of SECTIONS) {
    const el = await page.$(selector);
    if (!el) { info[label] = 'missing'; continue; }
    await page.evaluate((s) => {
      const target = document.querySelector(s);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    }, selector);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${viewport.name}__${label}.png` });
  }

  // filmography deeper frames for desktop
  if (!viewport.mobile && viewport.width >= 1024) {
    await page.evaluate(() => {
      const el = document.querySelector('#filmography');
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + Math.round(el.getBoundingClientRect().height * 0.34), behavior: 'instant' });
    });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${viewport.name}__filmography-02.png` });
  }

  summary.push({ viewport: viewport.name, loadMs: Date.now() - started, ...info, errors, failed });
  console.log(viewport.name, JSON.stringify({ layout: info.layout, overflow: info.scrollWidth - info.clientWidth, portrait: info.portrait?.natural, errors: errors.length, failed: failed.length }));
  await context.close();
}

fs.writeFileSync(`${DATA}/viewport-baseline.json`, JSON.stringify(summary, null, 2));
await browser.close();
console.log('DONE');

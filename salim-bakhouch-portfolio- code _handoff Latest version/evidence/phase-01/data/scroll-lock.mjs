import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150))});
await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
console.log('initial overflow', await p.evaluate(()=>document.body.style.overflow||'(empty)'), 'html', await p.evaluate(()=>getComputedStyle(document.documentElement).overflow));
// open photography archive
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1400);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2200);
console.log('archive open overflow', await p.evaluate(()=>document.body.style.overflow), 'html', await p.evaluate(()=>getComputedStyle(document.documentElement).overflow));
await p.keyboard.press('Escape'); await p.waitForTimeout(1200);
console.log('archive closed overflow', await p.evaluate(()=>document.body.style.overflow), 'html', await p.evaluate(()=>getComputedStyle(document.documentElement).overflow));
// check if lightbox locks, then closes restores
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1200);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2000);
await p.locator('.archive-tile').first().click(); await p.waitForTimeout(2000);
console.log('lightbox open overflow', await p.evaluate(()=>document.body.style.overflow));
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
console.log('lightbox closed overflow', await p.evaluate(()=>document.body.style.overflow));
// which components set body overflow?
console.log('open dialogs', await p.locator('[role="dialog"]').count());
for (const name of await p.locator('[role="dialog"]').evaluateAll(ds=>ds.map(d=>d.className))) console.log('dialog class', name);
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
console.log('after final esc overflow', await p.evaluate(()=>document.body.style.overflow), 'dialogs', await p.locator('[role="dialog"]').count());
console.log('errors', errs.slice(0,5));
// Then test scroll ability after close
await p.mouse.wheel(0,900); await p.waitForTimeout(700);
console.log('scrollY after close+wheel', await p.evaluate(()=>Math.round(scrollY)));
await browser.close();

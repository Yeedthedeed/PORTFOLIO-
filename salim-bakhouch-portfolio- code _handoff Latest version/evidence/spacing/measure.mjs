import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
console.log(JSON.stringify(await p.evaluate(()=>{
 const rows=[...document.querySelectorAll('.film-section-row')];
 const geo=[...document.querySelectorAll('.film-section-row > .chapter-geometry')];
 return {
  rowHeights: rows.map(r=>Math.round(r.getBoundingClientRect().height)),
  emptyGeo: geo.map(g=>({h:Math.round(g.getBoundingClientRect().height),pos:getComputedStyle(g).position,kids:g.children.length})),
  filmH: Math.round(document.querySelector('#filmography').getBoundingClientRect().height),
  gap: getComputedStyle(document.querySelector('.film-sections')).rowGap
 };
})), 'errors', errs.length);
await b.close();

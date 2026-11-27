import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
const page = await ctx.newPage();
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,180))});
const start=Date.now();
await page.goto(BASE,{waitUntil:'networkidle',timeout:120000}).catch(()=>{});
const navMs=Date.now()-start;
await page.waitForTimeout(6000);
const metrics=await page.evaluate(()=>{
 const nav=performance.getEntriesByType('navigation')[0];
 const res=performance.getEntriesByType('resource');
 const paints=performance.getEntriesByType('paint').map(p=>({name:p.name,t:Math.round(p.startTime)}));
 return {
  domContentLoaded: Math.round(nav?.domContentLoadedEventEnd||0),
  loadEvent: Math.round(nav?.loadEventEnd||0),
  transferSizeKB: Math.round((nav?.transferSize||0)/1024),
  resourceCount: res.length,
  failedish: res.filter(r=>r.transferSize===0&&r.decodedBodySize===0).length,
  paints,
  docHeight: document.body.scrollHeight,
  embeddedDataURIs: document.querySelectorAll('img[src^="data:"]').length,
  canvases: document.querySelectorAll('canvas').length,
  svgs: document.querySelectorAll('svg').length,
  animatedEls: document.getAnimations().length,
  fixedLayers: [...document.querySelectorAll('body div')].filter(el=>getComputedStyle(el).position==='fixed').length,
 };
});
// RAF & offscreen checks: count rAF calls over 2 seconds idle
const raf=await page.evaluate(()=>new Promise(res=>{
 let n=0; const t0=performance.now();
 const orig=window.requestAnimationFrame;
 window.requestAnimationFrame=function(cb){ n++; return orig.call(window,cb); };
 setTimeout(()=>{ window.requestAnimationFrame=orig; res({rafPerSec:n/2}); },2000);
}));
// background opacity & fixed layer stack
const layers=await page.evaluate(()=>[...document.querySelectorAll('body div')].filter(el=>{const cs=getComputedStyle(el);return cs.position==='fixed' && el.getBoundingClientRect().width>=innerWidth-2}).map(el=>({cls:(typeof el.className==='string'?el.className:'').slice(0,40),z:getComputedStyle(el).zIndex,op:getComputedStyle(el).opacity,bg:getComputedStyle(el).backgroundImage.slice(0,50)})).slice(0,12));
// scroll to filmography, measure fps proxy via rAF count
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+600));
await page.waitForTimeout(2000);
const rafFilm=await page.evaluate(()=>new Promise(res=>{let n=0;const o=window.requestAnimationFrame;window.requestAnimationFrame=function(cb){n++;return o.call(window,cb)};setTimeout(()=>{window.requestAnimationFrame=o;res(n/2)},2000);}));
console.log(JSON.stringify({navMs,metrics,raf,rafFilm,layers,errors:errs.slice(0,10)},null,2));
fs.writeFileSync('evidence/phase-01/data/perf.json',JSON.stringify({navMs,metrics,raf,rafFilm,layers,errors:errs.slice(0,10)},null,2));
await browser.close();

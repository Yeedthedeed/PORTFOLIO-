import { chromium } from 'playwright';
import fs from 'fs';
const b=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 const r=await p.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   cards:document.querySelectorAll('.ps-card').length,
   ribbons:document.querySelectorAll('.film-spiral-root').length,
   frames:document.querySelectorAll('.film-spiral-card').length,
   rigs:document.querySelectorAll('.chapter-light,.lighting-layer').length,
   dock:document.querySelectorAll('.mobile-dock').length,
   heroBg:getComputedStyle(document.querySelector('#work')).backgroundImage.slice(0,60),
   delusionBg:getComputedStyle(document.querySelector('#delusion-of-negation')).backgroundImage.slice(0,60),
   navZ:getComputedStyle(document.querySelector('header.site-header')).zIndex
 }));
 out[w+'x'+h]={...r,errors:errs.slice(0,3)};
 console.log(w+'x'+h,JSON.stringify(r),'errors',errs.length);
 await c.close();
}
// interactions still work
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500)); await p.waitForTimeout(1600);
const card=p.locator('#delusion-of-negation .film-spiral-card').nth(4); const cb=await card.boundingBox();
if(cb) await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);
await p.waitForTimeout(2300);
out.viewer={detail:await p.locator('.film-detail').count()};
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1500);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2200);
out.archive={open:await p.locator('.archive').count(),albums:await p.locator('.archive-album').count()};
await c.close();
fs.writeFileSync('evidence/phase-04c/regress.json',JSON.stringify(out,null,2));
console.log('INTERACTIONS',JSON.stringify({viewer:out.viewer,archive:out.archive}));
await b.close();

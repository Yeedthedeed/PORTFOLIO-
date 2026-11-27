import { chromium } from 'playwright';
import fs from 'fs';
const b=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 out[w+'x'+h]=await p.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   bloom:document.querySelectorAll('.bloom').length,
   geo:document.querySelectorAll('.chapter-geometry').length,
   cards:document.querySelectorAll('.ps-card').length,
   ribbons:document.querySelectorAll('.film-spiral-root').length,
   frames:document.querySelectorAll('.film-spiral-card').length,
   vt:typeof document.startViewTransition,
   accentDelusion:getComputedStyle(document.querySelector('#delusion-of-negation')).getPropertyValue('--film-accent').trim(),
   accentZakia:getComputedStyle(document.querySelector('#zakias-clock')).getPropertyValue('--film-accent').trim(),
   accentBirth:getComputedStyle(document.querySelector('#the-birth-permit')).getPropertyValue('--film-accent').trim(),
 }));
 out[w+'x'+h].errors=errs.slice(0,3);
 console.log(w+'x'+h,JSON.stringify(out[w+'x'+h]),'errors',errs.length);
 await c.close();
}
// interaction + transition
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1200);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(1800);
out.archive=await p.locator('.archive').count();
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500)); await p.waitForTimeout(1500);
const card=p.locator('#delusion-of-negation .film-spiral-card').nth(3); const cb=await card.boundingBox();
if(cb) await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);
await p.waitForTimeout(2000);
out.viewer=await p.locator('.film-detail').count();
out.audio=await p.locator('header button[aria-pressed]').first().getAttribute('aria-pressed');
await c.close();
fs.writeFileSync('evidence/phase-04f/regress.json',JSON.stringify(out,null,2));
console.log('INTERACTIONS',JSON.stringify({archive:out.archive,viewer:out.viewer}));
await b.close();

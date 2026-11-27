import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-05/screens';
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1100);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
 }
 for(const [film,sel] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
   const hh=await p.evaluate(s=>document.querySelector(s).offsetHeight,sel);
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1100); await p.screenshot({path:`${OUT}/${w}x${h}__${film}-start.png`});
   await p.evaluate(({s,y})=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+y);},{s:sel,y:hh*0.45});
   await p.waitForTimeout(1000); await p.screenshot({path:`${OUT}/${w}x${h}__${film}-mid.png`});
   await p.evaluate(({s,y})=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+y);},{s:sel,y:hh-200});
   await p.waitForTimeout(900); await p.screenshot({path:`${OUT}/${w}x${h}__${film}-end.png`});
 }
 const info=await p.evaluate(()=>{const r=getComputedStyle(document.documentElement);return{
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  bloom:document.querySelectorAll('.bloom').length,
  cards:document.querySelectorAll('.ps-card').length,
  ribbons:document.querySelectorAll('.film-spiral-root').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  accents:{d:getComputedStyle(document.querySelector('#delusion-of-negation')).getPropertyValue('--signal-tier').trim(),
   z:getComputedStyle(document.querySelector('#zakias-clock')).getPropertyValue('--signal-tier').trim(),
   b:getComputedStyle(document.querySelector('#the-birth-permit')).getPropertyValue('--signal-tier').trim()},
  muted:r.getPropertyValue('--muted').trim(), bg:r.getPropertyValue('--bg').trim()};});
 rows.push({viewport:`${w}x${h}`,...info,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify(info),'errors',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-05/capture.json',JSON.stringify(rows,null,2));
await b.close();

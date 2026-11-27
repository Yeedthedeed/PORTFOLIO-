import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-04e/screens';
const b=await chromium.launch();
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1300);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
 }
 const info=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   bloom:document.querySelectorAll('.bloom').length,
   geo:document.querySelectorAll('.chapter-geometry').length,
   cards:document.querySelectorAll('.ps-card').length,
   ribbons:document.querySelectorAll('.film-spiral-root').length}));
 console.log(w+'x'+h,JSON.stringify(info),'errors',errs.length);
 await c.close();
}
await b.close();

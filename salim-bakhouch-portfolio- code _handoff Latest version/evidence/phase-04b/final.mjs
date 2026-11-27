import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-04b/screens';
const b=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 const info=await p.evaluate(()=>({
   rigs:document.querySelectorAll('.chapter-light').length,
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   cards:document.querySelectorAll('.ps-card').length,
   ribbons:document.querySelectorAll('.film-spiral-root').length,
   navLayer:(()=>{const hd=document.querySelector('header.site-header');return hd?getComputedStyle(hd).zIndex:null})()
 }));
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['filmography','#delusion-of-negation'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1400);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}__final.png`});
 }
 out[w+'x'+h]={...info,errors:errs.slice(0,4)};
 console.log(w+'x'+h,JSON.stringify(info),'errors',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-04b/final.json',JSON.stringify(out,null,2));
await b.close();

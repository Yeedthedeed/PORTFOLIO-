import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-04/screens';
fs.mkdirSync(OUT,{recursive:true});
const V=[[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]];
const secs=[['hero','#work'],['photography','#photography'],['filmography','#filmography'],['featured','#featured-project'],['about','#about'],['contact','#contact']];
const browser=await chromium.launch();
const out={};
for(const [w,h,m] of V){
 for (const on of [true,false]) {
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
  const p=await c.newPage();
  if(on) await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,150))});
  await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7500);
  for(const [name,sel] of secs){
    await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
    await p.waitForTimeout(1500);
    await p.screenshot({path:`${OUT}/${w}x${h}__${name}__${on?'light':'base'}.png`});
  }
  const info=await p.evaluate(()=>({
    lighting:document.documentElement.dataset.lighting,
    layer:document.querySelectorAll('.lighting-layer').length,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    cards:document.querySelectorAll('.ps-card').length,
    ribbons:document.querySelectorAll('.film-spiral-root').length,
    dock:document.querySelectorAll('.mobile-dock').length
  }));
  out[(on?'light':'base')+' '+w+'x'+h]={...info,errors:errs.slice(0,3)};
  console.log((on?'light':'base'),w+'x'+h,JSON.stringify(info),'errors',errs.length);
  await c.close();
 }
}
fs.writeFileSync('evidence/phase-04/capture.json',JSON.stringify(out,null,2));
await browser.close();

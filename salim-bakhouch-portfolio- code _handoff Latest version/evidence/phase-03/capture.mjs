import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const OUT='evidence/phase-03/screens';
const VIEWS=[
 {n:'1920x1080',w:1920,h:1080,m:false},
 {n:'1440x900',w:1440,h:900,m:false},
 {n:'1024x768',w:1024,h:768,m:false},
 {n:'768x1024',w:768,h:1024,m:true},
 {n:'390x844',w:390,h:844,m:true},
 {n:'360x800',w:360,h:800,m:true},
 {n:'844x390',w:844,h:390,m:true},
];
const secs=[['hero','#work'],['photography','#photography'],['filmography','#filmography'],['featured','#featured-project'],['about','#about'],['contact','#contact']];
const browser=await chromium.launch();
const report=[];
for(const v of VIEWS){
 const c=await browser.newContext({viewport:{width:v.w,height:v.h},isMobile:v.m,hasTouch:v.m,deviceScaleFactor:1});
 const p=await c.newPage();
 const errors=[]; const failed=[];
 p.on('pageerror',e=>errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200))});
 p.on('requestfailed',r=>failed.push(r.url().slice(0,120)));
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForTimeout(8000);
 const metrics=await p.evaluate(()=>{
  const small={}; const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let count=0;
  while(walk.nextNode()){const el=walk.currentNode.parentElement;if(!el||!walk.currentNode.textContent.trim())continue;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05)continue;const fs=Math.round(parseFloat(cs.fontSize)*10)/10;if(fs<12){small[fs]=(small[fs]||0)+1;count++;}}
  const portrait=document.querySelector('.hero-portrait-stage img');
  return {layout:document.documentElement.dataset.layout,height:document.body.scrollHeight,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   smallText:small,smallCount:count,
   portrait:portrait?{natural:[portrait.naturalWidth,portrait.naturalHeight],opacity:getComputedStyle(portrait).opacity}:null,
   eyebrow:getComputedStyle(document.querySelector('.eyebrow')).fontSize,
   filmMeta:getComputedStyle(document.querySelector('.film-section-meta')).fontSize,
   logline:getComputedStyle(document.querySelector('.film-section-logline p:last-child')).fontSize,
   body:getComputedStyle(document.querySelector('#about p')).fontSize,
   tokens:{text:getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim(),bg:getComputedStyle(document.documentElement).getPropertyValue('--surface-base').trim()},
   sphereCards:document.querySelectorAll('.ps-card').length,ribbons:document.querySelectorAll('.film-spiral-root').length,frames:document.querySelectorAll('.film-spiral-card').length};
 });
 for(const [name,sel] of secs){
   const el=await p.$(sel); if(!el) continue;
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:'instant'});},sel);
   await p.waitForTimeout(1500);
   await p.screenshot({path:`${OUT}/${v.n}__${name}.png`});
 }
 report.push({viewport:v.n,...metrics,errors,failed});
 console.log(v.n,JSON.stringify({layout:metrics.layout,small:metrics.smallCount,eyebrow:metrics.eyebrow,meta:metrics.filmMeta,logline:metrics.logline,overflow:metrics.overflow,errors:errors.length}));
 await c.close();
}
fs.writeFileSync('evidence/phase-03/capture-report.json',JSON.stringify(report,null,2));
await browser.close();
console.log('done');

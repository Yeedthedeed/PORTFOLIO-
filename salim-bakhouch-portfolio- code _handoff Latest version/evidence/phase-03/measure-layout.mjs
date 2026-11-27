import { chromium } from 'playwright';
const browser=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7500);
 const r=await p.evaluate(()=>{
  const box=s=>{const el=document.querySelector(s);if(!el)return null;const b=el.getBoundingClientRect();return{t:Math.round(b.top+scrollY),b:Math.round(b.bottom+scrollY),l:Math.round(b.left),r:Math.round(b.right),w:Math.round(b.width),h:Math.round(b.height)};};
  const header=box('#photography .spatial-header');
  const cards=[...document.querySelectorAll('#photography .ps-card')].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0);
  const sphereTop=cards.length?Math.round(Math.min(...cards.map(b=>b.top+scrollY))):null;
  const sphereBottom=cards.length?Math.round(Math.max(...cards.map(b=>b.bottom+scrollY))):null;
  const section=box('#photography');
  const film=box('#filmography');
  const rows=[...document.querySelectorAll('.film-section-row')].map(row=>{
    const rb=row.getBoundingClientRect();
    const cards=[...row.querySelectorAll('.film-spiral-card')].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0);
    const stage=row.querySelector('.film-section-ribbon')?.getBoundingClientRect();
    return {top:Math.round(rb.top+scrollY),bottom:Math.round(rb.bottom+scrollY),h:Math.round(rb.height),
      ribbonStage:stage?{t:Math.round(stage.top+scrollY),b:Math.round(stage.bottom+scrollY),h:Math.round(stage.height)}:null,
      frameTop:cards.length?Math.round(Math.min(...cards.map(b=>b.top+scrollY))):null,
      frameBottom:cards.length?Math.round(Math.max(...cards.map(b=>b.bottom+scrollY))):null,
      clippedAbove:cards.length&&stage?Math.round(Math.min(...cards.map(b=>b.top+scrollY))-(stage.top+scrollY))<0:null,
      clippedBelow:cards.length&&stage?Math.round(Math.max(...cards.map(b=>b.bottom+scrollY))-(stage.bottom+scrollY))>0:null,
      overflow:getComputedStyle(row).overflow};
  });
  return {layout:document.documentElement.dataset.layout,header,section,sphereTop,sphereBottom,
    headerSphereOverlap:header&&sphereTop!==null?sphereTop<header.b:null,
    gapHeaderSphere:header&&sphereTop!==null?sphereTop-header.b:null,
    film:{top:film?.t,bottom:film?.b,h:film?.h,overflow:film?getComputedStyle(document.querySelector('#filmography')).overflow:null},
    rows,docHeight:document.body.scrollHeight,overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    type:{eyebrow:getComputedStyle(document.querySelector('.eyebrow')).fontSize,title:getComputedStyle(document.querySelector('.spatial-title')).fontSize,subtitle:getComputedStyle(document.querySelector('.spatial-subtitle')).fontSize,
      filmTitle:getComputedStyle(document.querySelector('.film-section-title')).fontSize,filmMeta:getComputedStyle(document.querySelector('.film-section-meta')).fontSize,
      filmLogline:getComputedStyle(document.querySelector('.film-section-logline p:last-child')).fontSize,em:getComputedStyle(document.querySelector('.spatial-title em')).color,muted:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()},
    errors:window.__errors||[]};
 });
 out[w+'x'+h]=r;
 console.log(w+'x'+h,JSON.stringify({layout:r.layout,headerSphereOverlap:r.headerSphereOverlap,gap:r.gapHeaderSphere,filmOverflow:r.film.overflow,rows:r.rows.map(x=>({clippedAbove:x.clippedAbove,clippedBelow:x.clippedBelow,overflow:x.overflow})),type:r.type,overflowX:r.overflowX,doc:r.docHeight}));
 await c.close();
}
import fs from 'fs'; fs.writeFileSync('/tmp/layout.json',JSON.stringify(out,null,2));
await browser.close();

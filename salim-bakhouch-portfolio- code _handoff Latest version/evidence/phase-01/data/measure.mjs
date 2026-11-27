import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const out={};

// 1. Sphere & ribbon scale across widths
for (const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[360,800]]) {
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});
  const p=await c.newPage();
  await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7500);
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1600);
  const sphere=await p.evaluate(()=>{
    const cards=[...document.querySelectorAll('.ps-card')].map(el=>el.getBoundingClientRect()).filter(r=>r.width>0);
    if(!cards.length) return null;
    const minX=Math.min(...cards.map(r=>r.left)), maxX=Math.max(...cards.map(r=>r.right));
    const minY=Math.min(...cards.map(r=>r.top)), maxY=Math.max(...cards.map(r=>r.bottom));
    const wrap=document.querySelector('.sphere-wrap')?.getBoundingClientRect();
    return {clusterW:Math.round(maxX-minX),clusterH:Math.round(maxY-minY),vw:innerWidth,share:Math.round((maxX-minX)/innerWidth*100),wrap:wrap&&{w:Math.round(wrap.width),h:Math.round(wrap.height)},visible:cards.length};
  });
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+400)); await p.waitForTimeout(1900);
  const ribbon=await p.evaluate(()=>{
    const wrap=document.querySelector('.film-spiral-wrap')?.getBoundingClientRect();
    const imgs=[...document.querySelectorAll('.film-section:first-of-type .film-spiral-card img, .film-spiral-card img')].map(i=>i.getBoundingClientRect()).filter(r=>r.width>0);
    const maxW=imgs.length?Math.max(...imgs.map(r=>r.width)):0;
    const title=document.querySelector('.film-section-title')?.getBoundingClientRect();
    return {wrap:wrap&&{w:Math.round(wrap.width),h:Math.round(wrap.height)},maxFrameW:Math.round(maxW),titleH:title&&Math.round(title.height)};
  });
  out[w+'x'+h]={sphere,ribbon};
  await c.close();
}

// 2. nav collisions: measure header items
for (const [w,h] of [[1440,900],[1024,768],[768,1024],[390,844],[360,800],[844,390]]) {
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});
  const p=await c.newPage(); await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
  out['nav'+w+'x'+h]=await p.evaluate(()=>{
    const items=[...document.querySelectorAll('header.site-header a, header.site-header button, header.site-header span')].map(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return{txt:(el.innerText||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,26),x:Math.round(r.left),r:Math.round(r.right),y:Math.round(r.top),b:Math.round(r.bottom),vis:cs.display!=='none'&&r.width>0}}).filter(i=>i.vis);
    const overlaps=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(a.txt&&b.txt&&a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b)overlaps.push([a.txt,b.txt]);}
    return {items:items.filter(i=>i.txt),overlaps};
  });
  // meta-card vs dock overlap in hero
  out['hero'+w+'x'+h]=await p.evaluate(()=>{
    const rect=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();if(!r.width)return null;return{top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right)}};
    const dock=rect('.mobile-dock');const meta=rect('#work .hidden.md\\:block');const cap=rect('.mobile-hero-caption');const now=rect('.hero-now');
    const hit=(a,b)=>a&&b?!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top):null;
    return {dock,meta,cap,now,dockMeta:hit(dock,meta),dockCaption:hit(dock,cap),dockNow:hit(dock,now)};
  });
  await c.close();
}
fs.writeFileSync('evidence/phase-01/data/measurements.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2).slice(0,12000));
await browser.close();

import { chromium } from 'playwright';
import fs from 'fs';
const browser=await chromium.launch();
const out={};
const c=await browser.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(8000);
// film slate data-driven check
out.filmSlates=await p.evaluate(()=>[...document.querySelectorAll('.film-section-row')].map(sec=>({
 heading:sec.querySelector('.film-section-title')?.innerText.trim(),
 eyebrow:sec.querySelector('.eyebrow')?.innerText.trim(),
 meta:sec.querySelector('.film-section-meta')?.innerText.trim(),
 accentVars:{accent:getComputedStyle(sec).getPropertyValue('--film-accent').trim(),cool:getComputedStyle(sec).getPropertyValue('--film-accent-cool').trim()},
 dot:getComputedStyle(sec.querySelector('.film-section-meta'),'::before').backgroundColor,
 frames:sec.querySelectorAll('.film-spiral-card').length,
 caption:sec.querySelector('.film-spiral-caption')?.innerText.trim()
})));
// nav collisions
for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[360,800],[844,390]]){
  const cc=await browser.newContext({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});
  const pp=await cc.newPage(); await pp.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await pp.waitForTimeout(7000);
  out['nav'+w+'x'+h]=await pp.evaluate(()=>{
   const items=[...document.querySelectorAll('header.site-header a, header.site-header button, header.site-header span')].map(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return{txt:(el.innerText||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,24),x:Math.round(r.left),r:Math.round(r.right),y:Math.round(r.top),b:Math.round(r.bottom),vis:cs.display!=='none'&&r.width>0}}).filter(i=>i.vis&&i.txt);
   const overlaps=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(a.txt&&b.txt&&a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b)overlaps.push([a.txt,b.txt]);}
   return {items:items.map(i=>i.txt),overlaps};
  });
  await cc.close();
}
// photography archive open / lightbox / esc
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop));
await p.waitForTimeout(1400);
await p.getByRole('button',{name:/browse all albums/i}).first().click();
await p.waitForTimeout(2200);
out.archive={open:await p.locator('.archive').count(),title:await p.locator('.archive-title').first().innerText().catch(()=>null),albums:await p.locator('.archive-album').count(),tiles:await p.locator('.archive-tile').count()};
await p.locator('.archive-tile').first().click(); await p.waitForTimeout(2200);
out.lightbox={open:await p.locator('.archive-lightbox').count(),caption:await p.locator('.ps-viewer figcaption').first().innerText().catch(()=>null)};
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
await p.keyboard.press('Escape'); await p.waitForTimeout(700);
out.archiveAfterEsc={archive:await p.locator('.archive').count(),bodyOverflow:await p.evaluate(()=>document.body.style.overflow)};
// film viewer + stills
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500));
await p.waitForTimeout(2000);
const frame=p.locator('.film-spiral-card').first(); const fb=await frame.boundingBox();
if(fb) await p.mouse.click(fb.x+fb.width/2,fb.y+fb.height/2);
await p.waitForTimeout(2600);
out.filmViewer={detail:await p.locator('.film-detail').count(),showcase:await p.locator('.stills-showcase').count()};
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
out.filmAfterEsc={showcase:await p.locator('.stills-showcase').count(),bodyOverflow:await p.evaluate(()=>document.body.style.overflow)};
out.errors=errs.slice(0,8);
await c.close();
// mobile composition
const m=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const mp=await m.newPage(); await mp.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await mp.waitForTimeout(7000);
out.mobile=await mp.evaluate(()=>{
 const rect=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return r.width?{t:Math.round(r.top),b:Math.round(r.bottom),l:Math.round(r.left),r:Math.round(r.right)}:null;};
 const dock=rect('.mobile-dock'),caption=rect('.mobile-hero-caption'),portrait=rect('.hero-portrait-stage img');
 const hit=(a,b)=>a&&b?!(a.r<=b.l||b.r<=a.l||a.b<=b.t||b.b<=a.t):null;
 return {dock,caption,portrait,dockCaption:hit(dock,caption),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,heroHeight:document.querySelector('#work')?.getBoundingClientRect().height};
});
await mp.screenshot({path:'evidence/phase-03/screens/390x844__hero-final.png'});
await m.close();
fs.writeFileSync('evidence/phase-03/regressions.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2).slice(0,7000));
await browser.close();

import { chromium } from 'playwright';
import fs from 'fs';
const B='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,150))});
 await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>({
  layout:document.documentElement.dataset.layout,
  dock:document.querySelectorAll('.mobile-dock').length,
  progress:document.querySelectorAll('.scroll-progress').length,
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  bodyPad:getComputedStyle(document.body).paddingBottom,
  sphereCards:document.querySelectorAll('.ps-card').length,
  ribbons:document.querySelectorAll('.film-spiral-root').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  navOverlaps:(()=>{const it=[...document.querySelectorAll('header.site-header a,header.site-header button,header.site-header span')].map(e=>{const b=e.getBoundingClientRect();return{t:(e.innerText||e.getAttribute('aria-label')||'').trim(),x:b.left,r:b.right,y:b.top,bb:b.bottom,vis:getComputedStyle(e).display!=='none'&&b.width>0}}).filter(i=>i.vis&&i.t);const o=[];for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const a=it[i],b=it[j];if(a.x<b.r&&b.x<a.r&&a.y<b.bb&&b.y<a.b&&!(a.t.includes(b.t)||b.t.includes(a.t)))o.push([a.t,b.t]);}return o;})()
 }));
 // album open/close on each viewport
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+600)); await p.waitForTimeout(1600);
 const b2=p.getByRole('button',{name:/view full album/i}).first();
 let album=0;
 if(await b2.count()){ await b2.click(); await p.waitForTimeout(2200); album=await p.locator('.stills-showcase').count();
   await p.screenshot({path:`evidence/phase-03b/screens/${w}__album-check.png`}); await p.keyboard.press('Escape'); await p.waitForTimeout(900); }
 r.albumOpened=album;
 r.albumClosed=await p.locator('.stills-showcase').count();
 r.bodyOverflowAfter=await p.evaluate(()=>document.body.style.overflow);
 out[w+'x'+h]={...r,errors:errs.slice(0,4)};
 console.log(w+'x'+h,JSON.stringify({layout:r.layout,dock:r.dock,progress:r.progress,overflow:r.overflow,cards:r.sphereCards,ribbons:r.ribbons,album:r.albumOpened,closed:r.albumClosed,bodyOverflow:r.bodyOverflowAfter,nav:r.navOverlaps.length,errors:errs.length}));
 await c.close();
}
// landing + archive watch link audit
const c=await browser.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(8000);
out.watchLanding=await p.evaluate(()=>[...document.querySelectorAll('.film-section-row .film-watch')].map(a=>({film:a.closest('.film-section-row')?.querySelector('.film-section-title')?.innerText.trim(),label:a.innerText.trim().replace(/\s+/g,' '),href:a.getAttribute('href'),target:a.getAttribute('target')})));
out.heroNoGuide=await p.evaluate(()=>!document.querySelector('.hero-scroll-cue'));
await c.close();
fs.writeFileSync('evidence/phase-03b/regress.json',JSON.stringify(out,null,2));
await browser.close();

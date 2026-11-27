import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const out={};

// Mobile ribbon tap with a visible frame
{
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const p=await c.newPage(); await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+300)); await p.waitForTimeout(2200);
 const frames=await p.locator('.film-spiral-card').evaluateAll(els=>els.map((e,i)=>{const r=e.getBoundingClientRect();return{i,idx:e.getAttribute('data-index'),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),vis:r.top>80&&r.bottom<760&&r.width>40}}).filter(f=>f.vis).slice(0,6));
 out.mobileVisibleFrames=frames;
 if(frames.length){
  const f=frames[Math.floor(frames.length/2)];
  await p.touchscreen.tap(f.x+f.w/2, f.y+f.h/2);
  await p.waitForTimeout(2600);
  out.mobileRibbonTap={frame:f,showcase:await p.locator('.stills-showcase').count(),detail:await p.locator('.film-detail').count()};
  await p.screenshot({path:'evidence/phase-01/screens/390x844__ribbon-tap-result.png'});
  await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
 }
 // mobile film archive composition
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+300)); await p.waitForTimeout(1200);
 const openBtn=p.locator('.film-section button').filter({hasText:/archive/i}).last();
 await openBtn.click({force:true}); await p.waitForTimeout(2400);
 out.mobileFilmArchive=await p.evaluate(()=>({open:document.querySelectorAll('.film-archive').length, ribbons:document.querySelectorAll('.film-archive .film-spiral-root').length, frames:document.querySelectorAll('.film-archive .film-spiral-card').length, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth, scrollable:(()=>{const el=document.querySelector('.film-archive--scroll');return el?{sh:el.scrollHeight,ch:el.clientHeight}:null})()}));
 await p.screenshot({path:'evidence/phase-01/screens/390x844__film-archive-mobile.png'});
 await c.close();
}

// Longer-wait focus restore after archive close
{
 const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1200);
 const browse=p.getByRole('button',{name:/browse all albums/i}).first();
 await browse.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(2200);
 out.beforeClose=await p.evaluate(()=>({dialogs:document.querySelectorAll('[role=dialog]').length, active:(document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText||'').trim().slice(0,30)}));
 await p.keyboard.press('Escape'); await p.waitForTimeout(2200);
 out.afterClose=await p.evaluate(()=>({dialogs:document.querySelectorAll('[role=dialog]').length, active:(document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText||'').trim().slice(0,30), onBody:document.activeElement===document.body, browseFocus:document.activeElement===document.querySelector('#photography button')}));
 // sphere tab stops
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1600);
 out.sphereTabStops=await p.evaluate(()=>[...document.querySelectorAll('.ps-card')].filter(el=>el.getAttribute('tabindex')==='0').length);
 // contrast values
 out.colors=await p.evaluate(()=>{const els=[...document.querySelectorAll('.font-mono,.eyebrow,.film-spiral-caption,.hero-side,.chapter-rail')].slice(0,6);return els.map(el=>({cls:(typeof el.className==='string'?el.className:'').slice(0,26),fs:getComputedStyle(el).fontSize,color:getComputedStyle(el).color,bg:getComputedStyle(document.body).backgroundColor}))});
 await c.close();
}
fs.writeFileSync('evidence/phase-01/data/closeout.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
await browser.close();

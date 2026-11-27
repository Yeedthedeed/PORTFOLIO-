import { chromium } from 'playwright';
import fs from 'fs';
const browser=await chromium.launch();
const out={};
const V=[[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]];
const OUT='evidence/phase-03/screens-after';
fs.mkdirSync(OUT,{recursive:true});
for(const [w,h,m] of V){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,160))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{
  const bb=el=>{const b=el.getBoundingClientRect();return{t:Math.round(b.top+scrollY),b:Math.round(b.bottom+scrollY),w:Math.round(b.width)};};
  const header=document.querySelector('#photography .spatial-header');
  const cards=[...document.querySelectorAll('.ps-card')].map(el=>el.getBoundingClientRect()).filter(b=>b.width>0);
  const sphere=cards.length?{t:Math.round(Math.min(...cards.map(b=>b.top+scrollY))),b:Math.round(Math.max(...cards.map(b=>b.bottom+scrollY)))}:null;
  const hb=header?bb(header):null;
  const filmRows=[...document.querySelectorAll('.film-section-row')].map(row=>{
    const st=row.querySelector('.film-section-ribbon')?.getBoundingClientRect();
    const cs=[...row.querySelectorAll('.film-spiral-card')].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0);
    return cs.length&&st?{above:Math.min(...cs.map(b=>b.top))>=st.top-1,below:Math.max(...cs.map(b=>b.bottom))<=st.bottom+1,n:cs.length}:null;
  });
  return {layout:document.documentElement.dataset.layout,
    sphereOverlap:sphere&&hb?sphere.t<hb.b:null,gap:sphere&&hb?sphere.t-hb.b:null,
    sphereCards:cards.length,ribbons:filmRows,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    navOverlaps:(()=>{const it=[...document.querySelectorAll('header.site-header a, header.site-header button, header.site-header span')].map(el=>{const b=el.getBoundingClientRect();const t=(el.innerText||el.getAttribute('aria-label')||'').trim();return{t,x:b.left,r:b.right,y:b.top,b:b.bottom,vis:getComputedStyle(el).display!=='none'&&b.width>0}}).filter(i=>i.vis&&i.t);const o=[];for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const a=it[i],b=it[j];if(a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b&&!(a.t.includes(b.t)||b.t.includes(a.t)))o.push([a.t,b.t]);}return o;})(),
    type:{eyebrow:getComputedStyle(document.querySelector('.eyebrow')).fontSize,title:getComputedStyle(document.querySelector('.spatial-title')).fontSize,filmMeta:getComputedStyle(document.querySelector('.film-section-meta')).fontSize,em:getComputedStyle(document.querySelector('.spatial-title em')).color,muted:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()},
    doc:document.body.scrollHeight};
 });
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['filmography','#filmography'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1400);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
 }
 out[w+'x'+h]={...r,errors:errs.slice(0,5)};
 console.log(w+'x'+h,JSON.stringify({layout:r.layout,overlap:r.sphereOverlap,cards:r.sphereCards,ribbons:r.ribbons,overflow:r.overflow,nav:r.navOverlaps,errors:errs.length}));
 await c.close();
}
// interaction regression
const c=await browser.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(8000);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop));await p.waitForTimeout(1400);
await p.getByRole('button',{name:/browse all albums/i}).first().click();await p.waitForTimeout(2200);
out.archive={open:await p.locator('.archive').count(),albums:await p.locator('.archive-album').count()};
await p.keyboard.press('Escape');await p.waitForTimeout(900);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500));await p.waitForTimeout(1800);
const card=p.locator('.film-spiral-card').first();const cb=await card.boundingBox();if(cb)await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);
await p.waitForTimeout(2400);
out.film={detail:await p.locator('.film-detail').count(),showcase:await p.locator('.stills-showcase').count()};
await p.keyboard.press('Escape');await p.waitForTimeout(900);
out.audio=(await p.locator('header button[aria-pressed]').first().getAttribute('aria-pressed'));
await c.close();
fs.writeFileSync('evidence/phase-03/final-report.json',JSON.stringify(out,null,2));
await browser.close();
console.log('DONE');

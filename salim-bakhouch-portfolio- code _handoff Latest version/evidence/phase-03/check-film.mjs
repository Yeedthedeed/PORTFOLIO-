import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[390,844,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{
  const rows=[...document.querySelectorAll('.film-section-row')].map((row,i)=>{
   const rb=row.getBoundingClientRect();
   const stage=row.querySelector('.film-section-ribbon')?.getBoundingClientRect();
   const cards=[...row.querySelectorAll('.film-spiral-card')].map(e=>{const b=e.getBoundingClientRect();return{top:b.top,bottom:b.bottom,w:b.width};}).filter(b=>b.w>0);
   return {i,rowTop:Math.round(rb.top+scrollY),rowH:Math.round(rb.height),
     stage:stage?{t:Math.round(stage.top+scrollY),b:Math.round(stage.bottom+scrollY),h:Math.round(stage.height)}:null,
     n:cards.length,
     frames:cards.length?{t:Math.round(Math.min(...cards.map(c=>c.top+scrollY))),b:Math.round(Math.max(...cards.map(c=>c.bottom+scrollY)))}:null,
     overTop:cards.length&&stage?Math.round(Math.min(...cards.map(c=>c.top))-stage.top):null,
     overBottom:cards.length&&stage?Math.round(Math.max(...cards.map(c=>c.bottom))-stage.bottom):null,
     rowOverflow:getComputedStyle(row).overflow};
  });
  return {sectionOverflow:getComputedStyle(document.querySelector('#filmography')).overflow,rows};
 });
 console.log(w+'x'+h,JSON.stringify(r));
 await p.evaluate(()=>{const e=document.querySelector('#filmography');window.scrollTo(0,e.offsetTop+520);});
 await p.waitForTimeout(2200);
 await p.screenshot({path:`/tmp/film-${w}.png`});
 await c.close();
}
await browser.close();

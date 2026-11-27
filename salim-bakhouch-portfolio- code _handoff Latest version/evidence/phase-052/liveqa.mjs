import { chromium } from 'playwright';
const b=await chromium.launch();
for(const [w,h,m] of [[1440,900,false],[390,844,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,90))});
 await p.goto('https://etherealism-seamless.deed.page/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 await p.evaluate(()=>{const s=document.querySelector('#filmography');window.scrollTo(0,s.getBoundingClientRect().top+scrollY+900);});
 await p.waitForTimeout(1500);
 await p.screenshot({path:`evidence/phase-052/screens/LIVE-${w}.png`});
 console.log(w,JSON.stringify(await p.evaluate(()=>({
  borders:[...document.querySelectorAll('.film-section-row')].map(r=>getComputedStyle(r).borderTopWidth),
  captions:document.querySelectorAll('.film-spiral-caption').length,
  geoShapes:document.querySelectorAll('#filmography .chapter-geometry rect').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))),'err',errs.length);
 await c.close();
}
await b.close();

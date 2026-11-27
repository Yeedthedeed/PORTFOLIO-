import { chromium } from 'playwright';
const b=await chromium.launch();
for(const [w,h,m] of [[1440,900,false],[390,844,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 const r=await p.evaluate(()=>{
  const sec=document.querySelector('#filmography');
  const hd=sec.querySelector(':scope > .spatial-header');
  const hb=hd.getBoundingClientRect(), sb=sec.getBoundingClientRect();
  const rows=[...document.querySelectorAll('.film-section-row')].map(x=>{const b=x.getBoundingClientRect();return{t:Math.round(b.top+scrollY),h:Math.round(b.height)}});
  return {headerTop:Math.round(hb.top),headerH:Math.round(hb.height),sectionTop:Math.round(sb.top),innerSpaceAboveHeader:Math.round(hb.top-sb.top),rows};
 });
 // scroll so the header is in view, capture it
 await p.evaluate(()=>{const s=document.querySelector('#filmography');window.scrollTo(0,s.getBoundingClientRect().top+scrollY);});
 await p.waitForTimeout(1200);
 await p.screenshot({path:`evidence/phase-052/screens/${w}x${h}__header-clean.png`});
 console.log(w+'x'+h,JSON.stringify(r));
 await c.close();
}
await b.close();

import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(2200);
 const r=await p.evaluate(()=>{
  const hd=document.querySelector('#photography .spatial-header').getBoundingClientRect();
  const cards=[...document.querySelectorAll('.ps-card')].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0);
  const top=cards.length?Math.min(...cards.map(b=>b.top)):null;
  const bottom=cards.length?Math.max(...cards.map(b=>b.bottom)):null;
  const dock=document.querySelector('.mobile-dock')?.getBoundingClientRect();
  return {n:cards.length,headerBottom:Math.round(hd.bottom),cardTop:top!==null?Math.round(top):null,
    cardBottom:bottom!==null?Math.round(bottom):null,gap:top!==null?Math.round(top-hd.bottom):null,
    overlap:top!==null?top<hd.bottom-1:null,
    cardsBehindDock: dock&&bottom!==null ? bottom>dock.top+2 : null};
 });
 console.log(w+'x'+h,JSON.stringify(r));
 await c.close();
}
await browser.close();

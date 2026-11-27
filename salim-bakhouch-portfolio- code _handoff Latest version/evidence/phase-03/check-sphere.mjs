import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const [w,h,m] of [[1440,900,false],[390,844,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{
  const sec=document.querySelector('#photography');
  const header=document.querySelector('#photography .spatial-header');
  const wrap=document.querySelector('.sphere-wrap');
  const stage=document.querySelector('.sphere-stage');
  const cards=[...document.querySelectorAll('.ps-card')];
  const bb=el=>{if(!el)return null;const b=el.getBoundingClientRect();return{t:Math.round(b.top+scrollY),b:Math.round(b.bottom+scrollY),w:Math.round(b.width),h:Math.round(b.height)};};
  const cbs=cards.map(c=>c.getBoundingClientRect()).filter(b=>b.width>0);
  return {section:bb(sec),header:bb(header),wrap:bb(wrap),stage:bb(stage),cards:cards.length,cardsSized:cbs.length,
   cardBox:cbs.length?{t:Math.round(Math.min(...cbs.map(b=>b.top+scrollY))),b:Math.round(Math.max(...cbs.map(b=>b.bottom+scrollY)))}:null,
   wrapDisplay:wrap?getComputedStyle(wrap).display:null, wrapPos:wrap?getComputedStyle(wrap).position:null,
   sectionDisplay:sec?getComputedStyle(sec).display:null, errors:[]};
 });
 console.log(w+'x'+h,JSON.stringify(r));
 await p.evaluate(()=>{const e=document.querySelector('#photography');window.scrollTo(0,e.offsetTop);});
 await p.waitForTimeout(1600);
 await p.screenshot({path:'/tmp/sphere-'+w+'.png'});
 console.log('errors',errs.slice(0,3));
 await c.close();
}
await browser.close();

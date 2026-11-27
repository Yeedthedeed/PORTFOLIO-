import { chromium } from 'playwright';
const b=await chromium.launch();
for(const [w,h,m] of [[1440,900,false],[1920,1080,false],[390,844,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+600)); await p.waitForTimeout(1800);
 const btn=p.getByRole('button',{name:/view full album/i}).first();
 if(await btn.count()){ await btn.click(); await p.waitForTimeout(2600); }
 await p.screenshot({path:`evidence/phase-03b/screens/${w}__album-final.png`});
 const info=await p.evaluate(()=>{
  const hd=document.querySelector('.stills-showcase-header');
  const tools=document.querySelector('.stills-showcase-tools');
  const watch=document.querySelector('.stills-showcase-watch');
  const back=document.querySelector('.stills-showcase-header .text-action');
  const bb=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{t:Math.round(r.top),b:Math.round(r.bottom),l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),h:Math.round(r.height)}};
  const wb=bb(watch), bbb=bb(back), tb=bb(tools);
  const overlap=(a,b)=>a&&b?!(a.r<=b.l||b.r<=a.l||a.b<=b.t||b.b<=a.t):null;
  return {headerH:hd?Math.round(hd.getBoundingClientRect().height):null,
    watchBox:wb, backBox:bbb, toolsBox:tb, overlapBackTools:overlap(bbb,tb),
    gridCols:getComputedStyle(document.querySelector('.stills-showcase-grid')).gridTemplateColumns,
    tiles:document.querySelectorAll('.stills-showcase-tile').length};
 });
 console.log(w+'x'+h,JSON.stringify(info));
 await c.close();
}
await b.close();

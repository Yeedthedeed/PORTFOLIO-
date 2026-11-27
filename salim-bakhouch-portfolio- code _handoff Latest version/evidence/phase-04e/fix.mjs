import { chromium } from 'playwright';
const b=await chromium.launch();
for(const [w,h] of [[844,390],[390,844]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true}); const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 await p.screenshot({path:`evidence/phase-04e/screens/${w}x${h}__hero__fixed.png`});
 console.log(w+'x'+h, JSON.stringify(await p.evaluate(()=>({geo:document.querySelectorAll('#work .chapter-geometry').length,
   geoVisible:document.querySelector('#work .chapter-geometry')?getComputedStyle(document.querySelector('#work .chapter-geometry')).display:null}))));
 await c.close();
}
await b.close();

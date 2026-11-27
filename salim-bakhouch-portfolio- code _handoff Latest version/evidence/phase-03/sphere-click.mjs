import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const [w,h,m] of [[1440,900,false],[390,844,true]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(2000);
 const info=await p.evaluate(()=>{
  const card=document.querySelector('.ps-card');
  const cs=getComputedStyle(card);
  const b=card.getBoundingClientRect();
  return {inline:card.getAttribute('style')?.slice(0,160),width:cs.width,height:cs.height,rect:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],tabindex:card.getAttribute('tabindex'),
   wrap:getComputedStyle(document.querySelector('.sphere-wrap')).cssText?.slice(0,80),stageW:document.querySelector('.sphere-stage').getBoundingClientRect().width};
 });
 console.log(w+'x'+h,JSON.stringify(info));
 // try clicking the visible card via element centre from screenshot region
 const card=p.locator('.ps-card').first();
 const b=await card.boundingBox();
 console.log('playwright bbox',b);
 if(b){ await p.mouse.click(b.x+b.width/2,b.y+b.height/2); } else { await card.focus(); await p.keyboard.press('Enter'); }
 await p.waitForTimeout(2400);
 console.log('viewer after activate:',await p.locator('.ps-viewer').count());
 await c.close();
}
await browser.close();

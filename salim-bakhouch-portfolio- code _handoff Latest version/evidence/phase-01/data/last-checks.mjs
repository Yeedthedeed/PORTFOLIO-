import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
// Landscape repeated, with waiting for load; check portrait clipping
for(const [w,h] of [[844,390],[768,1024],[390,844]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
 const p=await c.newPage(); await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(9000);
 const info=await p.evaluate(()=>{
  const im=document.querySelector('.hero-portrait-stage img'); const ir=im?.getBoundingClientRect();
  return {layout:document.documentElement.dataset.layout, vh:innerHeight, portrait:ir&&{top:Math.round(ir.top),bottom:Math.round(ir.bottom),h:Math.round(ir.height)}, dock:(()=>{const d=document.querySelector('.mobile-dock');if(!d)return null;const r=d.getBoundingClientRect();return{top:Math.round(r.top),bottom:Math.round(r.bottom)}})(), nav:(()=>{const n=document.querySelector('header.site-header');const r=n.getBoundingClientRect();return{top:Math.round(r.top),bottom:Math.round(r.bottom)}})()};
 });
 console.log(w+'x'+h,JSON.stringify(info));
 await p.screenshot({path:`evidence/phase-01/screens/${w}x${h}__hero-loaded.png`});
 await c.close();
}
// Check tabbing into ribbons from keyboard: focus ring visible? and scroll pausing.
const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+300)); await p.waitForTimeout(1600);
const frame=p.locator('.film-spiral-card').first();
await frame.focus(); await p.waitForTimeout(600);
console.log('RIBBON FOCUS VISIBLE', await p.evaluate(()=>{const a=document.activeElement;const cs=getComputedStyle(a);return{label:a.getAttribute('aria-label'),outline:cs.outline,outlineWidth:cs.outlineWidth,outlineColor:cs.outlineColor,boxShadow:cs.boxShadow.slice(0,60)}}));
await p.screenshot({path:'evidence/phase-01/screens/1440x900__ribbon-keyboard-focus.png'});
// check body scroll lock on overlays
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1400);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(1800);
console.log('BODY OVERFLOW IN ARCHIVE', await p.evaluate(()=>document.body.style.overflow));
await p.keyboard.press('Escape'); await p.waitForTimeout(700);
console.log('BODY OVERFLOW AFTER CLOSE', await p.evaluate(()=>document.body.style.overflow));
// full-page screen at 1440 for composition review
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
await p.screenshot({path:'evidence/phase-01/screens/1440x900__fullpage.png', fullPage:true});
await browser.close();

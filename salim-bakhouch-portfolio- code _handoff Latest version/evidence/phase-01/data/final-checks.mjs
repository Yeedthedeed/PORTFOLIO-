import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();

// 1. Film archive opens from section nav action, capture three ribbons
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(8000);
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop));
await page.waitForTimeout(1400);
const openArchive = page.locator('.film-section button', { hasText: /archive/i }).last();
await openArchive.click({ force: true });
await page.waitForTimeout(2400);
console.log('FILM ARCHIVE', {dialogs:await page.locator('.film-archive').count(), ribbons:await page.locator('.film-archive .film-spiral-root').count()});
await page.screenshot({path:'evidence/phase-01/screens/1440x900__film-archive-pair.png'});
await page.evaluate(()=>{const el=document.querySelector('.film-archive--scroll');if(el)el.scrollTop=el.scrollHeight;});
await page.waitForTimeout(1800);
await page.screenshot({path:'evidence/phase-01/screens/1440x900__film-archive-birth.png'});
await ctx.close();

// 2. low-viewport hero text overlap check and mobile images
for (const [w,h,name] of [[390,844,'390x844'],[360,800,'360x800'],[768,1024,'768x1024']]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});
 const p=await c.newPage();
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForTimeout(8000);
 const boxes=await p.evaluate(()=>{
   const get=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return{top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right)}};
   const txt=[...document.querySelectorAll('#work p,#work h2')].map(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return{text:(el.innerText||'').trim().slice(0,30),op:+cs.opacity,fs:cs.fontSize,top:Math.round(r.top),bottom:Math.round(r.bottom)}}).filter(x=>x.text&&x.op>0.05);
   return {dom:get('.mobile-dock'), caption:get('.mobile-hero-caption'), meta:get('#work .hidden.md\\:block'), portrait:get('.hero-portrait-stage img'), texts:txt};
 });
 console.log('MOBILE HERO',name,JSON.stringify(boxes,null,1).slice(0,2200));
 await c.close();
}
await browser.close();

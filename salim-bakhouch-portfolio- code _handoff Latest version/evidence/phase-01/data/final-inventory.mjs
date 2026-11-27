import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
const msgs=[];
page.on('console',m=>msgs.push({type:m.type(),text:m.text().slice(0,180)}));
page.on('pageerror',e=>msgs.push({type:'pageerror',text:e.message.slice(0,180)}));
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(5000);
// force audio icon RAF before refs mount → reproduce undefined rect errors
await page.mouse.move(1290,52);
await page.waitForTimeout(300);
const audio=page.locator('header button[aria-pressed]').first();
await audio.hover(); await page.waitForTimeout(250);
await audio.click({force:true}); await page.waitForTimeout(250);
await audio.click({force:true}); await page.waitForTimeout(300);
const errs=[...new Set(msgs.filter(m=>m.type==='error').map(m=>m.text))];
console.log('ERRORS ON AUDIO',errs.slice(0,5));
// Hover all ribbon sections & viewers; collect errors
for(const sel of ['#photography','#filmography','#featured-project','#about','#contact']){
 await page.evaluate(s=>window.scrollTo(0,document.querySelector(s).offsetTop+120),sel);
 await page.waitForTimeout(1800);
}
const errs2=[...new Set(msgs.filter(m=>m.type==='error').map(m=>m.text))];
console.log('ERRORS AFTER ALL SECTIONS',errs2.slice(0,6));
// Nav landmark/Escape on mobile
const c2=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p2=await c2.newPage();
await p2.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p2.waitForTimeout(7000);
console.log('MOBILE NAV VISIBLE?', await p2.locator('header.site-header').isVisible());
console.log('MOBILE DOCK LABELS', await p2.locator('.mobile-dock').innerText());
console.log('MOBILE CAPTION BOX', await p2.locator('.mobile-hero-caption').boundingBox());
console.log('MOBILE PORTRAIT BOX', await p2.locator('.hero-portrait-stage img').boundingBox());
console.log('HERO NOW BOX', await p2.locator('.hero-now').boundingBox().catch(()=>null));
// largest empty gap in hero: text bottom vs dock top
console.log('HERO CHILD TEXT POSITIONS', await p2.evaluate(()=>[...document.querySelectorAll('#work p,#work h2')].map(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return{t:(el.innerText||'').trim().slice(0,24),top:Math.round(r.top),bot:Math.round(r.bottom),op:cs.opacity}}).filter(x=>x.op>0.05)));
// landscape phone
const c3=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
const p3=await c3.newPage(); await p3.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p3.waitForTimeout(7000);
console.log('LANDSCAPE layout',await p3.evaluate(()=>document.documentElement.dataset.layout),'overflow',await p3.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
await p3.screenshot({path:'evidence/phase-01/screens/844x390__landscape-hero.png'});
await browser.close();

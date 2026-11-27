import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const out={};
{
 const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 // heading structure
 out.headings=await p.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>({tag:h.tagName,txt:(h.innerText||'').trim().replace(/\s+/g,' ').slice(0,42),hidden:getComputedStyle(h).display==='none'})));
 // landmarks
 out.landmarks=await p.evaluate(()=>({main:document.querySelectorAll('main').length,header:document.querySelectorAll('header.site-header').length,nav:document.querySelectorAll('nav').length,footer:document.querySelectorAll('footer').length}));
 // aria-hidden containing focusable
 out.focusableAriaHidden=await p.evaluate(()=>[...document.querySelectorAll('[aria-hidden="true"]')].filter(el=>el.querySelector('a[href],button,input,[tabindex]:not([tabindex="-1"])')).map(el=>({tag:el.tagName,cls:(typeof el.className==='string'?el.className:'').slice(0,30)})));
 // images without alt
 out.imagesNoAlt=await p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length);
 out.imagesTotal=await p.evaluate(()=>document.querySelectorAll('img').length);
 out.emptyAlt=await p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>i.getAttribute('alt')==='').length);
 // buttons without accessible name
 out.unnamedButtons=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>{const n=(b.innerText||'').trim()||b.getAttribute('aria-label')||b.getAttribute('title');return !n}).length);
 // contrast counts: all visible text nodes below 12px and low contrast approx
 out.tinyText=await p.evaluate(()=>{const map={};const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const el=w.currentNode.parentElement;if(!el)continue;const cs=getComputedStyle(el);if(cs.display==='none'||+cs.opacity<0.1)continue;if(!w.currentNode.textContent.trim())continue;const fs=parseFloat(cs.fontSize);if(fs<12){map[fs]=(map[fs]||0)+1;}}return map;});
 // focus style of ribbon with keyboard-generated focus (simulate real tab)
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+300)); await p.waitForTimeout(1400);
 const res=[];
 for(let i=0;i<40 && res.length<3;i++){
   await p.keyboard.press('Tab');
   const s=await p.evaluate(()=>{const a=document.activeElement;if(!a?.classList?.contains('film-spiral-card'))return null;const cs=getComputedStyle(a);const img=a.querySelector('img');return{outline:cs.outline,outlineWidth:cs.outlineWidth,outlineStyle:cs.outlineStyle,imgOutline:img?getComputedStyle(img).outline:'none'};});
   if(s)res.push(s);
 }
 out.ribbonFocus=res;
 await p.screenshot({path:'evidence/phase-01/screens/1440x900__ribbon-real-tab-focus.png'});
 // reduced motion behaviour: animated elements count
 await c.close();
}
{
 const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}); const p=await c.newPage();
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 out.reducedMotion={
   animations:await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),
   loader:await p.locator('.loader').count(),
   developOpacity:await p.evaluate(()=>[...document.querySelectorAll('.develop')].map(e=>+getComputedStyle(e).opacity).slice(0,5)),
   grainAnim:await p.evaluate(()=>getComputedStyle(document.querySelector('.grain')).animationName),
   bloomAnim:await p.evaluate(()=>getComputedStyle(document.querySelector('.bloom')).animationName),
   sphereRunning:await p.evaluate(()=>document.querySelectorAll('.ps-card').length),
 };
 await p.screenshot({path:'evidence/phase-01/screens/1440x900__reduced-motion.png'});
 await c.close();
}
fs.writeFileSync('evidence/phase-01/data/a11y.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2).slice(0,6000));
await browser.close();

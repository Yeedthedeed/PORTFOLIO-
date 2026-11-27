import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('https://etherealism-aperture-v2.deed.page/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>{const t=document.querySelector('#zakias-clock');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+200);});
await p.waitForTimeout(1500);
await p.screenshot({path:'evidence/phase-06/screens/LIVE-v2-films.png'});
console.log(JSON.stringify(await p.evaluate(()=>({
 filmBg:getComputedStyle(document.querySelector('#filmography')).backgroundColor,
 secBg:getComputedStyle(document.querySelector('#photography')).backgroundColor,
 gap:getComputedStyle(document.querySelector('.film-sections')).rowGap,
 aperture:!!document.querySelector('.oa-aperture'),
 frames:document.querySelectorAll('.film-spiral-card').length,
 overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))));
await b.close();

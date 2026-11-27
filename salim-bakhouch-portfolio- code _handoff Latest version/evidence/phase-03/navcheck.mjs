import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[360,800],[844,390]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 const r=await p.evaluate(()=>{
  const items=[...document.querySelectorAll('header.site-header a, header.site-header button, header.site-header span')].map(el=>{const b=el.getBoundingClientRect();const cs=getComputedStyle(el);return{txt:(el.innerText||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,22),x:Math.round(b.left),r:Math.round(b.right),y:Math.round(b.top),b:Math.round(b.bottom),vis:cs.display!=='none'&&b.width>0}}).filter(i=>i.vis&&i.txt);
  const overlaps=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(a.txt&&b.txt&&a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b&&!(a.txt.includes(b.txt)||b.txt.includes(a.txt)))overlaps.push([a.txt,b.txt]);}
  return overlaps;});
 console.log(w+'x'+h,'overlaps:',JSON.stringify(r));
 await c.close();
}
await browser.close();

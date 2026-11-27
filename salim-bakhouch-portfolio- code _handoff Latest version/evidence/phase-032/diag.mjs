import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:768,height:1024},isMobile:true,hasTouch:true});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>{const t=document.querySelector('#featured-project');window.scrollTo(0,t.getBoundingClientRect().top+scrollY);});
await p.waitForTimeout(1200);
console.log(JSON.stringify(await p.evaluate(()=>{
 const root=document.querySelector('#featured-project');
 const marks=[...root.querySelectorAll('.featured-signal-label,.featured-signal-rule')].map(e=>{const r=e.getBoundingClientRect();return{t:'mark',cls:e.className,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
 const imgs=[...root.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();return{t:'img',x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
 return {marks,imgs};
}),null,2));
// active frame outline check
await p.evaluate(()=>{const t=document.querySelector('#delusion-of-negation');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+400);});
await p.waitForTimeout(1200);
await p.locator('#delusion-of-negation .film-spiral-card').first().focus();
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(()=>{
 const img=document.querySelector('#delusion-of-negation .film-spiral-card:focus-visible img')||document.querySelector('#delusion-of-negation .film-spiral-card img');
 const cs=getComputedStyle(img);
 const r=img.getBoundingClientRect();
 return {outlineColor:cs.outlineColor,outlineWidth:cs.outlineWidth,outlineOffset:cs.outlineOffset,box:[Math.round(r.width),Math.round(r.height)]};
})));
await b.close();

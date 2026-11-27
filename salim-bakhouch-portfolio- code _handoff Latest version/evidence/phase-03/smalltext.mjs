import { chromium } from 'playwright';
const browser=await chromium.launch();
for(const v of [{n:'1440',w:1440,h:900,m:false},{n:'390',w:390,h:844,m:true}]){
const c=await browser.newContext({viewport:{width:v.w,height:v.h},isMobile:v.m,hasTouch:v.m});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(7000);
const out=await p.evaluate(()=>{
 const res={};const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walk.nextNode()){const t=walk.currentNode.textContent.trim();if(!t)continue;const el=walk.currentNode.parentElement;if(!el)continue;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05)continue;const fs=parseFloat(cs.fontSize);if(fs>=12)continue;const key=fs+'px :: '+el.tagName+'.'+(typeof el.className==='string'?el.className:'').slice(0,38)+' :: '+t.slice(0,28);
  res[key]=(res[key]||0)+1;}
 return res;});
console.log('\n=== '+v.n+' small nodes ===');Object.entries(out).sort().forEach(([k,n])=>console.log(n+'× '+k));
await c.close();}
await browser.close();

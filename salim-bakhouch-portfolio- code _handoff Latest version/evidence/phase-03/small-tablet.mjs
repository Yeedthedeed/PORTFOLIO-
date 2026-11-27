import { chromium } from 'playwright';
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1024,height:768}});const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(7000);
console.log(await p.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const t=w.currentNode.textContent.trim();if(!t)continue;const el=w.currentNode.parentElement;if(!el)continue;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05)continue;const fs=parseFloat(cs.fontSize);if(fs>=12)continue;out.push({fs,cls:typeof el.className==='string'?el.className.slice(0,60):'',tag:el.tagName,text:t.slice(0,30)});}return out;}));
await b.close();

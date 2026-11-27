import { chromium } from 'playwright';
const b=await chromium.launch();
for(const [w,h] of [[1440,900],[1920,1080]]){
 const c=await b.newContext({viewport:{width:w,height:h}}); const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 await p.screenshot({path:`evidence/phase-04b/screens/${w}__hero__lit2.png`});
 await p.evaluate(()=>document.documentElement.setAttribute('data-lighting','off')); await p.waitForTimeout(500);
 await p.screenshot({path:`evidence/phase-04b/screens/${w}__hero__off2.png`});
 await c.close();
}
await b.close();
console.log('hero shots done');

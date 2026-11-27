import { chromium } from 'playwright';
const b=await chromium.launch();
for(const on of [false,true]){
 const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
 if(on) await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7500);
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['filmography','#filmography'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
  await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
  await p.waitForTimeout(1600);
  await p.screenshot({path:`evidence/phase-04/screens/1440x900__${name}__${on?'light':'base'}.png`});
 }
 console.log(on?'light captured':'base captured');
 await c.close();
}
await b.close();

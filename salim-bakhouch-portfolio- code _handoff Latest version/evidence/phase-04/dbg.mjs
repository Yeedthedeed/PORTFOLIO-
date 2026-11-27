import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(5000);
console.log(await p.evaluate(()=>({
 hw:navigator.hardwareConcurrency,
 coarse:matchMedia('(pointer: coarse)').matches,
 fine:matchMedia('(pointer: fine)').matches,
 reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,
 saveData:navigator.connection?.saveData,
 dataset:document.documentElement.dataset.lighting,
 layer:document.querySelectorAll('.lighting-layer').length,
 vars:getComputedStyle(document.documentElement).getPropertyValue('--light-key-str')
})));
await b.close();

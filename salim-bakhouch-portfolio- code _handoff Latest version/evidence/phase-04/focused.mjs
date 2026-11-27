import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
const read=()=>p.evaluate(()=>({
  key:getComputedStyle(document.documentElement).getPropertyValue('--light-key-str').trim(),
  rim:getComputedStyle(document.documentElement).getPropertyValue('--light-rim-str').trim(),
  accent:getComputedStyle(document.documentElement).getPropertyValue('--light-accent').trim(),
  keyX:getComputedStyle(document.documentElement).getPropertyValue('--light-key-x').trim(),
  keyY:getComputedStyle(document.documentElement).getPropertyValue('--light-key-y').trim()
}));
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);
const a=await read();
await p.mouse.move(120,120); await p.waitForTimeout(500);
const b1=await read();
await p.mouse.move(1300,760); await p.waitForTimeout(500);
const b2=await read();
console.log('POINTER INDEPENDENCE', JSON.stringify({a,b1,b2,same:a.keyX===b1.keyX&&b1.keyX===b2.keyX&&a.key===b2.key}));
// rest stability: no continuous loop
const s1=await read(); await p.waitForTimeout(1400); const s2=await read();
console.log('REST STABLE', JSON.stringify({same:s1.key===s2.key&&s1.rim===s2.rim&&s1.accent===s2.accent}));
// per-film presets
for(const [name,sel] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
  await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+250);},sel);
  await p.waitForTimeout(1700);
  console.log(name.toUpperCase(), JSON.stringify(await read()));
}
// selected film state
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500)); await p.waitForTimeout(1600);
const before=await read();
const card=p.locator('#delusion-of-negation .film-spiral-card').nth(3); const cb=await card.boundingBox();
if(cb) await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);
await p.waitForTimeout(1900);
const during=await read();
await p.keyboard.press('Escape'); await p.waitForTimeout(1400);
const after=await read();
console.log('SELECTED FILM', JSON.stringify({before:before.key,during:during.key,after:after.key,changed:before.key!==during.key,restored:Math.abs(+before.key-+after.key)<0.01}));
await c.close();
// reduced motion visual
const c2=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const p2=await c2.newPage(); await p2.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
await p2.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p2.waitForTimeout(6000);
const r1=await p2.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--light-key-str').trim());
await p2.waitForTimeout(900);
const r2=await p2.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--light-key-str').trim());
console.log('REDUCED MOTION STATIC', JSON.stringify({r1,r2,static:r1===r2,layer:await p2.evaluate(()=>document.querySelectorAll('.lighting-layer').length)}));
await c2.close();
await b.close();

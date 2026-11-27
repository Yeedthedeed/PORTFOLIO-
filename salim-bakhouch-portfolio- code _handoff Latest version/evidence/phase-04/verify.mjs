import { chromium } from 'playwright';
import fs from 'fs';
const B='http://127.0.0.1:4173/';
const OUT='evidence/phase-04/screens';
const browser=await chromium.launch();
const out={};
const c=await browser.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150))});
await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
const read=()=>p.evaluate(()=>{const cs=getComputedStyle(document.documentElement);return{
  lighting:document.documentElement.dataset.lighting,
  surfaces:document.querySelectorAll('.lighting-layer > div').length,
  key:cs.getPropertyValue('--light-key-str').trim(),
  rim:cs.getPropertyValue('--light-rim-str').trim(),
  fill:cs.getPropertyValue('--light-fill-str').trim(),
  bounce:cs.getPropertyValue('--light-bounce-str').trim(),
  ambient:cs.getPropertyValue('--light-ambient').trim(),
  falloff:cs.getPropertyValue('--light-falloff').trim(),
  occlusion:cs.getPropertyValue('--light-occlusion').trim(),
  accent:cs.getPropertyValue('--light-accent').trim(),
  keyX:cs.getPropertyValue('--light-key-x').trim(),
  cursorNX:cs.getPropertyValue('--light-cursor-nx').trim(),
  keyGradient:cs.getPropertyValue('--light-gradient').slice(0,90),
  rimGradient:cs.getPropertyValue('--rim-gradient').slice(0,90),
  aoGradient:cs.getPropertyValue('--ao-gradient').slice(0,90)
};});
out.initial=await read();
const presets={};
for(const [name,sel] of [['hero','#work'],['photography','#photography'],['filmography','#filmography'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
  await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
  await p.waitForTimeout(1600);
  presets[name]=await read();
  await p.screenshot({path:`${OUT}/1440__${name}.png`});
}
out.presets=presets;
// no pointer influence: move and compare
const beforeMove=await read();
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);
const heroStable=await read();
await p.mouse.move(700,420); await p.waitForTimeout(600);
const afterMove=await read();
out.pointerIndependent={keyXSame:beforeMove.keyX===afterMove.keyX,cursorNX:afterMove.cursorNX,keyX:afterMove.keyX};
// selected state
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1600);
const beforeSel=await read();
const card=p.locator('.ps-card').first(); const cb=await card.boundingBox();
if(cb) await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);
await p.waitForTimeout(1900);
const afterSel=await read();
out.selected={before:{key:beforeSel.key,rim:beforeSel.rim},after:{key:afterSel.key,rim:afterSel.rim},changed:beforeSel.key!==afterSel.key||beforeSel.rim!==afterSel.rim};
await p.screenshot({path:`${OUT}/1440__selected-photo.png`});
await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
out.afterClose=await read();
// RAF at rest should be idle: count frames over 1.5s after settle
out.restFrames=await p.evaluate(()=>new Promise(res=>{let n=0;const o=window.requestAnimationFrame;window.requestAnimationFrame=function(cb){n++;return o.call(window,cb)};setTimeout(()=>{window.requestAnimationFrame=o;res(n)},1500);}));
out.errors=errs.slice(0,6);
await c.close();
// low-power context: no engine
const c2=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p2=await c2.newPage();
await p2.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p2.waitForTimeout(7000);
out.mobile=await p2.evaluate(()=>({lighting:document.documentElement.dataset.lighting,layer:document.querySelectorAll('.lighting-layer').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
await p2.screenshot({path:`${OUT}/390__mobile-static.png`});
await c2.close();
// reduced motion: static frame, no transitions
const c3=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const p3=await c3.newPage();
await p3.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
await p3.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p3.waitForTimeout(6000);
out.reduced=await p3.evaluate(()=>({lighting:document.documentElement.dataset.lighting,layer:document.querySelectorAll('.lighting-layer').length,key:getComputedStyle(document.documentElement).getPropertyValue('--light-key-str').trim(),transition:document.querySelector('.light-key')?getComputedStyle(document.querySelector('.light-key')).transitionDuration:null}));
await p3.screenshot({path:`${OUT}/1440__reduced-motion.png`});
await c3.close();
fs.writeFileSync('evidence/phase-04/verify.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
await browser.close();

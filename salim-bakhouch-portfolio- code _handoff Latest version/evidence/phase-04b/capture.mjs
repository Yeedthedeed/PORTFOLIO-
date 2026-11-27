import { chromium } from 'playwright';
const B='http://127.0.0.1:4173/';
const OUT='evidence/phase-04b/screens';
const b=await chromium.launch();
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[390,844,true]]){
 for(const on of [true,false]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
  if(!on) await p.addInitScript(()=>document.documentElement.setAttribute('data-lighting','off'));
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
  await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
  const info=await p.evaluate(()=>({rigs:document.querySelectorAll('.chapter-light').length,
    heroRig:!!document.querySelector('#work .chapter-light'),
    keys:getComputedStyle(document.documentElement).getPropertyValue('--cl-key-a')||null,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  for(const [name,sel] of [['hero','#work'],['photography','#photography'],['filmography','#delusion-of-negation'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
    await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
    await p.waitForTimeout(1500);
    await p.screenshot({path:`${OUT}/${w}x${h}__${name}__${on?'lit':'off'}.png`});
  }
  console.log(w+'x'+h,on?'lit':'off',JSON.stringify(info),'errors',errs.length);
  await c.close();
 }
}
await b.close();

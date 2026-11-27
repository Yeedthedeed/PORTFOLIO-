import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
for(const [f,n] of [[0,'hero'],[0.62,'films'],[0.82,'featured']]){
 await p.evaluate(y=>window.scrollTo(0,document.body.scrollHeight*y),f);
 await p.waitForTimeout(1300);
 await p.screenshot({path:`evidence/phase-06/screens/1440__calib-${n}.png`});
}
await p.evaluate(()=>{document.querySelectorAll('main,header.site-header,.chapter-rail').forEach(e=>e.style.visibility='hidden');window.scrollTo(0,0);});
await p.waitForTimeout(700);
await p.screenshot({path:'evidence/phase-06/screens/1440__field-only.png'});
console.log(JSON.stringify(await p.evaluate(()=>{
 const svg=document.querySelector('.oa-svg');const a=document.querySelector('.oa-aperture');
 return {nodes:svg.querySelectorAll('*').length,anim:getComputedStyle(a).animationName,
  stroke:getComputedStyle(svg.querySelector('circle')).stroke.slice(0,44),
  opacity:getComputedStyle(a).opacity};
})));
await b.close();

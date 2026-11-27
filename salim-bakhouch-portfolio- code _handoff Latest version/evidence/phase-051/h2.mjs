import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>{const t=document.querySelector('#zakias-clock');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+260);});
await p.waitForTimeout(1600);
const cards=p.locator('#zakias-clock .film-spiral-card');
const n=await cards.count();
let idx=-1;
for(let i=0;i<n;i++){const bb=await cards.nth(i).boundingBox();if(bb&&bb.width>70&&bb.y>120&&bb.y<700&&bb.x>250&&bb.x<1100){idx=i;break;}}
console.log('target idx',idx);
if(idx>=0){
 await cards.nth(idx).hover({force:true}); await p.waitForTimeout(700);
 console.log(JSON.stringify(await cards.nth(idx).evaluate(el=>{const img=el.querySelector('img');const cs=getComputedStyle(img);
  return {hover:el.matches(':hover'),bt:cs.borderTopColor,br:cs.borderRightColor,bb:cs.borderBottomColor,bl:cs.borderLeftColor,filter:cs.filter,
   beforeOpacity:getComputedStyle(el,'::before').opacity};}),null,1));
 await p.screenshot({path:'evidence/phase-051/screens/1440__frame-hover.png'});
 await p.mouse.move(10,10); await p.waitForTimeout(800);
 await p.screenshot({path:'evidence/phase-051/screens/1440__frame-recovered.png'});
}
await b.close();

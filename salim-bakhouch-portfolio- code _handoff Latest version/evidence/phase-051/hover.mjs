import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-051/screens'; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(()=>{const t=document.querySelector('#zakias-clock');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+260);});
await p.waitForTimeout(1800);
// neutral
await p.screenshot({path:`${OUT}/1440__frame-neutral.png`});
// hover a centred card
const cards=await p.locator('#zakias-clock .film-spiral-card').evaluateAll(els=>els.map((e,i)=>{const r=e.getBoundingClientRect();return{i,x:r.x,y:r.y,w:r.width,h:r.height,vis:r.top>100&&r.bottom<820&&r.left>150&&r.right<1290};}).filter(c=>c.vis));
const target=cards[Math.floor(cards.length/2)];
console.log('hover target',target);
await p.mouse.move(target.x+target.w/2,target.y+target.h/2);
await p.waitForTimeout(700);
await p.screenshot({path:`${OUT}/1440__frame-hover.png`});
const styles=await p.evaluate(({i})=>{
 const cards=[...document.querySelectorAll('#zakias-clock .film-spiral-card')];
 const el=cards[i]; const img=el.querySelector('img');
 const cs=getComputedStyle(img);
 return {borderTop:cs.borderTopColor,borderRight:cs.borderRightColor,borderBottom:cs.borderBottomColor,borderLeft:cs.borderLeftColor,
  boxShadow:cs.boxShadow.slice(0,90),filter:cs.filter,transform:cs.transform};
},{i:target.i});
console.log(JSON.stringify(styles,null,1));
// keyboard focus
await p.evaluate(()=>document.querySelector('#zakias-clock .film-spiral-card')?.focus());
await p.waitForTimeout(600);
await p.screenshot({path:`${OUT}/1440__frame-focus.png`});
// leave
await p.mouse.move(20,20); await p.waitForTimeout(700);
await p.screenshot({path:`${OUT}/1440__frame-recovered.png`});
await b.close();

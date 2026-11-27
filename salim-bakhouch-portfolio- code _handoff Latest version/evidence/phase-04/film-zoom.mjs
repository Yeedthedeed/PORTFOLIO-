import { chromium } from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch();
for(const [name,preset] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
 for(const on of [false,true]){
  const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
  if(on) await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
  await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
  await p.evaluate(sel=>{const t=document.querySelector(sel);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+260);},preset);
  await p.waitForTimeout(1800);
  await p.screenshot({path:`evidence/phase-04/screens/1440__${name}__${on?'light':'base'}.png`});
  await c.close();
 }
}
const items=[['film base (right edge)','evidence/phase-04/screens/1440__delusion__base.png'],['film light (right edge)','evidence/phase-04/screens/1440__delusion__light.png'],['zakia light (right edge)','evidence/phase-04/screens/1440__zakia__light.png'],['birth light (right edge)','evidence/phase-04/screens/1440__birth__light.png']];
const W=700,H=430,cols=2,rows=2,gap=8,labelH=22;const comp=[];
for(let i=0;i<items.length;i++){
 const [label,file]=items[i];
 const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
 const img=await sharp(file).extract({left:740,top:120,width:700,height:430}).png().toBuffer();
 comp.push({input:img,left:x,top:y+labelH});
 comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="16" font-family="monospace" font-size="12" fill="#9fd8ff">${label}</text></svg>`),left:x,top:y});
}
await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:90}).toFile('evidence/phase-04/film-rim-comparison.jpg');
console.log('done');
await b.close();

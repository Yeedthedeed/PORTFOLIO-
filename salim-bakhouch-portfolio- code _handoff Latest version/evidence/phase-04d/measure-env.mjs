import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const browser=await chromium.launch();
const c=await browser.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(7000);
await p.evaluate(()=>{
  document.querySelectorAll('main,header.site-header,.chapter-rail,.mobile-dock,.scroll-progress').forEach(e=>e.style.visibility='hidden');
  document.querySelectorAll('.scanlines,.grain').forEach(e=>e.style.display='none');
});
const variants={current:'',noBloom:'.bloom',noVignette:'.vignette',noBoth:'.bloom,.vignette'};
const report={};
async function radial(file){
  const {width,height}=await sharp(file).metadata();
  const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  const cx=width/2, cy=height*0.46;
  const maxR=Math.min(width,height)*0.5;
  const lum=(x,y)=>{const i=(Math.round(y)*width+Math.round(x))*info.channels;return 0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];};
  const out={};
  for(const k of [0,0.2,0.4,0.6,0.8,1.0]){
    let s=0,n=0;
    for(let a=0;a<360;a+=5){
      const rad=a*Math.PI/180, x=cx+Math.cos(rad)*maxR*k, y=cy+Math.sin(rad)*maxR*k;
      if(x<2||y<2||x>width-3||y>height-3) continue;
      s+=lum(x,y);n++;
    }
    out[k]=n?+(s/n).toFixed(2):null;
  }
  return out;
}
for(const [name,sel] of Object.entries(variants)){
  await p.evaluate(s=>{
    document.querySelectorAll('.bloom,.vignette').forEach(e=>e.style.display='');
    if(s) document.querySelectorAll(s.split(',')[0]).forEach(e=>e.style.display='none');
    if(s && s.includes(',')) document.querySelectorAll(s.split(',')[1]).forEach(e=>e.style.display='none');
  },sel);
  await p.waitForTimeout(350);
  const f=`/tmp/env-${name}.png`;
  await p.screenshot({path:f});
  report[name]=await radial(f);
}
console.log(JSON.stringify(report,null,2));
const cur=report.current;
console.log('\nCURRENT PROFILE (centre → edge):', Object.entries(cur).map(([k,v])=>`${Math.round(+k*100)}%:${v}`).join('  '));
console.log('centre/edge ratio:', (cur['0']/cur['1']).toFixed(2));
fs.writeFileSync('evidence/phase-04d/environment-radial.json',JSON.stringify(report,null,2));
await browser.close();

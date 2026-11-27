import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const browser=await chromium.launch();
const c=await browser.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(7000);

const variants={
  current:null,
  noBloom:'.bloom',
  noVignette:'.vignette',
  noBoth:'.bloom,.vignette',
};
const report={};
for(const [name,sel] of Object.entries(variants)){
  await p.evaluate(s=>{
    document.querySelectorAll('.bloom,.vignette,.scanlines,.grain').forEach(e=>e.style.display='');
    if(s) document.querySelectorAll(s.split(',')[0]+','+s.split(',')[1]).forEach(e=>e.style.display='none');
  },sel).catch(async()=>{
    await p.evaluate(s=>{
      document.querySelectorAll('.bloom,.vignette').forEach(e=>e.style.display='');
      if(s) document.querySelectorAll(s).forEach(e=>e.style.display='none');
    },sel);
  });
  await p.waitForTimeout(400);
  const file=`/tmp/lum-${name}.png`;
  await p.screenshot({path:file});
  report[name]=await radial(file);
}
// radial luminance sampling on an image, avoiding the portrait where possible:
// sample along a horizontal line in the lower band and along a 45deg diagonal
async function radial(file){
  const img=sharp(file);
  const {width,height}=await img.metadata();
  const {data,info}=await img.raw().toBuffer({resolveWithObject:true});
  const cx=width/2, cy=height*0.46;
  const px=(x,y)=>{const i=(Math.round(y)*width+Math.round(x))*info.channels;return [data[i],data[i+1],data[i+2]];};
  const lum=([r,g,b])=>0.2126*r+0.7152*g+0.0722*b;
  const rings=[0,0.25,0.5,0.75,1.0,1.3];
  const maxR=Math.min(width,height)*0.5;
  const out={};
  for(const k of rings){
    let sum=0,n=0;
    for(let a=0;a<360;a+=6){
      const rad=a*Math.PI/180;
      const x=cx+Math.cos(rad)*maxR*k;
      const y=cy+Math.sin(rad)*maxR*k;
      if(x<2||y<2||x>width-3||y>height-3) continue;
      sum+=lum(px(x,y));n++;
    }
    out[k]=n?+(sum/n).toFixed(2):null;
  }
  return out;
}
console.log(JSON.stringify(report,null,2));
fs.writeFileSync('evidence/phase-04d/radial-luminance.json',JSON.stringify(report,null,2));
await browser.close();

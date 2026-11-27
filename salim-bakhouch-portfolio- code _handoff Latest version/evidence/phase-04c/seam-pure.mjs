import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const b=await chromium.launch();
const ids=[['hero','#work'],['photography','#photography'],['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project'],['about','#about'],['contact','#contact']];
const summary={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 for(const [name,sel] of ids){
   await p.evaluate(s=>{
     const t=document.querySelector(s);
     window.scrollTo(0,t.getBoundingClientRect().top+scrollY);
     // hide everything inside except the section itself, so only the painted background remains
     [...t.children].forEach(el=>{el.setAttribute('data-seam-hide','1');el.style.visibility='hidden';});
   },sel);
   await p.waitForTimeout(700);
   const file=`/tmp/pure-${w}-${name}.png`;
   await p.screenshot({path:file});
   const meta=await sharp(file).metadata();
   const W=meta.width,H=meta.height;
   const top=Math.round(H*0.35), hgt=Math.max(40,Math.round(H*0.25));
   const {data,info}=await sharp(file).extract({left:10,top,width:W-20,height:Math.min(hgt,H-top-10)}).raw().toBuffer({resolveWithObject:true});
   const cols=[];
   for(let x=0;x<W-20;x++){let s=0,n=0;for(let y=0;y<Math.min(hgt,H-top-10);y+=2){const i=(y*(W-20)+x)*info.channels;s+=data[i];n++;}cols.push(s/n);}
   let maxJump=0;
   for(let x=1;x<cols.length;x++)maxJump=Math.max(maxJump,Math.abs(cols[x]-cols[x-1]));
   summary[`${w}x${h}__${name}`]=+maxJump.toFixed(2);
   await p.evaluate(s=>{const t=document.querySelector(s);[...t.children].forEach(el=>{el.style.visibility='';el.removeAttribute('data-seam-hide');});},sel);
 }
 await c.close();
}
const vals=Object.values(summary);
console.log(JSON.stringify(summary,null,2));
console.log('MAX', Math.max(...vals).toFixed(2), '| MEAN', (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2), '| FAIL>2:', vals.filter(v=>v>2).length, '/', vals.length);
fs.writeFileSync('evidence/phase-04c/seam-pure.json',JSON.stringify(summary,null,2));
await b.close();

import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const b=await chromium.launch();
const ids=[['hero','#work'],['photography','#photography'],['featured','#featured-project'],['contact','#contact']];
const rows=[];
const smooth=(arr,k)=>{const out=[];for(let i=0;i<arr.length;i++){let s=0,n=0;for(let j=-k;j<=k;j++){const x=i+j;if(x>=0&&x<arr.length){s+=arr[x];n++;}}out.push(s/n);}return out;};
for(const mode of ['on','off']){
 for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[390,844,true]]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
  await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
  if(mode==='off') await p.evaluate(()=>document.documentElement.setAttribute('data-lighting','off'));
  for(const [name,sel] of ids){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);[...t.children].forEach(el=>el.style.visibility='hidden');},sel);
   await p.waitForTimeout(600);
   const file=`/tmp/ctl-${mode}-${w}-${name}.png`;
   await p.screenshot({path:file});
   const meta=await sharp(file).metadata(); const W=meta.width,H=meta.height;
   const top=Math.round(H*0.3),hh=Math.min(120,H-top-10);
   const {data,info}=await sharp(file).extract({left:10,top,width:W-20,height:hh}).raw().toBuffer({resolveWithObject:true});
   const cols=[];for(let x=0;x<W-20;x++){let s=0,n=0;for(let y=0;y<hh;y+=2){const i=(y*(W-20)+x)*info.channels;s+=data[i];n++;}cols.push(s/n);}
   const sm=smooth(cols,12);let mj=0;for(let x=1;x<sm.length;x++)mj=Math.max(mj,Math.abs(sm[x]-sm[x-1]));
   rows.push({mode,viewport:`${w}x${h}`,chapter:name,maxJump:+mj.toFixed(2)});
   await p.evaluate(s=>{const t=document.querySelector(s);[...t.children].forEach(el=>el.style.visibility='');},sel);
  }
  await c.close();
 }
}
console.log(JSON.stringify(rows,null,2));
const by=(m)=>rows.filter(r=>r.mode===m).map(r=>r.maxJump);
const on=by('on'),off=by('off');
console.log('ON  max',Math.max(...on).toFixed(2),'mean',(on.reduce((a,b)=>a+b,0)/on.length).toFixed(2));
console.log('OFF max',Math.max(...off).toFixed(2),'mean',(off.reduce((a,b)=>a+b,0)/off.length).toFixed(2));
fs.writeFileSync('evidence/phase-04c/seam-control.json',JSON.stringify(rows,null,2));
await b.close();

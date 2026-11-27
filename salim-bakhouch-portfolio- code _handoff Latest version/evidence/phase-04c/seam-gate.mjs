import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const b=await chromium.launch();
const results=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1300);
   await p.screenshot({path:`evidence/phase-04c/screens/${w}x${h}__${name}.png`});
 }
 await p.evaluate(()=>document.documentElement.setAttribute('data-lighting','off')); await p.waitForTimeout(600);
 for(const [name,sel] of [['hero','#work'],['photography','#photography'],['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project'],['about','#about'],['contact','#contact']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(900);
   await p.screenshot({path:`evidence/phase-04c/screens/${w}x${h}__${name}__off.png`});
 }
 await c.close();
}
// seam analysis on clean background bands (avoid text/portrait): sample top strip below nav
const analyze=async(file)=>{
 const meta=await sharp(file).metadata();
 const W=meta.width, H=meta.height;
 const top=Math.round(H*0.62), hgt=Math.min(90,Math.round(H*0.12));
 const {data,info}=await sharp(file).extract({left:20,top,width:W-40,height:hgt}).raw().toBuffer({resolveWithObject:true});
 const cols=[];
 for(let x=0;x<W-40;x++){let s=0,n=0;for(let y=0;y<hgt;y+=2){const i=(y*(W-40)+x)*info.channels;s+=data[i];n++;}cols.push(s/n);}
 let maxJump=0;
 for(let x=1;x<cols.length;x++)maxJump=Math.max(maxJump,Math.abs(cols[x]-cols[x-1]));
 return +maxJump.toFixed(2);
};
const files=fs.readdirSync('evidence/phase-04c/screens').filter(f=>f.endsWith('.png')&&!f.includes('__off'));
const summary={};
for(const f of files){ const j=await analyze('evidence/phase-04c/screens/'+f); (summary[f]=j); }
console.log(JSON.stringify(summary,null,2));
const worst=Object.entries(summary).sort((a,b)=>b[1]-a[1]).slice(0,6);
console.log('WORST',JSON.stringify(worst));
fs.writeFileSync('evidence/phase-04c/seam.json',JSON.stringify(summary,null,2));
await b.close();

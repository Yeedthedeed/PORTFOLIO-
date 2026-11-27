import { chromium } from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
const variants=[['all',null],['no-key','.cl-key'],['no-rim','.cl-rim'],['no-bounce','.cl-bounce'],['no-occ','.cl-occlusion'],['no-shaft','.cl-shaft']];
for(const [name,sel] of variants){
  await p.evaluate(s=>{document.querySelectorAll('.chapter-light > span').forEach(e=>e.style.display='');if(s){document.querySelectorAll(s).forEach(e=>e.style.display='none')}},sel);
  await p.waitForTimeout(350);
  await p.screenshot({path:`/tmp/iso-${name}.png`});
}
// scan for vertical discontinuity in the background region
const scan=async(f)=>{
  const {data,info}=await sharp(f).extract({left:600,top:250,width:700,height:120}).raw().toBuffer({resolveWithObject:true});
  const cols=[];
  for(let x=0;x<700;x++){let s=0;for(let y=0;y<120;y+=4){const i=(y*700+x)*info.channels;s+=data[i];}
    cols.push(s/(120/4));}
  let maxJump=0,maxAt=0;
  for(let x=1;x<cols.length;x++){const j=Math.abs(cols[x]-cols[x-1]);if(j>maxJump){maxJump=j;maxAt=x;}}
  return {maxJump:+maxJump.toFixed(2),atX:600+maxAt};
};
for(const [name] of variants){console.log(name, JSON.stringify(await scan(`/tmp/iso-${name}.png`)));}
await b.close();

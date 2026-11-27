import { chromium } from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.screenshot({path:'/tmp/seam-lit.png'});
await p.evaluate(()=>document.documentElement.setAttribute('data-lighting','off'));
await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/seam-off.png'});
// difference in a clean bottom-left background band (no portrait, no text)
const diff=async(a,bb)=>{
 const ex={left:40,top:600,width:1360,height:120};
 const A=await sharp(a).extract(ex).raw().toBuffer({resolveWithObject:true});
 const B=await sharp(bb).extract(ex).raw().toBuffer({resolveWithObject:true});
 const cols=[];
 for(let x=0;x<ex.width;x++){
   let s=0,n=0;
   for(let y=0;y<ex.height;y+=3){const i=(y*ex.width+x)*A.info.channels;s+=A.data[i]-B.data[i];n++;}
   cols.push(s/n);
 }
 let maxJump=0,at=0;
 for(let x=1;x<cols.length;x++){const j=Math.abs(cols[x]-cols[x-1]);if(j>maxJump){maxJump=j;at=x;}}
 return {maxJump:+maxJump.toFixed(2),atX:40+at,meanLeft:+(cols.slice(0,600).reduce((s,v)=>s+v,0)/600).toFixed(2),meanRight:+(cols.slice(700).reduce((s,v)=>s+v,0)/660).toFixed(2)};
};
console.log(JSON.stringify(await diff('/tmp/seam-lit.png','/tmp/seam-off.png')));
await b.close();

import { chromium } from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch();
async function shot(on,file){
 const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
 if(on) await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#delusion-of-negation').getBoundingClientRect().top+scrollY+240));
 await p.waitForTimeout(1900);
 await p.screenshot({path:file});
 const rim=await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--rim-gradient').slice(0,130));
 await c.close();
 return rim;
}
const rimBase=await shot(false,'/tmp/rim-base.png');
const rimOn=await shot(true,'/tmp/rim-on.png');
console.log('base rim:',rimBase||'(none)');
console.log('light rim:',rimOn);
const mean=async(f)=>{const {data,info}=await sharp(f).extract({left:1180,top:40,width:200,height:300}).raw().toBuffer({resolveWithObject:true});let r=0,g=0,b=0,n=0;for(let i=0;i<data.length;i+=info.channels){r+=data[i];g+=data[i+1];b+=data[i+2];n++;}return [r/n,g/n,b/n].map(v=>+v.toFixed(1));};
const a=await mean('/tmp/rim-base.png'), bb=await mean('/tmp/rim-on.png');
console.log('rim region base rgb',a,'light rgb',bb,'delta',a.map((v,i)=>+(bb[i]-v).toFixed(1)));
await b.close();

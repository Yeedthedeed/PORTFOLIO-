import { chromium } from 'playwright';
import fs from 'fs';
const b=await chromium.launch();
const out={};
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
 const r=await p.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  bloom:document.querySelectorAll('.bloom').length,
  geo:document.querySelectorAll('.chapter-geometry').length,
  cards:document.querySelectorAll('.ps-card').length,
  ribbons:document.querySelectorAll('.film-spiral-root').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  halo:!!document.querySelector('.hero-portrait-stage [style*="rgba(61,159,255,0.14)"]'),
  portrait:document.querySelector('.hero-portrait-stage img')?.naturalWidth
 }));
 out[w+'x'+h]={...r,errors:errs.slice(0,3)};
 console.log(w+'x'+h,JSON.stringify(r),'errors',errs.length);
 await c.close();
}
// contrast on lit backgrounds
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(7000);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}window.scrollTo(0,0);});
await p.waitForTimeout(500);
const contrast=await p.evaluate(()=>{
 const rv=c=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return{r:d[0],g:d[1],b:d[2]};};
 const lum=p=>{const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return .2126*f(p.r)+.7152*f(p.g)+.0722*f(p.b)};
 const targets=[['hero quote','#work h1'],['photo eyebrow','#photography .eyebrow'],['film meta','.film-section-meta'],['film logline','.film-section-logline p:last-child'],['featured kicker','#featured-project .font-mono'],['about body','#about p'],['contact meta','#contact .font-mono']];
 return targets.map(([n,s])=>{const el=document.querySelector(s);if(!el)return{name:n,missing:true};
  const cs=getComputedStyle(el);let node=el,bg=null;
  while(node){const c=getComputedStyle(node).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'){const m=c.match(/[\d.]+/g);const a=m&&m.length>3?+m[3]:1;if(a>0.85){bg=c;break;}}node=node.parentElement;}
  if(!bg)bg=getComputedStyle(document.body).backgroundColor;
  const f=rv(cs.color),k=rv(bg);const cr=(Math.max(lum(f),lum(k))+.05)/(Math.min(lum(f),lum(k))+.05);
  return{name:n,size:cs.fontSize,contrast:+cr.toFixed(2),pass:cr>=4.5};});
});
out.contrast=contrast;
await c.close();
fs.writeFileSync('evidence/phase-04e/verify.json',JSON.stringify(out,null,2));
console.log('CONTRAST',JSON.stringify(contrast));
await b.close();

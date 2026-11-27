import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-06/screens';
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,100))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6000);
 const H=await p.evaluate(()=>document.body.scrollHeight);
 for(const [f,name] of [[0,'hero'],[0.3,'photography'],[0.58,'films'],[0.8,'featured'],[0.93,'contact']]){
  await p.evaluate(y=>window.scrollTo(0,y),Math.round(H*f));
  await p.waitForTimeout(1100);
  await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
 }
 const info=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  frames:document.querySelectorAll('.film-spiral-card').length,cards:document.querySelectorAll('.ps-card').length,
  grainAboveContent:(()=>{const g=document.querySelector('.oa-grain');const f=document.querySelector('.optical-field');return f?+getComputedStyle(f).zIndex:null;})(),
  overlays:document.querySelectorAll('.grain,.scanlines,.vignette,.bloom').length}));
 rows.push({viewport:`${w}x${h}`,...info,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify(info),'err',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-06/final.json',JSON.stringify(rows,null,2));
// contrast with the new field
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));}window.scrollTo(0,0);});
await p.waitForTimeout(500);
const contrast=await p.evaluate(()=>{
 const rv=c=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return{r:d[0],g:d[1],b:d[2]};};
 const lum=p=>{const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return .2126*f(p.r)+.7152*f(p.g)+.0722*f(p.b)};
 const bgOf=el=>{let n=el;while(n){const c=getComputedStyle(n).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'){const m=c.match(/[\d.]+/g);const a=m&&m.length>3?+m[3]:1;if(a>.85)return c;}n=n.parentElement;}return 'rgb(5,9,18)'};
 return [['hero quote','#work h1'],['nav link','header.site-header a.link-underline'],['photo eyebrow','#photography .eyebrow'],
   ['film index','.film-chapter-index'],['film meta','.film-section-meta'],['film logline','.film-section-logline p:last-child'],
   ['about body','#about p'],['contact meta','#contact .font-mono']].map(([n,s])=>{
   const el=document.querySelector(s); if(!el) return {name:n,missing:true};
   const f=rv(getComputedStyle(el).color), k=rv(bgOf(el));
   const r=(Math.max(lum(f),lum(k))+.05)/(Math.min(lum(f),lum(k))+.05);
   return {name:n,size:getComputedStyle(el).fontSize,contrast:+r.toFixed(2),pass:r>=4.5};});
});
console.log('CONTRAST',JSON.stringify(contrast));
fs.writeFileSync('evidence/phase-06/contrast.json',JSON.stringify(contrast,null,2));
await b.close();

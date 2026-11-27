import { chromium } from 'playwright';
import fs from 'fs';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));}window.scrollTo(0,0);});
await p.waitForTimeout(500);
const out=await p.evaluate(()=>{
 const rv=c=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return{r:d[0],g:d[1],b:d[2]};};
 const lin=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
 const lum=p=>.2126*lin(p.r)+.7152*lin(p.g)+.0722*lin(p.b);
 const ratio=(f,bg)=>{const a=lum(rv(f)),b=lum(rv(bg));return +(((Math.max(a,b)+.05)/(Math.min(a,b)+.05))).toFixed(2)};
 const bgOf=el=>{let n=el;while(n){const c=getComputedStyle(n).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'){const m=c.match(/[\d.]+/g);const a=m&&m.length>3?+m[3]:1;if(a>.85)return c;}n=n.parentElement;}return 'rgb(5,9,18)'};
 const rows=[];
 const sample=[['hero quote','#work h1'],['nav link','header.site-header a.link-underline'],
  ['eyebrow','#photography .eyebrow'],['spatial subtitle','.spatial-subtitle'],
  ['film chapter index','.film-chapter-index'],['film logline label','.film-section-logline > .eyebrow'],
  ['film meta','.film-section-meta'],['film logline','.film-section-logline p:last-child'],
  ['watch CTA','.film-watch'],['featured kicker','#featured-project .font-mono'],
  ['about body','#about p'],['stat label','#about .font-mono'],['contact meta','#contact .font-mono'],
  ['legal','#contact span.font-mono']];
 for(const [name,sel] of sample){
   const el=document.querySelector(sel); if(!el){rows.push({name,missing:true});continue;}
   const cs=getComputedStyle(el); const bg=bgOf(el); const r=el.getBoundingClientRect();
   rows.push({name,color:cs.color,bg,size:cs.fontSize,weight:cs.fontWeight,
     contrast:ratio(cs.color,bg),passAA:ratio(cs.color,bg)>=4.5,
     inView:r.top<900&&r.bottom>0});
 }
 // accent marks
 const marks=[['delusion index','#delusion-of-negation .film-chapter-index'],['zakia index','#zakias-clock .film-chapter-index'],['birth index','#the-birth-permit .film-chapter-index']];
 for(const [name,sel] of marks){const el=document.querySelector(sel);rows.push({name,
   color:getComputedStyle(el).color,bg:bgOf(el),contrast:ratio(getComputedStyle(el).color,bgOf(el))});}
 return rows;
});
console.log(JSON.stringify(out,null,2));
fs.writeFileSync('evidence/phase-05/contrast.json',JSON.stringify(out,null,2));
const fails=out.filter(r=>r.contrast!==undefined&&r.contrast<4.5);
console.log('\nFAIL',fails.length); fails.forEach(f=>console.log(f.name,f.size,f.contrast));
await b.close();

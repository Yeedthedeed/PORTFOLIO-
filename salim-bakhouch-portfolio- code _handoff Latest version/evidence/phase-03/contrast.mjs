import { chromium } from 'playwright';
import fs from 'fs';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(8000);
// scroll whole page so layout settles
await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});
await page.waitForTimeout(600);
const targets=[
 ['hero kicker','#work .font-mono'],
 ['hero h1','#work h1'],
 ['metacard label','#work .hidden.md\\:block .font-mono'],
 ['nav tagline','header.site-header span.font-mono'],
 ['chip eyebrow','#photography .eyebrow'],
 ['chip subtitle','#photography .spatial-subtitle'],
 ['film eyebrow','.film-section-row .eyebrow'],
 ['film meta','.film-section-meta'],
 ['film logline','.film-section-logline p:last-child'],
 ['film caption','.film-section-ribbon .film-spiral-caption'],
 ['featured kicker','#featured-project .font-mono'],
 ['about body','#about p:nth-of-type(2)'],
 ['about lead','#about h3'],
 ['about stat label','#about .font-mono'],
 ['contact meta','#contact .font-mono'],
 ['legal','#contact span.font-mono'],
 ['chapter rail','.chapter-rail-link'],
 ['archive link','.archive-links a'],
];
const data=await page.evaluate((targets)=>{
 const resolve=(cssColor)=>{
   if(!cssColor||cssColor==='transparent'||cssColor==='rgba(0, 0, 0, 0)') return null;
   const cv=document.createElement('canvas');cv.width=1;cv.height=1;
   const ctx=cv.getContext('2d');
   ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillRect(0,0,1,1);
   ctx.fillStyle=cssColor;ctx.fillRect(0,0,1,1);
   const [r,g,b,a]=ctx.getImageData(0,0,1,1).data;return {r,g,b,a};
 };
 const parseAlpha=(cssColor)=>{const m=(cssColor||'').match(/rgba?\(([^)]+)\)|oklch\(([^)]+)\)/); if(!m) return 1; if(m[1]){const p=m[1].split(/[ ,/]+/).map(Number);return p.length>3?p[3]:1;} return 1;};
 const out=[];
 for(const [name,sel] of targets){
   const el=document.querySelector(sel);
   if(!el){out.push({name,missing:true});continue;}
   const cs=getComputedStyle(el);
   let node=el,bg=null;
   while(node){const c=getComputedStyle(node).backgroundColor;if(c&&c!=='transparent'&&parseAlpha(c)>0.85){bg=c;break;}node=node.parentElement;}
   if(!bg) bg=getComputedStyle(document.body).backgroundColor;
   const fgR=resolve(cs.color), bgR=resolve(bg);
   const lin=(v)=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
   const lumin=(p)=>0.2126*lin(p.r)+0.7152*lin(p.g)+0.0722*lin(p.b);
   const ratio=fgR&&bgR?((Math.max(lumin(fgR),lumin(bgR))+0.05)/(Math.min(lumin(fgR),lumin(bgR))+0.05)):null;
   const r=el.getBoundingClientRect();
   out.push({name,color:cs.color,fgRgb:fgR,bgCss:bg,bgRgb:bgR,fontSize:cs.fontSize,fontWeight:cs.fontWeight,text:(el.innerText||'').trim().slice(0,40),inView:r.top<900&&r.bottom>0,contrast:ratio?+ratio.toFixed(2):null,passAA:ratio?ratio>=4.5:null,passLarge:ratio?ratio>=3:null});
 }
 return out;
},targets);
console.log(JSON.stringify(data.map(({name,fontSize,fontWeight,contrast,passAA,passLarge,color,bgCss,text})=>({name,fontSize,fontWeight,color,bgCss,contrast,passAA,passLarge,text})),null,2));
fs.writeFileSync('evidence/phase-03/contrast.json',JSON.stringify(data,null,2));
await browser.close();

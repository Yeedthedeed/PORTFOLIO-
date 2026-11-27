import { chromium } from 'playwright';
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(7500);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}window.scrollTo(0,0);});
await p.waitForTimeout(700);
const t=[['hero kicker','#work .font-mono'],['hero h1','#work h1'],['nav tagline','header.site-header span.font-mono'],['photo eyebrow','#photography .eyebrow'],['film meta','.film-section-meta'],['film logline','.film-section-logline p:last-child'],['featured kicker','#featured-project .font-mono'],['about body','#about p'],['contact meta','#contact .font-mono']];
const res=await p.evaluate((targets)=>{
 const rv=(c)=>{const cv=document.createElement('canvas');cv.width=1;cv.height=1;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return{r:d[0],g:d[1],b:d[2]};};
 const lum=p=>{const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(p.r)+0.7152*f(p.g)+0.0722*f(p.b)};
 return targets.map(([name,sel])=>{const el=document.querySelector(sel);if(!el)return{name,missing:true};
  const cs=getComputedStyle(el); let n=el,bg=null;
  while(n){const c=getComputedStyle(n).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){const m=c.match(/[\d.]+/g);const a=m&&m.length>3?+m[3]:1;if(a>0.85){bg=c;break;}}n=n.parentElement;}
  if(!bg)bg=getComputedStyle(document.body).backgroundColor;
  const f=rv(cs.color),bk=rv(bg);const cr=(Math.max(lum(f),lum(bk))+0.05)/(Math.min(lum(f),lum(bk))+0.05);
  return{name,size:cs.fontSize,contrast:+cr.toFixed(2),pass:cr>=4.5};});
},t);
console.log(JSON.stringify(res,null,2));
const fs=await import('fs'); fs.writeFileSync('evidence/phase-04/contrast.json',JSON.stringify(res,null,2));
await b.close();

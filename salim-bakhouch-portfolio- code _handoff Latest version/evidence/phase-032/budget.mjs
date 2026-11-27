import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const OUT='evidence/phase-032/screens'; fs.mkdirSync(OUT,{recursive:true});
const VIEWS=[[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]];
const CH=[['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project']];
const browser=await chromium.launch();
const rows=[];
// warm/blue classification in OKLCH
const srgbToLinear=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
function classify(r,g,b){
 const R=srgbToLinear(r/255),G=srgbToLinear(g/255),B=srgbToLinear(b/255);
 const l=0.4122214708*R+0.5363325363*G+0.0514459929*B;
 const m=0.2119034982*R+0.6806995451*G+0.1073969566*B;
 const s=0.0883024619*R+0.2817188376*G+0.6299787005*B;
 const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);
 const L=0.2104542553*l_+0.793617785*m_-0.0040720468*s_;
 const a=1.9779984951*l_-2.428592205*m_+0.4505937099*s_;
 const bb=0.0259040371*l_+0.7827717662*m_-0.808675766*s_;
 const C=Math.hypot(a,bb); let H=Math.atan2(bb,a)*180/Math.PI; if(H<0)H+=360;
 if(L<0.10) return 'dark';
 if(C>0.035 && H>=15 && H<=115 && L>0.30) return 'warm';
 if(C>0.012 && H>=170 && H<=300) return 'blue';
 return 'neutral';
}
const analyse=async(file)=>{
 const {data,info}=await sharp(file).resize(16,16,{fit:'fill'}).raw().toBuffer({resolveWithObject:true});
 const hist={}; let warm=0,blue=0,total=16*16;
 const colours=[];
 for(let i=0;i<data.length;i+=info.channels){
   const r=data[i],g=data[i+1],b=data[i+2];
   const k=classify(r,g,b); hist[k]=(hist[k]||0)+1;
   if(k==='warm')warm++; if(k==='blue')blue++;
   colours.push('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''));
 }
 return {histogram16x16:hist,warm_pixel_ratio:+(warm/total).toFixed(4),blue_pixel_ratio:+(blue/total).toFixed(4),palette16:[...new Set(colours)].slice(0,16)};
};
for(const [w,h,m] of VIEWS){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForTimeout(7000);
 for(const [name,sel] of CH){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1200);
   // 1. signal geometry: rects of the four warm marks vs viewport, overlap vs images
   const geo=await p.evaluate(({s})=>{
     const root=document.querySelector(s);
     const vw=innerWidth, vh=innerHeight;
     const marks=[...root.querySelectorAll('.film-chapter-index, .film-section-row .eyebrow-line, .film-section-logline > .eyebrow, .film-spiral-card.is-active img, .featured-signal-label, .featured-signal-rule')]
       .filter(el=>el.getBoundingClientRect().width>0);
     const area=marks.reduce((sum,el)=>{
       const r=el.getBoundingClientRect();
       const inView = Math.max(0, Math.min(r.bottom,vh)-Math.max(r.top,0)) * Math.max(0, Math.min(r.right,vw)-Math.max(r.left,0));
       return sum+inView;
     },0);
     const imgs=[...root.querySelectorAll('img')].map(i=>i.getBoundingClientRect()).filter(r=>r.width>0);
     const overlap=marks.some(el=>{
       const r=el.getBoundingClientRect();
       return imgs.some(ir=>!(r.right<=ir.left||ir.right<=r.left||r.bottom<=ir.top||ir.bottom<=r.top));
     });
     const outline=root.querySelector('.film-spiral-card.is-active img');
     return {marks:marks.length, markArea:Math.round(area), viewport:vw*vh,
       ratio:+(area/(vw*vh)).toFixed(5), overlapImage:overlap,
       outlineOffset:outline?getComputedStyle(outline).outlineOffset:null,
       outlineColor:outline?getComputedStyle(outline).outlineColor:null};
   },{s:sel});
   // 2. screenshot with imagery hidden (field only)
   await p.evaluate(s=>{const t=document.querySelector(s);t.querySelectorAll('img').forEach(i=>i.style.visibility='hidden');},sel);
   await p.waitForTimeout(250);
   const fieldFile=`${OUT}/${w}x${h}__${name}__FIELD.png`;
   await p.screenshot({path:fieldFile});
   // 3. clean screenshot with imagery
   await p.evaluate(s=>{const t=document.querySelector(s);t.querySelectorAll('img').forEach(i=>i.style.visibility='');},sel);
   await p.waitForTimeout(250);
   const file=`${OUT}/${w}x${h}__${name}.png`;
   await p.screenshot({path:file});
   const field=await analyse(fieldFile);
   rows.push({viewport:`${w}x${h}`,chapter:name,...geo,...field});
   console.log(`${w}x${h} ${name} ratio=${geo.ratio} marks=${geo.marks} warmField=${field.warm_pixel_ratio} blueField=${field.blue_pixel_ratio} overlapImg=${geo.overlapImage}`);
 }
 await c.close();
}
fs.writeFileSync('evidence/phase-032/budget.json',JSON.stringify(rows,null,2));
const fails=rows.filter(r=>r.ratio>0.03||r.overlapImage||r.warm_pixel_ratio>0.03||r.blue_pixel_ratio<0.90);
console.log('\nFAILURES:',fails.length);
fails.slice(0,10).forEach(f=>console.log(JSON.stringify(f)));
await browser.close();

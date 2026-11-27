import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const OUT='evidence/phase-032/screens';
fs.mkdirSync(OUT,{recursive:true});
const VIEWS=[[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]];
const CH=[['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit'],['featured','#featured-project']];
const browser=await chromium.launch();
const rows=[];
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
function classify(r,g,b){
 const R=lin(r/255),G=lin(g/255),B=lin(b/255);
 const l=0.4122214708*R+0.5363325363*G+0.0514459929*B;
 const m=0.2119034982*R+0.6806995451*G+0.1073969566*B;
 const s=0.0883024619*R+0.2817188376*G+0.6299787005*B;
 const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);
 const L=0.2104542553*l_+0.793617785*m_-0.0040720468*s_;
 const a=1.9779984951*l_-2.428592205*m_+0.4505937099*s_;
 const bb=0.0259040371*l_+0.7827717662*m_-0.808675766*s_;
 const C=Math.hypot(a,bb); let H=Math.atan2(bb,a)*180/Math.PI; if(H<0)H+=360;
 return {warm:C>0.045&&H>=15&&H<=115&&L>0.42, blue:C>0.018&&H>=170&&H<=300, dark:L<0.14};
}
const analyse=async(file,w=480,h=270)=>{
 const {data,info}=await sharp(file).resize(w,h,{fit:'fill'}).raw().toBuffer({resolveWithObject:true});
 let warm=0,blue=0,visible=0,n=0;
 for(let i=0;i<data.length;i+=info.channels){
   const c=classify(data[i],data[i+1],data[i+2]); n++;
   if(!c.dark) visible++;
   if(c.warm) warm++; if(c.blue) blue++;
 }
 return {warm_over_field:+(warm/n).toFixed(5),blue_over_field:+(blue/n).toFixed(5),
   warm_over_visible:visible?+(warm/visible).toFixed(5):0,blue_over_visible:visible?+(blue/visible).toFixed(5):0};
};
const hist16=async file=>{
 const {data,info}=await sharp(file).resize(16,16,{fit:'fill'}).raw().toBuffer({resolveWithObject:true});
 const bins={}; const pal=[];
 for(let i=0;i<data.length;i+=info.channels){
   const r=data[i],g=data[i+1],b=data[i+2];
   const k=`${Math.round(r/24)}-${Math.round(g/24)}-${Math.round(b/24)}`;
   bins[k]=(bins[k]||0)+1;
   pal.push('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''));
 }
 return {top_bins:Object.entries(bins).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>({bin:k,count:n})),palette:[...new Set(pal)].slice(0,10)};
};
for(const [w,h,m] of VIEWS){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
 const p=await c.newPage();
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForTimeout(6500);
 for(const [name,sel] of CH){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY);},sel);
   await p.waitForTimeout(1100);
   const geo=await p.evaluate(({s})=>{
     const root=document.querySelector(s);const vw=innerWidth,vh=innerHeight;
     const marks=[...root.querySelectorAll('.film-chapter-index, .film-section-row .eyebrow-line, .film-section-logline > .eyebrow, .featured-signal-label, .featured-signal-rule')].filter(e=>e.getBoundingClientRect().width>0);
     const area=marks.reduce((sum,el)=>{const r=el.getBoundingClientRect();
       return sum+Math.max(0,Math.min(r.bottom,vh)-Math.max(r.top,0))*Math.max(0,Math.min(r.right,vw)-Math.max(r.left,0));},0);
     const imgs=[...root.querySelectorAll('img')].map(i=>i.getBoundingClientRect()).filter(r=>r.width>0);
     const paint=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
       const ow=parseFloat(cs.outlineWidth)||0, oo=parseFloat(cs.outlineOffset)||0;
       return {left:r.left-ow-oo,right:r.right+ow+oo,top:r.top-ow-oo,bottom:r.bottom+ow+oo};};
     const overlaps=marks.filter(el=>{const m=paint(el);
       return imgs.some(ir=>!(m.right<=ir.left||ir.right<=m.left||m.bottom<=ir.top||ir.bottom<=m.top));})
       .map(el=>typeof el.className==='string'?el.className:'mark');
     return {marks:marks.length,ratio:+(area/(vw*vh)).toFixed(5),overlaps};
   },{s:sel});
   await p.evaluate(s=>{document.querySelectorAll(`${s} img`).forEach(i=>i.style.visibility='hidden');},sel);
   await p.waitForTimeout(230);
   const f1=`${OUT}/${w}x${h}__${name}__FIELD.png`;
   await p.screenshot({path:f1});
   await p.evaluate(s=>{document.querySelectorAll(`${s} img`).forEach(i=>i.style.visibility='');},sel);
   await p.waitForTimeout(230);
   const f2=`${OUT}/${w}x${h}__${name}.png`;
   await p.screenshot({path:f2});
   const field=await analyse(f1); const hist=await hist16(f1);
   rows.push({viewport:`${w}x${h}`,chapter:name,marks:geo.marks,signal_area_ratio:geo.ratio,
     overlaps_image:geo.overlaps.length>0,overlapping_elements:geo.overlaps,...field,histogram16x16:hist});
   console.log(`${w}x${h} ${name} area=${(geo.ratio*100).toFixed(3)}% warmField=${(field.warm_over_field*100).toFixed(3)}% blueVisible=${(field.blue_over_visible*100).toFixed(1)}% overlap=${geo.overlaps.length}`);
 }
 await c.close();
}
fs.writeFileSync('evidence/phase-032/budget.json',JSON.stringify(rows,null,2));
const fails=rows.filter(r=>r.signal_area_ratio>0.03||r.overlaps_image||r.warm_over_field>0.03);
console.log('\nROWS',rows.length,'FAIL',fails.length);
fails.forEach(f=>console.log('FAIL',f.viewport,f.chapter,'area',f.signal_area_ratio,'warm',f.warm_over_field,JSON.stringify(f.overlapping_elements)));
console.log('MAX signal area %',(Math.max(...rows.map(r=>r.signal_area_ratio))*100).toFixed(3));
console.log('MAX warm field %',(Math.max(...rows.map(r=>r.warm_over_field))*100).toFixed(3));
console.log('MIN blue-of-visible %',(Math.min(...rows.map(r=>r.blue_over_visible))*100).toFixed(1));
await browser.close();

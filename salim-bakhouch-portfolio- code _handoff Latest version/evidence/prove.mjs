import { chromium } from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
// scroll into the filmography
await p.evaluate(()=>{const t=document.querySelector('#zakias-clock');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+200);});
await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/f-with.png'});
// hide only the aperture SVG, keep everything else identical
await p.evaluate(()=>{const s=document.querySelector('.oa-svg');if(s)s.style.display='none';});
await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/f-without.png'});
const diff=async(a,bb)=>{
 const A=await sharp(a).raw().toBuffer({resolveWithObject:true});
 const B=await sharp(bb).raw().toBuffer({resolveWithObject:true});
 let sum=0,n=0,changed=0;
 for(let i=0;i<A.data.length;i+=A.info.channels){
  const d=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);
  sum+=d;n++; if(d>6)changed++;
 }
 return {meanDelta:+(sum/n).toFixed(3), changedPixelsPct:+(changed/n*100).toFixed(2)};
};
console.log('APERTURE VISIBLE BEHIND FILMOGRAPHY:', JSON.stringify(await diff('/tmp/f-with.png','/tmp/f-without.png')));
// spacing after compaction
console.log('SECTION SPACING', JSON.stringify(await p.evaluate(()=>{
 const fs=document.querySelector('.film-sections');const film=document.querySelector('#filmography');
 const rows=[...document.querySelectorAll('.film-section-row')];
 const hd=film.querySelector(':scope > .spatial-header');
 const b=el=>{const r=el.getBoundingClientRect();return{t:Math.round(r.top+scrollY),h:Math.round(r.height),b:Math.round(r.bottom+scrollY)}};
 return {gap:getComputedStyle(fs).rowGap, fsMargin:getComputedStyle(fs).marginTop,
  header:b(hd),firstRow:b(rows[0]),gapAfterHeader:Math.round(b(rows[0]).t-b(hd).b),
  between12:Math.round(b(rows[1]).t-b(rows[0]).b), rowsTotal:rows.reduce((s,r)=>s+b(r).h,0),
  filmH:b(film).h, ribbonH:getComputedStyle(document.querySelector('.film-section-ribbon')).height};
})));
await b.close();

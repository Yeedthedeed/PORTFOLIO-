import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const OUT='evidence/spacing/screens';
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,100))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6000);
 const info=await p.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  rows:[...document.querySelectorAll('.film-section-row')].map(r=>Math.round(r.getBoundingClientRect().height)),
  filmH:Math.round(document.querySelector('#filmography').getBoundingClientRect().height),
  emptyGeo:document.querySelectorAll('.film-section-row > .chapter-geometry').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  captions:document.querySelectorAll('.film-spiral-caption').length,
  filtered:[...document.querySelectorAll('.film-spiral-card img')].map(i=>getComputedStyle(i).filter).filter(f=>f!=='none').length,
  fieldZ:getComputedStyle(document.querySelector('.optical-field')).zIndex,
  cards:document.querySelectorAll('.ps-card').length
 }));
 for(const [id,sel] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+80);},sel);
   await p.waitForTimeout(1100);
   await p.screenshot({path:`${OUT}/${w}x${h}__${id}.png`});
 }
 // aperture differential behind filmography
 await p.evaluate(()=>{const t=document.querySelector('#zakias-clock');window.scrollTo(0,t.getBoundingClientRect().top+scrollY+200);});
 await p.waitForTimeout(1000);
 await p.screenshot({path:'/tmp/with.png'});
 await p.evaluate(()=>{const s=document.querySelector('.oa-svg');if(s)s.style.display='none';});
 await p.waitForTimeout(350);
 await p.screenshot({path:'/tmp/without.png'});
 const A=await sharp('/tmp/with.png').resize(480,270).raw().toBuffer({resolveWithObject:true});
 const B=await sharp('/tmp/without.png').resize(480,270).raw().toBuffer({resolveWithObject:true});
 let changed=0,n=0;
 for(let i=0;i<A.data.length;i+=A.info.channels){const d=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);if(d>6)changed++;n++;}
 info.apertureDifferentialPct=+(changed/n*100).toFixed(2);
 rows.push({viewport:`${w}x${h}`,...info,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify({rows:info.rows,filmH:info.filmH,geo:info.emptyGeo,frames:info.frames,aperture:info.apertureDifferentialPct,overflow:info.overflow}),'err',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/spacing/full.json',JSON.stringify(rows,null,2));
const fails=rows.filter(r=>r.overflow!==0||r.emptyGeo!==0||r.frames!==122||r.captions!==0||r.filtered!==0||r.errors.length);
console.log('FAILS',fails.length);
await b.close();

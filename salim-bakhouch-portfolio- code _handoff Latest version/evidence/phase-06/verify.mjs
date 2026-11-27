import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-06/screens'; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,110))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 // six scroll positions across the whole page
 const H=await p.evaluate(()=>document.body.scrollHeight);
 const positions=[[0,'01-hero'],[0.26,'02-photography'],[0.48,'03-delusion'],[0.60,'04-zakia'],[0.70,'05-birth'],[0.80,'06-featured'],[0.92,'07-contact']];
 for(const [f,name] of positions){
   await p.evaluate(y=>window.scrollTo(0,y), Math.round(H*f));
   await p.waitForTimeout(1200);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
 }
 const info=await p.evaluate(()=>{
  const field=document.querySelector('.optical-field');
  const cs=field?getComputedStyle(field):null;
  const grain=document.querySelector('.oa-grain');
  const z=el=>el?getComputedStyle(el).zIndex:null;
  const svg=document.querySelector('.oa-svg');
  const content=document.querySelector('#work');
  return {
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   field:!!field, fieldZ:cs?.zIndex, fieldPointer:cs?.pointerEvents,
   grainOpacity:grain?getComputedStyle(grain).opacity:null,
   grainAnimated:grain?getComputedStyle(grain).animationName:null,
   globalOverlays:{grain:document.querySelectorAll('.grain,.scanlines,.vignette').length},
   svgNodes:svg?svg.querySelectorAll('*').length:0,
   canvases:document.querySelectorAll('canvas').length,
   contentZ:z(content),
   timelineSupported:CSS.supports('animation-timeline','scroll()'),
   apertureAnim:document.querySelector('.oa-aperture')?getComputedStyle(document.querySelector('.oa-aperture')).animationName:null,
   cards:document.querySelectorAll('.ps-card').length,
   ribbons:document.querySelectorAll('.film-spiral-root').length,
   frames:document.querySelectorAll('.film-spiral-card').length,
   captions:document.querySelectorAll('.film-spiral-caption').length
  };
 });
 rows.push({viewport:`${w}x${h}`,...info,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify(info),'err',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-06/verify.json',JSON.stringify(rows,null,2));
await b.close();

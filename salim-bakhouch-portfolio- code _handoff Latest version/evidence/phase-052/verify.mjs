import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
const OUT='evidence/phase-052/screens'; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,110))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 const geo=await p.evaluate(()=>{
   const rows=[...document.querySelectorAll('.film-section-row')];
   const style=el=>{const cs=getComputedStyle(el);return{border:cs.borderTopWidth+' '+cs.borderTopStyle,bg:cs.backgroundColor,bgImg:cs.backgroundImage.slice(0,30),shadow:cs.boxShadow};};
   const before=el=>{const cs=getComputedStyle(el,'::before');return{content:cs.content,display:cs.display};};
   const g=document.querySelector('#filmography .chapter-geometry');
   return {rows:rows.map(r=>({cls:r.id,...style(r),before:before(r)})),
     filmGeom:g?{filter:getComputedStyle(g).display,shapes:g.querySelectorAll('rect,line,path,circle').length}:null,
     filmographyBg:getComputedStyle(document.querySelector('#filmography')).backgroundImage.slice(0,60)};
 });
 // capture transitions: header→film1, film1→film2, film2→film3
 const shots=[];
 for(const [name,sel,off] of [['header-first','#delusion-of-negation',-120],['between-1-2','#zakias-clock',-160],['between-2-3','#the-birth-permit',-160],['film3','#the-birth-permit',220]]){
   await p.evaluate(({s,o})=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+o);},{s:sel,o:off});
   await p.waitForTimeout(1200);
   await p.screenshot({path:`${OUT}/${w}x${h}__${name}.png`});
   shots.push(name);
 }
 rows.push({viewport:`${w}x${h}`,...geo,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify({rows:geo.rows,borders:geo.rows.filter(r=>r.border.startsWith('0px')).length+'/'+geo.rows.length,filmGeomShapes:geo.filmGeom?.shapes,bg:geo.filmographyBg.slice(0,34)}),'err',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-052/verify.json',JSON.stringify(rows,null,2));
await b.close();

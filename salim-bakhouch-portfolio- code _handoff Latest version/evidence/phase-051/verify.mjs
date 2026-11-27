import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-051/screens';
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,120))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 for(const [film,sel] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+220);},sel);
   await p.waitForTimeout(1300);
   await p.screenshot({path:`${OUT}/${w}x${h}__${film}.png`});
 }
 const info=await p.evaluate(()=>{
   const caps=document.querySelectorAll('.film-spiral-caption').length;
   const notes=document.querySelectorAll('.film-spiral-note').length;
   const imgs=[...document.querySelectorAll('.film-spiral-card img')];
   const txt=[...document.querySelectorAll('.film-spiral-card')].map(c=>c.innerText.trim()).filter(Boolean).length;
   const capBoxes=[...document.querySelectorAll('.film-spiral-caption')].filter(e=>e.getBoundingClientRect().width>0).length;
   const bg=s=>getComputedStyle(document.querySelector(s)).backgroundColor;
   const frames=[...document.querySelectorAll('.film-spiral-card img')].slice(0,3).map(i=>getComputedStyle(i).filter);
   return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    captionNodes:caps,noteNodes:notes,cardTextElements:txt,visibleCaptionBoxes:capBoxes,
    frames:document.querySelectorAll('.film-spiral-card').length,
    imageFiltersUnique:[...new Set(frames)],
    tiers:{d:getComputedStyle(document.querySelector('#delusion-of-negation')).getPropertyValue('--signal-tier').trim(),
     z:getComputedStyle(document.querySelector('#zakias-clock')).getPropertyValue('--signal-tier').trim(),
     b:getComputedStyle(document.querySelector('#the-birth-permit')).getPropertyValue('--signal-tier').trim()},
    planes:{p:bg('#photography'),photo:bg('#photography'),d:bg('#delusion-of-negation'),z:bg('#zakias-clock'),b:bg('#the-birth-permit'),f:bg('#featured-project'),a:bg('#about')},
    orange:{copper:getComputedStyle(document.documentElement).getPropertyValue('--c-copper').trim(),
      burnt:getComputedStyle(document.documentElement).getPropertyValue('--c-burnt').trim()}};
 });
 rows.push({viewport:`${w}x${h}`,...info,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify(info),'errors',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-051/verify.json',JSON.stringify(rows,null,2));
await b.close();

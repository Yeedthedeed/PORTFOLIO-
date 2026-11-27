import { chromium } from 'playwright';
import fs from 'fs';
const OUT='evidence/phase-051/screens'; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();
const rows=[];
for(const [w,h,m] of [[1920,1080,false],[1440,900,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true],[844,390,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m}); const p=await c.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',x=>{if(x.type()==='error')errs.push(x.text().slice(0,110))});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6500);
 for(const [film,sel] of [['delusion','#delusion-of-negation'],['zakia','#zakias-clock'],['birth','#the-birth-permit']]){
   await p.evaluate(s=>{const t=document.querySelector(s);window.scrollTo(0,t.getBoundingClientRect().top+scrollY+220);},sel);
   await p.waitForTimeout(1200);
   await p.screenshot({path:`${OUT}/${w}x${h}__${film}.png`});
 }
 // archive captions check
 await p.evaluate(()=>{const a=document.querySelector('.archive-links');window.scrollTo(0,a?a.offsetTop:0);}); await p.waitForTimeout(900);
 const arch=p.locator('.archive-links a').filter({hasText:/Filmography/i}).first();
 if(await arch.count()) await arch.click(); else await p.locator('#filmography button').filter({hasText:/archive/i}).last().click();
 await p.waitForTimeout(2200);
 const archive={open:await p.locator('.film-archive').count(),captions:await p.locator('.film-archive .film-spiral-caption').count(),frames:await p.locator('.film-archive .film-spiral-card').count(),ribbons:await p.locator('.film-archive .film-spiral-root').count()};
 await p.screenshot({path:`${OUT}/${w}x${h}__archive.png`});
 await p.keyboard.press('Escape'); await p.waitForTimeout(700);
 const info=await p.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  landingCaptions:document.querySelectorAll('.film-spiral-caption').length,
  landingNotes:document.querySelectorAll('.film-spiral-note').length,
  frames:document.querySelectorAll('.film-spiral-card').length,
  filtered:[...document.querySelectorAll('.film-spiral-card img')].map(i=>getComputedStyle(i).filter).filter(f=>f!=='none').length,
  planes:{d:getComputedStyle(document.querySelector('#delusion-of-negation')).backgroundColor,
   z:getComputedStyle(document.querySelector('#zakias-clock')).backgroundColor,
   b:getComputedStyle(document.querySelector('#the-birth-permit')).backgroundColor,
   f:getComputedStyle(document.querySelector('#featured-project')).backgroundColor,
   a:getComputedStyle(document.querySelector('#about')).backgroundColor},
  orange:{copper:getComputedStyle(document.documentElement).getPropertyValue('--c-copper').trim(),burnt:getComputedStyle(document.documentElement).getPropertyValue('--c-burnt').trim()},
  tiers:{d:getComputedStyle(document.querySelector('#delusion-of-negation')).getPropertyValue('--signal-tier').trim(),
   z:getComputedStyle(document.querySelector('#zakias-clock')).getPropertyValue('--signal-tier').trim(),
   b:getComputedStyle(document.querySelector('#the-birth-permit')).getPropertyValue('--signal-tier').trim()}
 }));
 rows.push({viewport:`${w}x${h}`,...info,archive,errors:errs.slice(0,3)});
 console.log(w+'x'+h,JSON.stringify({...info,archive}),'err',errs.length);
 await c.close();
}
fs.writeFileSync('evidence/phase-051/final.json',JSON.stringify(rows,null,2));
const fails=rows.filter(r=>r.landingCaptions>0||r.filtered>0||r.archive.captions>0||r.overflow>0);
console.log('FAIL ROWS',fails.length);
await b.close();

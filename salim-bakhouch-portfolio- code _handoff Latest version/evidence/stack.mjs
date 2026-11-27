import { chromium } from 'playwright';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(()=>{
 const secs=['#work','#photography','#filmography','#delusion-of-negation','#zakias-clock','#the-birth-permit','#featured-project','#about','#contact'];
 const out={};
 for(const s of secs){const el=document.querySelector(s); if(!el){out[s]='missing';continue;}
  const cs=getComputedStyle(el);
  out[s]={bg:cs.backgroundColor,bgImg:cs.backgroundImage.slice(0,34),pos:cs.position,z:cs.zIndex};}
 const field=document.querySelector('.optical-field');
 const app=document.querySelector('#root > div');
 const fs=document.querySelector('.film-sections');
 const film=document.querySelector('#filmography');
 const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return{t:Math.round(b.top+scrollY),h:Math.round(b.height)}};
 return {field:field?{z:getComputedStyle(field).zIndex,pos:getComputedStyle(field).position}:null,
  appBg:app?getComputedStyle(app).backgroundColor:null,
  film:r(film),sections:r(fs),header:r(film?.querySelector('.spatial-header')),
  gaps:fs?getComputedStyle(fs).rowGap:null,fsMargin:fs?getComputedStyle(fs).marginTop:null,
  rows:[...document.querySelectorAll('.film-section-row')].map(x=>{const b=x.getBoundingClientRect();const cs=getComputedStyle(x);return{id:x.id,t:Math.round(b.top+scrollY),h:Math.round(b.height),pt:cs.paddingTop,mt:cs.marginTop};}),
  out};
}),null,2));
await b.close();

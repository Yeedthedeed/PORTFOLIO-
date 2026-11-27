import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
const errors=[]; const failed=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200))});
page.on('pageerror',e=>errors.push('PAGEERROR '+e.message.slice(0,200)));
page.on('requestfailed',r=>failed.push(r.url().slice(0,140)));
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(9000);
// hover the viewfinder face region (sapphire halo + EVF)
const face=page.getByRole('button',{name:/viewfinder/i}).first();
const fb=await face.boundingBox();
console.log('FACE BOX',fb);
if(fb){await page.mouse.move(fb.x+fb.width/2,fb.y+fb.height/2);await page.waitForTimeout(1400);}
await page.screenshot({path:'evidence/phase-01/screens/1440x900__viewfinder-hover.png'});
console.log('ERRORS AFTER VIEWFINDER',errors.length,[...new Set(errors)].slice(0,4));
// keyboard tab order across the hero
const order=[];
for(let i=0;i<14;i++){await page.keyboard.press('Tab'); order.push(await page.evaluate(()=>{const a=document.activeElement;return {tag:a?.tagName,label:(a?.getAttribute('aria-label')||a?.innerText||'').trim().replace(/\n/g,' ').slice(0,42),cls:(typeof a?.className==='string'?a.className:'').slice(0,26)}}));}
console.log('TAB ORDER',JSON.stringify(order,null,1));
// check if keyboard focus is visible on nav link
await page.evaluate(()=>window.scrollTo(0,0));
await page.locator('a[href="#about"]').first().focus();
await page.screenshot({path:'evidence/phase-01/screens/1440x900__focus-navlink.png',clip:{x:900,y:0,width:540,height:120}});
// film ribbon size at 1920 and 1024 via new contexts
for(const [w,h] of [[1920,1080],[1024,768]]){
  const c2=await browser.newContext({viewport:{width:w,height:h}}); const p2=await c2.newPage();
  await p2.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p2.waitForTimeout(7000);
  await p2.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+450)); await p2.waitForTimeout(2200);
  const rb=await p2.evaluate(()=>[...document.querySelectorAll('.film-spiral-wrap')].map(el=>{const b=el.getBoundingClientRect();return{w:Math.round(b.width),h:Math.round(b.height)}}));
  const big=await p2.evaluate(()=>{const imgs=[...document.querySelectorAll('.film-spiral-card img')].filter(i=>{const b=i.getBoundingClientRect();return b.width>0});const max=imgs.reduce((a,i)=>Math.max(a,i.getBoundingClientRect().width),0);const sphere=document.querySelector('.sphere-wrap');const sb=sphere?.getBoundingClientRect();return{maxFrameW:Math.round(max),sphereW:sb?Math.round(sb.width):null,sphereH:sb?Math.round(sb.height):null}});
  console.log('LAYOUT',w+'x'+h,{ribbons:rb,...big});
  await p2.screenshot({path:`evidence/phase-01/screens/${w}x${h}__filmography-large.png`});
  await c2.close();
}
fs.writeFileSync('evidence/phase-01/data/audit-e.json',JSON.stringify({errors:[...new Set(errors)],failed,tabOrder:order},null,2));
await browser.close();

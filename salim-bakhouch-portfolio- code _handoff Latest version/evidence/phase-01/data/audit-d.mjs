import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
const errors=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,160))});
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(9000);
// SVG rect errors: reproduce context
console.log('FLAT ERROR COUNT',errors.length,'unique',[...new Set(errors)]);
// open each thing and collect errors by action
const steps=[];
async function step(name,fn){const before=errors.length;try{await fn();}catch(e){steps.push({name,threw:e.message.slice(0,80)})}await page.waitForTimeout(1000);steps.push({name,newErrors:errors.length-before,sample:errors.slice(before,before+2)});}
await step('menu-hover',async()=>{const m=page.getByRole('button',{name:'Open navigation'});await m.hover();});
await step('audio-hover',async()=>{await page.locator('header button[aria-pressed]').first().hover();});
await page.keyboard.press('Escape');
await step('sphere-hover',async()=>{await page.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop));await page.waitForTimeout(1400);const c=page.locator('.ps-card').first();const b=await c.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);});
await step('sphere-click',async()=>{const c=page.locator('.ps-card').first();const b=await c.boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2);});
await step('sphere-next',async()=>{await page.getByRole('button',{name:'Next photograph in album'}).click();});
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
await step('film-hover',async()=>{await page.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500));await page.waitForTimeout(1600);const f=page.locator('.film-spiral-card').first();const b=await f.boundingBox();if(b){await page.mouse.move(b.x+b.width/2,b.y+b.height/2);}});
await step('film-hold',async()=>{const f=page.locator('.film-spiral-card').first();const b=await f.boundingBox();if(b){await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(700);}});
await step('film-release',async()=>{await page.mouse.up();});
console.log('STEPS',JSON.stringify(steps,null,1));
console.log('TOTAL ERRORS',errors.length,'UNIQUE',[...new Set(errors)].slice(0,6));
// Text legibility sample: hero labels and film captions
const small=await page.evaluate(()=>[...document.querySelectorAll('.hero-side,.hero-meta,.font-mono,.eyebrow,.film-spiral-caption,.chapter-rail')].slice(0,40).map(el=>{const cs=getComputedStyle(el);return {cls:(typeof el.className==='string'?el.className:'').slice(0,30),fs:cs.fontSize,color:cs.color,text:(el.innerText||'').trim().slice(0,28)}}).filter(x=>x.text));
console.log('TYPOGRAPHY SAMPLE',JSON.stringify(small.slice(0,18),null,1));
// hit area of dock and nav buttons
const hit=await page.evaluate(()=>[...document.querySelectorAll('.mobile-dock a, header a, header button')].map(el=>{const r=el.getBoundingClientRect();return {label:(el.getAttribute('aria-label')||el.innerText||'').trim().slice(0,24),w:Math.round(r.width),h:Math.round(r.height)}}).slice(0,12));
console.log('HIT',JSON.stringify(hit));
await browser.close();

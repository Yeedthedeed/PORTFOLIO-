import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1400);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2200);
const state=async()=>p.evaluate(()=>({dialogs:[...document.querySelectorAll('[role="dialog"]')].map(d=>d.className), active:document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText?.slice(0,20), bodyOverflow:document.body.style.overflow}));
console.log('OPEN',await state());
// send Escape with focus on Back button
await p.keyboard.press('Escape'); await p.waitForTimeout(1200);
console.log('ESC #1',await state());
await p.locator('.archive').press('Escape').catch(()=>{});
await p.waitForTimeout(900);
console.log('ESC on archive element',await state());
await p.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
await p.waitForTimeout(900);
console.log('ESC window dispatch',await state());
// click Back explicitly
const back=p.locator('.archive-header .text-action').first();
if(await back.count()){await back.click(); await p.waitForTimeout(1200);}
console.log('BACK CLICK',await state());
await browser.close();

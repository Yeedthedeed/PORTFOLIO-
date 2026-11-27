import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForTimeout(9000);
console.log('AUDIO RECTS', await page.evaluate(()=>[...document.querySelectorAll('header button[aria-pressed] rect')].map(r=>({h:r.getAttribute('height'),y:r.getAttribute('y'),dw:r.getBoundingClientRect().width,dh:r.getBoundingClientRect().height}))));
console.log('AUDIO LABEL', await page.locator('header button[aria-pressed]').getAttribute('aria-label'));
await page.screenshot({path:'evidence/phase-01/screens/1440x900__audio-control.png', clip:{x:1150,y:0,width:290,height:110}});
// menu screenshot + escape behavior
await page.getByRole('button',{name:'Open navigation'}).click();
await page.waitForTimeout(900);
await page.screenshot({path:'evidence/phase-01/screens/1440x900__nav-menu.png', clip:{x:1000,y:0,width:440,height:420}});
await page.keyboard.press('Escape'); await page.waitForTimeout(600);
console.log('MENU AFTER ESC VISIBLE', await page.locator('#site-menu').isVisible().catch(()=>false));
// focus trap check in photography viewer
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop));
await page.waitForTimeout(1600);
const card=page.locator('.ps-card').first();
const cb=await card.boundingBox();
await page.mouse.click(cb.x+cb.width/2, cb.y+cb.height/2);
await page.waitForTimeout(2200);
const trap=await page.evaluate(()=>{
 const dlg=document.querySelector('.ps-viewer'); if(!dlg) return {noDialog:true};
 const focusables=[...dlg.querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])')];
 return {count:focusables.length, activeInDialog:!!document.activeElement?.closest('.ps-viewer'), role:dlg.getAttribute('role'), labelled:dlg.getAttribute('aria-labelledby')};
});
console.log('VIEWER FOCUS', trap);
// tab cycle test
const seen=new Set();
for(let i=0;i<25;i++){await page.keyboard.press('Tab'); const where=await page.evaluate(()=>document.activeElement?.closest('.ps-viewer')?'viewer':(document.activeElement?.closest('.ps-card')?'card':'outside')); seen.add(where);} 
console.log('TAB TERRITORY (25 tabs)',[...seen]);
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
// keyboard-only film ribbon reachability
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+400));
await page.waitForTimeout(1800);
const filmTabs=await page.evaluate(()=>[...document.querySelectorAll('.film-spiral-card')].slice(0,4).map(el=>({tabindex:el.getAttribute('tabindex'),role:el.getAttribute('role')})));
console.log('FILM FRAME TABS',filmTabs);
await browser.close();

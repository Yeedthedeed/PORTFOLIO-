import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
// Exactly reproduce earlier: land at archive, Escape at archive level (no lightbox), re-open, then Escape
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1200);
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2000);
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
console.log('after first close', await p.evaluate(()=>({dialogs:document.querySelectorAll('[role="dialog"]').length, overflow:document.body.style.overflow})));
await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2000);
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
console.log('after second close', await p.evaluate(()=>({dialogs:document.querySelectorAll('[role="dialog"]').length, overflow:document.body.style.overflow})));
await p.mouse.wheel(0,700); await p.waitForTimeout(600);
console.log('scrollY',await p.evaluate(()=>Math.round(scrollY)));
// film archive path
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+300)); await p.waitForTimeout(1600);
const b=p.locator('.film-section button').filter({hasText:/archive/i}).last();
await b.click({force:true}); await p.waitForTimeout(2200);
console.log('film archive open',await p.evaluate(()=>({dialogs:document.querySelectorAll('[role="dialog"]').length,overflow:document.body.style.overflow})));
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
console.log('film archive close',await p.evaluate(()=>({dialogs:document.querySelectorAll('[role="dialog"]').length,overflow:document.body.style.overflow})));
// stills showcase lock
await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500)); await p.waitForTimeout(1600);
await p.locator('.film-album-link').first().click(); await p.waitForTimeout(2200);
console.log('showcase open',await p.evaluate(()=>({overflow:document.body.style.overflow, dialogs:document.querySelectorAll('[role="dialog"]').length})));
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
console.log('showcase close',await p.evaluate(()=>({overflow:document.body.style.overflow, dialogs:document.querySelectorAll('[role="dialog"]').length})));
await browser.close();

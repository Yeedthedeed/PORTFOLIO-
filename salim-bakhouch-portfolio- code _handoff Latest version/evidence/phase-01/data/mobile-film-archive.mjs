import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
for(const [w,h] of [[390,844],[768,1024]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
 const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop)); await p.waitForTimeout(1400);
 const btn=p.getByRole('button',{name:/open archive view/i}).first();
 console.log(w,'button count',await btn.count(),'visible',await btn.isVisible().catch(()=>false));
 await btn.scrollIntoViewIfNeeded().catch(()=>{});
 await btn.click(); await p.waitForTimeout(2600);
 console.log(w,'archive',await p.locator('.film-archive').count(),'ribbons',await p.locator('.film-archive .film-spiral-root').count(),'dialogs',await p.locator('[role="dialog"]').count());
 await p.screenshot({path:`evidence/phase-01/screens/${w}x${h}__mobile-film-archive.png`});
 console.log(w,'scroll',await p.evaluate(()=>{const el=document.querySelector('.film-archive--scroll');return el?{sh:el.scrollHeight,ch:el.clientHeight}:null}));
 console.log(w,'errors',errs.slice(0,3));
 await c.close();
}
await browser.close();

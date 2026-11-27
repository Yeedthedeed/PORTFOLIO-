import { chromium } from 'playwright';
import fs from 'fs';
const B='http://127.0.0.1:4173/';
const OUT='evidence/phase-03b/screens';
const browser=await chromium.launch();
const out={};

{
 const c=await browser.newContext({viewport:{width:1440,height:900}});
 const p=await c.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150))});
 await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);

 out.dock=await p.locator('.mobile-dock').count();
 out.progress=await p.locator('.scroll-progress').count();
 out.landingActions=await p.evaluate(()=>[...document.querySelectorAll('.film-section-row')].map(sec=>({
   film:sec.querySelector('.film-section-title')?.innerText.trim(),
   actions:[...sec.querySelectorAll('.film-section-actions a, .film-section-actions button')].map(a=>({label:a.innerText.trim().replace(/\s+/g,' '),href:a.getAttribute('href'),target:a.getAttribute('target')}))
 })));

 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+500)); await p.waitForTimeout(2200);
 const card=p.locator('#delusion-of-negation .film-spiral-card').nth(4);
 const cb=await card.boundingBox();
 if(cb) await p.mouse.click(cb.x+cb.width/2, cb.y+cb.height/2);
 await p.waitForTimeout(2600);
 out.selection={detail:await p.locator('.film-detail').count(),albumBehind:await p.locator('.stills-showcase').count()};
 await p.screenshot({path:`${OUT}/1440__still-viewer.png`});
 const albumBtn=p.locator('.film-detail-album').first();
 out.viewerAlbumButton=await albumBtn.count();
 if(await albumBtn.count()){ await albumBtn.click(); await p.waitForTimeout(2600); }
 out.albumAfterViewer={album:await p.locator('.stills-showcase').count(),detail:await p.locator('.film-detail').count(),
   tiles:await p.locator('.stills-showcase-tile').count(),
   title:await p.locator('.stills-showcase-title').first().innerText().catch(()=>null),
   watched:await p.locator('.stills-showcase-watch').count(),
   github:await p.locator('.stills-showcase-tools a').count()};
 out.grid=await p.evaluate(()=>{
   const g=document.querySelector('.stills-showcase-grid');
   const tiles=[...document.querySelectorAll('.stills-showcase-tile')];
   const imgs=[...document.querySelectorAll('.stills-showcase-media img')].filter(i=>i.getBoundingClientRect().width>0);
   const cs=g?getComputedStyle(g):null;
   return {cols:cs?.gridTemplateColumns,display:cs?.display,tiles:tiles.length,visibleImgs:imgs.length,
     firstTile:tiles[0]?(()=>{const b=tiles[0].getBoundingClientRect();return{w:Math.round(b.width),h:Math.round(b.height)}})():null,
     imgH:imgs[0]?Math.round(imgs[0].getBoundingClientRect().height):null,
     imgW:imgs[0]?Math.round(imgs[0].getBoundingClientRect().width):null,
     scrollH:g?.scrollHeight,clientH:g?.clientHeight,vh:innerHeight};
 });
 await p.screenshot({path:`${OUT}/1440__album-grid.png`});
 await p.locator('.stills-showcase-tile').nth(2).click(); await p.waitForTimeout(2400);
 out.tileViewer={detail:await p.locator('.film-detail').count(),album:await p.locator('.stills-showcase').count()};
 await p.keyboard.press('Escape'); await p.waitForTimeout(900);
 out.afterTileEsc={detail:await p.locator('.film-detail').count(),album:await p.locator('.stills-showcase').count()};
 await p.keyboard.press('Escape'); await p.waitForTimeout(900);
 out.albumClosed=await p.locator('.stills-showcase').count();

 await p.evaluate(()=>{const a=document.querySelector('.archive-links');window.scrollTo(0,a?a.offsetTop:0)}); await p.waitForTimeout(1200);
 const arch=p.locator('.archive-links a').filter({hasText:/Filmography/i}).first();
 if(await arch.count()) await arch.click(); else await p.locator('#filmography button').filter({hasText:/archive/i}).last().click();
 await p.waitForTimeout(2500);
 out.archive={open:await p.locator('.film-archive').count(),
   panels:await p.evaluate(()=>[...document.querySelectorAll('.film-ribbon-panel')].map(pn=>({
     film:pn.dataset.film,
     actions:[...pn.querySelectorAll('.film-ribbon-panel-actions a, .film-ribbon-panel-actions button')].map(a=>({label:a.innerText.trim().replace(/\s+/g,' '),href:a.getAttribute('href'),target:a.getAttribute('target')}))
   }))),
   birthActions:await p.evaluate(()=>[...document.querySelectorAll('.film-archive-birth-actions a, .film-archive-birth-actions button')].map(a=>({label:a.innerText.trim().replace(/\s+/g,' '),href:a.getAttribute('href')})))};
 await p.screenshot({path:`${OUT}/1440__film-archive-actions.png`});
 const zakiaAlbum=p.locator('.film-ribbon-panel[data-film="Zakia\'s Clock"] .film-ribbon-panel-actions button').first();
 if(await zakiaAlbum.count()){ await zakiaAlbum.click(); await p.waitForTimeout(2500); }
 out.archiveAlbum={open:await p.locator('.stills-showcase').count(),tiles:await p.locator('.stills-showcase-tile').count()};
 await p.screenshot({path:`${OUT}/1440__archive-album.png`});
 await p.keyboard.press('Escape'); await p.waitForTimeout(700); await p.keyboard.press('Escape'); await p.waitForTimeout(700);
 out.errors=errs.slice(0,6);
 await c.close();
}

{
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const p=await c.newPage(); await p.goto(B,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 out.mobile={dock:await p.locator('.mobile-dock').count(),progress:await p.locator('.scroll-progress').count(),
   doc:await p.evaluate(()=>document.body.scrollHeight),
   overflow:await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),
   bottomPad:await p.evaluate(()=>getComputedStyle(document.body).paddingBottom)};
 await p.screenshot({path:`${OUT}/390__hero-no-dock.png`});
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+600)); await p.waitForTimeout(2000);
 const b=p.getByRole('button',{name:/view full album/i}).first();
 if(await b.count()){ await b.click(); await p.waitForTimeout(2600); }
 out.mobileAlbum={open:await p.locator('.stills-showcase').count(),
   cols:await p.evaluate(()=>{const g=document.querySelector('.stills-showcase-grid');return g?getComputedStyle(g).gridTemplateColumns:null;}),
   tile:await p.evaluate(()=>{const t=document.querySelector('.stills-showcase-tile');if(!t)return null;const r=t.getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height)}})};
 await p.screenshot({path:`${OUT}/390__album.png`});
 await c.close();
}
fs.writeFileSync('evidence/phase-03b/flows.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
await browser.close();

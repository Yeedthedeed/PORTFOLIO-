import { chromium } from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173/';
const browser=await chromium.launch();
const out={};

// 1. Elements intersecting the dock at 768 and 390
for (const [w,h] of [[768,1024],[390,844],[360,800]]) {
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
  const p=await c.newPage(); await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
  out['dock'+w]=await p.evaluate(()=>{
    const dock=document.querySelector('.mobile-dock'); if(!dock) return null;
    const dr=dock.getBoundingClientRect();
    const all=[...document.querySelectorAll('#work *')].filter(el=>{
      const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      if(!r.width||!r.height||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return false;
      return !(r.right<=dr.left||dr.right<=r.left||r.bottom<=dr.top||dr.bottom<=r.top);
    }).map(el=>{const r=el.getBoundingClientRect();return{tag:el.tagName,cls:(typeof el.className==='string'?el.className:'').slice(0,34),txt:(el.innerText||'').trim().replace(/\s+/g,' ').slice(0,30),top:Math.round(r.top),bottom:Math.round(r.bottom)}});
    return {dock:{top:Math.round(dr.top),bottom:Math.round(dr.bottom)},intersecting:all.slice(0,12)};
  });
  // mobile photography archive
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1300);
  await p.getByRole('button',{name:/browse all albums/i}).first().click(); await p.waitForTimeout(2400);
  out['archive'+w]=await p.evaluate(()=>{
    const grid=document.querySelector('.archive-grid'); const cols=grid?getComputedStyle(grid).gridTemplateColumns:'';
    const tile=document.querySelector('.archive-tile')?.getBoundingClientRect();
    const head=document.querySelector('.archive-header')?.getBoundingClientRect();
    const footer=document.querySelector('.mobile-dock');
    return {cols, tileW:tile&&Math.round(tile.width), headerH:head&&Math.round(head.height), dockPresent:!!footer, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  await p.screenshot({path:`evidence/phase-01/screens/${w}x${h}__photo-archive-mobile.png`});
  await p.keyboard.press('Escape'); await p.waitForTimeout(900);
  // stills showcase mobile
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+400)); await p.waitForTimeout(1600);
  const album=p.locator('.film-album-link').first();
  if(await album.count()){ await album.click(); await p.waitForTimeout(2400); }
  out['stills'+w]=await p.evaluate(()=>{
    const grid=document.querySelector('.stills-showcase-grid');
    const tile=document.querySelector('.stills-showcase-tile')?.getBoundingClientRect();
    return {gridDisplay:grid&&getComputedStyle(grid).display, cols:grid&&getComputedStyle(grid).gridTemplateColumns, tileW:tile&&Math.round(tile.width), overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth, header:document.querySelector('.stills-showcase-header')?.getBoundingClientRect().height};
  });
  await p.screenshot({path:`evidence/phase-01/screens/${w}x${h}__stills-album-mobile.png`});
  await c.close();
}

// 2. Sphere tap on an actual card at 390 + swipe in viewer
{
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const p=await c.newPage(); await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop+100)); await p.waitForTimeout(1800);
 // bring a visible card into view then tap its centre
 const card=p.locator('.ps-card').first(); const b=await card.boundingBox();
 await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2); await p.waitForTimeout(2400);
 out.sphereTap={viewer:await p.locator('.ps-viewer').count(), box:b};
 if(await p.locator('.ps-viewer').count()){
   await p.screenshot({path:'evidence/phase-01/screens/390x844__sphere-viewer.png'});
   // swipe left
   const stage=p.locator('.ps-viewer-stage').first();
   const sb=await stage.boundingBox();
   const client=await c.newCDPSession(p);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sb.x+sb.width*0.75,y:sb.y+sb.height*0.5}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sb.x+sb.width*0.35,y:sb.y+sb.height*0.5}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await p.waitForTimeout(1300);
   out.swipeCounter=await p.locator('.ps-viewer-nav span').first().innerText().catch(()=>null);
   await p.keyboard.press('Escape');
 }
 // mobile film ribbon tap
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#filmography').offsetTop+950)); await p.waitForTimeout(1800);
 const fr=p.locator('.film-spiral-card').first(); const fb=await fr.boundingBox();
 if(fb){await p.touchscreen.tap(fb.x+fb.width/2,fb.y+fb.height/2); await p.waitForTimeout(2500);}
 out.mobileRibbonTap={showcase:await p.locator('.stills-showcase').count(),detail:await p.locator('.film-detail').count()};
 await p.screenshot({path:'evidence/phase-01/screens/390x844__mobile-ribbon-tap.png'});
 await c.close();
}

// 3. Focus restoration after photography archive close & menu tab reachability
{
 const c=await browser.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
 await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(8000);
 const menu=p.getByRole('button',{name:'Open navigation'}); await menu.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
 const menuTabs=[]; for(let i=0;i<8;i++){await p.keyboard.press('Tab'); menuTabs.push(await p.evaluate(()=>({inMenu:!!document.activeElement?.closest('#site-menu'), label:(document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)})));}
 out.menuTabs=menuTabs;
 await p.keyboard.press('Escape'); await p.waitForTimeout(500);
 // open archive by keyboard and close
 await p.evaluate(()=>window.scrollTo(0,document.querySelector('#photography').offsetTop)); await p.waitForTimeout(1300);
 const browse=p.getByRole('button',{name:/browse all albums/i}).first();
 await browse.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(2200);
 await p.keyboard.press('Escape'); await p.waitForTimeout(900);
 out.focusAfterArchiveClose=await p.evaluate(()=>({tag:document.activeElement?.tagName, label:(document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText||'').trim().replace(/\s+/g,' ').slice(0,32), stillOnBody:document.activeElement===document.body}));
 await c.close();
}
fs.writeFileSync('evidence/phase-01/data/last-audit.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2).slice(0,9000));
await browser.close();

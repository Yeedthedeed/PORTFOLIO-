import fs from 'fs';
import sharp from 'sharp';
const parse=f=>{const s=fs.readFileSync(f,'utf8');const o={};const re=/"([^"]+)":\s*"(data:image\/webp;base64,[A-Za-z0-9+/=]+)"/g;let m;while((m=re.exec(s)))o[m[1]]=m[2];return o;};
const P={...parse('src/data/previewAssets.ts'),...parse('src/data/birthPermitPreviews.ts')};
const groups={
 'Delusion of Negation':Object.keys(P).filter(k=>k.startsWith('delusion-')),
 "Zakia's Clock":Object.keys(P).filter(k=>k.startsWith('zakia-')),
 'The Birth Permit':Object.keys(P).filter(k=>k.startsWith('birth-')),
};
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const toLch=(r,g,b)=>{const R=lin(r/255),G=lin(g/255),B=lin(b/255);
 const l=0.4122214708*R+0.5363325363*G+0.0514459929*B,m=0.2119034982*R+0.6806995451*G+0.1073969566*B,s=0.0883024619*R+0.2817188376*G+0.6299787005*B;
 const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);
 const L=0.2104542553*l_+0.793617785*m_-0.0040720468*s_;
 const a=1.9779984951*l_-2.428592205*m_+0.4505937099*s_,bb=0.0259040371*l_+0.7827717662*m_-0.808675766*s_;
 const C=Math.hypot(a,bb);let H=Math.atan2(bb,a)*180/Math.PI;if(H<0)H+=360;return{L,C,H};};
const bins=Array.from({length:12},()=>({w:0,c:0,l:0,n:0}));
const out={};
for(const [film,keys] of Object.entries(groups)){
 const step=Math.max(1,Math.floor(keys.length/6));
 const sample=[]; for(let i=0;i<keys.length&&sample.length<6;i+=step)sample.push(keys[i]);
 const fam=new Map(); let warm=0,cool=0,chrom=0,n=0,sumC=0,hiL=0,loL=0,hiN=0,loN=0;
 const perFrame=[];
 for(const k of sample){
  const buf=Buffer.from(P[k].split(',')[1],'base64');
  const {data,info}=await sharp(buf).resize(96,96,{fit:'inside'}).raw().toBuffer({resolveWithObject:true});
  const px=[];
  for(let i=0;i<data.length;i+=info.channels){
   const {L,C,H}=toLch(data[i],data[i+1],data[i+2]); n++; sumC+=C; px.push({L,C,H});
   if(C>0.03){chrom++; const b=Math.floor(H/30)%12; fam.set(b,(fam.get(b)||0)+1);
     if(H>=20&&H<=100)warm++; if(H>=170&&H<=300)cool++;}
  }
  px.sort((a,b)=>a.L-b.L);
  const low=px.slice(0,Math.floor(px.length*0.15)), high=px.slice(-Math.floor(px.length*0.15));
  const mean=(arr,f)=>arr.reduce((s,p)=>s+p[f],0)/arr.length;
  const topFam=[...fam.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([b,c])=>({hueDeg:b*30,frames:c}));
  perFrame.push({key:k,meanL:+mean(px,'L').toFixed(3),meanC:+mean(px,'C').toFixed(3),
   shadowHue:+mean(low,'H').toFixed(0),shadowL:+mean(low,'L').toFixed(2),
   highlightHue:+mean(high,'H').toFixed(0),highlightL:+mean(high,'L').toFixed(2)});
 }
 const frames=perFrame.length;
 out[film]={sampledFrames:sample,frameCount:frames,perFrame,
  saturationMean:+(sumC/n).toFixed(4),
  chromaticShare:+(chrom/n).toFixed(3),
  warmCoolRatio:cool?+(warm/cool).toFixed(2):null,
  dominantHueFamilies:[...fam.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([b,c])=>({hueRange:`${b*30}-${b*30+30}`,share:+(c/chrom).toFixed(3)}))};
}
console.log(JSON.stringify(out,null,2));
fs.writeFileSync('evidence/phase-05-stills.json',JSON.stringify(out,null,2));

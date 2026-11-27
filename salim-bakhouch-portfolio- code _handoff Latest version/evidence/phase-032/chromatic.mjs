import sharp from 'sharp';
import fs from 'fs';
const DIR='evidence/phase-032/screens';
const files=fs.readdirSync(DIR).filter(f=>f.endsWith('__FIELD.png'));
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
function oklch(r,g,b){
 const R=lin(r/255),G=lin(g/255),B=lin(b/255);
 const l=0.4122214708*R+0.5363325363*G+0.0514459929*B;
 const m=0.2119034982*R+0.6806995451*G+0.1073969566*B;
 const s=0.0883024619*R+0.2817188376*G+0.6299787005*B;
 const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);
 const L=0.2104542553*l_+0.793617785*m_-0.0040720468*s_;
 const a=1.9779984951*l_-2.428592205*m_+0.4505937099*s_;
 const bb=0.0259040371*l_+0.7827717662*m_-0.808675766*s_;
 const C=Math.hypot(a,bb);let H=Math.atan2(bb,a)*180/Math.PI;if(H<0)H+=360;return{L,C,H};
}
const rows=[];
for(const f of files){
 const {data,info}=await sharp(`${DIR}/${f}`).resize(480,270,{fit:'fill'}).raw().toBuffer({resolveWithObject:true});
 let chrom=0,blue=0,warm=0,other=0,total=0;
 for(let i=0;i<data.length;i+=info.channels){
   total++;
   const {C,H,L}=oklch(data[i],data[i+1],data[i+2]);
   if(C<=0.018) continue;
   chrom++;
   if(H>=170&&H<=300) blue++;
   else if(H>=15&&H<=115&&L>0.42) warm++;
   else other++;
 }
 rows.push({file:f,chromatic_pixels:chrom,
  blue_share_of_chromatic:chrom?+(blue/chrom).toFixed(4):1,
  warm_share_of_chromatic:chrom?+(warm/chrom).toFixed(4):0,
  other_hue_share_of_chromatic:chrom?+(other/chrom).toFixed(4):0});
}
const minBlue=Math.min(...rows.map(r=>r.blue_share_of_chromatic));
const maxWarm=Math.max(...rows.map(r=>r.warm_share_of_chromatic));
const maxOther=Math.max(...rows.map(r=>r.other_hue_share_of_chromatic));
console.log('files:',rows.length);
console.log('min blue share of chromatic:',(minBlue*100).toFixed(2)+'%');
console.log('max warm share of chromatic:',(maxWarm*100).toFixed(2)+'%');
console.log('max other-hue share of chromatic:',(maxOther*100).toFixed(2)+'%');
console.log(JSON.stringify(rows.slice(0,5),null,1));
fs.writeFileSync('evidence/phase-032/chromatic.json',JSON.stringify(rows,null,2));

import sharp from 'sharp';
const S='evidence/phase-032/screens';
const groups={
 'one-warm-light-films':[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/1440x900__featured.png`],
 'one-warm-light-fields':[`${S}/1440x900__delusion__FIELD.png`,`${S}/1440x900__zakia__FIELD.png`,`${S}/1440x900__birth__FIELD.png`,`${S}/1440x900__featured__FIELD.png`],
 'one-warm-light-responsive':[`${S}/390x844__delusion.png`,`${S}/390x844__zakia.png`,`${S}/390x844__birth.png`,`${S}/1920x1080__delusion.png`],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:87}).toFile(`evidence/phase-032/${name}.jpg`);
 console.log(name);
}

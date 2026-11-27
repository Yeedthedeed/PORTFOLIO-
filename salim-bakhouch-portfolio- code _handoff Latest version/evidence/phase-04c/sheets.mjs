import sharp from 'sharp';
const S='evidence/phase-04c/screens';
const groups={
 'lit-hero':[`${S}/1440x900__hero__off.png`,`${S}/1440x900__hero.png`,`${S}/1920x1080__hero.png`,`${S}/390x844__hero.png`],
 'lit-chapters':[`${S}/1440x900__photography.png`,`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`],
 'lit-editorial':[`${S}/1440x900__featured.png`,`${S}/1440x900__about.png`,`${S}/1440x900__contact.png`,`${S}/1920x1080__featured.png`],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:86}).toFile(`evidence/phase-04c/${name}.jpg`);
 console.log(name);
}

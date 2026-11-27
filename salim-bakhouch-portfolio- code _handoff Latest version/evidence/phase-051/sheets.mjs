import sharp from 'sharp';
const S='evidence/phase-051/screens';
const groups={
 'captions-removed':[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/1920x1080__birth.png`],
 'frame-lighting':[`${S}/1440__frame-neutral.png`,`${S}/1440__frame-hover.png`,`${S}/1440__frame-focus.png`,`${S}/1440__frame-recovered.png`],
 'blue-progression':[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/390x844__birth.png`],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050912'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050912'}}).composite(comp).jpeg({quality:87}).toFile(`evidence/phase-051/${name}.jpg`);
 console.log(name);
}

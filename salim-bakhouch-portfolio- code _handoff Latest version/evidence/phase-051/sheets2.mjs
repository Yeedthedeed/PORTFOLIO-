import sharp from 'sharp';
const S='evidence/phase-051/screens';
const groups={
 '01-captions-removed':[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/1920x1080__birth.png`],
 '02-blue-progression':[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/390x844__birth.png`],
 '03-frame-lighting':[`${S}/1440__frame-neutral.png`,`${S}/1440__frame-hover.png`,`${S}/1440__frame-focus.png`,`${S}/1440__frame-recovered.png`],
 '04-responsive':[`${S}/390x844__zakia.png`,`${S}/360x800__birth.png`,`${S}/768x1024__delusion.png`,`${S}/844x390__zakia.png`],
 '05-archive':[`${S}/1440x900__archive.png`,`${S}/390x844__archive.png`,`${S}/1024x768__birth.png`,`${S}/1920x1080__zakia.png`],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];let ok=true;
 for(let i=0;i<items.length;i++){
  try{await sharp(items[i]).metadata();}catch{ok=false;break;}
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050912'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 if(!ok){console.log('SKIP',name,'missing frame');continue;}
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050912'}}).composite(comp).jpeg({quality:88}).toFile(`evidence/phase-051/${name}.jpg`);
 console.log(name);
}

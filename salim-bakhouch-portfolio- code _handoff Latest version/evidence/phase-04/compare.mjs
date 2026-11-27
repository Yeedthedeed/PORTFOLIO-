import sharp from 'sharp';
const groups={
 'light-onoff-hero':['evidence/phase-04/screens/1440x900__hero__base.png','evidence/phase-04/screens/1440x900__hero__light.png','evidence/phase-04/screens/1920x1080__hero__base.png','evidence/phase-04/screens/1920x1080__hero__light.png'],
 'light-onoff-film':['evidence/phase-04/screens/1440x900__filmography__base.png','evidence/phase-04/screens/1440x900__filmography__light.png','evidence/phase-04/screens/1440x900__featured__base.png','evidence/phase-04/screens/1440x900__featured__light.png'],
 'light-onoff-photo':['evidence/phase-04/screens/1440x900__photography__base.png','evidence/phase-04/screens/1440x900__photography__light.png','evidence/phase-04/screens/1440x900__about__base.png','evidence/phase-04/screens/1440x900__about__light.png'],
 'light-mobile':['evidence/phase-04/screens/390x844__hero__light.png','evidence/phase-04/screens/390x844__filmography__light.png','evidence/phase-04/screens/390x844__about__light.png','evidence/phase-04/screens/768x1024__hero__light.png'],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:84}).toFile(`evidence/phase-04/${name}.jpg`);
 console.log(name);
}

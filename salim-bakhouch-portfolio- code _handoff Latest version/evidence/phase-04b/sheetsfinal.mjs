import sharp from 'sharp';
const groups={
 'final-hero-compare':['evidence/phase-04b/screens/1440x900__hero__off.png','evidence/phase-04b/screens/1440x900__hero__final.png','evidence/phase-04b/screens/1920x1080__hero__off.png','evidence/phase-04b/screens/1920x1080__hero__final.png'],
 'final-chapters':['evidence/phase-04b/screens/1440x900__photography__final.png','evidence/phase-04b/screens/1440x900__filmography__final.png','evidence/phase-04b/screens/1440x900__featured__final.png','evidence/phase-04b/screens/1440x900__contact__final.png'],
 'final-responsive':['evidence/phase-04b/screens/390x844__hero__final.png','evidence/phase-04b/screens/360x800__photography__final.png','evidence/phase-04b/screens/768x1024__featured__final.png','evidence/phase-04b/screens/844x390__hero__final.png'],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
  const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
  const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
  comp.push({input:img,left:x,top:y+labelH});
  comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:85}).toFile(`evidence/phase-04b/${name}.jpg`);
 console.log(name);
}

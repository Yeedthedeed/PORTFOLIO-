import sharp from 'sharp';
const groups={
 'before-after-hero':['evidence/phase-01/screens/1440x900__hero.png','evidence/phase-03/screens/1440x900__hero.png','evidence/phase-01/screens/1920x1080__hero.png','evidence/phase-03/screens/1920x1080__hero.png'],
 'before-after-photo':['evidence/phase-01/screens/1440x900__photography.png','evidence/phase-03/screens/1440x900__photography.png','evidence/phase-01/screens/1920x1080__photography.png','evidence/phase-03/screens/1920x1080__photography.png'],
 'before-after-film':['evidence/phase-01/screens/1440x900__filmography.png','evidence/phase-03/screens/1440x900__filmography.png','evidence/phase-01/screens/1440x900__filmography-02.png','evidence/phase-03/screens/1440x900__filmography.png'],
 'before-after-editorial':['evidence/phase-01/screens/1440x900__featured.png','evidence/phase-03/screens/1440x900__featured.png','evidence/phase-01/screens/1440x900__about.png','evidence/phase-03/screens/1440x900__about.png'],
 'phase03-responsive':['evidence/phase-03/screens/768x1024__hero.png','evidence/phase-03/screens/390x844__hero.png','evidence/phase-03/screens/360x800__hero.png','evidence/phase-03/screens/844x390__hero.png'],
 'phase03-mobile-sections':['evidence/phase-03/screens/390x844__photography.png','evidence/phase-03/screens/390x844__filmography.png','evidence/phase-03/screens/390x844__featured.png','evidence/phase-03/screens/390x844__contact.png'],
};
for(const [name,items] of Object.entries(groups)){
 const W=820,H=520,cols=2,rows=2,gap=8,labelH=24;const comp=[];
 for(let i=0;i<items.length;i++){
   const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
   const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
   comp.push({input:img,left:x,top:y+labelH});
   const label=items[i].split('/').slice(-2).join('/');
   const svg=Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${label}</text></svg>`);
   comp.push({input:svg,left:x,top:y});
 }
 await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:82}).toFile(`evidence/phase-03/screens/${name}.jpg`);
 console.log(name);
}

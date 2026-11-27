import sharp from 'sharp';
const items=[
 'evidence/phase-04b/screens/1440__hero__off2.png',
 'evidence/phase-04b/screens/1440__hero__lit2.png',
 'evidence/phase-04b/screens/1920__hero__off2.png',
 'evidence/phase-04b/screens/1920__hero__lit2.png',
];
const W=820,H=520,labelH=24,cols=2,rows=2,gap=8;const comp=[];
for(let i=0;i<items.length;i++){
 const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
 const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050709'}).png().toBuffer();
 comp.push({input:img,left:x,top:y+labelH});
 const label=items[i].split('/').pop();
 comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${label}</text></svg>`),left:x,top:y});
}
await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:86}).toFile('evidence/phase-04b/rig-hero-refined.jpg');
console.log('sheet done');

import sharp from 'sharp';
const S='evidence/spacing/screens';
const items=[`${S}/1440x900__delusion.png`,`${S}/1440x900__zakia.png`,`${S}/1440x900__birth.png`,`${S}/390x844__zakia.png`];
const W=820,H=520,gap=8,labelH=24,comp=[];
for(let i=0;i<items.length;i++){
 const x=(i%2)*(W+gap),y=Math.floor(i/2)*(H+labelH+gap);
 const img=await sharp(items[i]).resize(W,H,{fit:'contain',background:'#050912'}).png().toBuffer();
 comp.push({input:img,left:x,top:y+labelH});
 comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="17" font-family="monospace" font-size="12" fill="#9fd8ff">${items[i].split('/').pop()}</text></svg>`),left:x,top:y});
}
await sharp({create:{width:2*W+gap,height:2*(H+labelH+gap),channels:3,background:'#050912'}}).composite(comp).jpeg({quality:88}).toFile('evidence/spacing/after-fix.jpg');
console.log('sheet done');

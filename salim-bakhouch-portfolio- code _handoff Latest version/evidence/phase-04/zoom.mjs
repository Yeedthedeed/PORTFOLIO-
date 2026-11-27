import sharp from 'sharp';
const crop={left:0,top:0,width:720,height:450};
const items=[
 ['base hero (left edge)','evidence/phase-04/screens/1440x900__hero__base.png'],
 ['light hero (left edge)','evidence/phase-04/screens/1440x900__hero__light.png'],
 ['base film (right rim)','evidence/phase-04/screens/1440x900__filmography__base.png'],
 ['light film (right rim)','evidence/phase-04/screens/1440x900__filmography__light.png'],
];
const W=720,H=450,cols=2,rows=2,gap=8,labelH=22;const comp=[];
for(let i=0;i<items.length;i++){
 const [label,file]=items[i];
 const left=i%2===0?0:720;
 const x=(i%cols)*(W+gap),y=Math.floor(i/cols)*(H+labelH+gap);
 const img=await sharp(file).extract({left,top:0,width:720,height:450}).resize(W,H).png().toBuffer();
 comp.push({input:img,left:x,top:y+labelH});
 comp.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><rect width="${W}" height="${labelH}" fill="#0a1220"/><text x="8" y="16" font-family="monospace" font-size="12" fill="#9fd8ff">${label}</text></svg>`),left:x,top:y});
}
await sharp({create:{width:cols*W+gap,height:rows*(H+labelH+gap),channels:3,background:'#050709'}}).composite(comp).jpeg({quality:90}).toFile('evidence/phase-04/light-onoff-zoomed.jpg');
console.log('zoom sheet written');

import sharp from 'sharp';
const pairs=[
 ['hero','1440x900__hero'],
 ['photography','1440x900__photography'],
 ['filmography','1440x900__filmography'],
 ['featured','1440x900__featured'],
 ['about','1440x900__about'],
 ['contact','1440x900__contact'],
];
const mean=async(file,left,top,w,h)=>{
 const {data,info}=await sharp(file).extract({left,top,width:w,height:h}).raw().toBuffer({resolveWithObject:true});
 let r=0,g=0,b=0,n=0;
 for(let i=0;i<data.length;i+=info.channels){r+=data[i];g+=data[i+1];b+=data[i+2];n++;}
 return [r/n,g/n,b/n].map(v=>+v.toFixed(2));
};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
const rows=[];
for(const [name,base] of pairs){
 // sample a clean background patch (top-right of the section, away from text)
 const region={left:1150,top:60,width:120,height:40};
 const off=await mean(`evidence/phase-04/screens/${base}__base.png`,region.left,region.top,region.width,region.height);
 const on=await mean(`evidence/phase-04/screens/${base}__light.png`,region.left,region.top,region.width,region.height);
 rows.push({section:name,backgroundOff:off,backgroundOn:on,lumOff:+lum(off).toFixed(4),lumOn:+lum(on).toFixed(4),delta:+(lum(on)-lum(off)).toFixed(4)});
}
console.log(JSON.stringify(rows,null,2));
const fs=await import('fs'); fs.writeFileSync('evidence/phase-04/background-delta.json',JSON.stringify(rows,null,2));

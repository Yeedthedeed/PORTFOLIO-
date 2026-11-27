const fs=require('fs'), path=require('path'), https=require('https'), http=require('http');
const stills=JSON.parse(fs.readFileSync('/tmp/bp/stills.json','utf8'));
const OUT='src/assets/previews/birth-permit';
fs.mkdirSync(OUT,{recursive:true});
const proxy=(u)=>`https://images.weserv.nl/?url=${encodeURIComponent(u)}&w=320&h=320&fit=inside&we&output=webp&q=68&il`;
function get(url, redirects=0){
  return new Promise((res,rej)=>{
    if(redirects>8) return rej(new Error('redirects'));
    const mod=url.startsWith('https')?https:http;
    const req=mod.get(url,{headers:{'user-agent':'Mozilla/5.0'}},r=>{
      if([301,302,307,308].includes(r.statusCode)){r.resume();return res(get(r.headers.location,redirects+1));}
      if(r.statusCode!==200){r.resume();return rej(new Error('HTTP '+r.statusCode));}
      const c=[]; r.on('data',d=>c.push(d)); r.on('end',()=>res(Buffer.concat(c))); r.on('error',rej);
    });
    req.on('error',rej); req.setTimeout(120000,()=>req.destroy(new Error('timeout')));
  });
}
(async()=>{
  for(const s of stills){
    const file=path.join(OUT,s.id+'.webp');
    if(fs.existsSync(file)&&fs.statSync(file).size>300) continue;
    for(let a=1;a<=4;a++){
      try{ const b=await get(proxy(s.url)); if(b.length<300) throw new Error('small'); fs.writeFileSync(file,b); break; }
      catch(e){ if(a===4) console.error('FAIL',s.id,e.message); else await new Promise(r=>setTimeout(r,600*a)); }
    }
  }
  // bake
  const data={};
  for(const f of fs.readdirSync(OUT)){
    if(!f.endsWith('.webp')) continue;
    data[f.replace(/\.webp$/,'')]='data:image/webp;base64,'+fs.readFileSync(path.join(OUT,f)).toString('base64');
  }
  const out=`/* AUTO-GENERATED — display derivatives for The Birth Permit ribbon frames.
 * The untouched masters in birthPermit.ts remain the only viewer source.
 */
export const BIRTH_PERMIT_PREVIEWS: Record<string, string> = {
${Object.entries(data).map(([k,v])=>`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n')}
};
`;
  fs.writeFileSync('src/data/birthPermitPreviews.ts',out);
  console.log('previews baked:',Object.keys(data).length);
})();

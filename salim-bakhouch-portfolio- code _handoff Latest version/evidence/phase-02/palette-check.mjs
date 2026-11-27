const srgbToLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linToSrgb = c => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const hexToRgb = h => { h = h.replace('#',''); if (h.length===3) h=[...h].map(x=>x+x).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
function rgbToOklch(r,g,b){const R=srgbToLinear(r/255),G=srgbToLinear(g/255),B=srgbToLinear(b/255);const l=0.4122214708*R+0.5363325363*G+0.0514459929*B;const m=0.2119034982*R+0.6806995451*G+0.1073969566*B;const s=0.0883024619*R+0.2817188376*G+0.6299787005*B;const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);const L=0.2104542553*l_+0.793617785*m_-0.0040720468*s_;const a=1.9779984951*l_-2.428592205*m_+0.4505937099*s_;const bb=0.0259040371*l_+0.7827717662*m_-0.808675766*s_;const C=Math.hypot(a,bb);let H=Math.atan2(bb,a)*180/Math.PI;if(H<0)H+=360;return{L,C,H};}
function oklchToHex(L,C,H){const h=H*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);const l_=L+0.3963377774*a+0.2158037573*b;const m_=L-0.1055613458*a-0.0638541728*b;const s_=L-0.0894841775*a-1.291485548*b;const l=l_**3,m=m_**3,s=s_**3;const R=4.0767416621*l-3.3077115913*m+0.2309699292*s;const G=-1.2684380046*l+2.6097574011*m-0.3413193965*s;const B=-0.0041960863*l-0.7034186147*m+1.707614701*s;const to=v=>Math.max(0,Math.min(255,Math.round(linToSrgb(v)*255)));return '#'+[to(R),to(G),to(B)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const relLum = hex => { const [r,g,b]=hexToRgb(hex).map(v=>srgbToLinear(v/255)); return 0.2126*r+0.7152*g+0.0722*b; };
const contrast = (a,b) => { const L1=relLum(a), L2=relLum(b); return ((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)); };
const tokens = [
 ['surface-void','#03060A','page ground / overlay base'],
 ['surface-base','#050709','current page background'],
 ['surface-raised','#08111B','cards, slate plates'],
 ['surface-panel','#0B1724','archive rail, panels'],
 ['surface-instrument','#0F2133','instrument headers / active rail'],
 ['text-primary','#EEF3FA','headings, hero, key figures'],
 ['text-secondary','#C9D5E3','body copy'],
 ['text-tertiary','#9DAEC3','captions, secondary metadata'],
 ['text-quiet','#7C8FA6','least emphasis, still ≥12px'],
 ['line-hair','#1A2633','1px hairlines (≈8% ink)'],
 ['line-soft','#253546','1px dividers (~14%)'],
 ['line-strong','#3A5168','active border / focus support'],
 ['blue-core','#3D9FFF','primary accent (current)'],
 ['blue-bright','#8FD2FF','highlights, focus ring, links on hover'],
 ['blue-deep','#1B5FB8','pressed / deep accent'],
 ['blue-ink','#03101D','text on blue fills'],
 ['film-delusion','#D08C7E','Delusion warm accent (metadata only)'],
 ['film-delusion-cool','#8FC3DC','Delusion clinical spark'],
 ['film-zakia','#C9A46F','Zakia field ochre'],
 ['film-birth','#E2AE74','Birth Permit sodium amber'],
 ['silver-gelatin','#D6DEE8','neutral instrument silver'],
];
console.log('TOKEN | HEX | OKLCH | contrast vs #050709 | contrast vs #0B1724 | ROLE');
for (const [name,hex,role] of tokens) {
  const [r,g,b]=hexToRgb(hex); const {L,C,H}=rgbToOklch(r,g,b);
  const ok = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
  console.log(`${name} | ${hex} | ${ok} | ${contrast(hex,'#050709').toFixed(2)}:1 | ${contrast(hex,'#0B1724').toFixed(2)}:1 | ${role}`);
}
console.log('\n--- Proposed type ramp (rem) ---');
[['micro',10],['caption',12],['meta',12],['body-sm',15],['body',17],['lead',20],['h4',22],['h3',40],['h2',56],['h1',80],['display',112]].forEach(([n,px])=>console.log(`${n}: ${px}px = ${(px/16).toFixed(4)}rem`));

import sharp from 'sharp';
const W=1600,H=1080;
const chapters=[
 {t:'HERO — The Arrival', src:[0.22,0.34], kind:'window', rim:'right', dark:'lower-left',
  note:'Window left/behind 0.22 · right rim 0.14 · deep lower-left'},
 {t:'PHOTOGRAPHY — The Light Table', src:[0.50,0.66], kind:'sphere', rim:'arcs', dark:'surround',
  note:'Sphere is the source 0.10 · two orbital arcs · dark band around stage'},
 {t:'FILMOGRAPHY — Three Temperatures', src:[0.94,0.44], kind:'projector', rim:'right edge', dark:'left third',
  note:'Projector off-frame right 0.12–0.16 · accent rim · left third stays black'},
 {t:'FEATURED — The Frame', src:[0.20,0.26], kind:'lamp', rim:'poster edge', dark:'right half',
  note:'Gallery lamp above-left 0.24 · directional cast below poster'},
 {t:'ARCHIVE — The Cabinet (high key)', src:[0.50,0.05], kind:'strip', rim:'none', dark:'edges only',
  note:'Diffused overhead strip 0.15 · reading surface · no tile light'},
 {t:'ABOUT / CONTACT — Colophon', src:[0.72,0.18], kind:'practical', rim:'none', dark:'opposite corner',
  note:'One practical 0.10 · wide soft · falls off before body column'},
];
const cells=chapters.map((c,i)=>{
  const col=i%3, row=Math.floor(i/3);
  const x=40+col*510, y=92+row*500, w=470, h=330;
  const sx=x+c.src[0]*w, sy=y+c.src[1]*h;
  const dark = c.dark==='lower-left'
    ? `<polygon points="${x},${y+h} ${x+w*0.42},${y+h} ${x},${y+h*0.55}" fill="#000" opacity=".55"/>`
    : c.dark==='left third' ? `<rect x="${x}" y="${y}" width="${w*0.34}" height="${h}" fill="#000" opacity=".55"/>`
    : c.dark==='right half' ? `<rect x="${x+w*0.52}" y="${y}" width="${w*0.48}" height="${h}" fill="#000" opacity=".5"/>`
    : c.dark==='surround' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" opacity=".35"/>`
    : c.dark==='opposite corner' ? `<polygon points="${x+w},${y} ${x+w},${y+h} ${x+w*0.45},${y+h}" fill="#000" opacity=".45"/>`
    : `<rect x="${x}" y="${y}" width="${w*0.08}" height="${h}" fill="#000" opacity=".45"/><rect x="${x+w*0.92}" y="${y}" width="${w*0.08}" height="${h}" fill="#000" opacity=".45"/>`;
  const glow = c.kind==='strip'
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h*0.26}" fill="url(#g)"/>`
    : `<circle cx="${sx}" cy="${sy}" r="150" fill="url(#g)"/>`;
  const marks = c.kind==='sphere'
    ? `<circle cx="${x+w/2}" cy="${y+h*0.62}" r="78" fill="none" stroke="#8fd2ff" stroke-opacity=".5"/><circle cx="${x+w/2}" cy="${y+h*0.62}" r="112" fill="none" stroke="#8fd2ff" stroke-opacity=".22" stroke-dasharray="2 7"/>`
    : c.kind==='projector'
      ? `<polygon points="${x+w},${y+h*0.2} ${x+w},${y+h*0.72} ${x+w*0.45},${y+h*0.62} ${x+w*0.45},${y+h*0.3}" fill="#d08c7e" opacity=".10"/>`
      : '';
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#050709" stroke="#1f3346"/>
    ${dark}
    ${glow}
    ${marks}
    <circle cx="${sx}" cy="${sy}" r="4" fill="#cfe9ff"/>
    <text x="${x}" y="${y-26}" font-family="monospace" font-size="14" fill="#cfe9ff">0${i+1} · ${c.t}</text>
    <text x="${x}" y="${y-8}" font-family="monospace" font-size="11" fill="#7c8fa6">${c.note}</text>
    <text x="${x+8}" y="${y+h-12}" font-family="monospace" font-size="10" fill="#495869">SHADOW ZONE: ${c.dark.toUpperCase()} · RIM: ${c.rim.toUpperCase()}</text>
  </g>`;
}).join('');
const svg=`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="g"><stop offset="0" stop-color="#9fd0ff" stop-opacity=".34"/><stop offset=".55" stop-color="#4f8fd8" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="#03060a"/>
<text x="40" y="30" font-family="monospace" font-size="16" fill="#eef3fa">ETHEREALISM · ROUTE B · ANNOTATED LIGHTING PLAN</text>
${cells}
<text x="40" y="1050" font-family="monospace" font-size="11" fill="#7c8fa6">No ambient centre light · one named source per chapter + negative fill · light enters from an edge · black is a shape · the archive is the single high-key exception</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('evidence/phase-04d/lighting-plan.png');
console.log('plan written');

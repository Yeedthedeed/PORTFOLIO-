import fs from 'fs';
import sharp from 'sharp';

const parse = (file) => {
  const s = fs.readFileSync(file, 'utf8');
  const out = {};
  const re = /"([^"]+)":\s*"(data:image\/webp;base64,[A-Za-z0-9+/=]+)"/g;
  let m;
  while ((m = re.exec(s))) out[m[1]] = m[2];
  return out;
};

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function rgbToOklch(r, g, b) {
  const R = srgbToLinear(r / 255), G = srgbToLinear(g / 255), B = srgbToLinear(b / 255);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToHex(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const to = (v) => Math.max(0, Math.min(255, Math.round(linToSrgb(v) * 255)));
  return '#' + [to(R), to(G), to(B)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const previews = { ...parse('src/data/previewAssets.ts'), ...parse('src/data/birthPermitPreviews.ts') };
const groups = {
  'Delusion of Negation': Object.keys(previews).filter((k) => k.startsWith('delusion-')),
  "Zakia's Clock": Object.keys(previews).filter((k) => k.startsWith('zakia-')),
  'The Birth Permit': Object.keys(previews).filter((k) => k.startsWith('birth-')),
};

const results = {};
for (const [film, keys] of Object.entries(groups)) {
  const sample = keys.filter((_, i) => i % Math.max(1, Math.floor(keys.length / 12)) === 0).slice(0, 12);
  const pixels = [];
  const perStill = [];
  for (const key of sample) {
    const b64 = previews[key].split(',')[1];
    const buf = Buffer.from(b64, 'base64');
    const { data, info } = await sharp(buf).resize(72, 72, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
    let sumL = 0, n = 0, maxC = 0, best = null;
    const high = [];
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const { L, C, H } = rgbToOklch(r, g, b);
      sumL += L; n++;
      if (C > 0.045 && L > 0.28) high.push({ C, H, L });
      if (C > maxC) { maxC = C; best = { L, C, H, hex: '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('') }; }
    }
    high.sort((a, b) => b.C - a.C);
    const top = high.slice(0, Math.max(1, Math.round(high.length * 0.18)));
    if (top.length) {
      const meanC = top.reduce((s, p) => s + p.C, 0) / top.length;
      const vec = top.reduce((acc, p) => {
        const h = (p.H * Math.PI) / 180;
        return { x: acc.x + Math.cos(h) * p.C, y: acc.y + Math.sin(h) * p.C };
      }, { x: 0, y: 0 });
      const H = (Math.atan2(vec.y, vec.x) * 180) / Math.PI;
      const Lm = top.reduce((s, p) => s + p.L, 0) / top.length;
      pixels.push({ L: Lm, C: meanC * 1.15, H: (H + 360) % 360 });
      perStill.push({ key, accent: oklchToHex(Math.min(0.86, Lm + 0.12), Math.min(0.2, meanC * 1.25), (H + 360) % 360) });
    }
    if (!results[`${film}__still`]) results[`${film}__still`] = [];
    results[`${film}__still`].push({ key, meanL: +(sumL / n).toFixed(3), strongest: best });
  }
  const meanL = pixels.reduce((s, p) => s + p.L, 0) / pixels.length;
  const meanC = pixels.reduce((s, p) => s + p.C, 0) / pixels.length;
  // circular mean hue weighted by chroma
  const v = pixels.reduce((acc, p) => {
    const h = (p.H * Math.PI) / 180;
    return { x: acc.x + Math.cos(h) * p.C, y: acc.y + Math.sin(h) * p.C };
  }, { x: 0, y: 0 });
  const H = ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360;
  results[film] = {
    stillsSampled: pixels.length,
    meanLightness: +meanL.toFixed(3),
    meanChroma: +meanC.toFixed(3),
    meanHue: +H.toFixed(1),
    accent: { oklch: `oklch(${Math.min(0.88, meanL + 0.16).toFixed(3)} ${Math.min(0.15, meanC * 1.35).toFixed(3)} ${H.toFixed(1)})`, hex: oklchToHex(Math.min(0.88, meanL + 0.16), Math.min(0.15, meanC * 1.35), H) },
    duotoneDeep: { oklch: `oklch(${(0.16 + meanL * 0.12).toFixed(3)} ${Math.min(0.09, meanC * 0.9).toFixed(3)} ${H.toFixed(1)})`, hex: oklchToHex(0.16 + meanL * 0.12, Math.min(0.09, meanC * 0.9), H) },
    stillAccents: perStill,
  };
}
console.log(JSON.stringify(results, null, 2));
fs.writeFileSync('/tmp/film-colour.json', JSON.stringify(results, null, 2));

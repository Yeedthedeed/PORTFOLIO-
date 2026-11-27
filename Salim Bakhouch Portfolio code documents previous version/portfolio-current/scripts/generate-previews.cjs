/**
 * Creates display derivatives (never touches masters) and bakes them into a
 * TypeScript module so they ship inside the app document.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { spawnSync } = require("child_process");

const OUT_PHOTOS = path.join("src/assets/previews/photos");
const OUT_FILMS = path.join("src/assets/previews/films");
fs.mkdirSync(OUT_PHOTOS, { recursive: true });
fs.mkdirSync(OUT_FILMS, { recursive: true });

const manifest = fs.readFileSync("src/data/photographyManifest.ts", "utf8");
const filmsSrc = fs.readFileSync("src/data/filmStills.ts", "utf8");

const photos = [];
for (const line of manifest.split("\n")) {
  const id = line.match(/photo_id: "([^"]+)"/);
  const url = line.match(/source_url: "([^"]+)"/);
  if (id && url && !photos.some((p) => p.id === id[1])) photos.push({ id: id[1], url: url[1] });
}
const films = [];
for (const line of filmsSrc.split("\n")) {
  const id = line.match(/\{ id: "([^"]+)"/);
  const url = line.match(/url: "([^"]+)"/);
  if (id && url && !films.some((f) => f.id === id[1])) films.push({ id: id[1].replace(/'/g, ""), url: url[1] });
}

function fetchBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error("redirects"));
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        res.resume();
        return resolve(fetchBuffer(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
  });
}

const previewUrl = (u, w) =>
  "https://images.weserv.nl/?url=" + encodeURIComponent(u) +
  `&w=${w}&h=${w}&fit=inside&we&output=webp&q=72&il`;

async function make(item, dir) {
  const target = path.join(dir, item.id + ".webp");
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      if (!fs.existsSync(target) || fs.statSync(target).size < 300) {
        const buf = await fetchBuffer(previewUrl(item.url, 320));
        if (buf.length < 300) throw new Error("small");
        fs.writeFileSync(target, buf);
      }
      return true;
    } catch (e) {
      if (attempt === 4) { console.error("FAIL", item.id, e.message); return false; }
      await new Promise((r) => setTimeout(r, 700 * attempt));
    }
  }
  return false;
}

async function pool(list, worker, size = 8) {
  let cursor = 0;
  const results = [];
  async function run() {
    while (cursor < list.length) {
      const i = cursor++;
      results[i] = await worker(list[i]);
    }
  }
  await Promise.all(Array.from({ length: size }, run));
  return results;
}

(async () => {
  await pool(photos, (p) => make(p, OUT_PHOTOS));
  await pool(films, (f) => make(f, OUT_FILMS));
  require("child_process").execFileSync(process.execPath, [path.join(__dirname, "bake-previews.cjs")], { stdio: "inherit" });
})();

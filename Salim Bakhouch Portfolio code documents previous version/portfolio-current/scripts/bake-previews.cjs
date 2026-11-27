const fs = require("fs");
const path = require("path");
function encode(dir) {
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".webp")) continue;
    out[file.replace(/\.webp$/, "")] =
      "data:image/webp;base64," + fs.readFileSync(path.join(dir, file)).toString("base64");
  }
  return out;
}
const photos = encode("src/assets/previews/photos");
const films = encode("src/assets/previews/films");
const rows = (m) => Object.entries(m).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
const output = `/* AUTO-GENERATED — baked gallery previews (display derivatives only).
 * Masters are never modified. Full-screen viewers load the original file.
 */
export const PHOTO_PREVIEW_DATA: Record<string, string> = {
${rows(photos)}
};

export const FILM_PREVIEW_DATA: Record<string, string> = {
${rows(films)}
};
`;
fs.writeFileSync("src/data/previewAssets.ts", output);
console.log("baked photos:", Object.keys(photos).length, "films:", Object.keys(films).length);

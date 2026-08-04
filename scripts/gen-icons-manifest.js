const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "frontend", "public", "icons", "64x64");
const out = {};
for (const cat of fs.readdirSync(root)) {
  const dir = path.join(root, cat);
  if (!fs.statSync(dir).isDirectory()) continue;
  out[cat] = fs.readdirSync(dir).filter((f) => /\.png$/i.test(f)).sort();
}
fs.writeFileSync(path.join(__dirname, "..", "frontend", "public", "icons", "manifest.json"), JSON.stringify(out));
console.log("manifest gerado:", Object.entries(out).map(([c, f]) => `${c}=${f.length}`).join(", "));

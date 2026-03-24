const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `  const qualifiedForBadge = imgs.filter(u => u && !u.endsWith('.mp4')).length >= 2 && (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 3 || imgs.some(u => u && u.endsWith('.mp4')));`;

const newStr = `  const qualifiedForBadge = item.verified || (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 2 && (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 3 || imgs.some(u => u && u.endsWith('.mp4'))));`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

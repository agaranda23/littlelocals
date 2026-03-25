const fs = require("fs");
const path = require("path");

const compPath = path.join(__dirname, "src", "components.jsx");
let comp = fs.readFileSync(compPath, "utf8");

// Revert card badge
const oldCard = `  const qualifiedForBadge = item.verified || (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 2 && (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 3 || imgs.some(u => u && u.endsWith('.mp4'))));`;
const newCard = `  const qualifiedForBadge = imgs.filter(u => u && !u.endsWith('.mp4')).length >= 2 && (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 3 || imgs.some(u => u && u.endsWith('.mp4')));`;

// Revert detail badge
const oldDetail = `          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo) || item.verified;`;
const newDetail = `          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);`;

if (!comp.includes(oldCard)) { console.error("❌ Could not find card badge string."); process.exit(1); }
if (!comp.includes(oldDetail)) { console.error("❌ Could not find detail badge string."); process.exit(1); }

comp = comp.replace(oldCard, newCard).replace(oldDetail, newDetail);
fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ Reverted badge logic to photo-count only.");

const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `        filtered.forEach(function(item) {`;
const newStr = `        filtered.forEach(function(item, idx) {`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch45 applied — idx parameter added to MapView forEach");

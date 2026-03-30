const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `const ALWAYS_AVAILABLE_TYPES = new Set([
  "Park", "Playground", "Nature", "Garden", "Outdoor",
]);`;

const newStr = `const ALWAYS_AVAILABLE_TYPES = new Set([
  "Park", "Playground", "Nature", "Garden",
]);`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch39 applied — Outdoor removed from ALWAYS_AVAILABLE_TYPES");

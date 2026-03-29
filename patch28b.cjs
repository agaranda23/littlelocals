const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `          <div style={{ position: "absolute", top: 10, right: 10" }}>`;
const newStr = `          <div style={{ position: "absolute", top: 10, right: 10 }}>`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch28b applied — JSX syntax error fixed");

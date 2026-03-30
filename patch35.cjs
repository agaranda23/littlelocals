const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `<div style={{ fontSize: 16, color: "#6B7280" }}>Nothing planned yet</div>`;
const newStr = `<div style={{ fontSize: 16, color: "#6B7280" }}>Nothing planned yet — want ideas for today?</div>`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch35 applied — empty state copy updated");

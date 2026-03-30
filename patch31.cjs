const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 64, background: "white", borderTop: "1px solid #E5E7EB", display: "flex", zIndex: 1000, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>`;

const newStr = `  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 64, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", zIndex: 1000, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch31 applied — bottom nav now has blur/frosted glass effect");

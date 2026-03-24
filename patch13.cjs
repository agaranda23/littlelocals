const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "App.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `                  <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{localFav.name}</div>`;
const newStr = `                  <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{localFav.name}{localFav.verified && <img src="/verified-badge.svg" width={17} height={17} style={{ marginLeft: 5, verticalAlign: "middle", display: "inline-block" }} alt="Verified" />}</div>`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

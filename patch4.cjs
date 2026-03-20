const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "App.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 16, fontWeight: active ? 700 : 500,
                  padding: "5px 14px", borderRadius: 20, cursor: "pointer",`;

const newStr = `                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  padding: "5px 10px", borderRadius: 20, cursor: "pointer",`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string. No changes made.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

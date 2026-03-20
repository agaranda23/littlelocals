const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "App.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `            { label: "Week", value: "week", count: weekCount },`;
const newStr = `            { label: "Week", value: "week", count: dayFilter === "week" ? filtered.length : weekCount },`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string. No changes made.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

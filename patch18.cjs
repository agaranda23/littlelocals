const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `          <button onClick={(e) => { e.stopPropagation(); const url = item.website || (item.cta && item.cta.url) || ""; openExternalWebsite(url); }} style={{ flex: 1.2, padding: 12, borderRadius: 12, border: "none", background: item.cta.type === "phone" ? "#42A5F5" : item.cta.type === "facebook" ? "#1877F2" : item.cta.type === "email" ? "#7B68EE" : "#D4732A", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>`;

const newStr = `          <button onClick={(e) => { e.stopPropagation(); if (item.cta.type === "phone") { window.location.href = item.cta.url; } else { const url = item.cta.url || item.website || ""; openExternalWebsite(url); } }} style={{ flex: 1.2, padding: 12, borderRadius: 12, border: "none", background: item.cta.type === "phone" ? "#42A5F5" : item.cta.type === "facebook" ? "#1877F2" : item.cta.type === "email" ? "#7B68EE" : "#D4732A", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find CTA button.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Fixed phone CTA button.");

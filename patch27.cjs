const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `{item.cta.type === "phone" ? "📞 " : item.cta.type === "facebook" ? "📘 " : item.cta.type === "email" ? "✉️ " : (item.website || item.cta.url || "").includes("instagram") ? "📸 " : (item.website || item.cta.url || "").includes("book") || (item.website || item.cta.url || "").includes("ticket") || (item.website || item.cta.url || "").includes("happity") ? "🎟 " : "🌐 "}{item.cta.type === "phone" ? "Call" : item.cta.type === "facebook" ? "View on Facebook" : item.cta.type === "email" ? "Email" : (item.website || item.cta.url || "").includes("instagram") ? "View on Instagram" : (item.website || item.cta.url || "").includes("book") || (item.website || item.cta.url || "").includes("ticket") || (item.website || item.cta.url || "").includes("happity") ? "Book now" : "Visit Website"}`;

const newStr = `{item.cta.type === "phone" ? "📞 " : item.cta.type === "facebook" ? "📘 " : item.cta.type === "email" ? "✉️ " : (item.cta.url || "").includes("instagram") ? "📸 " : (item.cta.url || "").includes("book") || (item.cta.url || "").includes("ticket") || (item.cta.url || "").includes("happity") || (item.cta.url || "").includes("gymcatch") || (item.cta.url || "").includes("eequ") ? "🎟 " : "🌐 "}{item.cta.type === "phone" ? "Call" : item.cta.type === "facebook" ? "View on Facebook" : item.cta.type === "email" ? "Email" : (item.cta.url || "").includes("instagram") ? "View on Instagram" : (item.cta.url || "").includes("book") || (item.cta.url || "").includes("ticket") || (item.cta.url || "").includes("happity") || (item.cta.url || "").includes("gymcatch") || (item.cta.url || "").includes("eequ") ? "Book now" : "Visit Website"}`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch27 applied — CTA button label now uses cta_url only");

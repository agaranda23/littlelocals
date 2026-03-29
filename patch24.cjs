const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `website: l.website, imageUrl: l.image_url, suggestedBy: l.suggested_by, logo: l.logo, whatsappGroup: l.whatsapp_group_url,`;
const newStr = `website: l.website, imageUrl: l.image_url, suggestedBy: l.suggested_by, logo: l.logo, whatsappGroup: l.whatsapp_group_url, instagram: l.instagram || null,`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }

// Replace both occurrences
const count = app.split(old).length - 1;
app = app.replaceAll(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log(`✅ patch24 applied — instagram mapped on ${count} listing object(s)`);

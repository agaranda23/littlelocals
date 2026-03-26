const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

// Find and replace the broken line directly
const broken = `            const match = url.match(/(?:v=|youtu.be/|embed/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;`;

const fixed = `            const idx = url.indexOf("v=") !== -1 ? url.indexOf("v=") + 2 : url.indexOf("youtu.be/") !== -1 ? url.indexOf("youtu.be/") + 9 : url.indexOf("embed/") !== -1 ? url.indexOf("embed/") + 6 : -1;
            return idx !== -1 ? url.substring(idx, idx + 11) : null;`;

if (!src.includes(broken)) {
  console.error("❌ Could not find broken line.");
  console.error("Looking for:", JSON.stringify(broken));
  process.exit(1);
}

src = src.replace(broken, fixed);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Fixed YouTube URL parsing.");

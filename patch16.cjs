const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `            const getYouTubeId = (url) => {
            const match = url.match(/(?:v=|youtu\\.be\\/|embed\\/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
          };`;

// Try alternative — the regex might have been written differently
const oldStr2 = `            const getYouTubeId = (url) => {
            const match = url.match(/(?:v=|youtu.be/|embed/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
          };`;

const newStr = `            const getYouTubeId = (url) => {
            const patterns = ["v=", "youtu.be/", "embed/"];
            for (const p of patterns) {
              const idx = url.indexOf(p);
              if (idx !== -1) return url.substring(idx + p.length, idx + p.length + 11);
            }
            return null;
          };`;

if (src.includes(oldStr)) {
  src = src.replace(oldStr, newStr);
} else if (src.includes(oldStr2)) {
  src = src.replace(oldStr2, newStr);
} else {
  console.error("❌ Could not find regex string.");
  process.exit(1);
}

fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Fixed YouTube regex.");

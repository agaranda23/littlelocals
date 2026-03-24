const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}`;

const newStr = `        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo) || item.verified;
          return qualified && <VerifiedBadge size="detail" />;
        })()}`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

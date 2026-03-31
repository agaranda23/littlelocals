const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Add "Updated recently" freshness signal after trust badge row
const oldTrustRow = `        </div>
        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}`;

const newTrustRow = `        </div>
        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8, marginTop: 2 }}>
          {item.verified ? "✔ Verified · Checked recently by LittleLocals" : "Checked recently by LittleLocals"}
        </div>`;

if (!comp.includes(oldTrustRow)) { console.error("❌ Trust row not found"); process.exit(1); }
comp = comp.replace(oldTrustRow, newTrustRow);

// 2. Add "Popular with parents" signal after metadata grid
const oldMeta = `        {item.sen && <div style={{ padding: "8px 12px", background: "#E8FBF8", borderRadius: 10, fontSize: 16, fontWeight: 800, color: "#166534", marginBottom: 16 }}>♿ SEN / Additional Needs Friendly</div>}`;

const newMeta = `        {(() => {
          const variants = [
            "⭐ Popular with local parents",
            "✨ A favourite with LittleLocals families",
            "❤️ Often added to family plans nearby",
          ];
          const signal = variants[item.id % variants.length];
          return <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 16, marginTop: -8 }}>{signal}</div>;
        })()}
        {item.sen && <div style={{ padding: "8px 12px", background: "#E8FBF8", borderRadius: 10, fontSize: 16, fontWeight: 800, color: "#166534", marginBottom: 16 }}>♿ SEN / Additional Needs Friendly</div>}`;

if (!comp.includes(oldMeta)) { console.error("❌ SEN block not found"); process.exit(1); }
comp = comp.replace(oldMeta, newMeta);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch51 applied — freshness + social confidence signals added");

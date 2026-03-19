const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `        {/* COMMUNITY REVIEWS SECTION */}`;

const newStr = `        {/* Tash / Boston Manor cross-links */}
        {item.name && (
          item.name.toLowerCase().includes("toddler woodland adventure") ||
          item.name.toLowerCase().includes("wilder woodlands") ||
          item.name.toLowerCase().includes("help our hedgehogs")
        ) && (() => {
          const tashListings = [
            { id: 435, emoji: "🌿", label: "Toddler Woodland Adventure Club", sub: "Thursdays · £8 · Ages 2–5" },
            { id: 414, emoji: "🌳", label: "Wilder Woodlands – Family Nature Walk", sub: "Boston Manor Park · Free" },
            { id: 417, emoji: "🦔", label: "Help Our Hedgehogs – Wildlife Workshop", sub: "Boston Manor Park · Free" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#F0FDF4", borderRadius: 14, padding: "14px 16px", border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 10 }}>🌿 More from Tash at Boston Manor Park:</div>
              {tashListings.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < tashListings.length - 1 ? 10 : 0, marginBottom: i < tashListings.length - 1 ? 10 : 0, borderBottom: i < tashListings.length - 1 ? "1px solid #D1FAE5" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#166534" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Boston Manor Park play area cross-link — show on all 3 Tash listings */}
        {item.name && (
          item.name.toLowerCase().includes("toddler woodland adventure") ||
          item.name.toLowerCase().includes("wilder woodlands") ||
          item.name.toLowerCase().includes("help our hedgehogs")
        ) && (() => {
          const playArea = (allListings||[]).find(l => l.id === 408);
          if (!playArea) return null;
          return (
            <div onClick={() => onSelectListing && onSelectListing(playArea)} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>🛝</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>Boston Manor Park Children's Play Area</div>
                <div style={{ fontSize: 14, color: "#6B7280" }}>Free · On-site · Great before or after the session</div>
              </div>
              <span style={{ fontSize: 20, color: "#5B2D6E", fontWeight: 800 }}>→</span>
            </div>
          );
        })()}

        {/* COMMUNITY REVIEWS SECTION */}`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find injection point. No changes made.");
  process.exit(1);
}

if (src.includes("toddler woodland adventure")) {
  console.error("❌ Patch already applied. No changes made.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

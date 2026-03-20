const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `        {/* Hatha Mama cross-link */}`;

const newStr = `        {/* Jenny's Pilates / Buggyfit cross-link */}
        {item.name && (
          item.name.toLowerCase().includes("jenny") ||
          item.name.toLowerCase().includes("buggyfit")
        ) && (() => {
          const jennyListings = [
            { id: 434, emoji: "🧘", label: "Jenny's Pilates – Mum & Baby", sub: "Wednesdays 1pm · Northfields Studio" },
            { id: 436, emoji: "🏃", label: "Buggyfit – Outdoor Mum & Baby Fitness", sub: "Thursdays 11:30am · Lamas Park · £79/4wks" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#FFF0F6", borderRadius: 14, padding: "14px 16px", border: "1px solid #FBCFE8" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#9D174D", marginBottom: 10 }}>💪 Also by Jenny:</div>
              {jennyListings.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < jennyListings.length - 1 ? 10 : 0, marginBottom: i < jennyListings.length - 1 ? 10 : 0, borderBottom: i < jennyListings.length - 1 ? "1px solid #FBCFE8" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#9D174D" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Hatha Mama cross-link */}`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find injection point.");
  process.exit(1);
}

if (src.includes("jenny's pilates / buggyfit")) {
  console.error("❌ Patch already applied.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

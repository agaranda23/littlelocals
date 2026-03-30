const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `        <div style={{ fontSize: 18, color: tc.color, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
          {item.location}{dist !== null && <span style={{ color: "#D4732A" }}>· {Math.round(dist * 20)} min walk</span>}
        </div>`;

const newStr = `        <div style={{ fontSize: 18, color: tc.color, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          {item.location}{dist !== null && <span style={{ color: "#D4732A" }}>· {Math.round(dist * 20)} min walk</span>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {item.verified && <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", padding: "3px 8px", borderRadius: 20, border: "1px solid #BFDBFE" }}>✓ Verified</span>}
          {isOnToday(item) && <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#DCFCE7", padding: "3px 8px", borderRadius: 20, border: "1px solid #86EFAC" }}>📅 On today</span>}
          {(item.popular || item.verified) && <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "3px 8px", borderRadius: 20, border: "1px solid #FDE68A" }}>⭐ Popular</span>}
          {item.free && <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#F0FDF4", padding: "3px 8px", borderRadius: 20, border: "1px solid #BBF7D0" }}>Free</span>}
          {dist !== null && dist < 1.5 && <span style={{ fontSize: 12, fontWeight: 700, color: "#5B2D6E", background: "#F5F3FF", padding: "3px 8px", borderRadius: 20, border: "1px solid #DDD6FE" }}>📍 Nearby</span>}
        </div>`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch43 applied — trust badge row added under title");

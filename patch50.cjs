const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Tighten photo section spacing
const oldPhotos = `                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>📸 Photos</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>`;

const newPhotos = `                  <div style={{ fontSize: 17, fontWeight: 900, color: "#1F2937", marginBottom: 6 }}>📸 Photos</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>`;

if (!comp.includes(oldPhotos)) { console.error("❌ Photos section not found"); process.exit(1); }
comp = comp.replace(oldPhotos, newPhotos);

// 2. Upgrade Also at this venue card styling
const oldVenue = `            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Also at this venue</div>
              {sameVenue.map(rel => (
                <div key={rel.id} onClick={() => onSelectListing && onSelectListing(rel)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F9FAFB", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: "1px solid #E5E7EB" }}>
                  {rel.images?.[0]?.url && <img src={rel.images[0].url} alt={rel.name} loading="lazy" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 1 }}>{rel.name}</div>
                    <div style={{ fontSize: 16, color: "#6B7280" }}>{rel.type} · {rel.time}</div>
                  </div>
                  <span style={{ fontSize: 16, color: "#5B2D6E", fontWeight: 800 }}>→</span>
                </div>
              ))}
            </div>`;

const newVenue = `            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Also at this venue</div>
              {sameVenue.map(rel => (
                <div key={rel.id} onClick={() => onSelectListing && onSelectListing(rel)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "white", borderRadius: 14, marginBottom: 8, cursor: "pointer", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {rel.images?.[0]?.url && <img src={rel.images[0].url} alt={rel.name} loading="lazy" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{rel.name}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{rel.type}{rel.time ? " · " + rel.time : ""}</div>
                  </div>
                  <span style={{ fontSize: 18, color: "#5B2D6E", fontWeight: 800 }}>→</span>
                </div>
              ))}
            </div>`;

if (!comp.includes(oldVenue)) { console.error("❌ Also at venue section not found"); process.exit(1); }
comp = comp.replace(oldVenue, newVenue);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch50 applied — photo spacing tightened + venue cards upgraded");

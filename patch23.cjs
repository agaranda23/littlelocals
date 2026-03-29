const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const anchor = `        {/* Suggested by credit */}`;

const newBlock = `        {item.instagram && (
          <div style={{ marginTop: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); window.open("https://www.instagram.com/" + item.instagram, "_blank"); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📸 View on Instagram
            </button>
          </div>
        )}

        {/* Suggested by credit */}`;

if (!comp.includes(anchor)) { console.error("❌ Anchor not found"); process.exit(1); }
comp = comp.replace(anchor, newBlock);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch23 applied — Instagram button added");

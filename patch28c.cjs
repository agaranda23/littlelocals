const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// Fix both heart wrappers to stop pointer events too
const old1 = `          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

const new1 = `          <div onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

const old2 = `          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

const new2 = `          <div onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

if (!comp.includes(old1)) { console.error("❌ Heart1 not found"); process.exit(1); }
if (!comp.includes(old2)) { console.error("❌ Heart2 not found"); process.exit(1); }

comp = comp.replace(old1, new1);
comp = comp.replace(old2, new2);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch28c applied — heart now stops pointer events too");

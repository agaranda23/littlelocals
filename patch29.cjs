const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `        <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
          <img src="/lgd-dance.png" alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 19, fontWeight: 900, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
            <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#5B2D6E" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 16, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
            <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: "white", fontWeight: 900, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, zIndex: 3 }}>
            <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 15, fontWeight: 900, color: "white", background: "#5B2D6E", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Featured local provider</span>
          </div>
        </div>`;

const newStr = `        <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
          <img src={(item.images && item.images[0]) || item.logo || "/lgd-dance.png"} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {item.logo && (item.images && item.images[0]) && (
            <div style={{ position: "absolute", bottom: 44, left: 12, background: "white", borderRadius: 8, padding: "3px 6px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", zIndex: 3 }}>
              <img src={item.logo} style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} />
            </div>
          )}
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 19, fontWeight: 900, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
            <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#5B2D6E" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 16, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
            <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: "white", fontWeight: 900, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, zIndex: 3 }}>
            <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 15, fontWeight: 900, color: "white", background: "#5B2D6E", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Featured local provider</span>
          </div>
        </div>`;

if (!comp.includes(old)) { console.error("❌ Featured provider block not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch29 applied — featured provider now uses DB images + logo pill");

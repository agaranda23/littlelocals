const fs = require("fs");

// ─── PATCH components.jsx ───────────────────────────────────────────────────
const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Add savedToast state to ListingCard
const oldSig = `export function ListingCard({ item, onSelect, userLoc, isFav, onToggleFav, isNew, reviews, areaFilter, isSunny, onTrackClick, clickCount, viewCount, todaySignal, startsSoon }) {`;
const newSig = `export function ListingCard({ item, onSelect, userLoc, isFav, onToggleFav, isNew, reviews, areaFilter, isSunny, onTrackClick, clickCount, viewCount, todaySignal, startsSoon }) {
  const [savedToast, setSavedToast] = React.useState(false);
  const handleFav = (e) => {
    e.stopPropagation();
    if (!isFav) {
      if (navigator.vibrate) navigator.vibrate(60);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 1500);
    }
    onToggleFav(item.id, item.name);
  };`;

if (!comp.includes(oldSig)) { console.error("❌ ListingCard signature not found"); process.exit(1); }
comp = comp.replace(oldSig, newSig);

// 2. Replace both heart button onClick handlers and add toast
const oldHeart1 = `          {/* Fav button */}
          <div onClick={(e) => { e.stopPropagation(); onToggleFav(item.id, item.name); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
            {isFav ? "♥" : "♡"}
          </div>`;
const newHeart1 = `          {/* Fav button */}
          <div style={{ position: "absolute", top: 10, right: 10" }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

const oldHeart2 = `          <div onClick={(e) => { e.stopPropagation(); onToggleFav(item.id, item.name); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer" }}>
            {isFav ? "♥" : "♡"}
          </div>`;
const newHeart2 = `          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <div onClick={handleFav} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer" }}>
              {isFav ? "♥" : "♡"}
            </div>
            {savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}
          </div>`;

if (!comp.includes(oldHeart1)) { console.error("❌ Heart1 not found"); process.exit(1); }
if (!comp.includes(oldHeart2)) { console.error("❌ Heart2 not found"); process.exit(1); }
comp = comp.replace(oldHeart1, newHeart1);
comp = comp.replace(oldHeart2, newHeart2);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched — card heart now shows Saved toast");

// ─── PATCH App.jsx ───────────────────────────────────────────────────────────
const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// Fix Add button to scroll to top
const oldAdd1 = `<div onClick={openSuggest} style={{ margin: "6px 0 8px", padding: "12px 16px", background: "linear-gradient(135deg, #F9FAFB, #FDDDE6)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed #D4732A" }}>`;
const newAdd1 = `<div onClick={() => { openSuggest(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ margin: "6px 0 8px", padding: "12px 16px", background: "linear-gradient(135deg, #F9FAFB, #FDDDE6)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed #D4732A" }}>`;

const oldAdd2 = `<div onClick={openSuggest} style={{ margin: "16px 20px 8px", padding: "12px 16px", background: "linear-gradient(135deg, #F9FAFB, #FDDDE6)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed #D4732A" }}>`;
const newAdd2 = `<div onClick={() => { openSuggest(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ margin: "16px 20px 8px", padding: "12px 16px", background: "linear-gradient(135deg, #F9FAFB, #FDDDE6)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed #D4732A" }}>`;

if (!app.includes(oldAdd1)) { console.error("❌ Add button 1 not found"); process.exit(1); }
if (!app.includes(oldAdd2)) { console.error("❌ Add button 2 not found"); process.exit(1); }
app = app.replace(oldAdd1, newAdd1);
app = app.replace(oldAdd2, newAdd2);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched — Add button scrolls to top");
console.log("✅ patch28 complete");

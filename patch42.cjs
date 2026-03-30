const fs = require("fs");

// ─── components.jsx ─────────────────────────────────────────────
const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Add paddingBottom to DetailView outer wrapper
const oldWrapper = `    <div style={{ flex: 1, overflowY: "auto" }}>`;
const newWrapper = `    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>`;
if (!comp.includes(oldWrapper)) { console.error("❌ DetailView wrapper not found"); process.exit(1); }
comp = comp.replace(oldWrapper, newWrapper);

// 2. Improve save toast message
const oldToast = `{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 16, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}`;
const newToast = `{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "6px 10px", borderRadius: 8, whiteSpace: "nowrap", lineHeight: 1.4, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>Saved ✓<br/><span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>Find it in My Plans</span></div>}`;
if (!comp.includes(oldToast)) { console.error("❌ Save toast not found"); process.exit(1); }
comp = comp.replaceAll(oldToast, newToast);

// 3. Add trust badge row under listing title in DetailView
const oldTitleArea = `      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontSize: 26, fontWeight: 1000, color: "#111827", lineHeight: 1.2, marginBottom: 4 }}>{item.name}</div>
        <div style={{ fontSize: 17, color: "#D4732A", fontWeight: 700, marginBottom: 12 }}>{item.location}</div>`;
const newTitleArea = `      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontSize: 26, fontWeight: 1000, color: "#111827", lineHeight: 1.2, marginBottom: 4 }}>{item.name}</div>
        <div style={{ fontSize: 17, color: "#D4732A", fontWeight: 700, marginBottom: 8 }}>{item.location}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {item.verified && <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", padding: "3px 8px", borderRadius: 20, border: "1px solid #BFDBFE" }}>✓ Verified</span>}
          {isOnToday(item) && <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#DCFCE7", padding: "3px 8px", borderRadius: 20, border: "1px solid #86EFAC" }}>📅 On today</span>}
          {(item.popular || item.verified) && <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "3px 8px", borderRadius: 20, border: "1px solid #FDE68A" }}>⭐ Popular</span>}
          {item.free && <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#F0FDF4", padding: "3px 8px", borderRadius: 20, border: "1px solid #BBF7D0" }}>Free</span>}
        </div>`;
if (!comp.includes(oldTitleArea)) { console.error("❌ Title area not found"); process.exit(1); }
comp = comp.replace(oldTitleArea, newTitleArea);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched");

// ─── App.jsx ────────────────────────────────────────────────────
const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// 4. Improve My Plans empty state
const oldEmpty = `<div style={{ fontSize: 16, color: "#6B7280" }}>Nothing planned yet — want ideas for today?</div>`;
const newEmpty = `<div style={{ fontSize: 16, color: "#6B7280", marginBottom: 4 }}>Nothing planned yet.</div>
                    <div style={{ fontSize: 14, color: "#9CA3AF" }}>Add something for today in one tap.</div>`;
if (!app.includes(oldEmpty)) { console.error("❌ Empty state not found"); process.exit(1); }
app = app.replace(oldEmpty, newEmpty);

// 5. Improve card save toast
const oldCardToast = `{savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 13, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>Saved ✓</div>}`;
const newCardToast = `{savedToast && <div style={{ position: "absolute", top: 36, right: 0, background: "#5B2D6E", color: "white", fontSize: 12, fontWeight: 900, padding: "5px 8px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 10, lineHeight: 1.4, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>Saved ✓<br/><span style={{ fontSize: 10, fontWeight: 500, opacity: 0.9 }}>Find it in My Plans</span></div>}`;
if (!app.includes(oldCardToast)) { console.error("❌ Card toast not found in App.jsx"); }
else app = app.replaceAll(oldCardToast, newCardToast);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched");
console.log("✅ patch42 complete — UX polish applied");

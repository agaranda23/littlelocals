const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// 1. Add recentlyViewed state
const oldState = `  const [crossLinks, setCrossLinks] = useState([]);`;
const newState = `  const [crossLinks, setCrossLinks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ll_recentlyViewed") || "[]"); } catch(e) { return []; }
  });`;

if (!app.includes(oldState)) { console.error("❌ State not found"); process.exit(1); }
app = app.replace(oldState, newState);

// 2. Track view when openDetail is called
const oldOpenDetail = `  const openDetail = (item) => { window.history.pushState({ view: "detail" }, "", "/activity/" + (item.slug || item.id)); setSelected(item); window.scrollTo(0, 0); };`;
const newOpenDetail = `  const openDetail = (item) => {
    window.history.pushState({ view: "detail" }, "", "/activity/" + (item.slug || item.id));
    setSelected(item);
    window.scrollTo(0, 0);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== item.id);
      const updated = [{ id: item.id, name: item.name, image: (item.images && item.images[0]) || item.logo || null, timestamp: Date.now() }, ...filtered].slice(0, 5);
      try { localStorage.setItem("ll_recentlyViewed", JSON.stringify(updated)); } catch(e) {}
      return updated;
    });
  };`;

if (!app.includes(oldOpenDetail)) { console.error("❌ openDetail not found"); process.exit(1); }
app = app.replace(oldOpenDetail, newOpenDetail);

// 3. Add Recently Viewed section before Activity Passport
const oldPassport = `        {/* Activity Passport */}
        <div style={{ padding: "0 20px 16px" }}>`;
const newPassport = `        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ fontSize: 18, fontWeight: 1000, color: "#1F2937", marginBottom: 10 }}>👁 Recently viewed</div>
            {recentlyViewed.map(r => {
              const item = listings.find(l => l.id === r.id);
              if (!item) return null;
              return (
                <div key={r.id} onClick={() => { closeCalendar(); setTimeout(() => openDetail(item), 50); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 14, border: "1px solid #E5E7EB", marginBottom: 6, cursor: "pointer" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#F3F4F6", flexShrink: 0 }}>
                    {r.image ? <img src={r.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.emoji || "🎯"}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1F2937" }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: "#9CA3AF" }}>{item.type} · {item.location}</div>
                  </div>
                  <span style={{ fontSize: 18, color: "#9CA3AF" }}>→</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity Passport */}
        <div style={{ padding: "0 20px 16px" }}>`;

if (!app.includes(oldPassport)) { console.error("❌ Passport section not found"); process.exit(1); }
app = app.replace(oldPassport, newPassport);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch37 applied — Recently Viewed section added to My Plans");

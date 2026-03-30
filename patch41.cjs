const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `      {/* Floating "Top" button */}
      {showScrollTop && (
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: showInstallBanner ? 60 : 20, right: 16, padding: "8px 12px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 16, fontWeight: 900, color: "#1F2937", zIndex: 998, transition: "bottom 0.2s" }}>↑ Top</div>
      )}`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, ``);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch41 applied — floating Top button removed");

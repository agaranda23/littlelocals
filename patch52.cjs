const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `              <div onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSuggest(false); setSelected(null); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>`;

const newStr = `              <div onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSuggest(false); setSelected(null); setSearch(""); setDayFilter("week"); setSortBy("mixed"); setShowMoreFilters(false); setActiveTab("home"); if (showCalendar) closeCalendar(); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch52 applied — logo/title now does full home reset");

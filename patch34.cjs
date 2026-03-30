const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `if (tab.id === "home") { setShowMoreFilters(false); setSortBy("mixed"); setMapView(false); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }`;
const newStr = `if (tab.id === "home") { setShowMoreFilters(false); setSortBy("mixed"); setMapView(false); setDayFilter("week"); setSearch(""); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replaceAll(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch34 applied — Home tab resets to this week and clears search");

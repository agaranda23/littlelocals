const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// Replace both tab definitions and their click handlers
const old1 = `      { id: "nearby", icon: "📍", label: "Nearby" },`;
const new1 = `      { id: "nearby", icon: "📅", label: "Today" },`;

if (!app.includes(old1)) { console.error("❌ Tab definition not found"); process.exit(1); }
app = app.replaceAll(old1, new1);

// Update click handler behaviour — set dayFilter to today + sort nearest
const old2 = `          else if (tab.id === "nearby") { setSortBy("nearest"); setMapView(false); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }`;
const new2 = `          else if (tab.id === "nearby") { setDayFilter("today"); setSortBy("nearest"); setMapView(false); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }`;

if (!app.includes(old2)) { console.error("❌ Tab handler not found"); process.exit(1); }
app = app.replaceAll(old2, new2);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch33 applied — Nearby tab renamed to Today with correct behaviour");

const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 64, background: "white", borderTop: "1px solid #E5E7EB", display: "flex", zIndex: 1000, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
    {[
      { id: "home", icon: "🏠", label: "Home" },
      { id: "nearby", icon: "📅", label: "Today" },
      { id: "plans", icon: "🗓️", label: "My Plans", badge: calendarTotal },
      { id: "browse", icon: "🔎", label: "Browse" },
    ].map(tab => {
      const isActive = activeTab === tab.id;
      return (
        <div key={tab.id} onClick={() => {
          setActiveTab(tab.id);
          if (tab.id === "home") { setShowMoreFilters(false); setSortBy("mixed"); setMapView(false); setDayFilter("week"); setSearch(""); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          else if (tab.id === "nearby") { setDayFilter("today"); setSortBy("nearest"); setMapView(false); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          else if (tab.id === "plans") { openCalendar(); }
          else if (tab.id === "browse") { setShowMoreFilters(true); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
        }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 3, position: "relative" }}>
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 500, color: isActive ? "#5B2D6E" : "#9CA3AF" }}>{tab.label}</span>
          {tab.badge > 0 && <div style={{ position: "absolute", top: 8, right: "calc(50% - 18px)", background: "#5B2D6E", color: "white", fontSize: 9, fontWeight: 800, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{tab.badge}</div>}
          {isActive && <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 3, background: "#5B2D6E", borderRadius: "3px 3px 0 0" }} />}
        </div>
      );`;

const newStr = `  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 68, background: "transparent", display: "flex", zIndex: 1000, paddingBottom: 4 }}>
    {[
      { id: "home", icon: "🏠", label: "Home" },
      { id: "nearby", icon: "📅", label: "Today" },
      { id: "browse", icon: "🔎", label: "Explore" },
      { id: "plans", icon: "🗓️", label: "My Plans", badge: calendarTotal },
    ].map(tab => {
      const isActive = activeTab === tab.id;
      return (
        <div key={tab.id} onClick={() => {
          setActiveTab(tab.id);
          if (tab.id === "home") { setShowMoreFilters(false); setSortBy("mixed"); setMapView(false); setDayFilter("week"); setSearch(""); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          else if (tab.id === "nearby") { setDayFilter("today"); setSortBy("nearest"); setMapView(false); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          else if (tab.id === "plans") { openCalendar(); }
          else if (tab.id === "browse") { setShowMoreFilters(true); if (showCalendar) closeCalendar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
        }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 3, position: "relative" }}>
          <span style={{ fontSize: isActive ? 26 : 22, transition: "font-size 0.15s ease" }}>{tab.icon}</span>
          <span style={{ fontSize: 11, fontWeight: isActive ? 900 : 500, color: isActive ? "#5B2D6E" : "#9CA3AF", letterSpacing: isActive ? "-0.2px" : "0" }}>{tab.label}</span>
          {tab.badge > 0 && <div style={{ position: "absolute", top: 6, right: "calc(50% - 20px)", background: "#5B2D6E", color: "white", fontSize: 9, fontWeight: 800, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{tab.badge}</div>}
        </div>
      );`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch40b applied — second BottomNav fixed");

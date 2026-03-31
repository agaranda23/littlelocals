const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `          <div style={{ padding: "12px 20px 0" }}>
            {h >= 5 && h < 12 && <><div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{weather && weather.isRainy ? "🌧️ Rainy morning — easy indoor ideas below" : weather && weather.temp >= 18 ? "☀️ Beautiful morning — good time to get outside" : "🌤️ Good morning, " + area + " parents"}</div>{weather && weather.temp && <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 2 }}>{weather.temp}°C {weather.desc || ""}</div>}<div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>👀 {exploringCount} parents exploring today</div></>}
            {h >= 12 && h < 18 && <><div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{weather && weather.isRainy ? "🌧️ Rainy afternoon — indoor ideas below" : weather && weather.temp >= 18 ? "☀️ Still time for an outdoor adventure" : "👋 Afternoon, " + area + " parents"}</div>{weather && weather.temp && <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 2 }}>{weather.temp}°C {weather.desc || ""}</div>}<div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>👀 {exploringCount} parents exploring today</div></>}
            {h >= 18 && <><div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{weather && weather.tomorrowIsRainy ? "🌧️ Rainy tomorrow — plan something indoor" : weather && weather.tomorrowIsSunny && weather.tomorrowTemp >= 14 ? "☀️ Tomorrow's looking great — worth planning something" : "🌙 Planning ahead with the kids?"}</div>{weather && weather.tomorrowTemp && <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 2 }}>{weather.tomorrowTemp}°C tomorrow {weather.tomorrowDesc || ""}</div>}<div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>👀 {exploringCount} parents exploring today</div></>}
          </div>`;

const newStr = `          <div style={{ padding: "16px 20px 4px", borderBottom: "1px solid #F3F4F6", marginBottom: 4 }}>
            {h >= 5 && h < 12 && <><div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{weather && weather.isRainy ? "🌧️ Rainy morning — easy indoor ideas below" : weather && weather.temp >= 18 ? "☀️ Beautiful morning — good time to get outside" : "🌤️ Good morning, " + area + " parents"}</div>{weather && weather.temp && <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>{weather.temp}°C {weather.desc || ""}</div>}<div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>👀 {exploringCount} parents exploring today</div></>}
            {h >= 12 && h < 18 && <><div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{weather && weather.isRainy ? "🌧️ Rainy afternoon — indoor ideas below" : weather && weather.temp >= 18 ? "☀️ Still time for an outdoor adventure" : "👋 Afternoon, " + area + " parents"}</div>{weather && weather.temp && <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>{weather.temp}°C {weather.desc || ""}</div>}<div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>👀 {exploringCount} parents exploring today</div></>}
            {h >= 18 && <><div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{weather && weather.tomorrowIsRainy ? "🌧️ Rainy tomorrow — plan something indoor" : weather && weather.tomorrowIsSunny && weather.tomorrowTemp >= 14 ? "☀️ Tomorrow's looking great — worth planning something" : "🌙 Planning ahead with the kids?"}</div>{weather && weather.tomorrowTemp && <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>{weather.tomorrowTemp}°C tomorrow {weather.tomorrowDesc || ""}</div>}<div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>👀 {exploringCount} parents exploring today</div></>}
          </div>`;

if (!app.includes(old)) { console.error("❌ Greeting block not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch49 applied — homepage greeting block polished");

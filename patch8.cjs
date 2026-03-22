const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `        {item.bring.length > 0 && (`;

const newStr = `        {/* Generic collapsible timetable — set timetable_image in DB, no deploy needed */}
        {item.timetableImage && (() => {
          const [ttOpen, setTtOpen] = React.useState(false);
          return (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>📅 Timetable</div>
              <div style={{ position: "relative", maxHeight: ttOpen ? "none" : 200, overflow: "hidden", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                <img src={item.timetableImage} alt="Timetable" style={{ width: "100%", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                {!ttOpen && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
              </div>
              <div onClick={() => setTtOpen(!ttOpen)} style={{ textAlign: "center", padding: "8px 0", cursor: "pointer", fontSize: 16, fontWeight: 800, color: "#5B2D6E" }}>{ttOpen ? "Collapse timetable ↑" : "Tap to expand timetable ↓"}</div>
            </div>
          );
        })()}

        {item.bring.length > 0 && (`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find injection point.");
  process.exit(1);
}

if (src.includes("Generic collapsible timetable")) {
  console.error("❌ Patch already applied.");
  process.exit(1);
}

// Also map timetable_image from DB in App.jsx
const appPath = path.join(__dirname, "src", "App.jsx");
let app = fs.readFileSync(appPath, "utf8");

const oldMap = `            daysOfWeek: l.days_of_week || null,          // e.g. ["mon","wed","fri"]`;
const newMap = `            timetableImage: l.timetable_image || null,    // collapsible timetable image URL
            daysOfWeek: l.days_of_week || null,          // e.g. ["mon","wed","fri"]`;

if (!app.includes(oldMap)) {
  console.error("❌ Could not find App.jsx mapping point.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
app = app.replace(oldMap, newMap);

fs.writeFileSync(filePath, src, "utf8");
fs.writeFileSync(appPath, app, "utf8");
console.log("✅ Both files patched successfully.");

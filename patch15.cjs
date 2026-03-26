const fs = require("fs");
const path = require("path");

// ── components.jsx — add generic YouTube embed ─────────────────
const compPath = path.join(__dirname, "src", "components.jsx");
let comp = fs.readFileSync(compPath, "utf8");

const oldStr = `        {/* Oikos Stay and Play video */}`;
const newStr = `        {/* Generic YouTube embed — set youtube_url in DB, no deploy needed */}
        {item.youtubeUrl && (() => {
          const getYouTubeId = (url) => {
            const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
          };
          const videoId = getYouTubeId(item.youtubeUrl);
          if (!videoId) return null;
          return (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>🎥 See it in action</div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
                <iframe src={"https://www.youtube.com/embed/" + videoId} title={item.name} frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }} />
              </div>
            </div>
          );
        })()}

        {/* Oikos Stay and Play video */}`;

if (!comp.includes(oldStr)) { console.error("❌ Could not find injection point."); process.exit(1); }
if (comp.includes("Generic YouTube embed")) { console.error("❌ Already patched."); process.exit(1); }
comp = comp.replace(oldStr, newStr);
fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched.");

// ── App.jsx — map youtube_url field ───────────────────────────
const appPath = path.join(__dirname, "src", "App.jsx");
let app = fs.readFileSync(appPath, "utf8");

const oldMap = `            timetableImage: l.timetable_image || null,    // collapsible timetable image URL`;
const newMap = `            timetableImage: l.timetable_image || null,    // collapsible timetable image URL
            youtubeUrl: l.youtube_url || null,              // generic YouTube embed URL`;

if (!app.includes(oldMap)) { console.error("❌ Could not find App.jsx map point."); process.exit(1); }
app = app.replace(oldMap, newMap);
fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched.");
console.log("✅ All done.");

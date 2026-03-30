const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// Helper to insert badge logic — replaces both Today badge instances
const oldBadge1 = `          {/* Today badge */}
          {onToday && (
            <div style={{ position: "absolute", top: 10, left: 10, background: "#F0FDF4", color: "#166534", fontSize: 13, fontWeight: 600, padding: "2px 7px", borderRadius: 8, border: "1px solid #BBF7D0" }}>📅 Today</div>
          )}
        </div>
      ) : (`;

const newBadge1 = `          {/* Today / Open now / Starts soon badge */}
          {onToday && (() => {
            const now = new Date();
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const timeStr = (item.time || "").trim();
            const startMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
            const endMatch = timeStr.match(/[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
            const parseMins = (h, m, ap) => {
              let hrs = parseInt(h); const mins = parseInt(m) || 0;
              if (ap && ap.toLowerCase() === "pm" && hrs !== 12) hrs += 12;
              if (ap && ap.toLowerCase() === "am" && hrs === 12) hrs = 0;
              return hrs * 60 + mins;
            };
            let badge = { text: "📅 Today", bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };
            if (startMatch) {
              const startMins = parseMins(startMatch[1], startMatch[2], startMatch[3]);
              const endMins = endMatch ? parseMins(endMatch[1], endMatch[2], endMatch[3]) : null;
              if (endMins !== null && nowMins >= startMins && nowMins < endMins) {
                badge = { text: "🟢 Open now", bg: "#DCFCE7", color: "#166534", border: "#86EFAC" };
              } else if (startMins > nowMins && startMins - nowMins <= 120) {
                badge = { text: "⏰ Starts soon", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" };
              }
            }
            return <div style={{ position: "absolute", top: 10, left: 10, background: badge.bg, color: badge.color, fontSize: 13, fontWeight: 700, padding: "2px 7px", borderRadius: 8, border: \`1px solid \${badge.border}\` }}>{badge.text}</div>;
          })()}
        </div>
      ) : (`;

const oldBadge2 = `          {onToday && (
            <div style={{ position: "absolute", top: 10, left: 10, background: "#F0FDF4", color: "#166534", fontSize: 13, fontWeight: 600, padding: "2px 7px", borderRadius: 8, border: "1px solid #BBF7D0" }}>📅 Today</div>
          )}
        </div>
      )}`;

const newBadge2 = `          {onToday && (() => {
            const now = new Date();
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const timeStr = (item.time || "").trim();
            const startMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
            const endMatch = timeStr.match(/[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
            const parseMins = (h, m, ap) => {
              let hrs = parseInt(h); const mins = parseInt(m) || 0;
              if (ap && ap.toLowerCase() === "pm" && hrs !== 12) hrs += 12;
              if (ap && ap.toLowerCase() === "am" && hrs === 12) hrs = 0;
              return hrs * 60 + mins;
            };
            let badge = { text: "📅 Today", bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };
            if (startMatch) {
              const startMins = parseMins(startMatch[1], startMatch[2], startMatch[3]);
              const endMins = endMatch ? parseMins(endMatch[1], endMatch[2], endMatch[3]) : null;
              if (endMins !== null && nowMins >= startMins && nowMins < endMins) {
                badge = { text: "🟢 Open now", bg: "#DCFCE7", color: "#166534", border: "#86EFAC" };
              } else if (startMins > nowMins && startMins - nowMins <= 120) {
                badge = { text: "⏰ Starts soon", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" };
              }
            }
            return <div style={{ position: "absolute", top: 10, left: 10, background: badge.bg, color: badge.color, fontSize: 13, fontWeight: 700, padding: "2px 7px", borderRadius: 8, border: \`1px solid \${badge.border}\` }}>{badge.text}</div>;
          })()}
        </div>
      )}`;

if (!comp.includes(oldBadge1)) { console.error("❌ Badge1 not found"); process.exit(1); }
if (!comp.includes(oldBadge2)) { console.error("❌ Badge2 not found"); process.exit(1); }

comp = comp.replace(oldBadge1, newBadge1);
comp = comp.replace(oldBadge2, newBadge2);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch32 applied — Open now / Starts soon / Today priority badges");

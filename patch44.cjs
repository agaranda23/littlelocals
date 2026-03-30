const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Make "Send to another parent" secondary style
const oldSend = `style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Send to another parent
          </button>`;

const newSend = `style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #E5E7EB", background: "white", color: "#374151", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            📤 Send to a parent
          </button>`;

if (!comp.includes(oldSend)) { console.error("❌ Send button not found"); process.exit(1); }
comp = comp.replace(oldSend, newSend);

// 2. Make "More info / Bookings" secondary style
const oldMore = `<button onClick={(e) => { e.stopPropagation(); openExternalWebsite(item.website); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#D4732A", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
              🔗 More info / Bookings
            </button>`;

const newMore = `<button onClick={(e) => { e.stopPropagation(); openExternalWebsite(item.website); }} style={{ width: "100%", padding: 11, borderRadius: 12, border: "1px solid #E5E7EB", background: "white", color: "#374151", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              🔗 More info / Bookings
            </button>`;

if (!comp.includes(oldMore)) { console.error("❌ More info button not found"); process.exit(1); }
comp = comp.replace(oldMore, newMore);

// 3. Make WhatsApp group button secondary style
const oldWA = `<button onClick={(e) => { e.stopPropagation(); window.open(item.whatsappGroup, "_blank"); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Join WhatsApp Group
            </button>`;

const newWA = `<button onClick={(e) => { e.stopPropagation(); window.open(item.whatsappGroup, "_blank"); }} style={{ width: "100%", padding: 11, borderRadius: 12, border: "1px solid #dcfce7", background: "#f0fdf4", color: "#166534", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              💬 Join WhatsApp Group
            </button>`;

if (!comp.includes(oldWA)) { console.error("❌ WhatsApp button not found"); process.exit(1); }
comp = comp.replace(oldWA, newWA);

// 4. Make Instagram button secondary style
const oldInsta = `<button onClick={(e) => { e.stopPropagation(); window.open("https://www.instagram.com/" + item.instagram, "_blank"); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📸 View on Instagram
            </button>`;

const newInsta = `<button onClick={(e) => { e.stopPropagation(); window.open("https://www.instagram.com/" + item.instagram, "_blank"); }} style={{ width: "100%", padding: 11, borderRadius: 12, border: "1px solid #fce7f3", background: "#fdf2f8", color: "#9d174d", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📸 View on Instagram
            </button>`;

if (!comp.includes(oldInsta)) { console.error("❌ Instagram button not found"); process.exit(1); }
comp = comp.replace(oldInsta, newInsta);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch44 applied — CTA buttons styled with primary/secondary hierarchy");

const fs = require("fs");

// ─── PATCH components.jsx ───────────────────────────────────────────────────
const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Add crossLinks prop to DetailView signature
const oldSig = `export function DetailView({ item, onBack, userLoc, reviews, onAddReview, isFav, onToggleFav, onAddToCalendar, onRemoveFromCalendar, calendarPlan, isVisited, onToggleVisited, tips = [], onAddTip, allListings = [], onSelectListing }) {`;
const newSig = `export function DetailView({ item, onBack, userLoc, reviews, onAddReview, isFav, onToggleFav, onAddToCalendar, onRemoveFromCalendar, calendarPlan, isVisited, onToggleVisited, tips = [], onAddTip, allListings = [], onSelectListing, crossLinks = [] }) {`;

if (!comp.includes(oldSig)) { console.error("❌ DetailView signature not found"); process.exit(1); }
comp = comp.replace(oldSig, newSig);

// 2. Replace Jenny/Buggyfit block
const oldJenny = `        {/* Jenny's Pilates / Buggyfit cross-link */}
        {item.name && (
          item.name.toLowerCase().includes("jenny") ||
          item.name.toLowerCase().includes("buggyfit")
        ) && (() => {
          const jennyListings = [
            { id: 434, emoji: "🧘", label: "Jenny's Pilates – Mum & Baby", sub: "Wednesdays 1pm · Northfields Studio" },
            { id: 436, emoji: "🏃", label: "Buggyfit – Outdoor Mum & Baby Fitness", sub: "Thursdays 11:30am · Lamas Park · £79/4wks" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#FFF0F6", borderRadius: 14, padding: "14px 16px", border: "1px solid #FBCFE8" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#9D174D", marginBottom: 10 }}>💪 Also by Jenny:</div>
              {jennyListings.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < jennyListings.length - 1 ? 10 : 0, marginBottom: i < jennyListings.length - 1 ? 10 : 0, borderBottom: i < jennyListings.length - 1 ? "1px solid #FBCFE8" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#9D174D" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Hatha Mama cross-link */}
        {item.name && item.name.toLowerCase().includes("hatha mama") && (() => {
          const hathaCourses = [
            { id: 432, label: "Pregnancy Yoga", venue: "Northfields Community Centre", days: "Saturdays 10am", postcode: "W13 9SS" },
            { id: 433, label: "Baby Yoga & Massage", venue: "Garden Studio South Ealing", days: "Mondays 10am", postcode: "W5 4HX" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#FAF5FF", borderRadius: 14, padding: "14px 16px", border: "1px solid #E9D5FF" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#6B21A8", marginBottom: 10 }}>🧘 Hatha Mama also runs:</div>
              {hathaCourses.map(v => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                    <div style={{ fontSize: 14, color: "#6B7280" }}>{v.venue} · {v.postcode}</div>
                    <div style={{ fontSize: 14, color: "#6B7280" }}>{v.days}</div>
                  </div>
                  <span style={{ fontSize: 22, color: "#6B21A8" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Little Kickers cross-link */}
        {item.name && item.name.toLowerCase().includes("little kickers") && (() => {
          const lkVenues = [
            { id: 354, venue: "All Saints Church", area: "Ealing", postcode: "W5 3JJ", days: "Saturdays" },
            { id: 425, venue: "Ark Soane Academy", area: "Acton", postcode: "W3 8EA", days: "Sundays" },
            { id: 426, venue: "Drayton Manor High School", area: "Hanwell", postcode: "W7 1EU", days: "Sat & Sun" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#F0FDF4", borderRadius: 14, padding: "14px 16px", border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 10 }}>⚽ Little Kickers also runs classes at:</div>
              {lkVenues.map(v => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #D1FAE5" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.venue}</div>
                    <div style={{ fontSize: 14, color: "#6B7280" }}>{v.area} · {v.postcode} · {v.days}</div>
                  </div>
                  <span style={{ fontSize: 22, color: "#166534" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}`;

const newCrossLink = `        {/* DB-driven cross-links */}
        {(() => {
          const links = (crossLinks || []).filter(cl => cl.listing_id_a === item.id);
          if (!links.length) return null;
          // Group by label+colors so clusters render as one card
          const groups = {};
          links.forEach(cl => {
            const key = cl.label + cl.color_bg;
            if (!groups[key]) groups[key] = { label: cl.label, emoji: cl.emoji, color_bg: cl.color_bg, color_border: cl.color_border, color_accent: cl.color_accent, items: [] };
            const linked = (allListings||[]).find(l => l.id === cl.listing_id_b);
            if (linked) groups[key].items.push({ id: linked.id, name: linked.name, sub: [linked.day, linked.time, linked.venue].filter(Boolean).join(' · ') });
          });
          return Object.values(groups).map((group, gi) => (
            <div key={gi} style={{ marginBottom: 20, background: group.color_bg, borderRadius: 14, padding: "14px 16px", border: \`1px solid \${group.color_border}\` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: group.color_accent, marginBottom: 10 }}>{group.emoji} {group.label}</div>
              {group.items.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < group.items.length - 1 ? 10 : 0, marginBottom: i < group.items.length - 1 ? 10 : 0, borderBottom: i < group.items.length - 1 ? \`1px solid \${group.color_border}\` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.name}</div>
                    <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                  </div>
                  <span style={{ fontSize: 22, color: group.color_accent }}>→</span>
                </div>
              ))}
            </div>
          ));
        })()}`;

if (!comp.includes(oldJenny)) { console.error("❌ Jenny/Hatha/LK block not found"); process.exit(1); }
comp = comp.replace(oldJenny, newCrossLink);

// 3. Remove Mama & Me hardcoded block (from patch20)
const oldMama = `        {/* Mama & Me – Rosie.Movemama / Buggy Walk cross-link */}
        {item.name && (
          item.name.toLowerCase().includes("mama & me") ||
          item.name.toLowerCase().includes("mama and me") ||
          item.name.toLowerCase().includes("rosie.movemama") ||
          item.name.toLowerCase().includes("buggy walk")
        ) && (() => {
          const rosieListings = [
            { id: 447, emoji: "💪", label: "Mama & Me – Rosie.Movemama", sub: "Mon · Tue · Wed · BSPK Fitness, W13" },
            { id: 409, emoji: "🚶", label: "Ealing Buggy Walk – Northfields to Walpole Park", sub: "Outdoor buggy walk · Northfields to Walpole Park" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#FFF0F6", borderRadius: 14, padding: "14px 16px", border: "1px solid #FBCFE8" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#9D174D", marginBottom: 10 }}>🌸 Also by Rosie:</div>
              {rosieListings.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < rosieListings.length - 1 ? 10 : 0, marginBottom: i < rosieListings.length - 1 ? 10 : 0, borderBottom: i < rosieListings.length - 1 ? "1px solid #FBCFE8" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#9D174D" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Hatha Mama cross-link */}`;
if (comp.includes(oldMama)) {
  comp = comp.replace(oldMama, `        {/* Hatha Mama cross-link */}`);
}

// 4. Remove Tash / Boston Manor hardcoded blocks
const oldTash = `        {/* Tash / Boston Manor cross-links */}
        {item.name && (
          item.name.toLowerCase().includes("toddler woodland adventure") ||
          item.name.toLowerCase().includes("wilder woodlands") ||
          item.name.toLowerCase().includes("help our hedgehogs")
        ) && (() => {
          const tashListings = [
            { id: 435, emoji: "🌿", label: "Toddler Woodland Adventure Club", sub: "Thursdays · £8 · Ages 2–5" },
            { id: 414, emoji: "🌳", label: "Wilder Woodlands – Family Nature Walk", sub: "Boston Manor Park · Free" },
            { id: 417, emoji: "🦔", label: "Help Our Hedgehogs – Wildlife Workshop", sub: "Boston Manor Park · Free" },
          ].filter(v => v.id !== item.id);
          return (
            <div style={{ marginBottom: 20, background: "#F0FDF4", borderRadius: 14, padding: "14px 16px", border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 10 }}>🌿 More from Tash at Boston Manor Park:</div>
              {tashListings.map((v, i) => (
                <div key={v.id} onClick={() => { const other = (allListings||[]).find(l => l.id === v.id); if (other && onSelectListing) onSelectListing(other); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingBottom: i < tashListings.length - 1 ? 10 : 0, marginBottom: i < tashListings.length - 1 ? 10 : 0, borderBottom: i < tashListings.length - 1 ? "1px solid #D1FAE5" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>{v.label}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{v.sub}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#166534" }}>→</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Boston Manor Park play area cross-link — show on all 3 Tash listings */}
        {item.name && (
          item.name.toLowerCase().includes("toddler woodland adventure") ||
          item.name.toLowerCase().includes("wilder woodlands") ||
          item.name.toLowerCase().includes("help our hedgehogs")
        ) && (() => {
          const playArea = (allListings||[]).find(l => l.id === 408);
          if (!playArea) return null;
          return (
            <div onClick={() => onSelectListing && onSelectListing(playArea)} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>🛝</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>Boston Manor Park Children's Play Area</div>
                <div style={{ fontSize: 14, color: "#6B7280" }}>Free · On-site · Great before or after the session</div>
              </div>
              <span style={{ fontSize: 20, color: "#5B2D6E", fontWeight: 800 }}>→</span>
            </div>
          );
        })()}`;

if (!comp.includes(oldTash)) { console.error("❌ Tash block not found"); process.exit(1); }
comp = comp.replace(oldTash, `        {/* cross-links handled by DB-driven block above */}`);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched");

// ─── PATCH App.jsx ──────────────────────────────────────────────────────────
const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// 1. Add crossLinks state
const oldState = `const [tips, setTips] = React.useState({});`;
const newState = `const [tips, setTips] = React.useState({});
  const [crossLinks, setCrossLinks] = React.useState([]);`;
if (!app.includes(oldState)) { console.error("❌ tips state not found in App.jsx"); process.exit(1); }
app = app.replace(oldState, newState);

// 2. Add cross_links fetch to the parallel Promise.all
const oldFetch = `supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),`;
const newFetch = `supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),
          supabase.from("cross_links").select("*"),`;
if (!app.includes(oldFetch)) { console.error("❌ listing_images fetch not found in App.jsx"); process.exit(1); }
app = app.replace(oldFetch, newFetch);

// 3. Destructure the new result
const oldDestructure = `{ data: sd0 },
          { data: tipsData0 },
        ] = await Promise.all([`;
const newDestructure = `{ data: sd0 },
          { data: tipsData0 },
          { data: clData0 },
        ] = await Promise.all([`;
if (!app.includes(oldDestructure)) { console.error("❌ destructure block not found in App.jsx"); process.exit(1); }
app = app.replace(oldDestructure, newDestructure);

// 4. Set crossLinks after fetch
const oldTipsLoad = `const tipsData = tipsData0;`;
const newTipsLoad = `const tipsData = tipsData0;
        if (clData0) setCrossLinks(clData0);`;
if (!app.includes(oldTipsLoad)) { console.error("❌ tipsData line not found in App.jsx"); process.exit(1); }
app = app.replace(oldTipsLoad, newTipsLoad);

// 5. Pass crossLinks into DetailView usage
const oldDV = `allListings={listings}
                onSelectListing={`;
const newDV = `allListings={listings}
                crossLinks={crossLinks}
                onSelectListing={`;
if (!app.includes(oldDV)) { console.error("❌ DetailView allListings prop not found in App.jsx"); process.exit(1); }
app = app.replace(oldDV, newDV);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched");
console.log("✅ patch21 complete — cross-links now fully DB-driven");

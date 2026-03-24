const fs = require("fs");
const path = require("path");

// ── App.jsx ────────────────────────────────────────────────────
const appPath = path.join(__dirname, "src", "App.jsx");
let app = fs.readFileSync(appPath, "utf8");

// 1. Map new fields
const oldMap = `            timetableImage: l.timetable_image || null,    // collapsible timetable image URL`;
const newMap = `            timetableImage: l.timetable_image || null,    // collapsible timetable image URL
            isLocalFavourite: l.is_local_favourite || false,
            localFavouriteSubtitle: l.local_favourite_subtitle || null,
            littlelocalsPrice: l.littlelocals_price || null,
            littlelocalsOfferText: l.littlelocals_offer_text || null,`;

if (!app.includes(oldMap)) { console.error("❌ Could not find map point."); process.exit(1); }
app = app.replace(oldMap, newMap);

// 2. Inject Local Favourite section above the curated homepage sections
const oldSection = `      {/* === CURATED HOMEPAGE SECTIONS (page 1, default view only) === */}`;
const newSection = `      {/* === LOCAL FAVOURITE SECTION === */}
      {page === 1 && !search && !showFavourites && (() => {
        const localFav = (listings || []).filter(l => l.isLocalFavourite && !isExpiredEvent(l))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        if (!localFav) return null;
        const tc = typeColors[localFav.type] || { bg: "#eee", color: "#333" };
        return (
          <div style={{ padding: "0 20px", marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 1000, color: "#111827", letterSpacing: "-0.3px" }}>⭐ Local favourite this week</div>
              <div style={{ fontSize: 14, color: "#D4732A", fontWeight: 600, marginTop: 2 }}>{localFav.localFavouriteSubtitle || "Picked for Ealing parents right now 🧡"}</div>
            </div>
            <div style={{ background: "#F6F3FF", borderRadius: 16, padding: 12 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#5B2D6E", background: "#EDE9FE", padding: "3px 8px", borderRadius: 6 }}>⭐ Local favourite</span>
                {localFav.littlelocalsPrice && <span style={{ fontSize: 12, fontWeight: 800, color: "#7C3AED", background: "#EDE9FE", padding: "3px 8px", borderRadius: 6 }}>💜 LittleLocals price</span>}
              </div>
              <div onClick={() => openDetail(localFav)} style={{ background: "white", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.08)", overflow: "hidden", marginTop: 4, marginBottom: 4 }}>
                {(localFav.images && localFav.images.length > 0 || localFav.logo || localFav.imageUrl) && (
                  <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                    <img src={localFav.images?.[0] || localFav.logo || localFav.imageUrl} alt={localFav.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                  </div>
                )}
                {!(localFav.images && localFav.images.length > 0 || localFav.logo || localFav.imageUrl) && (
                  <div style={{ height: 180, background: \`linear-gradient(135deg, \${tc.bg}, \${tc.bg}cc)\`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{localFav.emoji || "⭐"}</div>
                )}
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{localFav.name}</div>
                  <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 6 }}>{localFav.type}{localFav.ages ? " · " + localFav.ages : ""}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {localFav.price && <span style={{ fontSize: 14, color: "#9CA3AF" }}>Standard price: {localFav.price}</span>}
                    {localFav.littlelocalsPrice && (
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#7C3AED" }}>💜 £{localFav.littlelocalsPrice} LittleLocals price</div>
                        {localFav.littlelocalsOfferText && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{localFav.littlelocalsOfferText}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* === CURATED HOMEPAGE SECTIONS (page 1, default view only) === */}`;

if (!app.includes(oldSection)) { console.error("❌ Could not find section injection point."); process.exit(1); }
app = app.replace(oldSection, newSection);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched.");

// ── components.jsx ─────────────────────────────────────────────
const compPath = path.join(__dirname, "src", "components.jsx");
let comp = fs.readFileSync(compPath, "utf8");

// Inject Local Favourite badge in DetailView after the verified badge block
const oldDetail = `        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}`;

const newDetail = `        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}
        {item.isLocalFavourite && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: item.littlelocalsPrice ? 8 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#5B2D6E", background: "#EDE9FE", padding: "4px 10px", borderRadius: 8 }}>⭐ Local favourite this week</span>
              {item.littlelocalsPrice && <span style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", background: "#EDE9FE", padding: "4px 10px", borderRadius: 8 }}>💜 LittleLocals price</span>}
            </div>
            {item.littlelocalsPrice && (
              <div style={{ background: "#F6F3FF", borderRadius: 12, padding: "10px 14px", marginTop: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#7C3AED" }}>💜 £{item.littlelocalsPrice} LittleLocals price</div>
                {item.littlelocalsOfferText && <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{item.littlelocalsOfferText}</div>}
              </div>
            )}
          </div>
        )}`;

if (!comp.includes(oldDetail)) { console.error("❌ Could not find detail injection point."); process.exit(1); }
comp = comp.replace(oldDetail, newDetail);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched.");
console.log("✅ All patches applied successfully.");

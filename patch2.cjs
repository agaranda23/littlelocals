const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components.jsx");
let src = fs.readFileSync(filePath, "utf8");

const oldStr = `        {item.images && item.images.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>📸 Photos</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
              {item.images.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
              ))}
            </div>
            <div style={{ fontSize: 16, color: "#9CA3AF", marginTop: 4 }}>{item.images.length} photo{item.images.length > 1 ? "s" : ""}</div>
          </div>
        )}`;

const newStr = `        {item.images && item.images.length > 0 && (() => {
          const photos = item.images.filter(u => u && !u.endsWith('.mp4'));
          const videos = item.images.filter(u => u && u.endsWith('.mp4'));
          return (
            <div style={{ marginBottom: 20 }}>
              {photos.length > 0 && (
                <>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>📸 Photos</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
                    {photos.map((src, i) => (
                      <img key={i} src={src} alt="" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 16, color: "#9CA3AF", marginTop: 4 }}>{photos.length} photo{photos.length > 1 ? "s" : ""}</div>
                </>
              )}
              {videos.length > 0 && (
                <div style={{ marginTop: photos.length > 0 ? 16 : 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>🎥 Videos</div>
                  {videos.map((src, i) => (
                    <video key={i} controls preload="none" style={{ width: "100%", borderRadius: 12, marginBottom: 8, display: "block" }}>
                      <source src={src} type="video/mp4" />
                    </video>
                  ))}
                </div>
              )}
            </div>
          );
        })()}`;

if (!src.includes(oldStr)) {
  console.error("❌ Could not find target string. No changes made.");
  process.exit(1);
}

src = src.replace(oldStr, newStr);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

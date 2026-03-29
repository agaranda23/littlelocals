const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old = `                          {(item.logo || (item.images && item.images[0])) && <img src={item.logo || item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: item.logo ? "contain" : "cover", background: item.logo ? "white" : "transparent", padding: item.logo ? 8 : 0, boxSizing: "border-box" }} onError={e => e.target.style.display="none"} />}
                          {!(item.logo || (item.images && item.images[0])) && <span style={{ fontSize: 32, fontWeight: 900, color: tc2.color || "#555", opacity: 0.4 }}>{(item.type || "A").charAt(0)}</span>}`;

const newStr = `                          {(item.images && item.images[0])
                            ? <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                            : item.logo
                            ? <img src={item.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", background: "white", padding: 8, boxSizing: "border-box" }} onError={e => e.target.style.display="none"} />
                            : <span style={{ fontSize: 32, fontWeight: 900, color: tc2.color || "#555", opacity: 0.4 }}>{(item.type || "A").charAt(0)}</span>
                          }
                          {item.logo && (item.images && item.images[0]) && (
                            <div style={{ position: "absolute", bottom: 5, left: 5, background: "white", borderRadius: 6, padding: "2px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                              <img src={item.logo} style={{ width: 18, height: 18, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} />
                            </div>
                          )}`;

if (!app.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
app = app.replace(old, newStr);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch25 applied — card now shows images[0] as main, logo as pill overlay");

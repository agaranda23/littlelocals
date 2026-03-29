const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// Fix pill in carousel (line ~2050)
const old1 = `                            <div style={{ position: "absolute", bottom: 5, left: 5, background: "white", borderRadius: 6, padding: "2px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                              <img src={item.logo} style={{ width: 18, height: 18, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} />
                            </div>`;
const new1 = `                            <div style={{ position: "absolute", bottom: 6, left: 6, background: "white", borderRadius: 8, padding: "3px 6px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                              <img src={item.logo} style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} />
                            </div>`;

// Fix pill in Smart picks carousel (line ~2277)
const old2 = `><img src={item.logo} style={{ width: 18, height: 18, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} /></div>}`;
const new2 = `><img src={item.logo} style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} onError={e => e.target.parentNode.style.display="none"} /></div>}`;

if (!app.includes(old1)) { console.error("❌ Pattern 1 not found"); process.exit(1); }
if (!app.includes(old2)) { console.error("❌ Pattern 2 not found"); process.exit(1); }

app = app.replace(old1, new1);
app = app.replace(old2, new2);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch26 applied — logo pill now 28x28px");

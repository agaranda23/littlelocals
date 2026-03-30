const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

const old = `        {getSuggestion(item) && <div style={{ fontSize: 11, color: "#C4C7CC", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSuggestion(item)}</div>}`;

const newStr = `        {isNew && <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#5B2D6E", background: "#EDE9FE", padding: "2px 7px", borderRadius: 6, marginBottom: 4 }}>✨ Just added in Ealing</div>}
        {getSuggestion(item) && <div style={{ fontSize: 11, color: "#C4C7CC", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSuggestion(item)}</div>}`;

if (!comp.includes(old)) { console.error("❌ Pattern not found"); process.exit(1); }
comp = comp.replace(old, newStr);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch36 applied — Just added badge on new listings");

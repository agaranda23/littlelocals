const fs = require("fs");

const compPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/components.jsx";
let comp = fs.readFileSync(compPath, "utf8");

// 1. Standardise cardSignal badge colours by tier
const oldSignal = `  const cardSignal = (() => {
    if (startsSoon !== null && startsSoon !== undefined) return { text: startsSoon === 0 ? "⏰ Starting now!" : \`⏰ Starts in \${startsSoon} min\`, color: "#fff", bg: "#EF4444" };
    if (item.popular) return { text: "⭐ Popular with local parents", color: "#9CA3AF", bg: "transparent" };
    if (item.freeTrial) return { text: "🎁 Free trial", color: "#166634", bg: "#ECFDF5" };
    return null;
  })();`;

const newSignal = `  const cardSignal = (() => {
    if (startsSoon !== null && startsSoon !== undefined) return { text: startsSoon === 0 ? "⏰ Starting now!" : \`⏰ Starts in \${startsSoon} min\`, color: "#fff", bg: "#EF4444", border: "#EF4444" };
    if (item.popular) return { text: "⭐ Popular with local parents", color: "#92400E", bg: "#FEF3C7", border: "#FDE68A" };
    if (item.freeTrial) return { text: "🎁 Free trial", color: "#166634", bg: "#DCFCE7", border: "#86EFAC" };
    return null;
  })();`;

if (!comp.includes(oldSignal)) { console.error("❌ cardSignal not found"); process.exit(1); }
comp = comp.replace(oldSignal, newSignal);

// 2. Standardise socialProof rendering — gold style
const oldSP = `        {socialProof && <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{socialProof}</div>}`;
const newSP = `        {socialProof && <div style={{ fontSize: 11, color: "#92400E", fontWeight: 600, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: "#FFFBEB", padding: "1px 6px", borderRadius: 5, display: "inline-block" }}>{socialProof}</div>}`;

if (!comp.includes(oldSP)) { console.error("❌ socialProof badge not found"); process.exit(1); }
comp = comp.replace(oldSP, newSP);

// 3. Standardise Just added badge — blue/grey freshness style
const oldJustAdded = `        {isNew && <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#5B2D6E", background: "#EDE9FE", padding: "2px 7px", borderRadius: 6, marginBottom: 4 }}>✨ Just added in Ealing</div>}`;
const newJustAdded = `        {isNew && <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", padding: "2px 7px", borderRadius: 6, marginBottom: 4, border: "1px solid #BFDBFE" }}>✨ Just added</div>}`;

if (!comp.includes(oldJustAdded)) { console.error("❌ Just added badge not found"); process.exit(1); }
comp = comp.replace(oldJustAdded, newJustAdded);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ patch48 applied — trust badge tiers standardised");

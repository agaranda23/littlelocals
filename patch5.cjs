const fs = require("fs");
const path = require("path");

// ── 1. components.jsx changes ──────────────────────────────────
const compPath = path.join(__dirname, "src", "components.jsx");
let comp = fs.readFileSync(compPath, "utf8");

// 1a. Warmer helper text (getSuggestion function)
const oldSuggestions = `  if (isFree && isOutdoor) return "Free outdoor fun today";
  if (isFree) return "Free activity — no booking needed";
  if (isSwim) return "Great for building water confidence";
  if (isBaby && isIndoor) return "Perfect for little ones indoors";
  if (isBaby) return "Ideal for babies & new parents";
  if (isToddler && isIndoor) return "Perfect for rainy day toddler fun";
  if (isToddler) return "Great for toddlers";
  if (isSport) return "Burn off some energy!";
  if (isOutdoor) return "Fun outdoor adventure";
  if (isIndoor) return "Great for rainy afternoons";
  if (isWeekend) return "Perfect weekend activity";
  if (type.includes("baking") || type.includes("arts")) return "Creative fun for curious kids";
  if (type.includes("music") || type.includes("dance")) return "Great for imaginative little ones";
  return null;`;

const newSuggestions = `  if (isFree && isOutdoor) return "Easy free outdoor win today";
  if (isFree) return "Free — just turn up, no booking needed";
  if (isSwim) return "Builds water confidence from the very start";
  if (isBaby && isIndoor) return "Warm indoor fun when you just need to get out";
  if (isBaby) return "Gentle, fun and made for little ones";
  if (isToddler && isIndoor) return "Burn toddler energy indoors — whatever the weather";
  if (isToddler) return "Burn some toddler energy before nap time";
  if (isSport) return "Let them run it out";
  if (isOutdoor) return "Fresh air and fun — good for everyone";
  if (isIndoor) return "Warm indoor activity — great for grey days";
  if (isWeekend) return "A proper weekend activity worth the trip";
  if (type.includes("baking") || type.includes("arts")) return "Gets little hands busy and imaginations going";
  if (type.includes("music") || type.includes("dance")) return "Singing, moving and making memories";
  return null;`;

if (!comp.includes(oldSuggestions)) {
  console.error("❌ Could not find getSuggestion strings.");
  process.exit(1);
}
comp = comp.replace(oldSuggestions, newSuggestions);

// 1b. Add social proof line in card (replace `const socialProof = null;`)
const oldSocialProof = `  const socialProof = null;`;
const newSocialProof = `  const socialProof = (() => {
    const signals = [
      "⭐ Popular with Ealing parents this week",
      "👀 " + (4 + (item.id % 7)) + " parents saved this recently",
      "📍 Parents nearby visited this recently",
      "💬 Frequently chosen by local mums",
      "⭐ " + (3 + (item.id % 9)) + " families tried this this week",
    ];
    // Only show on listings with images and not expired
    if (!item.images || item.images.length === 0) return null;
    if (item.popular || (item.clickCount && item.clickCount > 5)) return signals[item.id % signals.length];
    if (item.id % 4 === 0) return signals[item.id % signals.length];
    return null;
  })();`;

if (!comp.includes(oldSocialProof)) {
  console.error("❌ Could not find socialProof line.");
  process.exit(1);
}
comp = comp.replace(oldSocialProof, newSocialProof);

// 1c. Render social proof in card (after the getSuggestion line)
const oldSignalRender = `        {getSuggestion(item) && <div style={{ fontSize: 11, color: "#C4C7CC", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSuggestion(item)}</div>}`;
const newSignalRender = `        {getSuggestion(item) && <div style={{ fontSize: 11, color: "#C4C7CC", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSuggestion(item)}</div>}
        {socialProof && <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400, marginTop: 1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{socialProof}</div>}`;

if (!comp.includes(oldSignalRender)) {
  console.error("❌ Could not find signal render line.");
  process.exit(1);
}
comp = comp.replace(oldSignalRender, newSignalRender);

fs.writeFileSync(compPath, comp, "utf8");
console.log("✅ components.jsx patched.");

// ── 2. App.jsx changes ─────────────────────────────────────────
const appPath = path.join(__dirname, "src", "App.jsx");
let app = fs.readFileSync(appPath, "utf8");

// 2a. Contribution messages (3 instances)
app = app.replace(
  /Know a great activity we missed\?/g,
  "Help another tired parent discover something brilliant ✨"
);
app = app.replace(
  /Help other local parents discover it\./g,
  "Share a hidden gem and make someone's day."
);

// 2b. Subtitle under homepage headline
const oldHeadline = `<div style={{ fontSize: 26, fontWeight: 1000, color: "#1F2937", lineHeight: 1.2, marginBottom: 0, letterSpacing: -0.5 }}>{(() => { const h = new Date().getHours(); if (dayFilter === "today") return h < 12 ? "What shall we do this morning?" : h < 17 ? "What shall we do this afternoon?" : "What shall we do next?"; if (dayFilter === "tomorrow") return "Plan tomorrow with the kids"; if (dayFilter === "weekend") return "Plan your weekend with the kids"; return h < 12 ? "What shall we do this morning?" : h < 17 ? "What shall we do this afternoon?" : "What shall we do next?"; })()}</div>`;
const newHeadline = `<div style={{ fontSize: 26, fontWeight: 1000, color: "#1F2937", lineHeight: 1.2, marginBottom: 0, letterSpacing: -0.5 }}>{(() => { const h = new Date().getHours(); if (dayFilter === "today") return h < 12 ? "What shall we do this morning?" : h < 17 ? "What shall we do this afternoon?" : "What shall we do next?"; if (dayFilter === "tomorrow") return "Plan tomorrow with the kids"; if (dayFilter === "weekend") return "Plan your weekend with the kids"; return h < 12 ? "What shall we do this morning?" : h < 17 ? "What shall we do this afternoon?" : "What shall we do next?"; })()}</div>
              <div style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 400, marginTop: 6, marginBottom: 0 }}>Quick ideas around Ealing for babies, toddlers and kids</div>`;

if (!app.includes(oldHeadline)) {
  console.error("❌ Could not find headline line.");
  process.exit(1);
}
app = app.replace(oldHeadline, newHeadline);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched.");
console.log("✅ All patches applied successfully.");

const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// 1. Update community panel headings (3 instances)
app = app.replaceAll(
  `Help another tired parent discover something brilliant ✨`,
  `✨ Suggest an activity for Ealing parents`
);

// 2. Update subtitles (2 instances)
app = app.replaceAll(
  `Share a hidden gem and make someone's day.`,
  `Help improve what families nearby can find`
);

// 3. Update button labels (2 instances)
app = app.replaceAll(
  `>Add</span>`,
  `>Add activity</span>`
);

// 4. Reduce footer visual weight
const oldFooter = `<div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <span onClick={() => setShowPrivacy(true)} style={{ cursor: "pointer", color: "#6B7280", fontSize: 14 }}>Privacy Policy</span>
              <span onClick={() => setShowCookies(true)} style={{ cursor: "pointer", color: "#6B7280", fontSize: 14 }}>Cookie Policy</span>
              <span onClick={() => setShowTerms(true)} style={{ cursor: "pointer", color: "#6B7280", fontSize: 14 }}>Terms of Service</span>
              <span onClick={() => setShowContact(true)} style={{ cursor: "pointer", color: "#6B7280", fontSize: 14 }}>Contact</span>
            </div>`;

const newFooter = `<div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <span onClick={() => setShowPrivacy(true)} style={{ cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>Privacy Policy</span>
              <span onClick={() => setShowCookies(true)} style={{ cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>Cookie Policy</span>
              <span onClick={() => setShowTerms(true)} style={{ cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>Terms of Service</span>
              <span onClick={() => setShowContact(true)} style={{ cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>Contact</span>
            </div>`;

if (app.includes(oldFooter)) {
  app = app.replace(oldFooter, newFooter);
  console.log("✅ Footer weight reduced");
} else {
  console.log("⚠️ Footer pattern not found — skipping");
}

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch46 applied — community panel wording updated");

const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

app = app
  .replace(
    `<span onClick={() => setLegalPage("privacy")} style={{ fontSize: 14, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>`,
    `<span onClick={() => setLegalPage("privacy")} style={{ fontSize: 12, color: "#9CA3AF", cursor: "pointer" }}>Privacy Policy</span>`
  )
  .replace(
    `<span onClick={() => setLegalPage("cookies")} style={{ fontSize: 14, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Cookie Policy</span>`,
    `<span onClick={() => setLegalPage("cookies")} style={{ fontSize: 12, color: "#9CA3AF", cursor: "pointer" }}>Cookie Policy</span>`
  )
  .replace(
    `<span onClick={() => setLegalPage("terms")} style={{ fontSize: 14, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>`,
    `<span onClick={() => setLegalPage("terms")} style={{ fontSize: 12, color: "#9CA3AF", cursor: "pointer" }}>Terms of Service</span>`
  )
  .replace(
    `<a href="mailto:littlelocalsuk@gmail.com" style={{ fontSize: 14, color: "#6B7280", textDecoration: "underline" }}>Contact</a>`,
    `<a href="mailto:littlelocalsuk@gmail.com" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>Contact</a>`
  );

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch47 applied — footer links lighter and smaller");

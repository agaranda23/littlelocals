const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const old1 = `const ealingBorough = ["Ealing", "Hanwell", "West Ealing", "North Ealing", "South Ealing", "Hanger Hill", "Northfields", "Pitshanger", "Perivale", "Acton", "Chiswick"];`;
const new1 = `const ealingBorough = ["Ealing", "Hanwell", "West Ealing", "North Ealing", "South Ealing", "Hanger Hill", "Northfields", "Pitshanger", "Perivale", "Acton", "Chiswick", "Greenford", "Northolt", "Southall", "Yeading", "Hayes"];`;

const old2 = `const ealingBorough = ["Ealing","Hanwell","West Ealing","North Ealing","South Ealing","Hanger Hill","Northfields","Pitshanger","Perivale","Acton","Chiswick"];`;
const new2 = `const ealingBorough = ["Ealing","Hanwell","West Ealing","North Ealing","South Ealing","Hanger Hill","Northfields","Pitshanger","Perivale","Acton","Chiswick","Greenford","Northolt","Southall","Yeading","Hayes"];`;

if (!app.includes(old1)) { console.error("❌ Pattern 1 not found"); process.exit(1); }
if (!app.includes(old2)) { console.error("❌ Pattern 2 not found"); process.exit(1); }

app = app.replace(old1, new1);
app = app.replace(old2, new2);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch30 applied — Greenford, Northolt, Southall added to Ealing borough filter");

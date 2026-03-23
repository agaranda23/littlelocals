const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "App.jsx");
let src = fs.readFileSync(filePath, "utf8");

const old1 = `const ealingBorough = ["Ealing", "Hanwell", "West Ealing", "North Ealing", "South Ealing", "Hanger Hill", "Northfields", "Pitshanger", "Perivale"];`;
const new1 = `const ealingBorough = ["Ealing", "Hanwell", "West Ealing", "North Ealing", "South Ealing", "Hanger Hill", "Northfields", "Pitshanger", "Perivale", "Acton", "Chiswick"];`;

const old2 = `const ealingBorough = ["Ealing","Hanwell","West Ealing","North Ealing","South Ealing","Hanger Hill","Northfields","Pitshanger","Perivale"];`;
const new2 = `const ealingBorough = ["Ealing","Hanwell","West Ealing","North Ealing","South Ealing","Hanger Hill","Northfields","Pitshanger","Perivale","Acton","Chiswick"];`;

if (!src.includes(old1) || !src.includes(old2)) {
  console.error("❌ Could not find ealingBorough arrays.");
  process.exit(1);
}

src = src.replace(old1, new1).replace(old2, new2);
fs.writeFileSync(filePath, src, "utf8");
console.log("✅ Patch applied successfully.");

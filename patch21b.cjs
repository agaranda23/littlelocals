const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

// 1. Add crossLinks state
const oldState = `const [tips, setTips] = useState({});`;
const newState = `const [tips, setTips] = useState({});
  const [crossLinks, setCrossLinks] = useState([]);`;
if (!app.includes(oldState)) { console.error("❌ tips state not found"); process.exit(1); }
app = app.replace(oldState, newState);

// 2. Add cross_links to Promise.all fetch
const oldFetch = `supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),`;
const newFetch = `supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),
          supabase.from("cross_links").select("*"),`;
if (!app.includes(oldFetch)) { console.error("❌ listing_images fetch not found"); process.exit(1); }
app = app.replace(oldFetch, newFetch);

// 3. Destructure the new result
const oldDestructure = `          { data: tipsData0 },\n        ] = await Promise.all([`;
const newDestructure = `          { data: tipsData0 },\n          { data: clData0 },\n        ] = await Promise.all([`;
if (!app.includes(oldDestructure)) { console.error("❌ destructure block not found"); process.exit(1); }
app = app.replace(oldDestructure, newDestructure);

// 4. Set crossLinks after fetch
const oldTipsLoad = `const tipsData = tipsData0;`;
const newTipsLoad = `const tipsData = tipsData0;
        if (clData0) setCrossLinks(clData0);`;
if (!app.includes(oldTipsLoad)) { console.error("❌ tipsData line not found"); process.exit(1); }
app = app.replace(oldTipsLoad, newTipsLoad);

// 5. Pass crossLinks into DetailView
const oldDV = `allListings={listings} onSelectListing={openDetail}`;
const newDV = `allListings={listings} crossLinks={crossLinks} onSelectListing={openDetail}`;
if (!app.includes(oldDV)) { console.error("❌ DetailView allListings prop not found"); process.exit(1); }
app = app.replace(oldDV, newDV);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ App.jsx patched — crossLinks state, fetch, and prop added");
console.log("✅ patch21b complete — cross-links fully DB-driven");

const fs = require("fs");

const appPath = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");

const oldBlock = `          supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),
          supabase.from("cross_links").select("*"),
          supabase.from("reviews").select("*").order("created_at", { ascending: false }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),`;

const newBlock = `          supabase.from("listing_images").select("listing_id,url,sort_order").order("sort_order", { ascending: true }),
          supabase.from("reviews").select("*").order("created_at", { ascending: false }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          supabase.from("cross_links").select("*"),`;

if (!app.includes(oldBlock)) { console.error("❌ Promise.all block not found"); process.exit(1); }
app = app.replace(oldBlock, newBlock);

fs.writeFileSync(appPath, app, "utf8");
console.log("✅ patch22 applied — Promise.all order fixed");

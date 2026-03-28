const fs = require("fs");
const path = "/Users/alanaranda/Desktop/littlelocals-vite/src/App.jsx";
let src = fs.readFileSync(path, "utf8");

// Move the localStorage cache save to AFTER images are attached
const old = `          setListings(prev => prev.map(l => ({ ...l, images: imgMap[l.id] || [] })));
        }
          try { localStorage.setItem("ll_listings_cache", JSON.stringify(ld)); } catch(e) {}`;

const fixed = `          const withImages = prev => prev.map(l => ({ ...l, images: imgMap[l.id] || [] }));
          setListings(withImages);
          // Cache AFTER images are attached
          try {
            const cached = ld.map(l => ({ ...l, images: imgMap[l.id] || [] }));
            localStorage.setItem("ll_listings_cache", JSON.stringify(cached));
          } catch(e) {}
        }`;

if (!src.includes(old)) {
  console.error("❌ Pattern not found — check App.jsx hasn't changed");
  process.exit(1);
}

src = src.replace(old, fixed);
fs.writeFileSync(path, src, "utf8");
console.log("✅ patch19 applied — localStorage cache now saved after images are attached");

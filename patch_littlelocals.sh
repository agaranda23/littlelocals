#!/bin/bash
# LITTLElocals multi-image patch
# Run from: ~/Desktop/littlelocals-vite

set -e
cd ~/Desktop/littlelocals-vite

echo "✅ Patching components.jsx..."

# ---- PATCH 1: ListingCard thumbnail — show first image from images[] array ----
# Replace the single imageUrl img tag with one that checks images[] first, plus a count badge

python3 - << 'PYEOF'
import re

with open("src/components.jsx", "r") as f:
    content = f.read()

# Patch 1a: ListingCard thumbnail
old = '{item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: "78%", height: "78%", objectFit: "cover", position: "absolute", top: "11%", left: "11%", zIndex: 4, borderRadius: "50%" }} onError={(e) => { e.target.style.display = "none"; }} />}'
new = '''{(item.images && item.images.length > 0 ? item.images[0] : item.imageUrl) && (
          <img
            src={item.images && item.images.length > 0 ? item.images[0] : item.imageUrl}
            alt=""
            style={{ width: "78%", height: "78%", objectFit: "cover", position: "absolute", top: "11%", left: "11%", zIndex: 4, borderRadius: "50%" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        {item.images && item.images.length > 1 && (
          <div style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 4, zIndex: 6 }}>
            +{item.images.length - 1}
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    print("  ✓ ListingCard thumbnail patched")
else:
    print("  ⚠️  ListingCard thumbnail — pattern not found, skipping")

# Patch 1b: DetailView hero image — use images[0] if available
old2 = '{item.imageUrl && <img src={item.imageUrl} alt="" style={{ position: "absolute", zIndex: 3, width: 88, height: 88, objectFit: "cover", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.06)", border: "none" }} onError={(e) => { e.target.style.display = "none"; }} />}'
new2 = '''{(item.images && item.images.length > 0 ? item.images[0] : item.imageUrl) && (
        <img src={item.images && item.images.length > 0 ? item.images[0] : item.imageUrl} alt="" style={{ position: "absolute", zIndex: 3, width: 88, height: 88, objectFit: "cover", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.06)", border: "none" }} onError={(e) => { e.target.style.display = "none"; }} />
        )}'''

if old2 in content:
    content = content.replace(old2, new2)
    print("  ✓ DetailView hero image patched")
else:
    print("  ⚠️  DetailView hero image — pattern not found, skipping")

# Patch 1c: Insert gallery after description paragraph
old3 = '<p style={{ fontSize: 13, lineHeight: 1.7, color: "#4B5563", marginBottom: 16 }}>{item.description}</p>'
new3 = '''<p style={{ fontSize: 13, lineHeight: 1.7, color: "#4B5563", marginBottom: 16 }}>{item.description}</p>

        {/* Generic photo gallery from listing_images */}
        {item.images && item.images.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>📸 Photos</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
              {item.images.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>{item.images.length} photo{item.images.length > 1 ? "s" : ""}</div>
          </div>
        )}'''

if old3 in content:
    content = content.replace(old3, new3)
    print("  ✓ DetailView gallery inserted")
else:
    print("  ⚠️  DetailView gallery — description paragraph not found, skipping")

with open("src/components.jsx", "w") as f:
    f.write(content)

print("  Done with components.jsx")
PYEOF

echo ""
echo "✅ Patching App.jsx..."

python3 - << 'PYEOF'
with open("src/App.jsx", "r") as f:
    content = f.read()

# Helper: the listing mapper function (used multiple times)
# We'll insert the listing_images fetch after EACH setListings(ld.map(...)) call
# The safe anchor is the localStorage.setItem line that follows the main fetch

img_fetch = '''
        // Fetch listing_images and attach to listings
        const { data: imgData } = await supabase.from("listing_images").select("*").order("sort_order", { ascending: true });
        if (imgData && imgData.length > 0) {
          const imgMap = {};
          imgData.forEach(img => {
            if (!imgMap[img.listing_id]) imgMap[img.listing_id] = [];
            imgMap[img.listing_id].push(img.url);
          });
          setListings(prev => prev.map(l => ({ ...l, images: imgMap[l.id] || [] })));
        }'''

# Anchor 1: main Supabase load — after setListings, before localStorage.setItem("ll_listings_cache"
anchor1 = '          try { localStorage.setItem("ll_listings_cache", JSON.stringify(ld)); } catch(e) {}'
if anchor1 in content and img_fetch not in content:
    content = content.replace(anchor1, img_fetch + "\n" + anchor1)
    print("  ✓ App.jsx main fetch patched")
else:
    print("  ⚠️  App.jsx main fetch anchor not found or already patched")

# Anchor 2: refreshData function — after setListings in refreshData
# The refreshData setListings is followed by the reviews fetch
refresh_anchor = '      const { data: rd } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });\n      if (rd) setReviews'
refresh_img = '''      // Refresh listing_images
      const { data: imgData2 } = await supabase.from("listing_images").select("*").order("sort_order", { ascending: true });
      if (imgData2 && imgData2.length > 0) {
        const imgMap2 = {};
        imgData2.forEach(img => {
          if (!imgMap2[img.listing_id]) imgMap2[img.listing_id] = [];
          imgMap2[img.listing_id].push(img.url);
        });
        setListings(prev => prev.map(l => ({ ...l, images: imgMap2[l.id] || [] })));
      }
      '''

if refresh_anchor in content and 'imgData2' not in content:
    content = content.replace(refresh_anchor, refresh_img + refresh_anchor)
    print("  ✓ App.jsx refreshData patched")
else:
    print("  ⚠️  App.jsx refreshData anchor not found or already patched")

with open("src/App.jsx", "w") as f:
    f.write(content)

print("  Done with App.jsx")
PYEOF

echo ""
echo "✅ Copying new Admin.jsx..."
# Admin.jsx is written separately - copy from wherever you saved it
# (The user will paste it directly)

echo ""
echo "🎉 All patches applied!"
echo ""
echo "Now run:"
echo "  npm run build && git add -A && git commit -m 'feat: multi-image gallery' && git push"

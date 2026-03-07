import React, { useState, useEffect, useRef } from "react";
import { typeColors, dayMap } from "./typeColors.jsx";
import { sceneIllustrations, getDistanceMiles } from "./utils.jsx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function BrandBear({ size = 38 }) {
  return (
    <img src="/bear-logo.png" alt="LITTLElocals" style={{ width: size, height: size, borderRadius: size * 0.2, objectFit: "cover" }} />
  );
}

export function SceneBg({ type, w, h }) {
  const renderer = sceneIllustrations[type];
  return renderer ? renderer(w, h) : null;
}

export function isOnToday(item) {
  const today = new Date().getDay();
  const days = dayMap[item.day];
  return days ? days.includes(today) : true;
}

export function isOnDay(item, dayNum) {
  if (dayNum === -1) return true; // "All Days"
  const days = dayMap[item.day];
  return days ? days.includes(dayNum) : true;
}

export function shareWhatsApp(item) {
  var e = function(c) { return String.fromCodePoint(c); };
  var bear = e(0x1F9F8);
  var pin = e(0x1F4CD);
  var cal = e(0x1F4C5);
  var heart = e(0x1F9E1);
  var down = e(0x1F447);
  var dot = e(0x00B7);
  var link = window.location.href;
  var text = "Check out " + item.name + "! " + bear + "\n\n" + item.type + " " + dot + " " + item.ages + " " + dot + " " + item.price + "\n" + pin + " " + item.venue + "\n" + cal + " " + item.day + " " + item.time + "\n\n" + item.description.slice(0,120) + "...\n\nFound on LITTLElocals " + heart + "\nDiscover more activities for your little ones " + down + "\n" + link;
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
}

export function MapView({ filtered, userLoc, onSelect, areaFilter }) {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  
  const areaCenters = {
    "Ealing": [51.5139, -0.3048],
    "Ruislip": [51.5714, -0.4213],
    "Eastcote": [51.5762, -0.3962],
    "Uxbridge": [51.5461, -0.4761],
    "Hanwell": [51.5092, -0.3400],
    "Northfields": [51.4998, -0.3170],
    "Acton": [51.5095, -0.2713],
    "Chiswick": [51.4924, -0.2578],
    "Greenford": [51.5297, -0.3456],
  };

  useEffect(function() {
    if (!mapRef.current) return;
    var cancelled = false;
    var timer = setTimeout(function() {
      if (cancelled || !mapRef.current) return;
      try {
        if (mapObjRef.current) {
          try { mapObjRef.current.remove(); } catch(e) {}
          mapObjRef.current = null;
        }
        var el = mapRef.current;
        if (el._leaflet_id) {
          delete el._leaflet_id;
          el.innerHTML = "";
        }
        var center = userLoc ? [userLoc.lat, userLoc.lng] : (areaCenters[areaFilter] || [51.5139, -0.3048]);
        var zoom = userLoc ? 13 : (areaFilter && areaFilter !== "All Areas" ? 13 : 10);
        var map = L.map(el, { zoomControl: false }).setView(center, zoom);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "" }).addTo(map);
        if (userLoc) {
          var youIcon = L.divIcon({ className: "", html: "<div style='width:14px;height:14px;background:#F97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)'></div>", iconSize: [20, 20], iconAnchor: [10, 10] });
          L.marker([userLoc.lat, userLoc.lng], { icon: youIcon }).addTo(map).bindPopup("<b>You are here</b>");
        }
        var bounds = [];
        filtered.forEach(function(item) {
          if (!item.lat || !item.lng) return;
          var pinIcon = L.divIcon({ className: "", html: "<div style='width:24px;height:24px;border-radius:50%;background:#6B4EFF;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)'>" + (idx + 1) + "</div>", iconSize: [24, 24], iconAnchor: [12, 24] });
          var marker = L.marker([item.lat, item.lng], { icon: pinIcon }).addTo(map);
          var dist = userLoc ? (Math.sqrt(Math.pow((item.lat - userLoc.lat) * 111, 2) + Math.pow((item.lng - userLoc.lng) * 111 * Math.cos(userLoc.lat * Math.PI / 180), 2))).toFixed(1) : null;
          var postcode = item.venue ? item.venue.match(/[A-Z]{1,2}\d[\dA-Z]?\s?\d[A-Z]{2}/i) : null;
          var locLine = postcode ? postcode[0] : (item.venue || "");
          var popupHtml = "<div style='min-width:150px;font-family:system-ui,sans-serif'>" +
            "<div style='font-size:13px;font-weight:700;color:#1F2937;margin-bottom:4px'>" + item.name + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + item.type + " - " + (item.ages || "") + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + (item.day || "") + " " + (item.time || "") + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + locLine + "</div>" +
            (dist ? "<div style='font-size:10px;color:#F97316;font-weight:600;margin-bottom:2px'>" + dist + " km away</div>" : "") +
            "<div style='font-size:11px;font-weight:700;color:#1F2937;margin-bottom:5px'>" + (item.price || "") + "</div>" +
            "<div id='ll-map-" + item.id + "' style='font-size:11px;color:white;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#F97316,#FB923C);padding:6px 10px;border-radius:8px;text-align:center'>View details →</div>" +
            "</div>";
          marker.bindPopup(popupHtml);
          marker.on("popupopen", function() {
            var link = document.getElementById("ll-map-" + item.id);
            if (link) link.onclick = function() { onSelect(item); };
          });
          bounds.push([item.lat, item.lng]);
        });
        if (userLoc) bounds.push([userLoc.lat, userLoc.lng]);
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        else if (bounds.length === 1) map.setView(bounds[0], 14);
        mapObjRef.current = map;
        setTimeout(function() { if (map && map._container) map.invalidateSize(); }, 300);
      } catch(e) { console.error("Map error:", e); }
    }, 100);
    return function() {
      cancelled = true;
      clearTimeout(timer);
      try { if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null; } } catch(e) {}
    };
  }, [filtered.length, userLoc, areaFilter]);

  return <div ref={mapRef} style={{ height: 380, borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }} />;
}

export function ListingCard({ item, onSelect, userLoc, isFav, onToggleFav, isNew, reviews, areaFilter, isSunny, onTrackClick, clickCount }) {
  const tc = typeColors[item.type] || { bg: "#eee", color: "#333" };
  const areaCenters = { "Ealing": { lat: 51.5139, lng: -0.3048 }, "Ruislip": { lat: 51.5714, lng: -0.4213 }, "Eastcote": { lat: 51.5762, lng: -0.3962 }, "Uxbridge": { lat: 51.5461, lng: -0.4761 } };
  const locRef = userLoc || areaCenters[areaFilter] || null;
  const dist = locRef ? getDistanceMiles(locRef.lat, locRef.lng, item.lat, item.lng) : null;
  const walkMin = dist !== null ? Math.round(dist * 20) : null;
  const onToday = isOnToday(item);
  
  // Status badge — smarter real-time
  const getStatus = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const nowMins = h * 60 + m;
    if (!onToday) {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const tDay = tomorrow.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
      const itemDays = (item.day || "").toLowerCase();
      if (itemDays.includes(tDay) || itemDays.includes("daily")) return "📅 Tomorrow";
      return null;
    }
    const timeStr = (item.time || "").trim();
    if (!timeStr) return "On today";
    // Parse start time
    const startMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
    if (!startMatch) return "On today";
    let startH = parseInt(startMatch[1]);
    const startM = parseInt(startMatch[2] || "0");
    const startAmpm = (startMatch[3] || "").toLowerCase();
    if (startAmpm === "pm" && startH < 12) startH += 12;
    if (startAmpm === "am" && startH === 12) startH = 0;
    const startMins = startH * 60 + startM;
    // Parse end time
    const endMatch = timeStr.match(/[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
    let endH = null, endM = 0, endMins = null;
    if (endMatch) {
      endH = parseInt(endMatch[1]);
      endM = parseInt(endMatch[2] || "0");
      const endAmpm = (endMatch[3] || "").toLowerCase();
      if (endAmpm === "pm" && endH < 12) endH += 12;
      if (endAmpm === "am" && endH === 12) endH = 0;
      endMins = endH * 60 + endM;
    }
    const fmtTime = (hr, mn) => `${hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr)}:${String(mn).padStart(2, "0")}${hr >= 12 ? "pm" : "am"}`;
    // Currently open
    if (endMins !== null && nowMins >= startMins && nowMins < endMins) {
      const left = endMins - nowMins;
      if (left <= 30) return `⏰ Closes at ${fmtTime(endH, endM)}`;
      return "Open now";
    }
    // Before start time
    if (nowMins < startMins) {
      const diff = startMins - nowMins;
      if (diff <= 60) return `Starts in ${diff} min${diff !== 1 ? "s" : ""}`;
      return `Opens at ${fmtTime(startH, startM)}`;
    }
    // After end time or no end time but after start
    if (endMins !== null && nowMins >= endMins) return null;
    return "On today";
  };
  const status = getStatus();
  
  const handleClick = () => { if (onTrackClick) onTrackClick(item.id); onSelect(item); };
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 18, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)", border: "1px solid #E5E7EB", transition: "box-shadow 0.18s ease" }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div onClick={handleClick} style={{ width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg, ${tc.bg}, ${tc.bg}dd)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <SceneBg type={item.type} w={64} h={64} />
          <span style={{ position: "relative", zIndex: 2, fontSize: 22, fontWeight: 800, color: tc.color || "#333" }}>{(item.type || "A").charAt(0)}</span>
          {(item.logo || (item.images && item.images.length > 0 ? item.images[0] : item.imageUrl)) && (
          <img
            src={item.logo || (item.images && item.images.length > 0 ? item.images[0] : item.imageUrl)}
            alt=""
            style={{ width: "78%", height: "78%", objectFit: "cover", position: "absolute", top: "11%", left: "11%", zIndex: 4, borderRadius: "50%" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        {item.images && item.images.length > 1 && (
          <div style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 4, zIndex: 6 }}>
            +{item.images.length - 1}
          </div>
        )}
          {onToday && <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#166534", borderRadius: "0 12px 0 6px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}><span style={{ fontSize: 7, color: "white" }}>✓</span></div>}
        </div>
        <div onClick={handleClick} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#222222", lineHeight: 1.3 }}>{item.name}</span>
            {isNew && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#F97316", color: "white", flexShrink: 0, letterSpacing: 0.3 }}>NEW</span>}
          </div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.4, marginBottom: 3 }}>{item.type} · {item.ages} · {item.day}</div>
          <div style={{ fontSize: 13, color: "#4B5563", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {item.venue.split(",")[0]}, {item.location}
            {areaFilter && areaFilter !== "All Areas" && !item.location.includes(areaFilter) && <span style={{ fontSize: 10, fontWeight: 600, color: "#6B4EFF", background: "#F3F0FF", padding: "1px 6px", borderRadius: 4, marginLeft: 4 }}>{item.location}</span>}
            {walkMin !== null && walkMin < 60 && <span style={{ color: "#F97316", fontWeight: 600 }}>· {walkMin < 2 ? "Nearby" : "" + walkMin + " min walk"}</span>}
          </div>
          {status && <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, marginTop: 4, padding: "2px 8px", borderRadius: 6, color: status.includes("Open now") ? "#166534" : status.includes("Closes") ? "#92400E" : status.includes("Opens") || status.includes("Starts") ? "#92400E" : "#4B5563", background: status.includes("Open now") ? "#DCFCE7" : status.includes("Closes") ? "#FEF3C7" : status.includes("Opens") || status.includes("Starts") ? "#FEF3C7" : "transparent" }}>{status}</span>}
          {item.freeTrial && <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, marginTop: 4, padding: "2px 8px", borderRadius: 6, color: "#166534", background: "#DCFCE7" }}>Free trial available</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0, paddingTop: 2 }}>
          <span onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }} style={{ fontSize: 22, cursor: "pointer", lineHeight: 1, transition: "transform 0.15s", transform: isFav ? "scale(1.1)" : "scale(1)", minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center", color: isFav ? "#6B4EFF" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, background: item.free ? "#DCFCE7" : "#FFF7ED", color: item.free ? "#166534" : "#9A3412" }}>{item.price}</span>
        </div>
      </div>
      {(() => {
        const badges = [];
        // "You saved this" — only if saved, and only once (heart already shows in top right)
        if (isFav) badges.push(<span key="saved" style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: "#F3F0FF", color: "#6B4EFF", borderRadius: 6 }}>Saved</span>);
        // Activity signal — time-based copy where possible
        if (item.verified && badges.length < 2) {
          const clicks = clickCount || 0;
          let signal;
          if (clicks >= 8) signal = { text: "🔥 Popular with Ealing parents this week", color: "#92400E", bg: "#FEF3C7" };
          else if (clicks >= 3) signal = { text: "👀 Parents viewed this recently", color: "#4B5563", bg: "#F3F4F6" };
          else {
            const saveCount = clicks + (item.popular ? 5 : 2);
            signal = saveCount > 3
              ? { text: `🧡 ${saveCount} parents saved this`, color: "#4B5563", bg: "#F3F4F6" }
              : { text: "💛 Loved by local parents", color: "#4B5563", bg: "#F3F4F6" };
          }
          badges.push(<span key="loved" style={{ fontSize: 10, color: signal.color, fontWeight: 600, padding: "2px 8px", background: signal.bg, borderRadius: 6 }}>{signal.text}</span>);
        }
        // Review score
        const reviewBadge = (() => { const r = reviews.filter(rv => rv.listingId === item.id); if (r.length === 0 || badges.length >= 2) return null; const avg = (r.reduce((s, rv) => s + rv.rating, 0) / r.length).toFixed(1); return <span key="rev" style={{ fontSize: 10, color: "#92400E" }}>★ {avg} ({r.length})</span>; })();
        if (reviewBadge) badges.push(reviewBadge);
        if (badges.length === 0) return null;
        return (
          <div style={{ display: "flex", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid #F3F4F6", flexWrap: "wrap" }}>
            {badges.slice(0, 2)}
          </div>
        );
      })()}
    </div>
  );
}

const parkingLabels = { free: "🅿️ Free parking", "free-3hrs": "🅿️ Free (3hrs)", paid: "🅿️ Paid parking", street: "🅿️ Street parking", varies: "🅿️ Parking varies", none: "🚫 No parking" };

export function DetailView({ item, onBack, userLoc, reviews, onAddReview, isFav, onToggleFav, onAddToCalendar, onRemoveFromCalendar, calendarPlan, isVisited, onToggleVisited }) {
  const tc = typeColors[item.type] || { bg: "#eee", color: "#333" };
  const dist = userLoc ? getDistanceMiles(userLoc.lat, userLoc.lng, item.lat, item.lng) : null;
  const itemReviews = reviews.filter(r => r.listingId === item.id);
  const avgRating = itemReviews.length > 0 ? (itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length).toFixed(1) : null;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const openExternalWebsite = (url) => { if (!url) return; let safeUrl = url.trim(); if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) safeUrl = "https://" + safeUrl; window.open(safeUrl, "_blank", "noopener,noreferrer"); };
  const getHostname = (url) => { try { const safe = url.startsWith("http") ? url : "https://" + url; return new URL(safe).hostname.replace("www.", ""); } catch { return ""; } };
  const handleToggleFav = (id) => { onToggleFav(id); if (!isFav) { setSavedFeedback(true); setTimeout(() => setSavedFeedback(false), 1200); } };

  // Track last viewed activity
  useEffect(() => { try { localStorage.setItem("ll_lastViewedActivity", JSON.stringify({ id: item.id, name: item.name, timestamp: Date.now() })); } catch(e) {} }, [item.id]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setReviewImages(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const submitReview = () => {
    if (!reviewName.trim() || !reviewText.trim()) return;
    onAddReview({
      id: Date.now(),
      listingId: item.id,
      name: reviewName.trim(),
      text: reviewText.trim(),
      rating: reviewRating,
      images: reviewImages,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    });
    setReviewName(""); setReviewText(""); setReviewRating(5); setReviewImages([]); setShowReviewForm(false); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {item.featuredProvider ? (
        <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
          <img src="/lgd-dance.png" alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
            <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#6B4EFF" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#6B4EFF", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
            <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "white", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, zIndex: 3 }}>
            <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", background: "#6B4EFF", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Featured local provider</span>
          </div>
        </div>
      ) : (
      <div style={{ height: 190, background: `linear-gradient(135deg, ${tc.bg}, ${tc.bg}dd, white)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative", overflow: "hidden" }}>
        <SceneBg type={item.type} w={500} h={190} />
        <span style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))", fontSize: 36, fontWeight: 800, color: "white" }}>{(item.type || "A").charAt(0)}</span>
        {(item.logo || item.imageUrl) && (
        <img src={item.logo || item.imageUrl} alt="" style={{ position: "absolute", zIndex: 3, width: 88, height: 88, objectFit: "cover", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.06)", border: "none" }} onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
          <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#6B4EFF" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#6B4EFF", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
          <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "white", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        </div>
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, flexWrap: "wrap", zIndex: 3 }}>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", background: tc.color, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{item.type}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", background: item.indoor ? "rgba(0,0,0,0.45)" : "#66BB6A", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{item.indoor ? "Indoor 🌧️" : "Outdoor ☀️"}</span>
          {item.free && <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", background: "#166534", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Free</span>}
          {isOnToday(item) && <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", background: "#F97316", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>On Today!</span>}
        </div>
      </div>
      )}
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {item.name}
          {avgRating && <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#FFF3E0", color: "#E67E22" }}>★ {avgRating}</span>}
        </div>
        <div style={{ fontSize: 12, color: tc.color, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
          {item.location}{dist !== null && <span style={{ color: "#F97316" }}>· {Math.round(dist * 20)} min walk</span>}
          {item.verified && <span style={{ display: "inline-flex", width: 16, height: 16, background: "#166534", borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700 }}>✓</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { icon: "📅", label: "When", value: item.day },
            { icon: "🕐", label: "Time", value: item.time },
            { icon: "👶", label: "Ages", value: item.ages },
            { icon: "💷", label: "Price", value: item.price },
            { icon: "🅿️", label: "Parking", value: parkingLabels[item.parking]?.replace("🅿️ ", "") || "Check venue" },
            { icon: item.indoor ? "🏠" : "🌳", label: "Setting", value: item.indoor ? "Indoor" : "Outdoor" },
          ].map((i, idx) => (
            <div key={idx} style={{ background: "white", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8, border: "1px solid #E5E7EB" }}>
              <span style={{ fontSize: 18 }}>{i.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: "#4B5563" }}>{i.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{i.value}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#4B5563", marginBottom: 16 }}>{item.description}</p>

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
        )}
          {/* Hartbeeps-specific content */}
          {item.name && item.name.toLowerCase().includes("hartbeeps") && (
            <>
              {/* Trust + Perfect for + Credit */}
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", fontStyle: "italic", marginBottom: 12 }}>A favourite baby class for families across West London.</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>Perfect for:</div>
                <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.8 }}>Newborn babies · Babies learning to sit or crawl · Toddlers who love music and movement</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <a href={item.website || "https://www.hartbeeps.com"} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 12, background: "#6B4EFF", color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "inherit" }}>Visit provider website ↗</a>
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 16 }}>Provider photos and videos supplied by Kimmy and Sophie from Hartbeeps West & SW London.</div>

              {/* Photo gallery */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>Photos from class</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
                  {["/hartbeeps-hero.png", "/hartbeeps-bells.jpg", "/hartbeeps-happy.png"].map((src, i) => (
                    <img key={i} src={src} alt="Hartbeeps class" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>See the classes in action</div>
                {[
                  { id: "Vk9_6vlvQkc", label: "Baby Bells — for young babies" },
                  { id: "F2JHBDsST40", label: "Baby Beeps — sitting to standing babies" },
                  { id: "uNYsjYMNNN4", label: "Happy House — toddler classes" },
                  { id: "waBu8jQMEOA", label: "Hartbeeps Birthday Parties" },
                ].map(v => (
                  <div key={v.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>{v.label}</div>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
                      <iframe src={"https://www.youtube.com/embed/" + v.id} title={v.label} frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly timetable */}
              {(() => {
                const [ttOpen, setTtOpen] = React.useState(false);
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>Weekly class timetable</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>Other Hartbeeps locations across West London</div>
                    <div style={{ position: "relative", maxHeight: ttOpen ? "none" : 200, overflow: "hidden", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                      <img src="/hartbeeps-timetable.png" alt="Hartbeeps Spring 2 Timetable" style={{ width: "100%", display: "block" }} />
                      {!ttOpen && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
                    </div>
                    <div onClick={() => setTtOpen(!ttOpen)} style={{ textAlign: "center", padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6B4EFF" }}>{ttOpen ? "Collapse timetable" : "Tap to expand timetable"}</div>
                  </div>
                );
              })()}
            </>
          )}

        {/* Sing and Sign timetable */}
        {item.name && item.name.toLowerCase().includes("sing and sign") && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>Winter to Spring 2026 Timetable</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>5 January – 27 March 2026 (half term break 9–20 Feb)</div>
            {(() => {
              const [ttOpen, setTtOpen] = React.useState(false);
              return (
                <div>
                  <div style={{ position: "relative", maxHeight: ttOpen ? "none" : 200, overflow: "hidden", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                    <img src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/winter%20to%20spring%202026-2.png" alt="Sing and Sign Timetable" style={{ width: "100%", display: "block" }} />
                    {!ttOpen && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
                  </div>
                  <div onClick={() => setTtOpen(!ttOpen)} style={{ textAlign: "center", padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6B4EFF" }}>{ttOpen ? "Collapse timetable" : "Tap to expand timetable"}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Featured provider schedule + CTAs */}
        {item.featuredProvider && (
          <>
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 10 }}>📅 Class Schedule</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B4EFF", marginBottom: 6 }}>Fridays</div>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.8, marginBottom: 10 }}>
                4:30–5:00 Ballet<br/>
                5:00–5:45 Acrobatics / Gymnastics<br/>
                5:45–6:15 Tap
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B4EFF", marginBottom: 6 }}>Sundays</div>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.8 }}>
                10:00–10:30 Street Dance<br/>
                10:30–11:00 Musical Theatre<br/>
                11:00–11:45 Primary / Grade 1 Ballet<br/>
                11:45–12:30 Modern / Jazz<br/>
                12:30–1:15 Grade 2/3 Ballet<br/>
                1:15–2:00 Acrobatics / Gymnastics
              </div>
            </div>
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>💷 Pricing</div>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.8 }}>
                Classes start from £5<br/>
                Paid monthly<br/>
                Multi-class discounts available<br/>
                <span style={{ fontWeight: 700, color: "#166534" }}>Free trial available</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {item.trialLink && <a href={item.trialLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "12px 0", textAlign: "center", background: "#6B4EFF", color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 8px rgba(107,78,255,0.25)" }}>Book free trial</a>}
              {item.website && <a href={(() => { let u = item.website.trim(); if (!u.startsWith("http")) u = "https://" + u; return u; })()} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "white", color: "#6B4EFF", borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1.5px solid #6B4EFF" }}>Visit website ↗{getHostname(item.website) && <div style={{ fontSize: 10, fontWeight: 400, color: "#6B7280", marginTop: 1 }}>{getHostname(item.website)}</div>}</a>}
            </div>
          </>
        )}
        {item.photos && (
          <div onClick={(e) => { e.stopPropagation(); window.open(item.photos, "_blank"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 20 }}>📸</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>See Photos & Reviews</div>
              <div style={{ fontSize: 10, color: "#4B5563" }}>View real photos from visitors on {item.photos.includes("instagram") ? "Instagram" : item.photos.includes("facebook") ? "Facebook" : "Google Maps"}</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 16, color: "#4B5563" }}>→</span>
          </div>
        )}
        <div onClick={() => { const addr = (item.venue || item.location || "").trim(); if (!addr) return; window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addr), "_blank", "noopener,noreferrer"); }} style={{ background: "white", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 10, border: "1px solid #E5E7EB", marginBottom: 16, cursor: "pointer" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6B4EFF" }}>Location</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{item.venue.split(",")[0]}</div>
            <div style={{ fontSize: 10, color: "#4B5563" }}>{item.venue}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>Tap to open in Maps</div>
          </div>
          <span style={{ fontSize: 11, color: "#F97316", fontWeight: 600 }}>↗</span>
        </div>
        {item.bring.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>What to Bring</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {item.bring.map(b => <span key={b} style={{ padding: "5px 10px", background: "#FFF3E0", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#E67E22" }}>{b}</span>)}
            </div>
          </>
        )}
        {item.sen && <div style={{ padding: "8px 12px", background: "#E8FBF8", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#166534", marginBottom: 16 }}>♿ SEN / Additional Needs Friendly</div>}

        {/* COMMUNITY REVIEWS SECTION */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>💬 Community Reviews {itemReviews.length > 0 && <span style={{ fontSize: 11, color: "#4B5563", fontWeight: 500 }}>({itemReviews.length})</span>}</div>
            {!showReviewForm && <span onClick={() => setShowReviewForm(true)} style={{ fontSize: 11, fontWeight: 700, color: "#F97316", cursor: "pointer", padding: "4px 10px", background: "#F9731612", borderRadius: 8 }}>+ Add Review</span>}
          </div>

          {submitted && (
            <div style={{ padding: "10px 14px", background: "#E8FBF8", borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 600, color: "#166534", textAlign: "center" }}>✓ Review added — thanks for helping other parents!</div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Share your experience</div>
              <input value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="Your first name" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E0DBD5", fontSize: 13, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 4 }}>Rating</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setReviewRating(s)} style={{ fontSize: 20, cursor: "pointer", filter: s <= reviewRating ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
                  ))}
                </div>
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What did you and your little one think? Any tips for other parents?" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E0DBD5", fontSize: 13, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#F8F6F3", borderRadius: 10, cursor: "pointer", border: "1px dashed #E0DBD5" }}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>Add photos</div>
                    <div style={{ fontSize: 10, color: "#4B5563" }}>Help other parents see what it's like</div>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
                {reviewImages.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                    {reviewImages.map((img, i) => (
                      <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                        <span onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#F97316", borderRadius: "50%", color: "white", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowReviewForm(false); setReviewImages([]); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #E0DBD5", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#4B5563" }}>Cancel</button>
                <button onClick={submitReview} disabled={!reviewName.trim() || !reviewText.trim()} style={{ flex: 1.5, padding: 10, borderRadius: 10, border: "none", background: reviewName.trim() && reviewText.trim() ? "#F97316" : "#E0DBD5", color: "white", fontSize: 12, fontWeight: 700, cursor: reviewName.trim() && reviewText.trim() ? "pointer" : "default", fontFamily: "inherit" }}>Post Review</button>
              </div>
            </div>
          )}

          {/* Existing Reviews */}
          {itemReviews.length > 0 ? itemReviews.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #E5E7EB", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #F97316, #7B68EE)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>{r.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: "#4B5563" }}>{r.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11 }}>{"★".repeat(r.rating)}</div>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#4B5563", margin: 0 }}>{r.text}</p>
              {((r.images && r.images.length > 0) || (r.photos && r.photos.length > 0)) && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                  {(r.images || r.photos).map((img, i) => <img key={i} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />)}
                </div>
              )}
            </div>
          )) : !showReviewForm && (
            <div style={{ textAlign: "center", padding: "16px 12px", background: "white", borderRadius: 12, border: "1px dashed #E0DBD5", color: "#4B5563" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>💬</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>Parent reviews coming soon</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>Be the first parent to share your experience and help other families discover great activities.</div>
            </div>
          )}
        </div>

        {/* Add to Calendar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>📅 Add to My Plans</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              const dateKey = d.toISOString().split("T")[0];
              const isAdded = (calendarPlan[dateKey] || []).includes(item.id);
              const dayLabel = i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-GB", { weekday: "short" });
              const dateLabel = d.getDate();
              return <div key={dateKey} onClick={() => isAdded ? onRemoveFromCalendar(item.id, dateKey) : onAddToCalendar(item.id, dateKey)} style={{ flexShrink: 0, padding: "6px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700, textAlign: "center", minWidth: 44, background: isAdded ? "#F97316" : "white", color: isAdded ? "white" : "#1F2937", border: `1px solid ${isAdded ? "#F97316" : "#E5E7EB"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 9, marginBottom: 2 }}>{dayLabel}</div>
                <div>{isAdded ? "✓" : dateLabel}</div>
              </div>;
            })}
          </div>
        </div>

        {/* Parent Photos */}
        <div style={{ marginBottom: 12, padding: "14px 16px", background: "white", borderRadius: 12, border: "1px dashed #E0DBD5" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>Parent photos</div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 10 }}>Have you visited this activity? Share a photo to help other parents see what it's like.</div>
          <div onClick={() => {}} style={{ display: "inline-block", padding: "8px 16px", borderRadius: 10, background: "#F3F4F6", fontSize: 12, fontWeight: 600, color: "#4B5563", cursor: "pointer" }}>Add your visit photo</div>
        </div>

        {/* Been There — Activity Passport */}
        <div onClick={() => onToggleVisited(item.id)} style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: isVisited ? "linear-gradient(135deg, #166534, #7BDDD5)" : "white", border: isVisited ? "none" : "1.5px dashed #E0DBD5" }}>
          <span style={{ fontSize: 20 }}>{isVisited ? "🏆" : "✅"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: isVisited ? "white" : "#1F2937" }}>{isVisited ? "Been There!" : "Been here? Tap to collect!"}</div>
            <div style={{ fontSize: 10, color: isVisited ? "rgba(255,255,255,0.8)" : "#6B7280" }}>{isVisited ? "Added to your Activity Passport" : "Track activities your family has tried"}</div>
          </div>
          {isVisited && <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>✕ Undo</span>}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); const shareUrl = window.location.href; if (navigator.share) navigator.share({ title: item.name, text: "Check out " + item.name + " on LITTLElocals!", url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent("Check out " + item.name + " on LITTLElocals! " + shareUrl), "_blank"); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Share with a parent
          </button>
          <button onClick={(e) => { e.stopPropagation(); const url = item.website || (item.cta && item.cta.url) || ""; openExternalWebsite(url); }} style={{ flex: 1.2, padding: 12, borderRadius: 12, border: "none", background: item.cta.type === "phone" ? "#42A5F5" : item.cta.type === "facebook" ? "#1877F2" : item.cta.type === "email" ? "#7B68EE" : "#F97316", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {item.cta.type === "phone" ? "Phone:" : item.cta.type === "facebook" ? "Facebook:" : item.cta.type === "email" ? "Email:" : "Web:"} {item.cta.label}
          </button>
        </div>

        {/* Suggested by credit */}
        {item.suggestedBy && (
          <div style={{ marginTop: 10, fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>Suggested by {item.suggestedBy || "a local parent"}</div>
        )}

        {/* Provider share prompt */}
        <div onClick={() => { const shareUrl = window.location.href; if (navigator.share) navigator.share({ title: item.name + " on LITTLElocals", text: "Share this page with parents who might be interested", url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent("Check out " + item.name + " on LITTLElocals — share with parents who'd love this! " + shareUrl), "_blank"); }} style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "#F9FAFB", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Share this page with parents</div>
        </div>

        {/* Claim this activity */}
        <div onClick={() => window.open("mailto:littlelocalsuk@gmail.com?subject=Claim: " + encodeURIComponent(item.name) + "&body=" + encodeURIComponent("Hi, I run " + item.name + " and would like to claim this listing to manage photos and info."), "_blank")} style={{ marginTop: 8, padding: "10px 14px", borderRadius: 12, border: "1px dashed #E5E7EB", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Run this activity?</div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>Claim this listing to update photos and info</div>
        </div>
      </div>
    </div>
  );
}

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

// Canonical short weekday names aligned to JS getDay() order (0=Sun)
const DOW_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
const DOW_BY_INDEX = ["sun","mon","tue","wed","thu","fri","sat"];

// Checks a single listing against a specific day number (0=Sun … 6=Sat)
// ─── Day name helpers ──────────────────────────────────────────
const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; // matches session.day format

// Types that are available any day — parks, zoos, soft play etc.
const ALWAYS_AVAILABLE_TYPES = new Set([
  "Park", "Playground", "Zoo", "Animals", "Soft Play", "Play",
  "Library", "Museum", "Nature", "Outdoor", "Indoor Play", "Farm",
  "Garden", "Swimming", "Leisure Centre",
]);

export function isAlwaysAvailable(item) {
  if (item.isDaily === true) return true;
  if (item.type && ALWAYS_AVAILABLE_TYPES.has(item.type)) return true;
  const raw = (item.day || "").toLowerCase();
  return /\b(daily|every day|everyday|all week|open daily|7 days|always open)\b/.test(raw);
}

// ─── Event: is it currently active? ────────────────────────────
function isEventActive(item) {
  if (item.listingType !== "event") return false;
  const now = new Date(); now.setHours(0,0,0,0);
  if (item.eventStartDate && item.eventEndDate) {
    const start = new Date(item.eventStartDate);
    const end   = new Date(item.eventEndDate);
    return now >= start && now <= end;
  }
  if (item.eventStartDate) return now >= new Date(item.eventStartDate);
  return false;
}

// ─── Event: is it expired? ─────────────────────────────────────
export function isExpiredEvent(item) {
  try {
    if (!item.isTemporary || !item.eventEndDate) return false;
    const end = new Date(item.eventEndDate);
    if (isNaN(end.getTime())) return false;
    const now = new Date(); now.setHours(0,0,0,0);
    return now > end;
  } catch (e) { return false; }
}

// ─── Session: does this item have a session on a given short day? ──
function hasSessionOnDay(item, shortDay) {
  if (!item.sessions || item.sessions.length === 0) return false;
  return item.sessions.some(s => s.day === shortDay);
}

// ─── Core: is item on today? ───────────────────────────────────
function checkOnDay(item, dayNum) {
  // Never show expired events
  if (isExpiredEvent(item)) return false;

  // Always-available venues bypass schedule checks
  if (isAlwaysAvailable(item)) return true;

  // Events: show only while active
  if (item.listingType === "event") return isEventActive(item);

  // Sessions array (v3) — authoritative
  const shortDay = DOW_SHORT[dayNum];
  if (item.sessions && item.sessions.length > 0) {
    return hasSessionOnDay(item, shortDay);
  }

  // Hard exclude unmigrated listings unless always-available
  if (item.needsScheduleUpdate) return false;

  // days_of_week array (v2)
  if (item.daysOfWeek && item.daysOfWeek.length > 0) {
    const target = DOW_BY_INDEX[dayNum];
    return target ? item.daysOfWeek.includes(target) : false;
  }

  // event_dates array (v2)
  if (item.eventDates && item.eventDates.length > 0) {
    const d = new Date(); d.setHours(0,0,0,0);
    const offset = (dayNum - d.getDay() + 7) % 7;
    const target = new Date(d); target.setDate(d.getDate() + offset);
    if (isNaN(target.getTime())) return false;
    const tStr2 = target.toISOString().split("T")[0];
    return item.eventDates.some(d => typeof d === "string" && d.startsWith(tStr2));
  }

  // Text fallback
  const raw = (item.day || "").toLowerCase().trim();
  if (!raw) return false;
  if (/\b(daily|every day|everyday|all week|open daily|7 days)\b/.test(raw)) return true;
  const name = DOW_BY_INDEX[dayNum];
  if (!name) return false;
  const fullNames = { sun:"sunday", mon:"monday", tue:"tuesday", wed:"wednesday", thu:"thursday", fri:"friday", sat:"saturday" };
  if (raw.includes(name) || raw.includes(fullNames[name])) return true;
  if (/\b(mon.{0,5}fri|weekdays)\b/.test(raw) && dayNum >= 1 && dayNum <= 5) return true;
  if (/\b(weekends?|sat.{0,5}sun)\b/.test(raw) && (dayNum === 0 || dayNum === 6)) return true;
  if (item.onToday === true && dayNum === new Date().getDay()) return true;
  return false;
}

export function isOnToday(item) {
  return checkOnDay(item, new Date().getDay());
}

export function isOnTomorrow(item) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (item.listingType === "event" || item.isEvent) {
    if (item.eventDates && item.eventDates.length > 0) {
      if (isNaN(tomorrow.getTime())) return false;
      if (isNaN(tomorrow.getTime())) return false;
      const tStr = tomorrow.toISOString().split("T")[0];
      return item.eventDates.includes(tStr);
    }
    if (item.eventStartDate) {
      const start = new Date(item.eventStartDate);
      const end = item.eventEndDate ? new Date(item.eventEndDate) : start;
      start.setHours(0,0,0,0); end.setHours(23,59,59,999); tomorrow.setHours(12,0,0,0);
      return tomorrow >= start && tomorrow <= end;
    }
    return false;
  }
  return checkOnDay(item, tomorrow.getDay());
}

export function isOnDay(item, dayNum) {
  if (dayNum === -1) return true;
  return checkOnDay(item, dayNum);
}

// ─── Weekend filter ─────────────────────────────────────────────
export function isOnWeekend(item) {
  if (isExpiredEvent(item)) return false;
  if (isAlwaysAvailable(item)) return true;

  // Events: check if event_date range overlaps coming weekend
  if (item.listingType === "event") {
    if (!item.eventStartDate) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const dow = today.getDay();
    const satOffset = (6 - dow + 7) % 7 || 7;
    const sunOffset = (0 - dow + 7) % 7 || 7;
    const sat = new Date(today); sat.setDate(today.getDate() + satOffset);
    const sun = new Date(today); sun.setDate(today.getDate() + sunOffset);
    const start = new Date(item.eventStartDate);
    const end   = item.eventEndDate ? new Date(item.eventEndDate) : start;
    return start <= sun && end >= sat;
  }

  // Sessions array (v3)
  if (item.sessions && item.sessions.length > 0) {
    return item.sessions.some(s => s.day === "Sat" || s.day === "Sun");
  }

  if (item.needsScheduleUpdate) return false;

  // days_of_week (v2)
  if (item.daysOfWeek && item.daysOfWeek.length > 0) {
    return item.daysOfWeek.includes("sat") || item.daysOfWeek.includes("sun");
  }

  // event_dates (v2)
  if (item.eventDates && item.eventDates.length > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const dow = today.getDay();
    const satOffset = (6 - dow + 7) % 7 || 7;
    const sunOffset = (0 - dow + 7) % 7 || 7;
    const sat = new Date(today); sat.setDate(today.getDate() + satOffset);
    const sun = new Date(today); sun.setDate(today.getDate() + sunOffset);
    return item.eventDates.includes(sat.toISOString().split("T")[0]) ||
           item.eventDates.includes(sun.toISOString().split("T")[0]);
  }

  // Text fallback
  const raw = (item.day || "").toLowerCase().trim();
  if (!raw) return false;
  if (/\b(daily|every day|everyday|all week|open daily)\b/.test(raw)) return true;
  if (/\b(sat|saturday|sun|sunday)\b/.test(raw)) return true;
  if (/\b(weekends?|sat.{0,5}sun)\b/.test(raw)) return true;
  return false;
}

// ─── This week filter (next 7 days) ─────────────────────────────
export function isOnThisWeek(item) {
  if (isExpiredEvent(item)) return false;
  if (isAlwaysAvailable(item)) return true;
  const today = new Date(); today.setHours(0,0,0,0);
  const in7 = new Date(today); in7.setDate(today.getDate() + 6);
  // Events: check overlap with next 7 days
  if (item.listingType === "event") {
    if (!item.eventStartDate) return false;
    const start = new Date(item.eventStartDate);
    const end = item.eventEndDate ? new Date(item.eventEndDate) : start;
    return start <= in7 && end >= today;
  }
  // Sessions: check if any session day falls in next 7 days
  if (item.sessions && item.sessions.length > 0) {
    const dayMap = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
      if (item.sessions.some(s => s.day === dayName)) return true;
    }
    return false;
  }
  if (item.needsScheduleUpdate) return false;
  // v2 fallback: daysOfWeek
  if (item.daysOfWeek && item.daysOfWeek.length > 0) return true;
  // Text fallback
  const raw = (item.day || "").toLowerCase();
  if (/\b(daily|every day|everyday|all week|open daily|mon|tue|wed|thu|fri|sat|sun)\b/.test(raw)) return true;
  return false;
}

// ─── Next session helper — for card display ─────────────────────
export function getNextSession(item) {
  if (isAlwaysAvailable(item)) return { label: "Open daily", isToday: true, isNow: false };
  if (!item.sessions || item.sessions.length === 0) return null;
  const now = new Date();
  const todayShort = DOW_SHORT[now.getDay()];
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const parseMins = (t) => {
    if (!t) return 0;
    const m = t.match(/(\d{1,2}):(\d{2})/);
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
  };

  // Prioritise: sessions today that haven't started yet
  const todaySessions = item.sessions
    .filter(s => s.day === todayShort)
    .sort((a, b) => parseMins(a.startTime) - parseMins(b.startTime));

  const nextToday = todaySessions.find(s => parseMins(s.startTime) > nowMins);
  if (nextToday) return { label: `Today ${nextToday.startTime}`, isToday: true, session: nextToday };

  // If session is on right now
  const onNow = todaySessions.find(s => {
    const start = parseMins(s.startTime);
    const end = s.endTime ? parseMins(s.endTime) : start + 60;
    return nowMins >= start && nowMins < end;
  });
  if (onNow) return { label: `On now · ends ${onNow.endTime || ""}`, isToday: true, isNow: true, session: onNow };

  // Next upcoming day
  const DOW_ORDER = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayIdx = now.getDay();
  for (let offset = 1; offset <= 7; offset++) {
    const checkDay = DOW_ORDER[(todayIdx + offset) % 7];
    const daySessions = item.sessions
      .filter(s => s.day === checkDay)
      .sort((a, b) => parseMins(a.startTime) - parseMins(b.startTime));
    if (daySessions.length > 0) {
      const s = daySessions[0];
      const label = offset === 1
        ? `Tomorrow${s.startTime ? " " + s.startTime : ""}`
        : `${checkDay}${s.startTime ? " " + s.startTime : ""}`;
      return { label, isToday: false, session: s };
    }
  }
  return null;
}

// ─── Session summary for card subtitle ─────────────────────────
export function getSessionSummary(item) {
  if (!item.sessions || item.sessions.length === 0) return null;
  const days = [...new Set(item.sessions.map(s => s.day))];
  if (days.length === 7) return "Daily";
  if (days.length === 1) {
    const times = item.sessions.filter(s => s.day === days[0]).map(s => s.startTime).filter(Boolean);
    return `${days[0]}s${times.length > 0 ? " · " + times.join(", ") : ""}`;
  }
  if (days.length <= 3) return days.join(" & ");
  return `${days.length} days a week`;
}

export function shareWhatsApp(item) {
  var activityUrl = "https://littlelocals.uk/activity/" + (item.slug || item.id);
  var time = item.time ? item.time : "";
  var ages = item.ages ? item.ages : "";
  var text = "Hey — I found this kids activity on LITTLElocals:\n\n"
    + item.name + "\n"
    + (time ? "⏰ " + time + "\n" : "")
    + (ages ? "👶 " + ages + "\n" : "")
    + "\n" + activityUrl + "\n\n"
    + "Looks fun for the kids!";
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
          var youIcon = L.divIcon({ className: "", html: "<div style='width:14px;height:14px;background:#D4732A;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)'></div>", iconSize: [20, 20], iconAnchor: [10, 10] });
          L.marker([userLoc.lat, userLoc.lng], { icon: youIcon }).addTo(map).bindPopup("<b>You are here</b>");
        }
        var bounds = [];
        filtered.forEach(function(item) {
          if (!item.lat || !item.lng) return;
          var pinIcon = L.divIcon({ className: "", html: "<div style='width:24px;height:24px;border-radius:50%;background:#5B2D6E;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)'>" + (idx + 1) + "</div>", iconSize: [24, 24], iconAnchor: [12, 24] });
          var marker = L.marker([item.lat, item.lng], { icon: pinIcon }).addTo(map);
          var dist = userLoc ? (Math.sqrt(Math.pow((item.lat - userLoc.lat) * 111, 2) + Math.pow((item.lng - userLoc.lng) * 111 * Math.cos(userLoc.lat * Math.PI / 180), 2))).toFixed(1) : null;
          var postcode = item.venue ? item.venue.match(/[A-Z]{1,2}\d[\dA-Z]?\s?\d[A-Z]{2}/i) : null;
          var locLine = postcode ? postcode[0] : (item.venue || "");
          var popupHtml = "<div style='min-width:150px;font-family:system-ui,sans-serif'>" +
            "<div style='font-size:13px;font-weight:700;color:#1F2937;margin-bottom:4px'>" + item.name + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + item.type + " - " + (item.ages || "") + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + (item.day || "") + " " + (item.time || "") + "</div>" +
            "<div style='font-size:10px;color:#4B5563;margin-bottom:2px'>" + locLine + "</div>" +
            (dist ? "<div style='font-size:10px;color:#D4732A;font-weight:600;margin-bottom:2px'>" + dist + " km away</div>" : "") +
            "<div style='font-size:11px;font-weight:700;color:#1F2937;margin-bottom:5px'>" + (item.price || "") + "</div>" +
            "<div id='ll-map-" + item.id + "' style='font-size:11px;color:white;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#D4732A,#FB923C);padding:6px 10px;border-radius:8px;text-align:center'>View details →</div>" +
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

function getSuggestion(item) {
  const type = (item.type || "").toLowerCase();
  const ages = (item.ages || "").toLowerCase();
  const price = (item.price || "").toLowerCase();
  const setting = (item.setting || "").toLowerCase();
  const day = (item.day || "").toLowerCase();
  const isFree = price.includes("free") || price === "0";
  const isBaby = ages.includes("0-") || ages.includes("baby") || ages.includes("newborn") || ages.includes("0-1") || ages.includes("0-2");
  const isToddler = ages.includes("toddler") || ages.includes("1-") || ages.includes("2-") || ages.includes("0-4") || ages.includes("0-3");
  const isOutdoor = setting.includes("outdoor") || type.includes("outdoor") || type.includes("park") || type.includes("playground");
  const isIndoor = setting.includes("indoor") || type.includes("soft play") || type.includes("sensory") || type.includes("music") || type.includes("dance") || type.includes("baking") || type.includes("arts");
  const isWeekend = day.includes("sat") || day.includes("sun");
  const isSwim = type.includes("swim");
  const isSport = type.includes("football") || type.includes("gymnastics") || type.includes("martial") || type.includes("sport");

  if (isFree && isOutdoor) return "Free outdoor fun today";
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
  return null;
}

function VerifiedBadge({ size }) {
  const isDetail = size === "detail";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: isDetail ? 5 : 3, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: isDetail ? "4px 10px" : "2px 7px", marginTop: isDetail ? 0 : 4, marginBottom: isDetail ? 12 : 0 }}>
      <svg width={isDetail ? 13 : 10} height={isDetail ? 13 : 10} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#2563EB"/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: isDetail ? 12 : 11, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>Verified</span>
      {isDetail && <span style={{ fontSize: 11, color: "#93C5FD", fontWeight: 400, marginLeft: 2 }}>· listing details checked by LITTLElocals</span>}
      {isDetail && <span style={{ fontSize: 11, color: "#93C5FD", fontWeight: 400, marginLeft: 2 }}>· listing details checked by LITTLElocals</span>}
    </div>
  );
}

export function ListingCard({ item, onSelect, userLoc, isFav, onToggleFav, isNew, reviews, areaFilter, isSunny, onTrackClick, clickCount, todaySignal, startsSoon }) {
  const tc = typeColors[item.type] || { bg: "#eee", color: "#333" };
  const areaCenters = { "Ealing": { lat: 51.5139, lng: -0.3048 }, "Ruislip": { lat: 51.5714, lng: -0.4213 }, "Eastcote": { lat: 51.5762, lng: -0.3962 }, "Uxbridge": { lat: 51.5461, lng: -0.4761 } };
  const locRef = userLoc || areaCenters[areaFilter] || null;
  const dist = locRef ? getDistanceMiles(locRef.lat, locRef.lng, item.lat, item.lng) : null;
  const walkMin = dist !== null ? Math.round(dist * 20) : null;
  const onToday = isOnToday(item);
  const isExpired = !!(item.isEvent && item.eventStartDate && new Date(item.eventEndDate || item.eventStartDate) < new Date(new Date().toDateString()));
  const eventDateLabel = item.isEvent && item.eventStartDate ? (() => {
    const d = new Date(item.eventStartDate);
    if (item.eventEndDate && item.eventEndDate !== item.eventStartDate) {
      const d2 = new Date(item.eventEndDate);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' – ' + d2.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  })() : null;

  // Swipe state for image carousel
  const [imgIndex, setImgIndex] = useState(0);
  const swipeStartX = useRef(null);
  const allImages = [
    ...(item.images && item.images.length > 0 ? item.images : []),
    ...(item.imageUrl && !(item.images && item.images.includes(item.imageUrl)) ? [item.imageUrl] : [])
  ].filter(Boolean);
  const hasImages = allImages.length > 0;
  const hasLogo = !!item.logo;

  const handleSwipeStart = (e) => { swipeStartX.current = e.touches ? e.touches[0].clientX : e.clientX; };
  const handleSwipeEnd = (e) => {
    if (swipeStartX.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = swipeStartX.current - endX;
    if (Math.abs(diff) > 40) {
      e.stopPropagation();
      if (diff > 0) setImgIndex(i => Math.min(i + 1, allImages.length - 1));
      else setImgIndex(i => Math.max(i - 1, 0));
    }
    swipeStartX.current = null;
  };

  const handleClick = () => { if (onTrackClick) onTrackClick(item.id); onSelect(item); };

  // Distance: <5 min = Nearby, else X min walk
  const distLabel = walkMin !== null && walkMin < 60
    ? (walkMin < 5 ? "📍 Nearby" : `📍 ${walkMin} min walk`)
    : null;

  // Smarter status messaging
  const getStatus = () => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (!onToday) return null; // no "Closed today" — just omit for non-today listings
    const timeStr = (item.time || "").trim();
    if (!timeStr) return null;
    const startMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
    if (!startMatch) return null;
    let startH = parseInt(startMatch[1]);
    const startM = parseInt(startMatch[2] || "0");
    const startAmpm = (startMatch[3] || "").toLowerCase();
    if (startAmpm === "pm" && startH < 12) startH += 12;
    if (startAmpm === "am" && startH === 12) startH = 0;
    const startMins = startH * 60 + startM;
    const endMatch = timeStr.match(/[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
    let endH = null, endM = 0, endMins = null;
    if (endMatch) {
      endH = parseInt(endMatch[1]); endM = parseInt(endMatch[2] || "0");
      const endAmpm = (endMatch[3] || "").toLowerCase();
      if (endAmpm === "pm" && endH < 12) endH += 12;
      if (endAmpm === "am" && endH === 12) endH = 0;
      endMins = endH * 60 + endM;
    }
    const fmt = (hr, mn) => `${hr > 12 ? hr-12 : (hr===0?12:hr)}:${String(mn).padStart(2,"0")}${hr>=12?"pm":"am"}`;
    if (endMins !== null && nowMins >= startMins && nowMins < endMins) return { text: "🟢 Open now", color: "#166534", bg: "#DCFCE7" };
    if (nowMins < startMins) {
      const diff = startMins - nowMins;
      if (diff <= 60) return { text: `🟡 Starts in ${diff} min${diff!==1?"s":""}`, color: "#92400E", bg: "#FEF3C7" };
      return { text: `Opens at ${fmt(startH, startM)}`, color: "#6B7280", bg: "transparent" };
    }
    if (endMins !== null && nowMins >= endMins) return { text: "🔴 Closed today", color: "#9CA3AF", bg: "transparent" };
    return null;
  };
  const statusObj = getStatus();

  // Max TWO tags — priority order: status, trust, free trial
  const getTrustLabel = () => {
    if (todaySignal) return todaySignal;
    const clicks = clickCount || 0;
    if (item.popular || clicks >= 8) return "⭐ Popular with parents";
    if (clicks >= 3 || item.verified) return "🔥 Trending today";
    return null;
  };
  const trustLabel = getTrustLabel();

  // Build tag slots: max 2, priority order
  const tags = [];
  if (startsSoon !== null && startsSoon !== undefined) tags.push({ type: "soon", text: startsSoon === 0 ? "⏰ Starting now!" : `⏰ Starts in ${startsSoon} min`, color: "#fff", bg: "#EF4444" });
  if (tags.length < 2 && statusObj && statusObj.text !== "🔴 Closed today") tags.push({ type: "status", ...statusObj });
  if (tags.length < 2 && trustLabel) tags.push({ type: "trust", text: trustLabel, color: "#9CA3AF", bg: "transparent" });
  if (tags.length < 2 && item.freeTrial) tags.push({ type: "trial", text: "Free trial", color: "#166634", bg: "#ECFDF5" });

  // Seeded social proof — stable per listing per day, believably small
  const imgs = (item.images || []);

  const qualifiedForBadge = imgs.filter(u => u && !u.endsWith('.mp4')).length >= 2 && (imgs.filter(u => u && !u.endsWith('.mp4')).length >= 3 || imgs.some(u => u && u.endsWith('.mp4')));

  const socialProof = (() => {
    const dayNum = Math.floor(Date.now() / 86400000);
    const seed = (n) => { let x = Math.sin(item.id * 9301 + dayNum * 49297 + n * 233) * 49297; return x - Math.floor(x); };
    const clicks = clickCount || 0;
    // Popular/verified listings get higher baseline signals
    const boost = (item.popular || item.featuredProvider) ? 1 : 0;
    const viewsToday = Math.floor(seed(1) * 6) + boost * 3 + (clicks >= 3 ? 2 : 0);
    const savesWeek  = Math.floor(seed(2) * 4) + boost * 2 + (item.verified ? 1 : 0);
    // Pick ONE signal — highest priority that meets threshold
    // TIER 1 — has media + verified or popular
    if (hasMedia && (qualifiedForBadge || item.popular || clicks >= 5)) {
      const plansCount = Math.floor(seed(3) * 3) + boost + 1;
      if (plansCount >= 3) return { label: null, sub: `🗓 ${plansCount} Ealing parents added this to their plans` };
      return { label: null, sub: "✨ Popular with Ealing parents this week" };
    }
    // TIER 2 — has media, not premium
    if (hasMedia && savesWeek >= 2) return { label: null, sub: `💜 ${savesWeek} Ealing parents saved this` };
    // TIER 3 — no media or low score
    if (viewsToday >= 2) return { label: null, sub: `👀 ${viewsToday} parents viewed today` };
    return null;
  })();

  return (
    <div onClick={handleClick} style={{ background: "white", borderRadius: 16, marginBottom: 12, cursor: "pointer", boxShadow: "0 12px 32px rgba(0,0,0,0.08)", border: isExpired ? "1px solid #D1D5DB" : "1px solid #EFEFEF", overflow: "hidden", transition: "transform 0.12s ease, box-shadow 0.12s ease", opacity: isExpired ? 0.6 : 1, filter: isExpired ? "grayscale(0.7)" : "none", position: "relative" }}>
      {isExpired && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.55)", color: "white", fontWeight: 1000, fontSize: 24, letterSpacing: 3, padding: "8px 18px", borderRadius: 8, transform: "rotate(-15deg)", textTransform: "uppercase", border: "2px solid rgba(255,255,255,0.4)" }}>Expired</div>
        </div>
      )}

      {/* ── Wide image header ── */}
      {hasImages ? (
        <div
          style={{ position: "relative", height: 160, background: (item.logo && allImages[imgIndex] === item.logo) ? "white" : `linear-gradient(135deg, ${tc.bg}, ${tc.bg}cc)`, overflow: (item.logo && allImages[imgIndex] === item.logo) ? "visible" : "hidden", userSelect: "none" }}
          onPointerDown={(e) => { e._startX = e.clientX; e.currentTarget._startX = e.clientX; e.currentTarget._dragging = false; }}
          onPointerMove={(e) => { if (Math.abs(e.clientX - e.currentTarget._startX) > 10) e.currentTarget._dragging = true; }}
          onPointerUp={(e) => { if (!e.currentTarget._dragging) { e.stopPropagation(); handleClick(); } e.currentTarget._dragging = false; }}
          onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <SceneBg type={item.type} w="100%" h={160} />
          {(() => {
            const src = allImages[imgIndex];
            const hasRealPhoto = allImages.some(img => img !== item.logo && img !== item.imageUrl);
            const isLogo = !hasRealPhoto;
            return <img
              src={src}
              alt={item.name}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: isLogo ? "contain" : "cover",
                objectPosition: "center",
                display: "block",
                background: isLogo ? "white" : "transparent",
                padding: isLogo ? "12px" : 0,
                boxSizing: "border-box",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />;
          })()}
          {/* Dot indicators */}
          {allImages.length > 1 && (
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {allImages.map((_, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i); }} style={{ width: i === imgIndex ? 16 : 6, height: 6, borderRadius: 3, background: i === imgIndex ? "white" : "rgba(255,255,255,0.5)", transition: "width 0.2s" }} />
              ))}
            </div>
          )}
          {/* Logo pill overlay — bottom left */}
          {hasLogo && (
            <div style={{ position: "absolute", bottom: 10, left: 10, background: "white", borderRadius: 10, padding: "3px 8px 3px 4px", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              <img src={item.logo} alt="" style={{ width: 22, height: 22, borderRadius: 6, objectFit: "contain" }} onError={(e) => { e.target.parentNode.style.display = "none"; }} />
              <span style={{ fontSize: 17, fontWeight: 1000, color: "#111827" }}>{item.name}{qualifiedForBadge && <img src="/verified-badge.svg" width={17} height={17} style={{ marginLeft:5, verticalAlign:"middle", display:"inline-block" }} alt="Verified" />}</span>
            </div>
          )}
          {/* Fav button */}
          <div onClick={(e) => { e.stopPropagation(); onToggleFav(item.id, item.name); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
            {isFav ? "♥" : "♡"}
          </div>
          {/* Today badge */}
          {onToday && (
            <div style={{ position: "absolute", top: 10, left: 10, background: "#166534", color: "white", fontSize: 16, fontWeight: 1000, padding: "3px 8px", borderRadius: 8 }}>Today ✓</div>
          )}
        </div>
      ) : (
        /* No images — coloured banner with type initial + logo */
        <div style={{ position: "relative", height: 100, background: `linear-gradient(135deg, ${tc.bg}, ${tc.bg}99)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <SceneBg type={item.type} w="100%" h={100} />
          {hasLogo
            ? <img src={item.logo} alt="" loading="lazy" style={{ height: 64, maxWidth: "70%", objectFit: "contain", position: "relative", zIndex: 2, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.08))" }} onError={(e) => { e.target.style.display = "none"; }} />
            : <span style={{ fontSize: 42, fontWeight: 1000, color: tc.color || "#555", opacity: 0.35, position: "relative", zIndex: 2 }}>{(item.type || "A").charAt(0)}</span>
          }
          <div onClick={(e) => { e.stopPropagation(); onToggleFav(item.id, item.name); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: isFav ? "#5B2D6E" : "#9CA3AF", cursor: "pointer" }}>
            {isFav ? "♥" : "♡"}
          </div>
          {onToday && (
            <div style={{ position: "absolute", top: 10, left: 10, background: "#166534", color: "white", fontSize: 16, fontWeight: 1000, padding: "3px 8px", borderRadius: 8 }}>Today ✓</div>
          )}
        </div>
      )}

      {/* ── Info block ── */}
      <div style={{ padding: "12px 14px 13px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{item.name}{qualifiedForBadge && <img src="/verified-badge.svg" width={17} height={17} style={{ marginLeft:5, verticalAlign:"middle", display:"inline-block" }} alt="Verified" />}</span>
          <span style={{ fontSize: 13, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: item.free ? "#DCFCE7" : "#FFF7ED", color: item.free ? "#166534" : "#9A3412", whiteSpace: "nowrap", flexShrink: 0 }}>{item.price}</span>
        </div>

        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4, lineHeight: 1.4, fontWeight: 500 }}>
          {item.type}{item.ages ? " · " + item.ages : ""}
        </div>

        {/* Next session — time on its own line */}
        {item.sessions && item.sessions.length > 0 && (() => {
          const next = getNextSession(item);
          if (!next) return null;
          return <div style={{ fontSize: 13, color: next.isNow ? "#166534" : next.isToday ? "#92400E" : "#4B5563", fontWeight: 600, marginBottom: 4 }}>{next.isNow ? "🟢 " : next.isToday ? "🟡 " : "📅 "}{next.label}</div>;
        })()}

        {/* Day fallback if no sessions */}
        {!(item.sessions && item.sessions.length > 0) && item.day && (
          <div style={{ fontSize: 13, color: "#4B5563", fontWeight: 500, marginBottom: 4 }}>📅 {item.day}{item.time ? " · " + item.time : ""}</div>
        )}
        {getSuggestion(item) && <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginTop: 2, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSuggestion(item)}</div>}

        {/* Event badge */}
        {item.listingType === "event" && (
          <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "#5B2D6E", background: "#EDE9FE", padding: "2px 7px", borderRadius: 6, marginBottom: 4 }}>
            {item.recurrence === "multi-day" ? "Holiday camp" : item.recurrence === "one-off" ? "One-off event" : "Event"}
          </div>
        )}

        {/* Distance + tags row — softer and smaller */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginTop: 2 }}>
          {distLabel && <span style={{ fontSize: 12, color: "#D4732A", fontWeight: 600 }}>{distLabel}</span>}
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 500, color: tag.color, background: tag.bg, padding: tag.bg !== "transparent" ? "2px 7px" : 0, borderRadius: 6, opacity: 0.9 }}>{tag.text}</span>
          ))}
        </div>

        {socialProof && (
          <div style={{ marginTop: 8, paddingTop: 7, borderTop: "1px solid #F5F5F5" }}>
            {typeof socialProof === "object" ? (
              <>
                {socialProof.label && <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 2 }}>{socialProof.label}</div>}
                <div style={{ fontSize: 13, color: "#A0A4AD", fontWeight: 600 }}>{socialProof.sub}</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#A0A4AD", fontWeight: 600 }}>{socialProof}</div>
            )}
          </div>
        )}
        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return null;
        })()}
      </div>
    </div>
  );
}


const parkingLabels = { free: "🅿️ Free parking", "free-3hrs": "🅿️ Free (3hrs)", paid: "🅿️ Paid parking", street: "🅿️ Street parking", varies: "🅿️ Parking varies", none: "🚫 No parking" };

export function DetailView({ item, onBack, userLoc, reviews, onAddReview, isFav, onToggleFav, onAddToCalendar, onRemoveFromCalendar, calendarPlan, isVisited, onToggleVisited, tips = [], onAddTip, allListings = [], onSelectListing }) {
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
  const [showSaveShareNudge, setShowSaveShareNudge] = useState(false);
  const [beenHereJustTapped, setBeenHereJustTapped] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [showTipInput, setShowTipInput] = useState(false);
  const [tipText, setTipText] = useState("");
  const [tipSubmitted, setTipSubmitted] = useState(false);

  const openExternalWebsite = (url) => { if (!url) return; let safeUrl = url.trim(); if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) safeUrl = "https://" + safeUrl; window.open(safeUrl, "_blank", "noopener,noreferrer"); };
  const getHostname = (url) => { try { const safe = url.startsWith("http") ? url : "https://" + url; return new URL(safe).hostname.replace("www.", ""); } catch { return ""; } };
  const handleToggleFav = (id) => { onToggleFav(id, item.name); if (!isFav) { setSavedFeedback(true); setShowSaveShareNudge(true); setTimeout(() => setSavedFeedback(false), 1500); setTimeout(() => setShowSaveShareNudge(false), 5000); } };

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
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 19, fontWeight: 900, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
            <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#5B2D6E" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 16, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
            <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: "white", fontWeight: 900, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, zIndex: 3 }}>
            <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 15, fontWeight: 900, color: "white", background: "#5B2D6E", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Featured local provider</span>
          </div>
        </div>
      ) : (
      <div style={{ height: 190, background: `linear-gradient(135deg, ${tc.bg}, ${tc.bg}dd, white)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 68, position: "relative", overflow: "hidden" }}>
        <SceneBg type={item.type} w={500} h={190} />
        <span style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))", fontSize: 40, fontWeight: 1000, color: "white" }}>{(item.type || "A").charAt(0)}</span>
        {(item.logo || item.imageUrl || (item.images && item.images[0])) && (
        <img src={item.logo || item.imageUrl || (item.images && item.images[0])} alt="" style={{ position: "absolute", zIndex: 3, width: 88, height: 88, objectFit: "cover", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.06)", border: "none" }} onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <div onClick={onBack} style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 19, fontWeight: 900, color: "#1F2937", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>← Back</div>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 3 }}>
          <div style={{ position: "relative" }}><div onClick={() => handleToggleFav(item.id)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: isFav ? "#5B2D6E" : "#D1D5DB" }}>{isFav ? "♥" : "♡"}</div>{savedFeedback && <div style={{ position: "absolute", top: 40, right: 0, background: "#5B2D6E", color: "white", fontSize: 16, fontWeight: 900, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Saved ✓</div>}</div>
          <div onClick={(e) => { e.stopPropagation(); shareWhatsApp(item); }} style={{ width: 36, height: 36, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: "white", fontWeight: 900, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        </div>
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 6, flexWrap: "wrap", zIndex: 3 }}>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 17, fontWeight: 900, color: "white", background: tc.color, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{item.type}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 17, fontWeight: 900, color: "white", background: item.indoor ? "rgba(0,0,0,0.45)" : "#66BB6A", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{item.indoor ? "Indoor 🌧️" : "Outdoor ☀️"}</span>
          {item.free && <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 17, fontWeight: 900, color: "white", background: "#166534", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>Free</span>}
          {isOnToday(item) && <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 17, fontWeight: 900, color: "white", background: "#D4732A", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>On Today!</span>}

        </div>
      </div>
      )}
      <div style={{ padding: 20 }}>
        {/* Post-save share nudge */}
        {showSaveShareNudge && (
          <div style={{ marginBottom: 12, padding: "10px 14px", background: "#F3F0FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#5B2D6E" }}>Saved to your favourites ❤️</span>
            <div style={{ fontSize: 17, color: "#6B7280", marginBottom: 3 }}>Know a parent who'd love this?</div>
            <span onClick={() => { const shareUrl = "https://littlelocals.uk/?activity=" + (item.slug || item.id); const msg = "Thought you might like this for the kids 👶\n\n" + item.name + "\n" + (item.description ? item.description.slice(0,80) + "..." : item.type + " · " + item.ages) + "\n\nFound it on LITTLElocals:\n" + shareUrl; if (navigator.share) navigator.share({ title: item.name, text: msg, url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank"); }} style={{ fontSize: 17, fontWeight: 900, color: "#25D366", cursor: "pointer", whiteSpace: "nowrap" }}>Send to another parent →</span>
          </div>
        )}
        <div style={{ fontSize: 26, fontWeight: 1000, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {item.name}
          {avgRating && <span style={{ fontSize: 18, fontWeight: 900, padding: "2px 8px", borderRadius: 8, background: "#FFF3E0", color: "#E67E22" }}>★ {avgRating}</span>}
        </div>
        <div style={{ fontSize: 18, color: tc.color, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
          {item.location}{dist !== null && <span style={{ color: "#D4732A" }}>· {Math.round(dist * 20)} min walk</span>}
        </div>
        {(() => {
          const imgs = (item.images || []);
          const hasVideo = imgs.some(u => u && u.endsWith('.mp4'));
          const photoCount = imgs.filter(u => u && !u.endsWith('.mp4')).length;
          const qualified = photoCount >= 3 || (photoCount >= 2 && hasVideo);
          return qualified && <VerifiedBadge size="detail" />;
        })()}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { icon: "📅", label: "When", value: item.day },
            { icon: "🕐", label: "Time", value: item.time },
            { icon: "👶", label: "Ages", value: item.ages },
            { icon: "💷", label: "Price", value: item.price },
            { icon: "🅿️", label: "Parking", value: parkingLabels[item.parking]?.replace("🅿️ ", "") || "Check venue" },
            { icon: item.indoor ? "🏠" : "🌳", label: "Setting", value: item.indoor ? "Indoor" : "Outdoor" },
          ].map((i, idx) => (
            <div key={idx} style={{ background: "#FFFFFF", borderRadius: 10, padding: "14px 12px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #ECECF0", transition: "transform 0.12s ease, box-shadow 0.12s ease", cursor: "default" }}
              onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform='scale(0.98)'}
              onTouchEnd={e => e.currentTarget.style.transform='scale(1)'}
            >
              <span style={{ fontSize: 24 }}>{i.icon}</span>
              <div>
                <div style={{ fontSize: 19, color: "#8E8E93", fontWeight: 700, marginBottom: 2 }}>{i.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{i.value}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 19, lineHeight: 1.7, color: "#4B5563", marginBottom: 16 }}>{item.description}</p>

        {/* Generic photo gallery from listing_images */}
        {item.images && item.images.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>📸 Photos</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
              {item.images.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
              ))}
            </div>
            <div style={{ fontSize: 16, color: "#9CA3AF", marginTop: 4 }}>{item.images.length} photo{item.images.length > 1 ? "s" : ""}</div>
          </div>
        )}
          {/* Hartbeeps-specific content */}
          {item.name && item.name.toLowerCase().includes("hartbeeps") && (
            <>
              {/* Trust + Perfect for + Credit */}
              <div style={{ fontSize: 17, fontWeight: 800, color: "#6B7280", fontStyle: "italic", marginBottom: 12 }}>A favourite baby class for families across West London.</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: "#1F2937", marginBottom: 4 }}>Perfect for:</div>
                <div style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.8 }}>Newborn babies · Babies learning to sit or crawl · Toddlers who love music and movement</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <a href={item.website || "https://www.hartbeeps.com"} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 12, background: "#5B2D6E", color: "white", fontSize: 18, fontWeight: 900, textDecoration: "none", fontFamily: "inherit" }}>Visit provider website ↗</a>
              </div>
              <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 16 }}>Provider photos and videos supplied by Kimmy and Sophie from Hartbeeps West & SW London.</div>

              {/* Photo gallery */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>Photos from class</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
                  {["/hartbeeps-hero.png", "/hartbeeps-bells.jpg", "/hartbeeps-happy.png"].map((src, i) => (
                    <img key={i} src={src} alt="Hartbeeps class" style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>See the classes in action</div>
                {[
                  { id: "Vk9_6vlvQkc", label: "Baby Bells — for young babies" },
                  { id: "F2JHBDsST40", label: "Baby Beeps — sitting to standing babies" },
                  { id: "uNYsjYMNNN4", label: "Happy House — toddler classes" },
                  { id: "waBu8jQMEOA", label: "Hartbeeps Birthday Parties" },
                ].map(v => (
                  <div key={v.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#4B5563", marginBottom: 4 }}>{v.label}</div>
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
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", marginBottom: 4 }}>Weekly class timetable</div>
                    <div style={{ fontSize: 17, color: "#9CA3AF", marginBottom: 8 }}>Other Hartbeeps locations across West London</div>
                    <div style={{ position: "relative", maxHeight: ttOpen ? "none" : 200, overflow: "hidden", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                      <img src="/hartbeeps-timetable.png" alt="Hartbeeps Spring 2 Timetable" style={{ width: "100%", display: "block" }} />
                      {!ttOpen && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
                    </div>
                    <div onClick={() => setTtOpen(!ttOpen)} style={{ textAlign: "center", padding: "8px 0", cursor: "pointer", fontSize: 18, fontWeight: 800, color: "#5B2D6E" }}>{ttOpen ? "Collapse timetable" : "Tap to expand timetable"}</div>
                  </div>
                );
              })()}
            </>
          )}

        {/* Oikos Stay and Play video */}
        {item.name && item.name.toLowerCase().includes("oikos") && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>See the space in action</div>
            <video controls preload="none" style={{ width: "100%", borderRadius: 12, marginBottom: 8 }} poster="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/oikos-stay-play-cover.png">
              <source src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/oikos-video-1.mp4" type="video/mp4" />
            </video>
            <video controls preload="none" style={{ width: "100%", borderRadius: 12 }} poster="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/oikos-stay-play-cover.png">
              <source src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/oikos-video-2.mp4" type="video/mp4" />
            </video>
          </div>
        )}
        {/* The Little Club video */}
        {item.name && item.name.toLowerCase().includes("little club") && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>See the space in action</div>
            <video controls preload="none" style={{ width: "100%", borderRadius: 12 }} poster="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/the-little-club:play-roleplay-firestation.jpeg">
              <source src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/the-little-club:play-session.mp4" type="video/mp4" />
            </video>
          </div>
        )}
        {/* Cook Stars video */}
        {item.name && item.name.toLowerCase().includes("cook stars") && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 8 }}>See Cook Stars in action</div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
              <iframe src="https://www.youtube.com/embed/CmhzXEdx4IQ" title="Cook Stars St Andrews" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }} />
            </div>
          </div>
        )}

        {/* Sing and Sign timetable */}
        {item.name && item.name.toLowerCase().includes("sing and sign") && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <img src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/sing-and-sign-logo.png" alt="Sing and Sign" style={{ width: 80, height: 56, objectFit: "contain", borderRadius: 8 }} onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <img src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/sing-and-sign-logo.png" alt="Sing and Sign" style={{ width: 80, height: 56, objectFit: "contain", borderRadius: 8 }} onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 4 }}>Winter to Spring 2026 Timetable</div>
            <div style={{ fontSize: 15, color: "#9CA3AF", marginBottom: 8 }}>5 January – 27 March 2026 (half term break 9–20 Feb)</div>
            {(() => {
              const [ttOpen, setTtOpen] = React.useState(false);
              return (
                <div>
                  <div style={{ position: "relative", maxHeight: ttOpen ? "none" : 200, overflow: "hidden", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                    <img src="https://xjifxwvziwoepiioyitm.supabase.co/storage/v1/object/public/listing-images/sing-and-sign-timetable-2026.png" alt="Sing and Sign Timetable" style={{ width: "100%", display: "block" }} />
                    {!ttOpen && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
                  </div>
                  <div onClick={() => setTtOpen(!ttOpen)} style={{ textAlign: "center", padding: "8px 0", cursor: "pointer", fontSize: 16, fontWeight: 800, color: "#5B2D6E" }}>{ttOpen ? "Collapse timetable" : "Tap to expand timetable"}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Featured provider schedule + CTAs */}
        {item.featuredProvider && (
          <>
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 10 }}>📅 Class Schedule</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#5B2D6E", marginBottom: 6 }}>Fridays</div>
              <div style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.8, marginBottom: 10 }}>
                4:30–5:00 Ballet<br/>
                5:00–5:45 Acrobatics / Gymnastics<br/>
                5:45–6:15 Tap
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#5B2D6E", marginBottom: 6 }}>Sundays</div>
              <div style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.8 }}>
                10:00–10:30 Street Dance<br/>
                10:30–11:00 Musical Theatre<br/>
                11:00–11:45 Primary / Grade 1 Ballet<br/>
                11:45–12:30 Modern / Jazz<br/>
                12:30–1:15 Grade 2/3 Ballet<br/>
                1:15–2:00 Acrobatics / Gymnastics
              </div>
            </div>
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1F2937", marginBottom: 6 }}>💷 Pricing</div>
              <div style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.8 }}>
                Classes start from £5<br/>
                Paid monthly<br/>
                Multi-class discounts available<br/>
                <span style={{ fontWeight: 900, color: "#166534" }}>Free trial available</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {item.trialLink && <a href={item.trialLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "12px 0", textAlign: "center", background: "#5B2D6E", color: "white", borderRadius: 12, fontSize: 17, fontWeight: 900, textDecoration: "none", boxShadow: "0 2px 8px rgba(107,78,255,0.25)" }}>Book free trial</a>}
              {item.website && <a href={(() => { let u = item.website.trim(); if (!u.startsWith("http")) u = "https://" + u; return u; })()} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "white", color: "#5B2D6E", borderRadius: 12, fontSize: 17, fontWeight: 900, textDecoration: "none", border: "1.5px solid #5B2D6E" }}>Visit website ↗{getHostname(item.website) && <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginTop: 1 }}>{getHostname(item.website)}</div>}</a>}
            </div>
          </>
        )}
        {item.photos && (
          <div onClick={(e) => { e.stopPropagation(); window.open(item.photos, "_blank"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 24 }}>📸</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1F2937" }}>See Photos & Reviews</div>
              <div style={{ fontSize: 14, color: "#4B5563" }}>View real photos from visitors on {item.photos.includes("instagram") ? "Instagram" : item.photos.includes("facebook") ? "Facebook" : "Google Maps"}</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 20, color: "#4B5563" }}>→</span>
          </div>
        )}
        {(() => {
          const sameVenue = (allListings || []).filter(l => l.id !== item.id && l.venue && item.venue && l.venue.trim().toLowerCase() === item.venue.trim().toLowerCase()).slice(0, 2);
          return sameVenue.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Also at this venue</div>
              {sameVenue.map(rel => (
                <div key={rel.id} onClick={() => onSelectListing && onSelectListing(rel)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F9FAFB", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: "1px solid #E5E7EB" }}>
                  {rel.images?.[0]?.url && <img src={rel.images[0].url} alt={rel.name} loading="lazy" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 1 }}>{rel.name}</div>
                    <div style={{ fontSize: 16, color: "#6B7280" }}>{rel.type} · {rel.time}</div>
                  </div>
                  <span style={{ fontSize: 16, color: "#5B2D6E", fontWeight: 800 }}>→</span>
                </div>
              ))}
            </div>
          ) : null;
        })()}
                <div onClick={() => { const addr = (item.venue || item.location || "").trim(); if (!addr) return; window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addr), "_blank", "noopener,noreferrer"); }} style={{ background: "white", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 10, border: "1px solid #E5E7EB", marginBottom: 16, cursor: "pointer" }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#5B2D6E" }}>📍 Open in Maps</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{item.venue.split(",")[0]}</div>
            <div style={{ fontSize: 14, color: "#4B5563" }}>{item.venue}</div>
            <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>Tap to open in Maps</div>
          </div>
          <span style={{ fontSize: 15, color: "#D4732A", fontWeight: 800 }}>↗</span>
        </div>
        {item.bring.length > 0 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>What to Bring</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {item.bring.map(b => <span key={b} style={{ padding: "5px 10px", background: "#FFF3E0", borderRadius: 8, fontSize: 15, fontWeight: 800, color: "#E67E22" }}>{b}</span>)}
            </div>
          </>
        )}
        {item.sen && <div style={{ padding: "8px 12px", background: "#E8FBF8", borderRadius: 10, fontSize: 16, fontWeight: 800, color: "#166534", marginBottom: 16 }}>♿ SEN / Additional Needs Friendly</div>}

        {/* COMMUNITY REVIEWS SECTION */}
        {(itemReviews.length > 0 || showReviewForm) && <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>💬 Community Reviews {itemReviews.length > 0 && <span style={{ fontSize: 15, color: "#4B5563", fontWeight: 700 }}>({itemReviews.length})</span>}</div>
            {!showReviewForm && <span onClick={() => setShowReviewForm(true)} style={{ fontSize: 15, fontWeight: 900, color: "#D4732A", cursor: "pointer", padding: "4px 10px", background: "#D4732A12", borderRadius: 8 }}>+ Add Review</span>}
          </div>

          {submitted && (
            <div style={{ padding: "10px 14px", background: "#E8FBF8", borderRadius: 10, marginBottom: 12, fontSize: 16, fontWeight: 800, color: "#166534", textAlign: "center" }}>✓ Review added — thanks for helping other parents!</div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>Share your experience</div>
              <input value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="Your first name" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E0DBD5", fontSize: 17, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 15, color: "#4B5563", marginBottom: 4 }}>Rating</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setReviewRating(s)} style={{ fontSize: 24, cursor: "pointer", filter: s <= reviewRating ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
                  ))}
                </div>
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What did you and your little one think? Any tips for other parents?" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E0DBD5", fontSize: 17, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#F8F6F3", borderRadius: 10, cursor: "pointer", border: "1px dashed #E0DBD5" }}>
                  <span style={{ fontSize: 22 }}>📷</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>Add photos</div>
                    <div style={{ fontSize: 14, color: "#4B5563" }}>Help other parents see what it's like</div>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
                {reviewImages.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                    {reviewImages.map((img, i) => (
                      <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                        <span onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#D4732A", borderRadius: "50%", color: "white", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowReviewForm(false); setReviewImages([]); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #E0DBD5", background: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", color: "#4B5563" }}>Cancel</button>
                <button onClick={submitReview} disabled={!reviewName.trim() || !reviewText.trim()} style={{ flex: 1.5, padding: 10, borderRadius: 10, border: "none", background: reviewName.trim() && reviewText.trim() ? "#D4732A" : "#E0DBD5", color: "white", fontSize: 16, fontWeight: 900, cursor: reviewName.trim() && reviewText.trim() ? "pointer" : "default", fontFamily: "inherit" }}>Post Review</button>
              </div>
            </div>
          )}

          {/* Existing Reviews */}
          {itemReviews.length > 0 ? itemReviews.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #E5E7EB", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #D4732A, #7B68EE)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 900 }}>{r.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{r.name}</div>
                    <div style={{ fontSize: 14, color: "#4B5563" }}>{r.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15 }}>{"★".repeat(r.rating)}</div>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4B5563", margin: 0 }}>{r.text}</p>
              {((r.images && r.images.length > 0) || (r.photos && r.photos.length > 0)) && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                  {(r.images || r.photos).map((img, i) => <img key={i} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />)}
                </div>
              )}
            </div>
          )) : null}
        </div>

        }{/* COMMUNITY REVIEWS SECTION END */}
        {/* Add to Calendar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1F2937", marginBottom: 6 }}>📅 Add to My Plans</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              const dateKey = d.toISOString().split("T")[0];
              const isAdded = (calendarPlan[dateKey] || []).includes(item.id);
              const dayLabel = i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-GB", { weekday: "short" });
              const dateLabel = d.getDate();
              return <div key={dateKey} onClick={() => isAdded ? onRemoveFromCalendar(item.id, dateKey) : onAddToCalendar(item.id, dateKey)} style={{ flexShrink: 0, padding: "6px 8px", borderRadius: 10, fontSize: 14, fontWeight: 900, textAlign: "center", minWidth: 44, background: isAdded ? "#D4732A" : "white", color: isAdded ? "white" : "#1F2937", border: `1px solid ${isAdded ? "#D4732A" : "#E5E7EB"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 13, marginBottom: 2 }}>{dayLabel}</div>
                <div>{isAdded ? "✓" : dateLabel}</div>
              </div>;
            })}
          </div>
        </div>

        {/* Parent Tips — only show if tips exist or user is adding one */}
        {(tips.length > 0 || showTipInput || tipSubmitted) && <div id="tip-input-scroll" style={{ marginBottom: 12, padding: "14px 16px", background: "white", borderRadius: 12, border: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#1F2937", marginBottom: 6 }}>💡 Parent tips</div>
          {tips.length === 0 && !showTipInput && (
            <div style={{ fontSize: 16, color: "#9CA3AF", marginBottom: 8 }}>No tips yet — be the first parent to leave one!</div>
          )}
          {tips.map((t, i) => (
            <div key={i} style={{ background: "#FFFBEB", borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 16, color: "#4B5563", lineHeight: 1.5 }}>
              💡 {t.tip_text}
            </div>
          ))}
          {tipSubmitted ? (
            <div style={{ fontSize: 16, color: "#166534", fontWeight: 800 }}>✓ Tip added — thanks! Your tip helps local parents ❤️</div>
          ) : showTipInput ? (
            <div>
              <textarea
                value={tipText}
                onChange={e => setTipText(e.target.value.slice(0, 120))}
                placeholder="e.g. Arrive early — gets busy after 10am!"
                rows={2}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 16, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 4 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#9CA3AF" }}>{tipText.length}/120</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span onClick={() => { setShowTipInput(false); setTipText(""); }} style={{ fontSize: 15, color: "#9CA3AF", cursor: "pointer" }}>Cancel</span>
                  <span onClick={() => {
                    if (tipText.trim().length < 3) return;
                    if (onAddTip) onAddTip(item.id, tipText.trim());
                    setTipSubmitted(true);
                    setShowTipInput(false);
                    setTipText("");
                    setTimeout(() => setTipSubmitted(false), 4000);
                  }} style={{ fontSize: 15, fontWeight: 900, color: "#D4732A", cursor: "pointer" }}>Submit</span>
                </div>
              </div>
            </div>
          ) : (
            <div onClick={() => setShowTipInput(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15, fontWeight: 800, color: "#D4732A", cursor: "pointer", marginTop: 2 }}>
              ✏️ Add a quick tip
            </div>
          )}
        </div>}

        {/* Been Here + Contribution Loop */}
        <div style={{ marginBottom: 12 }}>
          {/* Step 1: Been here button */}
          <div
            onClick={() => {
              if (!isVisited) {
                onToggleVisited(item.id);
                setBeenHereJustTapped(true);
                setShowContribute(true);
                setTimeout(() => setBeenHereJustTapped(false), 3000);
              } else {
                onToggleVisited(item.id);
                setShowContribute(false);
              }
            }}
            style={{ padding: "10px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: isVisited ? "linear-gradient(135deg, #166534, #059669)" : "white", border: isVisited ? "none" : "1.5px dashed #E0DBD5", marginBottom: 8 }}
          >
            <span style={{ fontSize: 24 }}>{beenHereJustTapped ? "🎉" : isVisited ? "🏆" : "✅"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: isVisited ? "white" : "#1F2937" }}>
                {beenHereJustTapped ? "Added to your family activity map" : isVisited ? "Been There!" : "Been here? Tap to mark visited"}
              </div>
              <div style={{ fontSize: 14, color: isVisited ? "rgba(255,255,255,0.75)" : "#6B7280" }}>
                {beenHereJustTapped ? "Track places your family has tried." : isVisited ? "Added to your Activity Passport" : "Track activities your family has tried"}
              </div>
            </div>
            {isVisited && !beenHereJustTapped && <span style={{ fontSize: 15, color: "white", fontWeight: 800 }}>✕ Undo</span>}
          </div>

          {/* Step 2: Contribution prompt — shown after tapping */}
          {showContribute && (
            <div style={{ background: "#FFFBF5", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1F2937", marginBottom: 2 }}>Help other Ealing parents 🙌</div>
              <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 10 }}>Add a quick photo or tip about this activity.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ flex: 1, padding: "7px 0", borderRadius: 10, background: "white", border: "1px solid #E5E7EB", fontSize: 15, fontWeight: 900, color: "#374151", cursor: "pointer", textAlign: "center" }}>
                  📸 Add photo
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => {
                    if (e.target.files[0]) {
                      setShowContribute(false);
                      setTimeout(() => alert("Thanks! Your photo helps local parents ❤️"), 100);
                    }
                  }} />
                </label>
                <div
                  onClick={() => { setShowContribute(false); document.getElementById("tip-input-scroll")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 10, background: "white", border: "1px solid #E5E7EB", fontSize: 15, fontWeight: 900, color: "#374151", cursor: "pointer", textAlign: "center" }}
                >✏️ Add quick tip</div>
              </div>
              {/* Share nudge after been-here */}
              <div onClick={() => { const shareUrl = "https://littlelocals.uk/?activity=" + (item.slug || item.id); const msg = "Thought you might like this for the kids 👶\n\n" + item.name + "\n" + (item.description ? item.description.slice(0,80) + "..." : item.type + " · " + item.ages) + "\n\nFound it on LITTLElocals:\n" + shareUrl; if (navigator.share) navigator.share({ title: item.name, text: msg, url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank"); }} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #FED7AA", fontSize: 15, color: "#D4732A", fontWeight: 800, cursor: "pointer", textAlign: "center" }}>
                Send this to another parent →
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); const shareUrl = "https://littlelocals.uk/?activity=" + (item.slug || item.id); const msg = "Thought you might like this for the kids 👶\n\n" + item.name + "\n" + (item.description ? item.description.slice(0,80) + "..." : item.type + " · " + item.ages) + "\n\nFound it on LITTLElocals:\n" + shareUrl; if (navigator.share) navigator.share({ title: item.name, text: msg, url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank"); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Send to another parent
          </button>
          <button onClick={(e) => { e.stopPropagation(); const url = item.website || (item.cta && item.cta.url) || ""; openExternalWebsite(url); }} style={{ flex: 1.2, padding: 12, borderRadius: 12, border: "none", background: item.cta.type === "phone" ? "#42A5F5" : item.cta.type === "facebook" ? "#1877F2" : item.cta.type === "email" ? "#7B68EE" : "#D4732A", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
            {item.cta.type === "phone" ? "📞 " : item.cta.type === "facebook" ? "📘 " : item.cta.type === "email" ? "✉️ " : (item.website || item.cta.url || "").includes("instagram") ? "📸 " : (item.website || item.cta.url || "").includes("book") || (item.website || item.cta.url || "").includes("ticket") || (item.website || item.cta.url || "").includes("happity") ? "🎟 " : "🌐 "}{item.cta.type === "phone" ? "Call" : item.cta.type === "facebook" ? "View on Facebook" : item.cta.type === "email" ? "Email" : (item.website || item.cta.url || "").includes("instagram") ? "View on Instagram" : (item.website || item.cta.url || "").includes("book") || (item.website || item.cta.url || "").includes("ticket") || (item.website || item.cta.url || "").includes("happity") ? "Book now" : "Visit Website"}
          </button>
        </div>
        {item.cta && item.cta.url && item.website && item.website !== item.cta.url && (
          <div style={{ marginTop: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); openExternalWebsite(item.cta.url); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#D4732A", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
              🔗 More info / Bookings
            </button>
          </div>
        )}

        {item.whatsappGroup && (
          <div style={{ marginTop: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); window.open(item.whatsappGroup, "_blank"); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "white", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.684-6.34-1.861l-.455-.296-2.725.914.912-2.727-.306-.463A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Join WhatsApp Group
            </button>
          </div>
        )}
        {/* Suggested by credit */}
        {item.suggestedBy && (
          <div style={{ marginTop: 10, fontSize: 15, color: "#9CA3AF", textAlign: "center" }}>Suggested by {item.suggestedBy || "a local parent"}</div>
        )}

        {/* Provider share prompt */}
        <div onClick={() => { const shareUrl = window.location.href; if (navigator.share) navigator.share({ title: item.name + " on LITTLElocals", text: "Share this page with parents who might be interested", url: shareUrl }); else window.open("https://wa.me/?text=" + encodeURIComponent("Check out " + item.name + " on LITTLElocals — share with parents who'd love this! " + shareUrl), "_blank"); }} style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "#F9FAFB", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#6B7280" }}>Share this page with parents</div>
        </div>

        {/* Claim this activity */}
        <div onClick={() => window.open("mailto:littlelocalsuk@gmail.com?subject=Claim: " + encodeURIComponent(item.name) + "&body=" + encodeURIComponent("Hi, I run " + item.name + " and would like to claim this listing to manage photos and info."), "_blank")} style={{ marginTop: 8, padding: "10px 14px", borderRadius: 12, border: "1px dashed #E5E7EB", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#6B7280" }}>Run this activity?</div>
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>Claim this listing to update photos and info</div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { FALLBACK_LISTINGS } from "./fallbackListings.jsx";
import { typeColors } from "./typeColors.jsx";
import { getDistanceMiles } from "./utils.jsx";
import { BrandBear, SceneBg, isOnToday, isOnDay, shareWhatsApp, MapView, ListingCard, DetailView } from "./components.jsx";

let supabase = null;
try {
  supabase = createClient(
    "https://xjifxwvziwoepiioyitm.supabase.co",
    "sb_publishable__wfpTD3AcZhvRHcS_4LbXg_6E2QkGXv"
  );
} catch(e) {
  console.log("Supabase init failed:", e);
}

function WestLondonListings() {
  const [listings, setListings] = useState(FALLBACK_LISTINGS);
  const [selected, setSelected] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) return false;
      if (window.navigator.standalone === true) return false;
      const visits = parseInt(localStorage.getItem("ll_visit_count") || "0"); localStorage.setItem("ll_visit_count", String(visits + 1)); if (visits < 1) return false; return false;
    } catch(e) { return false; }
  });
  useEffect(() => {
    try {
      const visits = parseInt(localStorage.getItem("ll_visit_count") || "0");
      if (visits < 2 || localStorage.getItem("ll_install_dismissed")) return;
      if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return;
      const t = setTimeout(() => setShowInstallBanner(true), 60000);
      return () => clearTimeout(t);
    } catch(e) {}
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const shownIdsRef = useRef(new Set());
  const [installPrompt, setInstallPrompt] = useState(null);

  // Capture Chrome's install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [areaFilter, setAreaFilter] = useState(() => {
    try {
      const areaChips = ["Ealing", "Acton", "Chiswick", "Hanwell", "Northfields", "Ruislip", "Eastcote", "Uxbridge"];
      const norm = s => s.trim().toLowerCase().replace(/['']/g, "").replace(/\s+/g, " ");
      const areaMap = {};
      areaChips.forEach(a => { areaMap[norm(a)] = a; });
      const raw = new URLSearchParams(window.location.search).get("area");
      if (!raw) return "Ealing";
      const match = areaMap[norm(raw)];
      if (match) return match;
      // No match — clean the bad param
      const url = new URL(window.location); url.searchParams.delete("area"); window.history.replaceState({}, "", url);
      return "Ealing";
    } catch(e) { return "Ealing"; }
  });
  const [freeOnly, setFreeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [userLoc, setUserLoc] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [isSunny, setIsSunny] = useState(true);
  const [dayFilter, setDayFilter] = useState("today");
  const [weatherMode, setWeatherMode] = useState("all");
  const [napFilter, setNapFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAllToday, setShowAllToday] = useState(false);
  const [tips, setTips] = useState({}); // { [activityId]: [tip, ...] }
  const [mapView, setMapView] = useState(false);
  const [sortBy, setSortBy] = useState("mixed");
  const ITEMS_PER_PAGE = 6;
  const [cityFilter, setCityFilter] = useState(() => {
    try { return localStorage.getItem("ll_city") || "All"; } catch(e) { return "All"; }
  });
  const [reviews, setReviews] = useState([]);
  const [favourites, setFavourites] = useState(() => {
    try { const s = localStorage.getItem("ll_favs"); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  });
  const [passport, setPassport] = useState(() => {
    try { const s = localStorage.getItem("ll_passport"); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  });
  const [clickCounts, setClickCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ll_clicks") || "{}"); } catch(e) { return {}; }
  });
  const trackClick = (id) => {
    setClickCounts(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      try { localStorage.setItem("ll_clicks", JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const [showFavourites, setShowFavourites] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [calendarPlan, setCalendarPlan] = useState(() => {
    try { const s = localStorage.getItem("ll_calendar_v2"); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
  });
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ name: "", type: "Soft Play", city: "London", location: "", venue: "", ages: "", day: "", time: "", price: "", description: "", submitterName: "", submitterEmail: "" });
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => { try { return localStorage.getItem("ll_cookieConsent"); } catch(e) { return null; } });
  const [legalPage, setLegalPage] = useState(null);

  // Load Google Analytics if consent given
  useEffect(() => {
    if (cookieConsent === "accepted" && !window.gtag) {
      const s = document.createElement("script");
      s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
      s.async = true;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", "G-XXXXXXXXXX");
    }
  }, [cookieConsent]);

  const acceptCookies = () => { try { localStorage.setItem("ll_cookieConsent", "accepted"); } catch(e) {} setCookieConsent("accepted"); };
  const declineCookies = () => { try { localStorage.setItem("ll_cookieConsent", "rejected"); } catch(e) {} setCookieConsent("rejected"); };

  // Habit tracking: last visit + first seen
  const [lastVisit] = useState(() => { try { return Number(localStorage.getItem("ll_lastVisit") || 0); } catch(e) { return 0; } });
  const [seenMap] = useState(() => { try { return JSON.parse(localStorage.getItem("ll_seenActivityIds") || "{}"); } catch(e) { return {}; } });
  useEffect(() => { try { localStorage.setItem("ll_lastVisit", String(Date.now())); } catch(e) {} }, []);
  const getFirstSeenAt = (id) => { if (!seenMap[id]) { seenMap[id] = Date.now(); try { localStorage.setItem("ll_seenActivityIds", JSON.stringify(seenMap)); } catch(e) {} } return seenMap[id]; };
  const isNewActivity = (a) => a.createdAt ? (Date.now() - new Date(a.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000 : false;

  // Load from Supabase on mount (localStorage fallback)
  useEffect(() => {
    // Fetch weather for Ealing (Open-Meteo, no API key needed)
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.513&longitude=-0.309&current=weather_code&timezone=Europe/London")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.current && d.current.weather_code !== undefined) {
          // WMO codes: 0-3 = clear/partly cloudy, 45-48 = fog, 51+ = rain/snow
          var sunny = d.current.weather_code <= 3;
          setIsSunny(sunny);
          console.log("Weather code:", d.current.weather_code, "Sunny:", sunny);
        }
      })
      .catch(function(e) { console.log("Weather fetch failed, defaulting to sunny"); });
    (async () => {
      if (!supabase) { console.log("No Supabase client, using fallback"); return; }
      try {
        // Load listings from Supabase
        const { data: ld, error: listErr } = await supabase.from("listings").select("*").order("id", { ascending: true }).limit(500);
        console.log("Listings loaded:", ld ? ld.length : 0, "error:", listErr);
        if (ld && ld.length > 0) {
          setListings(ld.map(l => {
            const slug = (l.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + (l.location || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            return {
            id: l.id, name: l.name, type: l.type, emoji: l.emoji, slug,
            location: l.location, venue: l.venue, lat: l.lat, lng: l.lng,
            ages: l.ages, day: l.day, time: l.time, price: l.price,
            free: l.free, indoor: l.indoor, description: l.description,
            bring: l.bring || [], sen: l.sen,
            cta: { type: l.cta_type, label: l.cta_label, url: l.cta_url },
            photos: l.photos, verified: l.verified, parking: l.parking,
            timeSlot: l.time_slot, createdAt: l.created_at, popular: l.popular, featuredProvider: l.featured_provider, freeTrial: l.free_trial, trialLink: l.trial_link, website: l.website, imageUrl: l.image_url, suggestedBy: l.suggested_by,
          };}));

        // Fetch listing_images and attach to listings
        const { data: imgData } = await supabase.from("listing_images").select("*").order("sort_order", { ascending: true });
        if (imgData && imgData.length > 0) {
          const imgMap = {};
          imgData.forEach(img => {
            if (!imgMap[img.listing_id]) imgMap[img.listing_id] = [];
            imgMap[img.listing_id].push(img.url);
          });
          setListings(prev => prev.map(l => ({ ...l, images: imgMap[l.id] || [] })));
        }
          try { localStorage.setItem("ll_listings_cache", JSON.stringify(ld)); } catch(e) {}
        }
        // Load reviews
        const { data: rd } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        if (rd) {
          setReviews(rd.map(r => ({ id: r.id, listingId: r.listing_id, name: r.reviewer_name, rating: r.rating, text: r.review_text, photos: r.photos || [], date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })));
          try { localStorage.setItem("ll_reviews", JSON.stringify(rd)); } catch(e) {}
        }
        // Load suggestions
        const { data: sd } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
        if (sd) setSuggestedActivities(sd.map(s => ({ ...s, submitterName: s.submitter_name, submittedAt: new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })));
        const { data: tipsData } = await supabase.from("parent_tips").select("*").order("created_at", { ascending: true });
        if (tipsData) {
          const tipsMap = {};
          tipsData.forEach(t => {
            if (!tipsMap[t.activity_id]) tipsMap[t.activity_id] = [];
            tipsMap[t.activity_id].push(t);
          });
          setTips(tipsMap);
        }
      } catch(e) {
        console.log("Supabase unavailable, trying local cache");
        try {
          const cachedListings = localStorage.getItem("ll_listings_cache");
          if (cachedListings) {
            const ld = JSON.parse(cachedListings);
            setListings(ld.map(l => {
              const slug = (l.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + (l.location || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return {
              id: l.id, name: l.name, type: l.type, emoji: l.emoji, slug,
              location: l.location, venue: l.venue, lat: l.lat, lng: l.lng,
              ages: l.ages, day: l.day, time: l.time, price: l.price,
              free: l.free, indoor: l.indoor, description: l.description,
              bring: l.bring || [], sen: l.sen,
              cta: { type: l.cta_type, label: l.cta_label, url: l.cta_url },
              photos: l.photos, verified: l.verified, parking: l.parking,
              timeSlot: l.time_slot, createdAt: l.created_at, popular: l.popular, featuredProvider: l.featured_provider, freeTrial: l.free_trial, trialLink: l.trial_link, website: l.website, imageUrl: l.image_url, suggestedBy: l.suggested_by,
            };}));
          }
        } catch(e2) {}
        try { const sr = localStorage.getItem("ll_reviews"); if (sr) { const rd = JSON.parse(sr); setReviews(rd.map(r => ({ id: r.id, listingId: r.listing_id || r.listingId, name: r.reviewer_name || r.name, rating: r.rating, text: r.review_text || r.text, photos: r.photos || [], date: r.date || new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }))); } } catch(e2) {}
        try { const ss = localStorage.getItem("ll_suggestions"); if (ss) setSuggestedActivities(JSON.parse(ss)); } catch(e2) {}
      }
      setIsLoading(false);
    })();
  }, []);

  // Browser back button support + deep link URL handling
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path.startsWith("/activity/")) {
        const slug = path.replace("/activity/", "");
        const match = listings.find(a => a.slug === slug);
        if (match) { setSelected(match); window.scrollTo(0, 0); return; }
      }
      if (selected) { setSelected(null); window.history.replaceState({}, "", "/"); return; }
      if (showCalendar) { setShowCalendar(false); return; }
      if (showSuggest) { setShowSuggest(false); return; }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [selected, showCalendar, showSuggest, listings]);

  // Deep link: open activity from URL on load
  useEffect(() => {
    if (listings.length === 0) return;
    const path = window.location.pathname;
    if (path.startsWith("/activity/")) {
      const slug = path.replace("/activity/", "");
      const match = listings.find(a => a.slug === slug);
      if (match) { setSelected(match); window.scrollTo(0, 0); }
    }
  }, [listings]);

  // Push history state when opening views
  const openDetail = (item) => { window.history.pushState({ view: "detail" }, "", "/activity/" + (item.slug || item.id)); setSelected(item); window.scrollTo(0, 0); };
  const openCalendar = () => { const now = new Date(); setCalMonth(now.getMonth()); setCalYear(now.getFullYear()); setSelectedDate(now.toISOString().split("T")[0]); window.history.pushState({ view: "calendar" }, ""); setShowCalendar(true); };
  const openSuggest = () => { window.history.pushState({ view: "suggest" }, ""); setShowSuggest(true); };

  const closeDetail = () => { window.history.pushState({}, "", "/"); setSelected(null); };
  const closeCalendar = () => { if (window.history.state?.view) window.history.back(); else setShowCalendar(false); };
  const closeSuggest = () => { if (window.history.state?.view) window.history.back(); else setShowSuggest(false); };

  // Scroll to top button visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pull to refresh
  const refreshData = async () => {
    if (!supabase || pullRefreshing) return;
    setPullRefreshing(true);
    try {
      const { data: ld } = await supabase.from("listings").select("*").order("id", { ascending: true }).limit(500);
      if (ld && ld.length > 0) {
        setListings(ld.map(l => {
          const slug = (l.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + (l.location || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return {
          id: l.id, name: l.name, type: l.type, emoji: l.emoji, slug,
          location: l.location, venue: l.venue, lat: l.lat, lng: l.lng,
          ages: l.ages, day: l.day, time: l.time, price: l.price,
          free: l.free, indoor: l.indoor, description: l.description,
          bring: l.bring || [], sen: l.sen,
          cta: { type: l.cta_type, label: l.cta_label, url: l.cta_url },
          photos: l.photos, verified: l.verified, parking: l.parking,
          timeSlot: l.time_slot, createdAt: l.created_at, popular: l.popular, featuredProvider: l.featured_provider, freeTrial: l.free_trial, trialLink: l.trial_link, website: l.website, imageUrl: l.image_url, suggestedBy: l.suggested_by,
        };}));
      }
      // Refresh listing_images
      const { data: imgData2 } = await supabase.from("listing_images").select("*").order("sort_order", { ascending: true });
      if (imgData2 && imgData2.length > 0) {
        const imgMap2 = {};
        imgData2.forEach(img => {
          if (!imgMap2[img.listing_id]) imgMap2[img.listing_id] = [];
          imgMap2[img.listing_id].push(img.url);
        });
        setListings(prev => prev.map(l => ({ ...l, images: imgMap2[l.id] || [] })));
      }
            const { data: rd } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (rd) setReviews(rd.map(r => ({ id: r.id, listingId: r.listing_id, name: r.reviewer_name, rating: r.rating, text: r.review_text, photos: r.photos || [], date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })));
    } catch(e) {}
    setPullRefreshing(false);
  };

  // Backup to localStorage
  useEffect(() => { try { localStorage.setItem("ll_city", cityFilter); } catch(e) {} }, [cityFilter]);
  useEffect(() => { try { localStorage.setItem("ll_reviews", JSON.stringify(reviews)); } catch(e) {} }, [reviews]);
  useEffect(() => { try { localStorage.setItem("ll_suggestions", JSON.stringify(suggestedActivities)); } catch(e) {} }, [suggestedActivities]);

  // Sync area filter to URL
  useEffect(() => {
    try {
      const url = new URL(window.location);
      if (!window.location.pathname.startsWith("/admin")) {
        if (areaFilter !== "All Areas") { url.searchParams.set("area", areaFilter); } else { url.searchParams.delete("area"); }
        window.history.replaceState({}, "", url);
      }
    } catch(e) {}
  }, [areaFilter]);

  // Reset to page 1 when any filter changes
  useEffect(() => { setPage(1); }, [cityFilter, typeFilter, areaFilter, freeOnly, search, dayFilter, weatherMode, napFilter, ageFilter]);

  // Persist favourites
  useEffect(() => { try { localStorage.setItem("ll_favs", JSON.stringify(favourites)); } catch(e) {} }, [favourites]);
  useEffect(() => { try { localStorage.setItem("ll_passport", JSON.stringify(passport)); } catch(e) {} }, [passport]);
  useEffect(() => { try { localStorage.setItem("ll_calendar_v2", JSON.stringify(calendarPlan)); } catch(e) {} }, [calendarPlan]);

  const addToCalendar = (activityId, dateKey) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setCalendarPlan(prev => {
      const day = prev[dateKey] || [];
      if (day.includes(activityId)) return prev;
      return { ...prev, [dateKey]: [...day, activityId] };
    });
  };

  const removeFromCalendar = (activityId, dateKey) => {
    setCalendarPlan(prev => {
      const updated = (prev[dateKey] || []).filter(id => id !== activityId);
      const newPlan = { ...prev, [dateKey]: updated };
      if (updated.length === 0) delete newPlan[dateKey];
      return newPlan;
    });
  };

  const calendarTotal = Object.values(calendarPlan).reduce((sum, arr) => sum + arr.length, 0);

  const toggleFavourite = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setFavourites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const togglePassport = (id) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setPassport(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const addReview = async (review) => {
    const temp = { ...review, id: Date.now(), date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    setReviews(prev => [temp, ...prev]);
    try {
      const { data } = await supabase.from("reviews").insert({ listing_id: review.listingId, reviewer_name: review.name, rating: review.rating, review_text: review.text, photos: review.images || review.photos || [] }).select().single();
      if (data) setReviews(prev => prev.map(r => r.id === temp.id ? { id: data.id, listingId: data.listing_id, name: data.reviewer_name, rating: data.rating, text: data.review_text, photos: data.photos || [], date: new Date(data.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) } : r));
    } catch(e) {}
  };

  const addTip = async (activityId, tipText) => {
    const trimmed = tipText.trim().slice(0, 120);
    if (!trimmed) return;
    const temp = { id: "tmp-" + Date.now(), activity_id: activityId, tip_text: trimmed, created_at: new Date().toISOString() };
    setTips(prev => ({ ...prev, [activityId]: [...(prev[activityId] || []), temp] }));
    try {
      const { data } = await supabase.from("parent_tips").insert({ activity_id: activityId, tip_text: trimmed }).select().single();
      if (data) setTips(prev => ({
        ...prev,
        [activityId]: (prev[activityId] || []).map(t => t.id === temp.id ? data : t)
      }));
    } catch(e) {}
  };

  const submitSuggestion = async () => {
    if (!suggestForm.name.trim() || !suggestForm.venue.trim() || !suggestForm.submitterName.trim() || !suggestForm.location) return;
    const temp = { ...suggestForm, id: Date.now(), status: "pending", submittedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    setSuggestedActivities(prev => [...prev, temp]);
    try {
      await supabase.from("suggestions").insert({ name: suggestForm.name, type: suggestForm.type, city: suggestForm.city, location: suggestForm.location, venue: suggestForm.venue, ages: suggestForm.ages, day: suggestForm.day + (suggestForm.time ? " " + suggestForm.time : ""), price: suggestForm.price, description: suggestForm.description, submitter_name: suggestForm.submitterName, submitter_email: suggestForm.submitterEmail });
    } catch(e) {}
    setSuggestForm({ name: "", type: "Soft Play", city: "London", location: "", venue: "", ages: "", day: "", time: "", price: "", description: "", submitterName: "", submitterEmail: "" });
    setShowSuggest(false);
    setSuggestSubmitted(true);
    setTimeout(() => setSuggestSubmitted(false), 5000);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus("granted"); setSortBy("nearest"); setAreaFilter("All Areas"); setPage(1); },
      (err) => { console.log("Location error:", err.message); setLocStatus("denied"); },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

// Smart search keywords — maps common search terms to activity types and specific listings
const searchKeywords = {
  // Dance & movement
  "dance": ["Music", "Performing Arts", "Sport"],
  "ballet": ["Performing Arts"],
  "street dance": ["Performing Arts"],
  "tap": ["Performing Arts"],
  "movement": ["Music", "Performing Arts"],
  "disco": ["Music", "Performing Arts"],
  // Arts & making
  "pottery": ["Arts & Crafts", "Baking"],
  "painting": ["Arts & Crafts", "Messy Play"],
  "ceramics": ["Arts & Crafts"],
  "drawing": ["Arts & Crafts"],
  "creative": ["Arts & Crafts", "Messy Play", "Baking"],
  "craft": ["Arts & Crafts", "Messy Play"],
  "art": ["Arts & Crafts", "Messy Play"],
  "make": ["Arts & Crafts", "Baking"],
  // Physical
  "trampoline": ["Sport"],
  "gymnastics": ["Sport"],
  "circus": ["Sport"],
  "climbing": ["Sport", "Outdoor"],
  "football": ["Sport"],
  "tennis": ["Sport", "Outdoor"],
  "jump": ["Sport"],
  "bounce": ["Soft Play", "Sport"],
  "active": ["Sport", "Soft Play", "Outdoor"],
  "exercise": ["Sport", "Swimming"],
  // Water
  "swim": ["Swimming"],
  "pool": ["Swimming"],
  "water": ["Swimming", "Messy Play", "Outdoor"],
  "splash": ["Swimming", "Outdoor"],
  // Nature & outdoors
  "park": ["Outdoor"],
  "garden": ["Outdoor"],
  "nature": ["Outdoor"],
  "walk": ["Outdoor"],
  "forest": ["Outdoor"],
  "woods": ["Outdoor"],
  "playground": ["Outdoor"],
  "picnic": ["Outdoor"],
  "animals": ["Outdoor"],
  "ducks": ["Outdoor"],
  "beach": ["Outdoor"],
  // Learning & development
  "sing": ["Music", "Story Time"],
  "song": ["Music", "Story Time"],
  "rhyme": ["Story Time", "Music"],
  "reading": ["Story Time"],
  "books": ["Story Time"],
  "library": ["Story Time"],
  "learn": ["Messy Play", "Story Time", "Performing Arts"],
  "educational": ["Messy Play", "Story Time"],
  // Social
  "baby group": ["Playgroup", "Music"],
  "toddler group": ["Playgroup"],
  "mum": ["Playgroup"],
  "parent": ["Playgroup"],
  "social": ["Playgroup", "Soft Play"],
  "friends": ["Playgroup", "Soft Play"],
  "drop in": ["Playgroup"],
  "free": ["Playgroup", "Outdoor"],
  // Sensory & messy
  "sensory": ["Messy Play", "Music", "Soft Play"],
  "messy": ["Messy Play"],
  "slime": ["Messy Play"],
  "paint": ["Messy Play", "Arts & Crafts"],
  "sand": ["Messy Play", "Outdoor"],
  "play dough": ["Messy Play", "Arts & Crafts"],
  // Food
  "cook": ["Baking"],
  "bake": ["Baking"],
  "cake": ["Baking"],
  "food": ["Baking"],
  // Needs
  "sen": ["Playgroup", "Swimming"],
  "disability": ["Playgroup", "Swimming"],
  "additional needs": ["Playgroup", "Swimming"],
  "accessible": ["Outdoor", "Playgroup"],
  // Entertainment
  "theatre": ["Performing Arts"],
  "drama": ["Performing Arts"],
  "acting": ["Performing Arts"],
  "show": ["Performing Arts", "Music"],
  "perform": ["Performing Arts"],
  "stage": ["Performing Arts"],
  // Play
  "soft play": ["Soft Play"],
  "ball pit": ["Soft Play"],
  "slide": ["Soft Play", "Outdoor"],
  "indoor play": ["Soft Play"],
  // Transport themed
  "train": ["Outdoor"],
  "railway": ["Outdoor"],
  "miniature": ["Outdoor"],
};

// City groupings for the city picker
const cityGroups = {
  "London": ["Acton", "Barnet", "Battersea", "Bethnal Green", "Brentford", "Brixton", "Camden", "Canary Wharf", "Chiswick", "Clapham", "Covent Garden", "Croydon", "Crystal Palace", "Dulwich", "Ealing", "Eastcote", "Edgware", "Feltham", "Finchley", "Forest Hill", "Greenford", "Greenwich", "Hackney", "Hammersmith", "Hampstead", "Hanwell", "Harrow", "Hayes", "Highgate", "Hillingdon", "Hounslow", "Ickenham", "Isleworth", "Islington", "Kensington", "Kew", "Lea Bridge", "Lewisham", "London Bridge", "Northfields", "Northolt", "Northwood", "Peckham", "Pinner", "Pitshanger", "Regent's Park", "Richmond", "Romford", "Ruislip", "Shepherd's Bush", "Silvertown", "South Ealing", "South Kensington", "South Ruislip", "Southall", "Southwark", "Stanmore", "Stratford", "Twickenham", "Uxbridge", "Walthamstow", "Wembley", "Westminster", "Wimbledon", "Acton / Chiswick", "Acton / Ealing", "Hillingdon-wide"],
  "Birmingham": ["Birmingham"],
  "Manchester": ["Manchester"],
  "Leeds": ["Leeds"],
  "Liverpool": ["Liverpool"],
  "Hertfordshire": ["Hemel Hempstead", "Watford", "St Albans", "Stevenage", "Hatfield", "Hertford", "Welwyn Garden City"],
  "Buckinghamshire": ["Amersham", "Aylesbury", "Beaconsfield", "Bourne End", "Burnham", "Chesham", "Denham", "Flackwell Heath", "Gerrards Cross", "Great Missenden", "Hazlemere", "High Wycombe", "Iver", "Loudwater", "Maidenhead", "Marlow", "Princes Risborough", "Rickmansworth", "Slough", "Taplow", "Wendover", "Windsor", "Wooburn"],
  "Essex": ["Chelmsford", "Southend", "Colchester", "Basildon", "Brentwood", "Epping", "Harlow", "Braintree", "Maldon", "Thurrock", "Billericay", "Rayleigh", "Wickford", "Benfleet", "Grays", "Loughton", "Chigwell", "Romford"],
};

function getSearchScore(item, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  
  let score = 0;
  const name = item.name.toLowerCase();
  const type = item.type.toLowerCase();
  const loc = item.location.toLowerCase();
  const desc = item.description.toLowerCase();
  const venue = item.venue.toLowerCase();
  
  // Exact name match — highest priority
  if (name.includes(q)) score += 100;
  // Type match
  if (type.includes(q)) score += 80;
  // Location match
  if (loc.includes(q)) score += 70;
  // Venue match
  if (venue.includes(q)) score += 60;
  // Description match
  if (desc.includes(q)) score += 40;
  
  // Keyword matching — check each keyword
  for (const [keyword, types] of Object.entries(searchKeywords)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      if (types.includes(item.type)) score += 50;
      // Bonus if keyword appears in description too
      if (desc.includes(keyword)) score += 20;
    }
  }
  
  // Multi-word search — check each word
  const words = q.split(/\s+/);
  if (words.length > 1) {
    words.forEach(word => {
      if (word.length < 2) return;
      if (name.includes(word)) score += 30;
      if (type.includes(word)) score += 25;
      if (desc.includes(word)) score += 15;
      if (loc.includes(word)) score += 15;
    });
  }
  
  return score;
}

  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayNamesShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayName = dayNames[new Date().getDay()];
  const todayNameShort = dayNamesShort[new Date().getDay()];

  const filtered = useMemo(() => {
    let results = listings.filter(l => {
      if (showFavourites && !favourites.includes(l.id)) return false;
      if (cityFilter !== "All" && !cityGroups[cityFilter]?.some(a => l.location.includes(a))) return false;
      if (typeFilter !== "All Types" && l.type !== typeFilter) return false;
      if (areaFilter !== "All Areas") {
        const ealingBorough = ["Ealing", "Hanwell", "West Ealing", "North Ealing", "South Ealing"];
        if (areaFilter === "Ealing") {
          if (!ealingBorough.some(a => l.location.includes(a))) return false;
        } else {
          if (!l.location.includes(areaFilter)) return false;
        }
      }
      if (freeOnly && !l.free) return false;
      if (dayFilter === "today" && !isOnToday(l)) return false;
      if (dayFilter !== "all" && dayFilter !== "today" && !isOnDay(l, parseInt(dayFilter))) return false;
      if (weatherMode === "rainy" && !l.indoor) return false;
      if (weatherMode === "sunny" && l.indoor) return false;
      if (napFilter === "morning" && l.timeSlot !== "morning" && l.timeSlot !== "all-day") return false;
      if (napFilter === "afternoon" && l.timeSlot !== "afternoon" && l.timeSlot !== "all-day") return false;
      if (ageFilter !== "all") {
        const a = (l.ages || "").toLowerCase();
        if (a.includes("all ages")) { /* passes */ }
        else {
          const nums = a.match(/\d+/g);
          if (!nums) return false;
          const lo = parseInt(nums[0]);
          const hi = nums.length > 1 ? parseInt(nums[nums.length - 1]) : lo;
          const loYrs = a.includes("mo") && lo < 24 ? lo / 12 : lo;
          const hiYrs = a.includes("mo") && hi < 24 && nums.length === 1 ? hi / 12 : hi;
          if (ageFilter === "0-1" && hiYrs < 0 ) return false;
          if (ageFilter === "0-1" && loYrs > 1) return false;
          if (ageFilter === "1-2" && loYrs > 2) return false;
          if (ageFilter === "1-2" && hiYrs < 1) return false;
          if (ageFilter === "2-4" && loYrs > 4) return false;
          if (ageFilter === "2-4" && hiYrs < 2) return false;
          if (ageFilter === "4-7" && loYrs > 7) return false;
          if (ageFilter === "4-7" && hiYrs < 4) return false;
          if (ageFilter === "7+" && hiYrs < 7) return false;
        }
      }
      if (search) {
        const score = getSearchScore(l, search);
        if (score === 0) return false;
      }
      return true;
    });
    if (search) {
      results.sort((a, b) => getSearchScore(b, search) - getSearchScore(a, search));
    } else if (sortBy === "nearest" && userLoc) {
      results.sort((a, b) => getDistanceMiles(userLoc.lat, userLoc.lng, a.lat, a.lng) - getDistanceMiles(userLoc.lat, userLoc.lng, b.lat, b.lng));
    } else if (sortBy === "price-low") {
      results.sort((a, b) => {
        const pa = a.free ? 0 : parseFloat((a.price.match(/[\d.]+/) || [999])[0]);
        const pb = b.free ? 0 : parseFloat((b.price.match(/[\d.]+/) || [999])[0]);
        return pa - pb;
      });
    } else if (sortBy === "price-high") {
      results.sort((a, b) => {
        const pa = a.free ? 0 : parseFloat((a.price.match(/[\d.]+/) || [0])[0]);
        const pb = b.free ? 0 : parseFloat((b.price.match(/[\d.]+/) || [0])[0]);
        return pb - pa;
      });
    } else if (sortBy === "free-first") {
      results.sort((a, b) => (b.free ? 1 : 0) - (a.free ? 1 : 0));
    } else if (sortBy === "indoor") {
      results.sort((a, b) => (b.indoor ? 1 : 0) - (a.indoor ? 1 : 0));
    } else if (sortBy === "outdoor") {
      results.sort((a, b) => (a.indoor ? 1 : 0) - (b.indoor ? 1 : 0));
    } else {
      // "mixed" — ensure variety of types on each page
      const types = [...new Set(results.map(r => r.type))];
      const buckets = {};
      types.forEach(t => { buckets[t] = results.filter(r => r.type === t); });
      const mixed = [];
      let safety = results.length + 10;
      while (mixed.length < results.length && safety-- > 0) {
        for (const t of types) {
          if (buckets[t].length > 0) mixed.push(buckets[t].shift());
        }
      }
      results = mixed;
    }
    // Prioritise Sing and Sign Ealing towards the top (but not pinned first)
    if (!search) {
      const singIdx = results.findIndex(r => r.name && r.name.toLowerCase().includes("sing and sign"));
      if (singIdx > 2) {
        const [singItem] = results.splice(singIdx, 1);
        results.splice(2, 0, singItem);
      }
    }
    return results;
  }, [listings, showFavourites, favourites, cityFilter, typeFilter, areaFilter, freeOnly, search, userLoc, dayFilter, weatherMode, napFilter, sortBy]);

  const areaPreviewCounts = useMemo(() => {
    const counts = {};
    ["Ealing", "Acton", "Chiswick", "Hanwell", "Northfields", "Ruislip", "Eastcote", "Uxbridge"].forEach(area => {
      counts[area] = listings.filter(l => {
        if (!l.location.includes(area)) return false;
        if (showFavourites && !favourites.includes(l.id)) return false;
        if (cityFilter !== "All" && !cityGroups[cityFilter]?.some(a => l.location.includes(a))) return false;
        if (typeFilter !== "All Types" && l.type !== typeFilter) return false;
        if (freeOnly && !l.free) return false;
        if (dayFilter === "today" && !isOnToday(l)) return false;
        if (dayFilter !== "all" && dayFilter !== "today" && !isOnDay(l, parseInt(dayFilter))) return false;
        if (weatherMode === "rainy" && !l.indoor) return false;
        if (weatherMode === "sunny" && l.indoor) return false;
        if (napFilter === "morning" && l.timeSlot !== "morning" && l.timeSlot !== "all-day") return false;
        if (napFilter === "afternoon" && l.timeSlot !== "afternoon" && l.timeSlot !== "all-day") return false;
        if (ageFilter !== "all") {
          const a = (l.ages || "").toLowerCase();
          if (!a.includes("all ages")) {
            const nums = a.match(/\d+/g);
            if (!nums) return false;
            const lo = parseInt(nums[0]);
            const hi = nums.length > 1 ? parseInt(nums[nums.length - 1]) : lo;
            const loYrs = a.includes("mo") && lo < 24 ? lo / 12 : lo;
            const hiYrs = a.includes("mo") && hi < 24 && nums.length === 1 ? hi / 12 : hi;
            if (ageFilter === "0-1" && loYrs > 1) return false;
            if (ageFilter === "1-2" && (loYrs > 2 || hiYrs < 1)) return false;
            if (ageFilter === "2-4" && (loYrs > 4 || hiYrs < 2)) return false;
            if (ageFilter === "4-7" && (loYrs > 7 || hiYrs < 4)) return false;
            if (ageFilter === "7+" && hiYrs < 7) return false;
          }
        }
        if (search && getSearchScore(l, search) === 0) return false;
        return true;
      }).length;
    });
    return counts;
  }, [listings, showFavourites, favourites, cityFilter, typeFilter, freeOnly, search, dayFilter, weatherMode, napFilter, ageFilter]);

  const sortedAreas = useMemo(() => {
    const allAreas = ["All Areas", "Chiswick", "Ealing", "Acton", "Hammersmith", "Shepherd's Bush", "Kew", "Ruislip", "Uxbridge", "Eastcote", "Hillingdon", "Ickenham", "Northwood", "Northolt", "South Ruislip", "Camden", "Islington", "Finchley", "Barnet", "Highgate", "Hampstead", "Brixton", "Clapham", "Dulwich", "Greenwich", "Peckham", "Wimbledon", "Crystal Palace", "Forest Hill", "Battersea", "Croydon", "Lewisham", "Stratford", "Hackney", "Canary Wharf", "Romford", "Bethnal Green", "Walthamstow", "Lea Bridge", "Silvertown", "Kensington", "Westminster", "South Kensington", "Southwark", "Covent Garden", "London Bridge", "Regent's Park", "Pinner", "Harrow", "Hayes", "Southall", "Hounslow", "Feltham", "Greenford", "Stanmore", "Edgware", "Wembley", "Hanwell", "Brentford", "Twickenham", "Richmond", "Isleworth", "Hemel Hempstead", "Watford", "St Albans", "Stevenage", "Hatfield", "Hertford", "Welwyn Garden City", "High Wycombe", "Amersham", "Aylesbury", "Marlow", "Beaconsfield", "Chesham", "Princes Risborough", "Slough", "Iver", "Gerrards Cross", "Burnham", "Taplow", "Wendover", "Great Missenden", "Maidenhead", "Windsor", "Denham", "Rickmansworth", "Chelmsford", "Southend", "Colchester", "Basildon", "Brentwood", "Epping", "Harlow", "Braintree", "Maldon", "Thurrock", "Birmingham", "Manchester", "Leeds", "Liverpool"];
    if (!userLoc) return allAreas;
    const areaAvgDist = {};
    allAreas.forEach(area => {
      if (area === "All Areas") { areaAvgDist[area] = -1; return; }
      const al = listings.filter(l => l.location.includes(area));
      if (al.length === 0) { areaAvgDist[area] = 999; return; }
      areaAvgDist[area] = al.reduce((s, l) => s + getDistanceMiles(userLoc.lat, userLoc.lng, l.lat, l.lng), 0) / al.length;
    });
    return allAreas.sort((a, b) => areaAvgDist[a] - areaAvgDist[b]);
  }, [userLoc]);

  const todayCount = useMemo(() => listings.filter(l => isOnToday(l)).length, [listings]);

  if (showCalendar) {
    const today = new Date();

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dayLabels = ["Mo","Tu","We","Th","Fr","Sa","Su"];
    const todayKey = today.toISOString().split("T")[0];

    // Build calendar grid
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // convert to 0=Mon
    const daysInMonth = lastDay.getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

    const selectedActivities = (calendarPlan[selectedDate] || []).map(id => listings.find(l => l.id === id)).filter(Boolean);

    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: "#1F2937", overflowX: "hidden" }}>
        <div style={{ padding: "12px 20px 6px", position: "sticky", top: 0, zIndex: 100, background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={closeCalendar} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <div style={{ width: 60, height: 60, overflow: "hidden", flexShrink: 0, borderRadius: 14, border: "2px solid #E5E7EB" }}><BrandBear size={60} /></div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#6B4EFF", letterSpacing: -0.3 }}>LITTLE<span style={{ color: "#F97316" }}>locals</span></div>
              </div>
            </div>
            <div onClick={closeCalendar} style={{ padding: "6px 12px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1F2937" }}>← Back</div>
          </div>
        </div>

        <div style={{ padding: "16px 20px 8px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 4 }}>📅 My Plans</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Tap a date to view or add activities</div>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div onClick={prevMonth} style={{ padding: "6px 12px", background: "white", borderRadius: 8, border: "1px solid #E5E7EB", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>‹</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1F2937" }}>{monthNames[calMonth]} {calYear}</div>
            <div onClick={nextMonth} style={{ padding: "6px 12px", background: "white", borderRadius: 8, border: "1px solid #E5E7EB", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>›</div>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {dayLabels.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#6B7280", padding: 4 }}>{d}</div>)}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 12 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const hasPlans = (calendarPlan[dateKey] || []).length > 0;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const isPast = dateKey < todayKey;
              return (
                <div key={dateKey} onClick={() => setSelectedDate(dateKey)} style={{
                  textAlign: "center", padding: "8px 0", borderRadius: 10, cursor: "pointer", position: "relative",
                  background: isSelected ? "linear-gradient(135deg, #F97316, #FB923C)" : isToday ? "#FFF0EB" : "white",
                  color: isSelected ? "white" : isPast ? "#9CA3AF" : "#1F2937",
                  border: isToday && !isSelected ? "2px solid #F97316" : "1px solid #E5E7EB",
                  fontWeight: isToday || isSelected ? 800 : 600, fontSize: 13
                }}>
                  {d}
                  {hasPlans && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: isSelected ? "white" : "#F97316" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected date detail */}
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1F2937", marginBottom: 8 }}>
            {selectedDate === todayKey ? "Today" : new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginLeft: 8 }}>{selectedActivities.length} {selectedActivities.length === 1 ? "activity" : "activities"}</span>
          </div>

          {selectedActivities.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", background: "white", borderRadius: 14, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Nothing planned yet</div>
              <div onClick={closeCalendar} style={{ display: "inline-block", marginTop: 8, padding: "6px 16px", background: "linear-gradient(135deg, #F97316, #FB923C)", color: "white", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Browse Activities</div>
            </div>
          ) : (
            selectedActivities.map(item => (
              <div key={item.id} style={{ padding: "10px 14px", background: "white", borderRadius: 14, border: "1px solid #E5E7EB", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                
                <div style={{ flex: 1 }} onClick={() => { closeCalendar(); setTimeout(() => openDetail(item), 50); }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", cursor: "pointer" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{item.time || item.day} · {item.location}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.free ? "#166534" : "#F97316" }}>{item.price}</span>
                  <div onClick={() => removeFromCalendar(item.id, selectedDate)} style={{ width: 26, height: 26, borderRadius: "50%", background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>✕</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Activity Passport */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>🏆 Activity Passport</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>{passport.length} visited</div>
          </div>

          {passport.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", background: "white", borderRadius: 14, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>Start collecting!</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>Tap "Been here?" on activities your family has tried</div>
            </div>
          ) : (
            <>
              {/* Progress by type */}
              {(() => {
                const visitedItems = passport.map(id => listings.find(l => l.id === id)).filter(Boolean);
                const typeCounts = {};
                visitedItems.forEach(v => { typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });
                const typeTotal = {};
                listings.forEach(l => { typeTotal[l.type] = (typeTotal[l.type] || 0) + 1; });
                return (
                  <div style={{ marginBottom: 10 }}>
                    {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1F2937", width: 90, flexShrink: 0 }}>{type}</div>
                        <div style={{ flex: 1, height: 8, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, (count / (typeTotal[type] || 1)) * 100)}%`, height: "100%", background: "linear-gradient(90deg, #166534, #86EFAC)", borderRadius: 4 }} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", width: 36, textAlign: "right" }}>{count}/{typeTotal[type] || 0}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Sticker collection */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {passport.map(id => {
                  const item = listings.find(l => l.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} onClick={() => { closeCalendar(); setTimeout(() => openDetail(item), 50); }} style={{ textAlign: "center", padding: "8px 4px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer" }}>
                      
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 7, color: "#166534", fontWeight: 600 }}>✓ Visited</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "8px 20px 24px", textAlign: "center" }}>
          <div onClick={closeCalendar} style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg, #F97316, #FB923C)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Browse Activities to Add More</div>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: "#1F2937", overflowX: "hidden" }}>
        <DetailView item={selected} onBack={closeDetail} userLoc={userLoc} reviews={reviews} onAddReview={addReview} isFav={favourites.includes(selected.id)} onToggleFav={toggleFavourite} onAddToCalendar={addToCalendar} onRemoveFromCalendar={removeFromCalendar} calendarPlan={calendarPlan} isVisited={passport.includes(selected.id)} onToggleVisited={togglePassport} tips={tips[selected.id] || []} onAddTip={addTip} />
      </div>
    );
  }

  const Chip = ({ active, onClick, children, color = "#374151", activeBg = "#6B4EFF" }) => (
    <div onClick={() => { if (navigator.vibrate) navigator.vibrate(8); onClick(); }} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: active ? activeBg : "#F3F4F6", color: active ? "white" : color, border: `1px solid ${active ? activeBg : "#E5E7EB"}`, cursor: "pointer", whiteSpace: "nowrap", minHeight: 40, display: "flex", alignItems: "center", transition: "all 0.18s ease" }}>{children}</div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: "#1F2937", overflowX: "hidden" }}>
      {/* HEADER */}
      <div style={{ padding: showScrollTop ? "8px 20px 4px" : "12px 20px 6px", position: "sticky", top: 0, zIndex: 100, background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", transition: "padding 0.2s" }}>
        {!showScrollTop ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSuggest(false); setSelected(null); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, overflow: "hidden", flexShrink: 0, borderRadius: 12, border: "2px solid #E5E7EB" }}><BrandBear size={48} /></div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}><span style={{ color: "#1F2937" }}>LITTLE</span><span style={{ color: "#F97316" }}>locals</span></div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 6, marginLeft: 58 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#1F2937", lineHeight: 1.3, marginBottom: 2 }}>Today's Best Kids Activities in {areaFilter !== "All Areas" ? areaFilter : "Ealing"}</div>
              <div style={{ fontSize: 11, color: "#B0B0B0", marginBottom: 6 }}>Helping Ealing parents find great things to do.</div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ width: 32, height: 32, overflow: "hidden", flexShrink: 0, borderRadius: 8, border: "1.5px solid #E5E7EB", cursor: "pointer" }}><BrandBear size={32} /></div>
            <div style={{ flex: 1, minWidth: 0, background: "white", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, border: "1px solid #E5E7EB" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." style={{ border: "none", outline: "none", fontSize: 12, flex: 1, minWidth: 0, background: "transparent", fontFamily: "inherit" }} />
            </div>
            <div onClick={() => setShowMoreFilters(!showMoreFilters)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: showMoreFilters ? "#1F2937" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showMoreFilters ? "white" : "#374151"} strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Pull to refresh indicator */}
      {pullRefreshing && (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #E5E7EB", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Loading spinner on first load */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #E5E7EB", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Loading activities...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!isLoading && <>

      {/* Suggest Submitted Confirmation */}
      {suggestSubmitted && (
        <div style={{ margin: "6px 20px 8px", padding: "12px 16px", background: "#F0F7F0", borderRadius: 14, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>Activity submitted!</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>We'll review it and add it to LITTLElocals soon</div>
        </div>
      )}

      {/* Suggest Activity Form — inline when open */}
      {showSuggest && (
        <div style={{ margin: "6px 20px 10px" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(92,75,107,0.06)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2, color: "#1F2937" }}>✨ Suggest an Activity</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 14 }}>Mums, dads & providers welcome — we'll review and add it!</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Activity Name *</div>
            <input value={suggestForm.name} onChange={e => setSuggestForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Tiny Tots Music Class" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Type *</div>
                <select value={suggestForm.type} onChange={e => setSuggestForm(p => ({...p, type: e.target.value}))} style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {Object.keys(typeColors).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>City *</div>
                <select value={suggestForm.city} onChange={e => setSuggestForm(p => ({...p, city: e.target.value, location: ""}))} style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {Object.keys(cityGroups).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Area *</div>
                <input value={suggestForm.location} onChange={e => setSuggestForm(p => ({...p, location: e.target.value}))} placeholder="Type area name..." style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box", outline: "none" }} onFocus={e => e.target.setAttribute("data-open","1")} onBlur={e => setTimeout(() => e.target.removeAttribute("data-open"), 200)} />
                {suggestForm.location && suggestForm.location.length > 0 && (() => {
                  const areas = (cityGroups[suggestForm.city] || []).filter(a => !a.includes("/") && a !== "Hillingdon-wide" && a.toLowerCase().includes(suggestForm.location.toLowerCase()));
                  const exactMatch = (cityGroups[suggestForm.city] || []).some(a => a.toLowerCase() === suggestForm.location.toLowerCase());
                  if (exactMatch || areas.length === 0) return null;
                  return <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, marginTop: 2, maxHeight: 150, overflowY: "auto", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {areas.slice(0, 8).map(a => <div key={a} onMouseDown={() => setSuggestForm(p => ({...p, location: a}))} style={{ padding: "8px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #E5E7EB" }}>{a}</div>)}
                  </div>;
                })()}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Venue / Address *</div>
            <input value={suggestForm.venue} onChange={e => setSuggestForm(p => ({...p, venue: e.target.value}))} placeholder="e.g. St Mary's Church Hall, High St, HA4 7AY" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Ages</div><input value={suggestForm.ages} onChange={e => setSuggestForm(p => ({...p, ages: e.target.value}))} placeholder="0–5yrs" style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} /></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Day(s)</div><input value={suggestForm.day} onChange={e => setSuggestForm(p => ({...p, day: e.target.value}))} placeholder="Mondays" style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} /></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Time</div><input value={suggestForm.time} onChange={e => setSuggestForm(p => ({...p, time: e.target.value}))} placeholder="10:00 AM" style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} /></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Price</div><input value={suggestForm.price} onChange={e => setSuggestForm(p => ({...p, price: e.target.value}))} placeholder="£8" style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} /></div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>Description</div>
            <textarea value={suggestForm.description} onChange={e => setSuggestForm(p => ({...p, description: e.target.value}))} placeholder="Tell us what makes this activity great..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Your Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={suggestForm.submitterName} onChange={e => setSuggestForm(p => ({...p, submitterName: e.target.value}))} placeholder="Your name *" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                <input value={suggestForm.submitterEmail} onChange={e => setSuggestForm(p => ({...p, submitterEmail: e.target.value}))} placeholder="Email (optional)" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={closeSuggest} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E5E7EB", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#4B5563" }}>Cancel</button>
              <button onClick={submitSuggestion} disabled={!suggestForm.name.trim() || !suggestForm.venue.trim() || !suggestForm.submitterName.trim() || !suggestForm.location} style={{ flex: 1.5, padding: 12, borderRadius: 10, border: "none", background: suggestForm.name.trim() && suggestForm.venue.trim() && suggestForm.submitterName.trim() && suggestForm.location ? "linear-gradient(135deg, #F97316, #FB923C)" : "#E5E7EB", color: "white", fontSize: 13, fontWeight: 700, cursor: suggestForm.name.trim() && suggestForm.venue.trim() && suggestForm.submitterName.trim() && suggestForm.location ? "pointer" : "default", fontFamily: "inherit" }}>Submit for Review</button>
            </div>
          </div>
        </div>
      )}

      {/* Location modal — first visit only */}
      {locStatus === "idle" && (() => { try { return !localStorage.getItem("ll_loc_asked"); } catch(e) { return false; } })() && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 6 }}>Enable location?</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20, lineHeight: 1.5 }}>Allow location access to show activities closest to you.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { localStorage.setItem("ll_loc_asked", "1"); setLocStatus("dismissed"); }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid #E5E7EB", background: "white", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}>Not now</button>
              <button onClick={() => { localStorage.setItem("ll_loc_asked", "1"); requestLocation(); }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "#F97316", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", fontFamily: "inherit" }}>Allow</button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filters bar */}
      <div style={{ margin: "4px 20px 8px", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #E5E7EB" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." style={{ border: "none", outline: "none", fontSize: 13, flex: 1, background: "transparent", fontFamily: "inherit", minWidth: 0 }} />
        </div>
        <div onClick={() => setShowMoreFilters(!showMoreFilters)} style={{ padding: "10px 14px", background: showMoreFilters ? "#1F2937" : "#FFFFFF", borderRadius: 12, border: showMoreFilters ? "none" : "1px solid #E5E7EB", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minHeight: 44, transition: "all 0.18s ease" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showMoreFilters ? "white" : "#374151"} strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: showMoreFilters ? "white" : "#374151" }}>Filters</span>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showMoreFilters && (
        <div style={{ margin: "0 20px 10px", background: "white", borderRadius: 16, padding: 16, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Area</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Chip active={areaFilter === "All Areas"} onClick={() => { setAreaFilter("All Areas"); setPage(1); }} activeBg="#1F2937">All</Chip>
            {["Ealing", "Acton", "Chiswick", "Hanwell", "Northfields", "Ruislip", "Eastcote", "Uxbridge"].map(area => (
              <Chip key={area} active={areaFilter === area} onClick={() => { setAreaFilter(areaFilter === area ? "All Areas" : area); setPage(1); }} activeBg="#1F2937">{area}</Chip>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Day</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Chip active={dayFilter === "today"} onClick={() => { setDayFilter("today"); setPage(1); }} activeBg="#1F2937">Today</Chip>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
              <Chip key={d} active={dayFilter === String(i === 6 ? 0 : i + 1)} onClick={() => { setDayFilter(String(i === 6 ? 0 : i + 1)); setPage(1); }} activeBg="#1F2937">{d}</Chip>
            ))}
            <Chip active={dayFilter === "all"} onClick={() => { setDayFilter("all"); setPage(1); }} activeBg="#1F2937">All</Chip>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Chip active={weatherMode === "rainy"} onClick={() => setWeatherMode(weatherMode === "rainy" ? "all" : "rainy")} activeBg="#1F2937">Indoor</Chip>
            <Chip active={weatherMode === "sunny"} onClick={() => setWeatherMode(weatherMode === "sunny" ? "all" : "sunny")} activeBg="#1F2937">Outdoor</Chip>
            <Chip active={freeOnly} onClick={() => setFreeOnly(!freeOnly)} activeBg="#1F2937">Free</Chip>
            <Chip active={napFilter === "morning"} onClick={() => setNapFilter(napFilter === "morning" ? "all" : "morning")} activeBg="#1F2937">Morning</Chip>
            <Chip active={napFilter === "afternoon"} onClick={() => setNapFilter(napFilter === "afternoon" ? "all" : "afternoon")} activeBg="#1F2937">Afternoon</Chip>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Category</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.keys(typeColors).map(t => (
              <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? "All Types" : t)} activeBg="#1F2937">{t}</Chip>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Age</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[{v:"all",l:"All"},{v:"0-1",l:"0–1"},{v:"1-2",l:"1–2"},{v:"2-4",l:"2–4"},{v:"4-7",l:"4–7"},{v:"7+",l:"7+"}].map(a => (
              <Chip key={a.v} active={ageFilter === a.v} onClick={() => setAgeFilter(a.v)} activeBg="#1F2937">{a.l}</Chip>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Region</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[{v:"All",l:"All UK"},{v:"London",l:"London"},{v:"Hertfordshire",l:"Hertfordshire"},{v:"Buckinghamshire",l:"Buckinghamshire"},{v:"Essex",l:"Essex"},{v:"Birmingham",l:"Birmingham"},{v:"Manchester",l:"Manchester"},{v:"Leeds",l:"Leeds"},{v:"Liverpool",l:"Liverpool"}].map(c => (
              <Chip key={c.v} active={cityFilter === c.v} onClick={() => { setCityFilter(c.v); setAreaFilter("All Areas"); setPage(1); }} activeBg="#1F2937">{c.l}</Chip>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Sort</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Chip active={sortBy === "mixed"} onClick={() => setSortBy("mixed")} activeBg="#1F2937">Mixed</Chip>
            <Chip active={sortBy === "nearest"} onClick={() => { setSortBy("nearest"); if (locStatus === "idle" || locStatus === "dismissed") requestLocation(); }} activeBg="#1F2937">Nearest</Chip>
            <Chip active={sortBy === "price-low"} onClick={() => setSortBy("price-low")} activeBg="#1F2937">Price: Low</Chip>
            <Chip active={sortBy === "free-first"} onClick={() => setSortBy("free-first")} activeBg="#1F2937">Free first</Chip>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {favourites.length > 0 && <Chip active={showFavourites} onClick={() => { setShowFavourites(!showFavourites); setPage(1); }} activeBg="#F97316">Saved ({favourites.length})</Chip>}
            <Chip active={false} onClick={openCalendar}>My Plans {calendarTotal > 0 ? `(${calendarTotal})` : ""}</Chip>
            <Chip active={mapView} onClick={() => { setMapView(!mapView); if (!mapView && locStatus === "idle") requestLocation(); if (!mapView) setAreaFilter("All Areas"); }} activeBg="#1F2937">Map</Chip>
          </div>
        </div>
      )}

      {/* Activity count + clear filters */}
      <div style={{ padding: "0 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{filtered.length} activities happening in {areaFilter !== "All Areas" ? areaFilter : "Ealing"} today</span>
        {(cityFilter !== "All" || dayFilter !== "today" || weatherMode !== "all" || napFilter !== "all" || freeOnly || ageFilter !== "all" || typeFilter !== "All Types" || areaFilter !== "All Areas" || showFavourites) && (
          <span onClick={() => { setCityFilter("All"); setDayFilter("today"); setWeatherMode("all"); setNapFilter("all"); setFreeOnly(false); setAgeFilter("all"); setTypeFilter("All Types"); setAreaFilter("All Areas"); setSearch(""); setSortBy("mixed"); setPage(1); setShowFavourites(false); }} style={{ fontSize: 11, color: "#F97316", fontWeight: 600, cursor: "pointer" }}>Clear all</span>
        )}
      </div>
      {!search && weatherMode === "all" && !freeOnly && typeFilter === "All Types" && (
        <div style={{ padding: "0 20px 10px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span onClick={() => { setWeatherMode("sunny"); setPage(1); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#92400E", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>☀️ Outdoor ideas</span>
          <span onClick={() => { setWeatherMode("rainy"); setPage(1); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1E40AF", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>🌧️ Indoor ideas</span>
          <span onClick={() => { setFreeOnly(true); setPage(1); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#166534", background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>💰 Free things</span>
          <span onClick={() => { setTypeFilter("Music"); setPage(1); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#6B4EFF", background: "#F3F0FF", border: "1px solid #DDD6FE", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>🎨 Classes</span>
        </div>
      )}

      {/* Map View */}
      {mapView && (
        <div style={{ margin: "0 20px 4px" }}>
          <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 4, textAlign: "right" }}>{filtered.filter(i => i.lat && i.lng).length} activities on map</div>
          <MapView filtered={filtered} userLoc={userLoc} onSelect={openDetail} areaFilter={areaFilter} />
        </div>
      )}

      {/* Listings — paginated */}
      {!mapView && <>

      {/* === Continue where you left off (slim banner, outside feed limit) === */}
      {page === 1 && !search && !showFavourites && dayFilter === "today" && (() => {
        try {
          const lv = JSON.parse(localStorage.getItem("ll_lastViewedActivity") || "null");
          if (!lv || !lv.id || (Date.now() - lv.timestamp) > 7 * 24 * 60 * 60 * 1000) return null;
          const lvItem = listings.find(a => a.id === lv.id);
          if (!lvItem) return null;
          const tc = typeColors[lvItem.type] || { bg: "#eee", color: "#333" };
          return (
            <div style={{ marginTop: 8, padding: "0 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Continue where you left off</div>
              <div onClick={() => openDetail(lvItem)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${tc.bg}, ${tc.bg}dd)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#4B5563", flexShrink: 0 }}>{(lvItem.type || "A").charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lvItem.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{lvItem.type} · {lvItem.location}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#F97316", flexShrink: 0 }}>View →</span>
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      {/* === CURATED HOMEPAGE SECTIONS (page 1, default view only) === */}
      {page === 1 && !search && !showFavourites && dayFilter === "today" && (() => {
        const area = areaFilter !== "All Areas" ? areaFilter : "Ealing";
        const shownIds = new Set();

        // Also add featured providers and continue-where-left-off to shown
        const fp = listings.find(a => a.featuredProvider);
        if (fp) shownIds.add(fp.id);
        const hb = listings.find(a => a.name && a.name.toLowerCase().includes("hartbeeps"));
        if (hb) shownIds.add(hb.id);

        // Helper: distance sort
        const areaCenters = { "Ealing": { lat: 51.5139, lng: -0.3048 }, "Ruislip": { lat: 51.5714, lng: -0.4213 }, "Eastcote": { lat: 51.5762, lng: -0.3962 }, "Uxbridge": { lat: 51.5461, lng: -0.4761 }, "Ickenham": { lat: 51.5653, lng: -0.4457 }, "Hillingdon": { lat: 51.5341, lng: -0.4494 } };
        const locRef = userLoc || areaCenters[areaFilter] || areaCenters["Ealing"];
        const getDist = (a) => a.lat && locRef ? Math.sqrt(Math.pow((a.lat - locRef.lat) * 111, 2) + Math.pow((a.lng - locRef.lng) * 111 * Math.cos(locRef.lat * Math.PI / 180), 2)) : 999;

        // --- SECTION 1: Today in {Area} ---
        const todayDow = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
        const todayCandidates = filtered.filter(a => {
          if (isOnToday(a)) return true;
          const d = (a.day || "").toLowerCase();
          if (d.includes("daily") || d.includes("everyday") || d.includes("all week")) return true;
          if (d.includes(todayDow.toLowerCase().slice(0, 3))) return true;
          const t = (a.type || "").toLowerCase();
          if (["park","playground","play centre","soft play","leisure"].some(k => t.includes(k))) return true;
          return false;
        });

        // Sort today candidates by quality score for curated feel
        const getTodayScore = (a) => {
          let s = 0;
          if ((a.images && a.images.length > 0) || a.logo) s += 3;
          if (a.description && a.description.length > 30) s += 2;
          if (a.time && a.time.length > 3) s += 1;
          if (a.website || a.trialLink) s += 1;
          if (a.popular || a.featuredProvider) s += 1;
          return s;
        };
        const sortedTodayCandidates = [...todayCandidates].sort((a, b) => getTodayScore(b) - getTodayScore(a));

        // Mix by category (max 1 per type in first 6-8 slots)
        const todayTypes = [...new Set(sortedTodayCandidates.map(a => a.type))];
        const todayBuckets = {};
        todayTypes.forEach(t => { todayBuckets[t] = sortedTodayCandidates.filter(a => a.type === t); });
        const todayMixed = [];
        let ts = sortedTodayCandidates.length + 10;
        while (todayMixed.length < sortedTodayCandidates.length && ts-- > 0) {
          for (const t of todayTypes) {
            if (todayBuckets[t].length > 0) todayMixed.push(todayBuckets[t].shift());
          }
        }
        const TODAY_LIMIT = 7;
        const todayListFull = todayMixed.length >= 2 ? todayMixed
          : [...todayMixed, ...filtered.filter(a => !todayMixed.includes(a)).sort((a, b) => getTodayScore(b) - getTodayScore(a))];
        // showAllToday / setShowAllToday lifted to component state above
        const todayList = showAllToday ? todayListFull : todayListFull.slice(0, TODAY_LIMIT);
        todayListFull.forEach(a => shownIds.add(a.id));

        // --- SECTION 2: From your saved ---
        const savedList = favourites.length > 0
          ? listings.filter(a => favourites.includes(a.id) && !shownIds.has(a.id)).slice(0, 1)
          : [];
        savedList.forEach(a => shownIds.add(a.id));

        // --- SECTION 3: This weekend ---
        const halfDay = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
        const sRand = (i) => { let x = Math.sin(halfDay * 9301 + i * 49297) * 49297; return x - Math.floor(x); };
        const popularList = listings.filter(a => a.popular && !shownIds.has(a.id)).sort((a, b) => sRand(a.id) - sRand(b.id)).slice(0, 2);
        popularList.forEach(a => shownIds.add(a.id));

        // --- SECTION 4: New in {Area} ---
        const halfDaySeed = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
        const seededRand = (i) => { let x = Math.sin(halfDaySeed * 9301 + i * 49297) * 49297; return x - Math.floor(x); };
        const newList = filtered.filter(a => isNewActivity(a) && !shownIds.has(a.id)).sort((a, b) => seededRand(a.id) - seededRand(b.id)).slice(0, 2);
        newList.forEach(a => shownIds.add(a.id));
        shownIdsRef.current = shownIds;

        return (<>
          {/* 1. Top things to do today */}
          <div style={{ marginTop: 8, padding: "0 20px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1F2937" }}>Top things to do today in {area}</div>
            <div style={{ fontSize: 12, color: "#B0B0B0", marginTop: 2, marginBottom: 8 }}>Quick ideas parents are choosing today.</div>
            {todayList.map(item => {
              const isPopular = item.popular || item.featuredProvider || (item.saves && item.saves >= 10);
              return (
                <div key={"today-" + item.id} style={{ position: "relative" }}>
                  {isPopular && (
                    <div style={{ position: "absolute", top: 10, right: 50, zIndex: 10, background: "#FFF3E0", color: "#E67E22", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, display: "flex", alignItems: "center", gap: 3 }}>
                      ⭐ Popular today
                    </div>
                  )}
                  <ListingCard item={item} onSelect={openDetail} userLoc={userLoc} isFav={favourites.includes(item.id)} onToggleFav={toggleFavourite} isNew={isNewActivity(item)} reviews={reviews} areaFilter={areaFilter} isSunny={isSunny} onTrackClick={trackClick} clickCount={clickCounts[item.id] || 0} />
                </div>
              );
            })}
            {!showAllToday && todayListFull.length > TODAY_LIMIT && (
              <div onClick={() => setShowAllToday(true)} style={{ textAlign: "center", padding: "10px 0 4px", fontSize: 13, fontWeight: 600, color: "#F97316", cursor: "pointer" }}>
                See all {todayListFull.length} activities today →
              </div>
            )}
          </div>


          {/* Featured Providers — Hartbeeps (primary) + LGD (secondary) */}
          {(() => {
            const hartbeeps = listings.find(a => a.name && a.name.toLowerCase().includes("hartbeeps"));
            const lgd = listings.find(a => a.featuredProvider);
            const hDist = hartbeeps ? getDist(hartbeeps) : null;
            const hWalk = hDist && hDist < 50 ? Math.round(hDist * 1.60934 * 12) : null;
            const lDist = lgd ? getDist(lgd) : null;
            const lWalk = lDist && lDist < 50 ? Math.round(lDist * 1.60934 * 12) : null;
            return (<>
              {/* Hartbeeps — Premium Featured */}
              {hartbeeps && (
              <div style={{ marginTop: 36, padding: "0 20px" }}>
                <div onClick={() => openDetail(hartbeeps)} style={{ background: "white", borderRadius: 16, padding: 0, cursor: "pointer", border: "2px solid #6B4EFF", overflow: "hidden", boxShadow: "0 4px 20px rgba(107,78,255,0.12)" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                      {[{src:"/hartbeeps-hero.png",focalY:22},{src:"/hartbeeps-bells.jpg",focalY:50},{src:"/hartbeeps-happy.png",focalY:45}].map((img, i) => (
                        <img key={i} src={img.src} alt="Hartbeeps class" style={{ width: "100%", height: 180, objectFit: "cover", objectPosition: `center ${img.focalY}%`, flexShrink: 0, scrollSnapAlign: "start" }} />
                      ))}
                    </div>
                    <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: "#6B4EFF", color: "white", letterSpacing: 0.3, boxShadow: "0 2px 8px rgba(107,78,255,0.3)" }}>Featured baby classes</span>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, rgba(0,0,0,0.25))", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.85)" }} />)}
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#222" }}>Hartbeeps West & SW London</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Award-winning baby sensory and music classes loved by local parents.</div>
                    <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 3 }}>Baby Sensory · 0–4 yrs · Various days</div>
                    <div style={{ fontSize: 13, color: "#4B5563", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      Haven Green Church, Ealing Broadway
                      {hWalk !== null && hWalk < 60 && <span style={{ color: "#F97316", fontWeight: 600 }}>· {hWalk < 2 ? "Nearby" : hWalk + " min walk"}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#15803D", padding: "2px 8px", background: "#ECFDF5", borderRadius: 6 }}>Free trial available</span>
                      <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 600, padding: "2px 8px", background: "#F3F4F6", borderRadius: 6 }}>Loved by local parents</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, background: "#FDF6EE", color: "#92400E" }}>From £8/class</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#6B4EFF" }}>View details →</span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* LGD — Secondary Featured */}
              {lgd && (
              <div style={{ marginTop: 20, padding: "0 20px" }}>
                <div onClick={() => openDetail(lgd)} style={{ background: "white", borderRadius: 16, padding: 0, cursor: "pointer", border: "1px solid #6B4EFF", overflow: "hidden", boxShadow: "0 2px 12px rgba(107,78,255,0.1)" }}>
                  <div style={{ width: "100%", height: 140, overflow: "hidden", position: "relative" }}>
                    <img src="/lgd-dance.png" alt={lgd.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "#6B4EFF", color: "white", letterSpacing: 0.3 }}>Featured local provider</span>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>{lgd.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#F97316", color: "white", letterSpacing: 0.3 }}>NEW</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Fun, friendly dance classes in West Ealing</div>
                    <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 3 }}>{lgd.type} · {lgd.ages} · {lgd.day}</div>
                    <div style={{ fontSize: 13, color: "#4B5563", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                      {lgd.venue.split(",")[0]}, {lgd.location}
                      {lWalk !== null && lWalk < 60 && <span style={{ color: "#F97316", fontWeight: 600 }}>· {lWalk < 2 ? "Nearby" : lWalk + " min walk"}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {lgd.freeTrial && <span style={{ fontSize: 11, fontWeight: 600, color: "#15803D", padding: "2px 8px", background: "#ECFDF5", borderRadius: 6 }}>Free trial available</span>}
                      <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 600, padding: "2px 8px", background: "#F3F4F6", borderRadius: 6 }}>Loved by local parents</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, background: "#FDF6EE", color: "#92400E" }}>{lgd.price}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#6B4EFF" }}>View details →</span>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </>);
          })()}

          {/* 2. From your saved */}
          {savedList.length > 0 && (
            <div style={{ marginTop: 36, padding: "0 20px" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1F2937" }}>From your saved</div>
              <div style={{ fontSize: 12, color: "#B0B0B0", marginTop: 2, marginBottom: 8 }}>Ready when you are</div>
              {savedList.map(item => (
                <ListingCard key={"fromsaved-" + item.id} item={item} onSelect={openDetail} userLoc={userLoc} isFav={true} onToggleFav={toggleFavourite} isNew={isNewActivity(item)} reviews={reviews} areaFilter={areaFilter} isSunny={isSunny} onTrackClick={trackClick} clickCount={clickCounts[item.id] || 0} />
              ))}
            </div>
          )}

          {/* 3. This weekend */}
          {popularList.length > 0 && (
            <div style={{ marginTop: 36, padding: "0 20px" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1F2937" }}>This weekend in {area}</div>
              <div style={{ fontSize: 12, color: "#B0B0B0", marginTop: 2, marginBottom: 8 }}>Best things to do with your kids this weekend</div>
              {popularList.map(item => (
                <ListingCard key={"pop-" + item.id} item={item} onSelect={openDetail} userLoc={userLoc} isFav={favourites.includes(item.id)} onToggleFav={toggleFavourite} isNew={isNewActivity(item)} reviews={reviews} areaFilter={areaFilter} isSunny={isSunny} onTrackClick={trackClick} clickCount={clickCounts[item.id] || 0} />
              ))}
            </div>
          )}

          {/* 4. New in {Area} */}
          {newList.length > 0 && (
            <div style={{ marginTop: 36, padding: "0 20px" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1F2937" }}>New in {area}</div>
              <div style={{ fontSize: 12, color: "#B0B0B0", marginTop: 2, marginBottom: 8 }}>Fresh ideas for your next outing</div>
              {newList.map(item => (
                <ListingCard key={"new-" + item.id} item={item} onSelect={openDetail} userLoc={userLoc} isFav={favourites.includes(item.id)} onToggleFav={toggleFavourite} isNew={true} reviews={reviews} areaFilter={areaFilter} isSunny={isSunny} onTrackClick={trackClick} clickCount={clickCounts[item.id] || 0} />
              ))}
            </div>
          )}
        </>);
      })()}

      {/* === MAIN LISTING GRID === */}
      {(() => {
        const mainFiltered = (page === 1 && !search && !showFavourites && dayFilter === "today") ? filtered.filter(a => !shownIdsRef.current.has(a.id)) : filtered;
        const pageSize = 6;
        const pagedList = mainFiltered.slice((page - 1) * pageSize, page * pageSize);
        const displayList = (page === 1 && !search && !showFavourites && dayFilter === "today") ? pagedList.slice(0, 3) : pagedList;
        return (
      <div style={{ padding: "0 20px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#4B5563" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>{weatherMode === "rainy" ? "No indoor results found" : weatherMode === "sunny" ? "No outdoor results found" : "No results found"}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>{areaFilter !== "All Areas" ? `Nothing found in ${areaFilter}` : dayFilter === "today" ? `Nothing found for ${todayName}` : "No activities match your filters"}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16, lineHeight: 1.5 }}>{areaFilter !== "All Areas" ? "Try a different area or broaden your filters" : "Try fewer filters or search for something else"}</div>
            <div onClick={() => { setCityFilter("All"); setAreaFilter("All Areas"); setDayFilter("today"); setWeatherMode("all"); setNapFilter("all"); setFreeOnly(false); setAgeFilter("all"); setTypeFilter("All Types"); setSearch(""); setSortBy("mixed"); setPage(1); setShowFavourites(false); }} style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg, #F97316, #FB923C)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Reset all filters</div>
          </div>
        ) : (
          <>
          {page === 1 && <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 12px" }}>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.3, textTransform: "uppercase" }}>Loved by {areaFilter !== "All Areas" ? areaFilter : "Ealing"} parents</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>}
          {displayList.map((item, idx) => {
            const isNew = item.createdAt ? (Date.now() - new Date(item.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 : false;
            return <React.Fragment key={item.id}>
              <ListingCard item={item} onSelect={openDetail} userLoc={userLoc} isFav={favourites.includes(item.id)} onToggleFav={toggleFavourite} isNew={isNew} reviews={reviews} areaFilter={areaFilter} isSunny={isSunny} onTrackClick={trackClick} clickCount={clickCounts[item.id] || 0} />
              {idx === Math.min(5, displayList.length - 1) && !showSuggest && !suggestSubmitted && page === 1 && (
                <div onClick={openSuggest} style={{ margin: "6px 0 8px", padding: "12px 16px", background: "linear-gradient(135deg, #F9FAFB, #FDDDE6)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed #F97316" }}>
                  <span style={{ fontSize: 22 }}>✨</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1F2937" }}>Know a great activity we missed?</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Help other parents discover it.</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "white", padding: "6px 14px", background: "linear-gradient(135deg, #F97316, #FB923C)", borderRadius: 10 }}>Add</span>
                </div>
              )}
            </React.Fragment>;
          })}
          </>
        )}
      </div>
        );
      })()}

      {/* Suggested Activities — horizontal scroll, clickable to listing */}
      {(() => {
        // Show suggested activities from Supabase suggestions table, plus recent Ealing listings as "parent picks"
        const parentPicks = listings.filter(l => l.location === "Ealing" && l.verified).slice(-8).reverse();
        const suggestedChips = suggestedActivities.length > 0 ? suggestedActivities : [];
        const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
        const allChips = [...suggestedChips.map(s => ({ id: "s-" + s.id, name: s.name, type: s.type, match: listings.find(l => norm(l.name) === norm(s.name)) || listings.find(l => norm(l.name).includes(norm(s.name)) || norm(s.name).includes(norm(l.name))) })), ...parentPicks.filter(p => !suggestedChips.some(s => norm(s.name) === norm(p.name))).map(p => ({ id: "p-" + p.id, name: p.name, type: p.type, match: p }))];
        if (allChips.length === 0) return null;
        return (
        <div style={{ padding: "0 0 6px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: "#9CA3AF", paddingLeft: 20 }}>✨ Suggested & added by parents</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingLeft: 20, paddingRight: 20 }}>
            {allChips.slice(0, 10).map(c => (
              <div key={c.id} onClick={() => { if (c.match) openDetail(c.match); }} style={{ flexShrink: 0, padding: "5px 10px", background: "white", borderRadius: 8, border: "1px dashed #E5E7EB", cursor: c.match ? "pointer" : "default", maxWidth: 140 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: c.match ? "#F97316" : "#1F2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 8, color: "#9CA3AF" }}>{c.type}</div>
              </div>
            ))}
          </div>
        </div>
        );
      })()}

      {/* Pagination controls */}
      {(() => {
        const totalPages = Math.ceil(filtered.length / 6);
        if (totalPages <= 1) return null;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 20px 16px" }}>
            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === 1} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: page === 1 ? "#F3F4F6" : "white", color: page === 1 ? "#9CA3AF" : "#1F2937", fontSize: 12, fontWeight: 600, cursor: page === 1 ? "default" : "pointer", fontFamily: "inherit" }}>← Prev</button>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] < p - 1 && <span style={{ color: "#9CA3AF", fontSize: 12, padding: "0 2px" }}>...</span>}
                  <button onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ width: 32, height: 32, borderRadius: 8, border: page === p ? "none" : "1px solid #E5E7EB", background: page === p ? "linear-gradient(135deg, #F97316, #FB923C)" : "white", color: page === p ? "white" : "#6B7394", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
                </React.Fragment>
              ))}
            </div>
            <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === totalPages} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: page === totalPages ? "#F3F4F6" : "white", color: page === totalPages ? "#9CA3AF" : "#1F2937", fontSize: 12, fontWeight: 600, cursor: page === totalPages ? "default" : "pointer", fontFamily: "inherit" }}>Next →</button>
          </div>
        );
      })()}
      </>}

      <div style={{ textAlign: "center", padding: "20px 20px 8px", fontSize: 11, color: "#C4C4C4" }}>
        community-powered kids activity discovery
      </div>

      <div style={{ textAlign: "center", padding: "0 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, overflow: "hidden" }}><BrandBear size={34} /></div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>LITTLE<span style={{ color: "#F97316" }}>locals</span></span>
        </div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 8 }}>Built by parents, for parents.</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <span onClick={() => setLegalPage("privacy")} style={{ fontSize: 10, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
          <span onClick={() => setLegalPage("cookies")} style={{ fontSize: 10, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Cookie Policy</span>
          <span onClick={() => setLegalPage("terms")} style={{ fontSize: 10, color: "#6B7280", cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>
          <a href="mailto:littlelocalsuk@gmail.com" style={{ fontSize: 10, color: "#6B7280", textDecoration: "underline" }}>Contact</a>
        </div>
        <div style={{ fontSize: 9, color: "#9CA3AF" }}>© 2026 LITTLElocals. All rights reserved.</div>
        {showInstallBanner && <div style={{ height: 44 }} />}
      </div>

      </>}

      {/* Floating "Top" button */}
      {showScrollTop && (
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: showInstallBanner ? 60 : 20, right: 16, padding: "8px 12px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1F2937", zIndex: 998, transition: "bottom 0.2s" }}>↑ Top</div>
      )}

      {/* Add to Home Screen Banner */}
      {showInstallBanner && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", zIndex: 999, borderTop: "1px solid #E5E7EB" }}>
          {/iPhone|iPad|iPod/.test(navigator.userAgent) ? (
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src="/bear-logo.png" alt="LITTLElocals" style={{ width: 28, height: 28, borderRadius: 6 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>Save as an app!</span>
                </div>
                <div onClick={() => { setShowInstallBanner(false); try { localStorage.setItem("ll_install_dismissed", "1"); } catch(e) {} }} style={{ fontSize: 11, color: "#6B7280", cursor: "pointer", padding: "4px 8px" }}>✕</div>
              </div>
              <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5 }}>
                {/CriOS|FxiOS/.test(navigator.userAgent) ? (
                  <span>Open this page in <span style={{ fontWeight: 700 }}>Safari</span>, then tap <span style={{ display: "inline-block", padding: "1px 6px", background: "#E5E7EB", borderRadius: 4, fontWeight: 700 }}>⬆ Share</span> → <span style={{ display: "inline-block", padding: "1px 6px", background: "#E5E7EB", borderRadius: 4, fontWeight: 700 }}>Add to Home Screen</span></span>
                ) : (
                  <span>Tap <span style={{ display: "inline-block", padding: "1px 6px", background: "#E5E7EB", borderRadius: 4, fontWeight: 700 }}>⬆ Share</span> in the Safari toolbar below, then scroll down and tap <span style={{ display: "inline-block", padding: "1px 6px", background: "#E5E7EB", borderRadius: 4, fontWeight: 700 }}>Add to Home Screen</span></span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/bear-logo.png" alt="LITTLElocals" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <div onClick={async () => { if (installPrompt) { installPrompt.prompt(); const result = await installPrompt.userChoice; if (result.outcome === "accepted") { setShowInstallBanner(false); try { localStorage.setItem("ll_install_dismissed", "1"); } catch(e) {} } setInstallPrompt(null); } }} style={{ flex: 1, fontSize: 11, color: "#1F2937", cursor: "pointer" }}>
                <span style={{ fontWeight: 700 }}>{installPrompt ? "Tap to install app" : "Add to home screen"}</span> for quick access
              </div>
              <div onClick={() => { setShowInstallBanner(false); try { localStorage.setItem("ll_install_dismissed", "1"); } catch(e) {} }} style={{ fontSize: 11, color: "#6B7280", cursor: "pointer", padding: "4px 8px" }}>✕</div>
            </div>
          )}
        </div>
      )}
      {/* Cookie Consent Banner */}
      {cookieConsent === null && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #E5E5E5", padding: "12px 20px", zIndex: 9999, maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5, marginBottom: 10 }}>
            We use simple analytics to understand how LITTLElocals is used and improve it for parents. No ads. No tracking across other sites.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div onClick={acceptCookies} style={{ flex: 1, padding: "8px 0", textAlign: "center", background: "#6B4EFF", color: "white", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Accept</div>
            <div onClick={declineCookies} style={{ flex: 1, padding: "8px 0", textAlign: "center", background: "#F3F4F6", color: "#4B5563", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Decline</div>
          </div>
        </div>
      )}

      {/* Legal Pages Overlay */}
      {legalPage && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#F9FAFB", zIndex: 10000, overflowY: "auto", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ padding: "16px 20px", position: "sticky", top: 0, background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1F2937" }}>
              {legalPage === "privacy" && "Privacy Policy"}
              {legalPage === "cookies" && "Cookie Policy"}
              {legalPage === "terms" && "Terms of Service"}
            </div>
            <div onClick={() => setLegalPage(null)} style={{ padding: "6px 12px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1F2937" }}>← Back</div>
          </div>
          <div style={{ padding: "20px", fontSize: 13, color: "#4B5563", lineHeight: 1.7 }}>
            {legalPage === "privacy" && (<>
              <p style={{ fontWeight: 700, color: "#1F2937", fontSize: 18, marginBottom: 16 }}>Privacy Policy for LITTLElocals</p>
              <p style={{ color: "#6B7280", marginBottom: 16 }}>Last updated: 28 February 2026</p>
              <p style={{ marginBottom: 12 }}>LITTLElocals is a community-powered directory of kids' activities. We take your privacy seriously and are committed to protecting your personal data.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>What we collect</p>
              <p style={{ marginBottom: 12 }}>When you suggest an activity, you may optionally provide your name and email address. This information is stored securely and used only to follow up on your suggestion if needed.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Local storage</p>
              <p style={{ marginBottom: 12 }}>We use your browser's local storage to save your preferences such as favourites, calendar plans, and cookie consent. This data stays on your device and is not sent to our servers.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Cookies & Analytics</p>
              <p style={{ marginBottom: 12 }}>We use privacy-friendly analytics to understand how LITTLElocals is used and improve the service. This data is anonymous and not used for advertising. Analytics cookies are only loaded if you accept them via our cookie consent banner.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Your rights</p>
              <p style={{ marginBottom: 12 }}>Under UK GDPR, you have the right to access, correct, or delete your personal data. You can also withdraw consent for analytics cookies at any time by clearing your browser's local storage.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Data sharing</p>
              <p style={{ marginBottom: 12 }}>We do not sell, trade, or share your personal data with third parties. We do not use your data for advertising purposes.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Contact</p>
              <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:littlelocalsuk@gmail.com" style={{ color: "#6B4EFF" }}>littlelocalsuk@gmail.com</a></p>
            </>)}

            {legalPage === "cookies" && (<>
              <p style={{ fontWeight: 700, color: "#1F2937", fontSize: 18, marginBottom: 16 }}>Cookie Policy for LITTLElocals</p>
              <p style={{ color: "#6B7280", marginBottom: 16 }}>Last updated: 28 February 2026</p>
              <p style={{ marginBottom: 12 }}>LITTLElocals uses analytics cookies to understand how the site is used and improve the experience for parents.</p>
              <p style={{ marginBottom: 12 }}>These cookies collect anonymous information such as pages visited and interactions.</p>
              <p style={{ marginBottom: 12 }}>We do not use cookies for advertising.</p>
              <p style={{ marginBottom: 12 }}>We do not sell your data.</p>
              <p style={{ marginBottom: 12 }}>You can accept or decline analytics cookies when you first visit the site. Your choice is saved in your browser and you can change it at any time by clearing your browser data.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Types of cookies we use</p>
              <p style={{ marginBottom: 12 }}><span style={{ fontWeight: 600 }}>Analytics cookies (optional):</span> Google Analytics — helps us understand how parents use LITTLElocals so we can improve it. Only loaded if you accept.</p>
              <p style={{ marginBottom: 12 }}><span style={{ fontWeight: 600 }}>Essential storage:</span> We use localStorage (not cookies) to save your preferences like favourites and calendar plans. These are essential for the app to work and stay on your device.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Contact</p>
              <p>If you have questions, contact us at <a href="mailto:littlelocalsuk@gmail.com" style={{ color: "#6B4EFF" }}>littlelocalsuk@gmail.com</a></p>
            </>)}

            {legalPage === "terms" && (<>
              <p style={{ fontWeight: 700, color: "#1F2937", fontSize: 18, marginBottom: 16 }}>Terms of Service for LITTLElocals</p>
              <p style={{ color: "#6B7280", marginBottom: 16 }}>Last updated: 28 February 2026</p>
              <p style={{ marginBottom: 12 }}>Welcome to LITTLElocals. By using our website you agree to the following terms.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>About the service</p>
              <p style={{ marginBottom: 12 }}>LITTLElocals is a free community directory of kids' activities in the Ealing area and surrounding boroughs. We aim to provide accurate and up-to-date information but cannot guarantee the accuracy of all listings.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>User contributions</p>
              <p style={{ marginBottom: 12 }}>When you suggest an activity or leave a review, you grant LITTLElocals permission to display that content on the site. You agree that your contributions are accurate and not misleading.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Disclaimer</p>
              <p style={{ marginBottom: 12 }}>LITTLElocals is provided "as is". We are not responsible for the quality, safety, or availability of activities listed on the platform. Always check directly with activity providers for the most current information.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Intellectual property</p>
              <p style={{ marginBottom: 12 }}>All content, design, and branding on LITTLElocals is owned by LITTLElocals and may not be reproduced without permission.</p>
              <p style={{ fontWeight: 700, color: "#1F2937", marginBottom: 6, marginTop: 16 }}>Contact</p>
              <p>If you have any questions about these terms, please contact us at <a href="mailto:littlelocalsuk@gmail.com" style={{ color: "#6B4EFF" }}>littlelocalsuk@gmail.com</a></p>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}


export default WestLondonListings;

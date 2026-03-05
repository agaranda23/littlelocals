import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xjifxwvziwoepiioyitm.supabase.co",
  "sb_publishable__wfpTD3AcZhvRHcS_4LbXg_6E2QkGXv"
);

const TYPES = ["Messy Play","Soft Play","Playgroup","Story Time","Outdoor","Music","Performing Arts","Sport","Baking","Arts & Crafts","Swimming","Baby Sensory"];
const EMPTY = { name:"", type:"Outdoor", emoji:"🌳", location:"", venue:"", lat:"", lng:"", ages:"", day:"", time:"", price:"", free:false, indoor:false, description:"", sen:false, verified:false, popular:false, featured_provider:false, cta_type:"website", cta_label:"", cta_url:"", website:"", image_url:"" };

function PhotosTab({ selected, onReload }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const multiRef = useRef();

  useEffect(() => { loadImages(); }, [selected.id]);

  async function loadImages() {
    const { data } = await supabase.from("listing_images").select("*").eq("listing_id", selected.id).order("sort_order", { ascending: true });
    setImages(data || []);
  }

  async function uploadPhotos(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true); setMsg(null);
    const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.sort_order || 0)) : 0;
    let uploaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
      if (upErr) { console.error("Upload error:", upErr); continue; }
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("listing_images").insert({ listing_id: selected.id, url: publicUrl, sort_order: maxOrder + i + 1 });
      if (!dbErr) uploaded++;
    }
    await loadImages();
    onReload();
    setMsg({ ok: uploaded > 0, text: uploaded > 0 ? `✅ ${uploaded} photo${uploaded > 1 ? "s" : ""} uploaded!` : "❌ Upload failed" });
    setUploading(false);
  }

  async function deleteImage(img) {
    if (!window.confirm("Delete this photo?")) return;
    await supabase.from("listing_images").delete().eq("id", img.id);
    await loadImages();
    onReload();
  }

  const s = {
    card: { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 },
    btn: (color) => ({ padding: "12px 20px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", background: color || "#1a1a2e", color: "#fff" }),
    msg: (ok) => ({ padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: ok ? "#e8f5e9" : "#fdecea", color: ok ? "#2e7d32" : "#c62828", marginTop: 12 }),
  };

  return (
    <div style={s.card}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{selected.name}</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{images.length} photo{images.length !== 1 ? "s" : ""}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
        {images.map((img, idx) => (
          <div key={img.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e0dbd4" }}>
            <img src={img.url} alt="" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
              {idx === 0 ? "Cover" : `#${idx + 1}`}
            </div>
            <button
              onClick={() => deleteImage(img)}
              style={{ position: "absolute", bottom: 4, right: 4, background: "#ef4444", color: "white", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              🗑
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "30px 20px", color: "#aaa", fontSize: 13, background: "#fafafa", borderRadius: 10, border: "1px dashed #e0dbd4" }}>
            No photos yet — upload some below
          </div>
        )}
      </div>

      <input ref={multiRef} type="file" accept="image/*" multiple onChange={uploadPhotos} style={{ display: "none" }} />
      <button
        style={s.btn(uploading ? "#aaa" : "#ff6b6b")}
        disabled={uploading}
        onClick={() => multiRef.current.click()}
      >
        {uploading ? "Uploading…" : `+ Add photos`}
      </button>
      {msg && <div style={s.msg(msg.ok)}>{msg.text}</div>}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("edit");
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [newMode, setNewMode] = useState(false);

  useEffect(() => { loadListings(); }, []);

  async function loadListings() {
    const { data } = await supabase.from("listings").select("*").order("name");
    setListings(data || []);
  }

  function selectListing(id) {
    const l = listings.find(x => x.id == id);
    setSelected(l);
    setForm(l ? { ...l } : null);
    setNewMode(false);
    setMsg(null);
  }

  function startNew() {
    setSelected(null);
    setForm({ ...EMPTY });
    setNewMode(true);
    setMsg(null);
  }

  function field(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true); setMsg(null);
    const payload = { ...form };
    delete payload.id; delete payload.created_at;
    let error;
    if (newMode) {
      const res = await supabase.from("listings").insert(payload).select().single();
      error = res.error;
      if (!error) { await loadListings(); setMsg({ ok:true, text:"✅ Listing created!" }); setNewMode(false); setSelected(res.data); setForm(res.data); }
    } else {
      ({ error } = await supabase.from("listings").update(payload).eq("id", selected.id));
      if (!error) { await loadListings(); setMsg({ ok:true, text:"✅ Saved!" }); }
    }
    if (error) setMsg({ ok:false, text: error.message });
    setSaving(false);
  }

  const s = {
    shell: { fontFamily:"system-ui", maxWidth:640, margin:"0 auto", padding:20, background:"#faf7f2", minHeight:"100vh" },
    header: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 },
    logo: { fontSize:20, fontWeight:900, color:"#1a1a2e" },
    tabs: { display:"flex", gap:8, marginBottom:20 },
    tab: (active) => ({ padding:"8px 18px", borderRadius:20, border:"none", fontWeight:800, fontSize:13, cursor:"pointer", background: active ? "#1a1a2e" : "#e8e3dc", color: active ? "#fff" : "#666" }),
    card: { background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16 },
    label: { display:"block", fontSize:12, fontWeight:800, color:"#888", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" },
    input: { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e0dbd4", fontSize:14, fontFamily:"system-ui", boxSizing:"border-box", marginBottom:12 },
    textarea: { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e0dbd4", fontSize:14, fontFamily:"system-ui", boxSizing:"border-box", marginBottom:12, minHeight:80, resize:"vertical" },
    row: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
    toggle: (on) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:`1.5px solid ${on?"#1a1a2e":"#e0dbd4"}`, background: on?"#1a1a2e":"#fff", color: on?"#fff":"#888", fontSize:12, fontWeight:800, cursor:"pointer" }),
    btn: (color) => ({ padding:"12px 20px", borderRadius:10, border:"none", fontWeight:800, fontSize:14, cursor:"pointer", background:color||"#1a1a2e", color:"#fff" }),
    msg: (ok) => ({ padding:"10px 14px", borderRadius:8, fontSize:13, fontWeight:700, background: ok?"#e8f5e9":"#fdecea", color: ok?"#2e7d32":"#c62828", marginTop:12 }),
    select: { width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e0dbd4", fontSize:14, marginBottom:16, background:"#fff" },
    newBtn: { padding:"8px 16px", borderRadius:20, border:"2px dashed #ff6b6b", background:"transparent", color:"#ff6b6b", fontWeight:800, fontSize:13, cursor:"pointer" }
  };

  return (
    <div style={s.shell}>
      <div style={s.header}>
        <div style={s.logo}>🐻 LITTLElocals Admin</div>
        <button style={s.newBtn} onClick={startNew}>+ New listing</button>
      </div>

      <div style={s.tabs}>
        {["edit","photos"].map(t => (
          <button key={t} style={s.tab(tab===t)} onClick={() => setTab(t)}>
            {t==="edit" ? "✏️ Edit listing" : "📸 Photos"}
          </button>
        ))}
      </div>

      {/* Listing selector */}
      <div style={s.card}>
        <label style={s.label}>{newMode ? "New listing" : "Select listing"}</label>
        {!newMode && (
          <select style={s.select} value={selected?.id || ""} onChange={e => selectListing(e.target.value)}>
            <option value="">— Choose a listing —</option>
            {listings.map(l => <option key={l.id} value={l.id}>{l.name} {l.image_url?"📸":""}</option>)}
          </select>
        )}
        {newMode && <div style={{ fontSize:14, color:"#ff6b6b", fontWeight:700, marginBottom:8 }}>Creating new listing — fill in details below</div>}
      </div>

      {/* Edit Tab */}
      {form && tab === "edit" && (
        <div style={s.card}>
          <label style={s.label}>Name</label>
          <input style={s.input} value={form.name||""} onChange={e=>field("name",e.target.value)} />

          <div style={s.row}>
            <div>
              <label style={s.label}>Type</label>
              <select style={{...s.input, marginBottom:12}} value={form.type||""} onChange={e=>field("type",e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Emoji</label>
              <input style={s.input} value={form.emoji||""} onChange={e=>field("emoji",e.target.value)} />
            </div>
          </div>

          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description||""} onChange={e=>field("description",e.target.value)} />

          <div style={s.row}>
            <div>
              <label style={s.label}>Price</label>
              <input style={s.input} value={form.price||""} onChange={e=>field("price",e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Ages</label>
              <input style={s.input} value={form.ages||""} onChange={e=>field("ages",e.target.value)} />
            </div>
          </div>

          <div style={s.row}>
            <div>
              <label style={s.label}>Day(s)</label>
              <input style={s.input} value={form.day||""} onChange={e=>field("day",e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Time</label>
              <input style={s.input} value={form.time||""} onChange={e=>field("time",e.target.value)} />
            </div>
          </div>

          <label style={s.label}>Location (area)</label>
          <input style={s.input} value={form.location||""} onChange={e=>field("location",e.target.value)} />

          <label style={s.label}>Venue (full address)</label>
          <input style={s.input} value={form.venue||""} onChange={e=>field("venue",e.target.value)} />

          <div style={s.row}>
            <div>
              <label style={s.label}>Latitude</label>
              <input style={s.input} value={form.lat||""} onChange={e=>field("lat",e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Longitude</label>
              <input style={s.input} value={form.lng||""} onChange={e=>field("lng",e.target.value)} />
            </div>
          </div>

          <label style={s.label}>Website</label>
          <input style={s.input} value={form.website||""} onChange={e=>field("website",e.target.value)} />

          <label style={s.label}>CTA URL</label>
          <input style={s.input} value={form.cta_url||""} onChange={e=>field("cta_url",e.target.value)} />

          <label style={s.label}>CTA Label</label>
          <input style={s.input} value={form.cta_label||""} onChange={e=>field("cta_label",e.target.value)} />

          <label style={s.label}>Flags</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {[["free","Free"],["indoor","Indoor"],["verified","Verified"],["sen","SEN"],["popular","Popular"],["featured_provider","Featured"]].map(([key,label]) => (
              <button key={key} style={s.toggle(!!form[key])} onClick={() => field(key, !form[key])}>{form[key]?"✓ ":""}{label}</button>
            ))}
          </div>

          <button style={s.btn(saving?"#aaa":"#1a1a2e")} disabled={saving} onClick={save}>
            {saving ? "Saving…" : newMode ? "Create listing" : "Save changes"}
          </button>
          {msg && <div style={s.msg(msg.ok)}>{msg.text}</div>}
        </div>
      )}

      {/* Photos Tab */}
      {tab === "photos" && (
        <>
          {!selected && !newMode && (
            <div style={s.card}>
              <p style={{ color:"#aaa", fontSize:14, margin:0 }}>Select a listing first to manage its photos</p>
            </div>
          )}
          {selected && (
            <PhotosTab selected={selected} onReload={loadListings} />
          )}
        </>
      )}
    </div>
  );
}

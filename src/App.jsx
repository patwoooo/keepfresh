import { useState, useRef, useEffect, useCallback } from "react";

const NOTO = "'Noto Sans TC', 'Noto Sans', sans-serif";
const GILL = "'Gill Sans', 'Gill Sans MT', 'Century Gothic', sans-serif";

const SUPABASE_URL = "https://pmonzpxkjqudgetfuovp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb256cHhranF1ZGdldGZ1b3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDA1NjAsImV4cCI6MjA5NjcxNjU2MH0.5Drj9wkyyGDgrh-h5z7UjThAbgmjJK1b4bLIaXgs4nk";
const BUCKET = "food-images";

const HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function dbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: HEADERS,
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function uploadImage(base64DataUrl, filename) {
  const base64 = base64DataUrl.split(",")[1];
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: "image/jpeg" });

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "image/jpeg",
    },
    body: blob,
  });
  if (!res.ok) throw new Error(await res.text());
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

const CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "fresh", label: "生鮮食材" },
  { id: "sauce", label: "醬料" },
  { id: "snack", label: "零食" },
  { id: "drink", label: "飲料" },
  { id: "health", label: "保健食品" },
  { id: "new", label: "+ 新增分類" },
];

const SORT_OPTIONS = ["即將到期優先", "到期日↑", "到期日↓", "名稱"];

const BG_COLORS = [
  "#4caf7d","#5b8fa8","#7a6fa8","#a86f6f",
  "#6fa87a","#a8956f","#6f8fa8","#8fa86f",
  "#7a7a7a","#6f7aa8","#a87a6f","#6fa89e",
];

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const expiry = new Date(dateStr); expiry.setHours(0,0,0,0);
  return Math.ceil((expiry - today) / (1000*60*60*24));
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}
function toDateStr(y, m, d) {
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
);
const IconChevron = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function PickerColumn({ items, selected, onSelect }) {
  const ITEM_H = 44;
  const VISIBLE = 7;
  const ref = useRef();
  const timer = useRef(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, [selected, items]);

  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const i = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      ref.current.scrollTop = clamped * ITEM_H;
      if (items[clamped] !== selected) onSelect(items[clamped]);
    }, 80);
  }

  return (
    <div style={{ flex: 1, position: "relative", height: ITEM_H * VISIBLE, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: ITEM_H, transform: "translateY(-50%)", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", pointerEvents: "none", zIndex: 2 }}/>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H * 2.5, background: "linear-gradient(to bottom, rgba(249,249,249,0.95), transparent)", pointerEvents: "none", zIndex: 3 }}/>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H * 2.5, background: "linear-gradient(to top, rgba(249,249,249,0.95), transparent)", pointerEvents: "none", zIndex: 3 }}/>
      <div ref={ref} onScroll={handleScroll}
        style={{ height: "100%", overflowY: "scroll", scrollbarWidth: "none", paddingTop: ITEM_H * 3, paddingBottom: ITEM_H * 3, WebkitOverflowScrolling: "touch" }}>
        {items.map(item => (
          <div key={item}
            style={{ height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: NOTO, fontSize: item === selected ? 20 : 16, fontWeight: item === selected ? 700 : 400, color: item === selected ? "#111" : "#aaa", transition: "font-size 0.1s, color 0.1s" }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddScreen({ image, onClose, onSave, categories }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());
  const [qty, setQty] = useState(1);
  const [category, setCategory] = useState(categories.find(c => c.id !== "all" && c.id !== "new")?.id || "snack");
  const [memo, setMemo] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  useEffect(() => {
    const max = daysInMonth(year, month);
    if (day > max) setDay(max);
  }, [year, month]);

  const expiryStr = toDateStr(year, month, day);
  const daysLeft = daysUntil(expiryStr);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      let image_url = null;
      if (image) {
        const filename = `item_${Date.now()}.jpg`;
        image_url = await uploadImage(image, filename);
      }
      const [saved] = await dbFetch("items?select=*", {
        method: "POST",
        body: JSON.stringify({
          name: name || "食材",
          category,
          expiry: expiryStr,
          image_url,
          qty,
          memo,
        }),
      });
      onSave(saved);
    } catch (e) {
      alert("儲存失敗：" + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#f5f5f5", zIndex: 400, maxWidth: 375, margin: "0 auto", overflowY: "auto", fontFamily: NOTO }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.08)", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#555", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>✕</button>

      {/* Square image preview */}
      <div style={{ padding: "60px 28px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 320, aspectRatio: "1/1", borderRadius: 0, overflow: "hidden", position: "relative", background: image ? "transparent" : "#5b8fa8", boxShadow: "0 4px 24px rgba(0,0,0,0.13)" }}>
          {image
            ? <img src={image} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>無照片</div>
          }
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.62))", padding: "32px 0 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
              {daysLeft < 0
                ? <span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 14, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>已過期</span>
                : <><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 20, color: "#fff", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{daysLeft}</span><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", marginLeft: 1 }}>日</span></>
              }
            </div>
            <div style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.4)", textAlign: "center", marginTop: 2 }}>{formatDate(expiryStr)}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", margin: "0 0 8px", padding: "0 20px" }}>
        {/* Name */}
        <div style={{ borderBottom: "1px solid #eee", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#888", fontSize: 15 }}>名稱</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="食材名稱"
            style={{ border: "none", outline: "none", fontSize: 15, fontFamily: NOTO, textAlign: "right", color: "#111", background: "transparent", width: "55%" }} />
        </div>
        {/* Qty */}
        <div style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#888", fontSize: 15 }}>數量</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #34a853", background: "#fff", fontSize: 18, color: "#34a853", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ fontSize: 17, fontWeight: 500, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #34a853", background: "#fff", fontSize: 18, color: "#34a853", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>
        {/* Expiry */}
        <div style={{ padding: "14px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#888", fontSize: 15 }}>保存期限</span>
          <span style={{ fontSize: 15, color: "#111" }}>{year}年{month}月{day}日</span>
        </div>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee", paddingBottom: 4, background: "#f9f9f9", borderRadius: 10, margin: "6px 0 0" }}>
          <PickerColumn items={years} selected={year} onSelect={setYear} />
          <div style={{ display: "flex", alignItems: "center", color: "#888", fontSize: 14, alignSelf: "center" }}>年</div>
          <PickerColumn items={months} selected={month} onSelect={setMonth} />
          <div style={{ display: "flex", alignItems: "center", color: "#888", fontSize: 14, alignSelf: "center" }}>月</div>
          <PickerColumn items={days} selected={day} onSelect={setDay} />
          <div style={{ display: "flex", alignItems: "center", color: "#888", fontSize: 14, alignSelf: "center" }}>日</div>
        </div>
        {/* Category */}
        <div style={{ borderBottom: "1px solid #eee", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#888", fontSize: 15 }}>分類</span>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 15, fontFamily: NOTO, color: "#111", background: "transparent", textAlign: "right" }}>
            {categories.filter(c => c.id !== "all" && c.id !== "new").map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        {/* Memo */}
        <div style={{ padding: "14px 0" }}>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 6 }}>備註</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="備註（選填）" rows={2}
            style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontFamily: NOTO, color: "#111", background: "transparent", resize: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ padding: "16px 20px 40px" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", padding: "15px", background: saving ? "#aaa" : "#34a853", border: "none", borderRadius: 30, color: "#fff", fontSize: 17, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: NOTO }}>
          {saving ? "儲存中..." : "新增"}
        </button>
      </div>
    </div>
  );
}

export default function KeepFresh() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("即將到期優先");
  const [search, setSearch] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addScreen, setAddScreen] = useState(null);
  const cameraInputRef = useRef();

  const loadItems = useCallback(async () => {
    try {
      const data = await dbFetch("items?select=*&order=expiry.asc");
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Poll every 30s so partner's changes appear
  useEffect(() => {
    const t = setInterval(loadItems, 30000);
    return () => clearInterval(t);
  }, [loadItems]);

  let filtered = items.filter(item => {
    const catMatch = activeCategory === "all" || item.category === activeCategory;
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "即將到期優先") return daysUntil(a.expiry) - daysUntil(b.expiry);
    if (sortBy === "到期日↑") return new Date(a.expiry) - new Date(b.expiry);
    if (sortBy === "到期日↓") return new Date(b.expiry) - new Date(a.expiry);
    if (sortBy === "名稱") return a.name.localeCompare(b.name);
    return 0;
  });

  function handleFabClick() { cameraInputRef.current.click(); }

  function handleCameraCapture(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        setAddScreen({ image: canvas.toDataURL("image/jpeg", 0.92) });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSaveItem(saved) {
    setItems(prev => [saved, ...prev]);
    setAddScreen(null);
  }

  async function handleDeleteItem(id) {
    try {
      await dbFetch(`items?id=eq.${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      setSelectedItem(null);
    } catch (e) {
      alert("刪除失敗：" + e.message);
    }
  }

  function handleAddCategory() {
    if (!newCatName) return;
    const id = newCatName.toLowerCase().replace(/\s/g,"_") + Date.now();
    setCategories(prev => [...prev.filter(c => c.id !== "new"), { id, label: newCatName }, { id: "new", label: "+ 新增分類" }]);
    setNewCatName("");
    setShowAddCategory(false);
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;700&family=Noto+Sans:wght@300;400;700&display=swap" rel="stylesheet"/>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleCameraCapture} />

      <div style={{ fontFamily: NOTO, background: "#f2f4f3", minHeight: "100vh", maxWidth: 375, margin: "0 auto", position: "relative", paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ background: "#fff", padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: GILL, fontSize: 25, fontWeight: 300, color: "#34a853", letterSpacing: 3, textTransform: "uppercase" }}>KEEPFRESH</span>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
            {categories.map(cat => {
              const isActive = activeCategory === cat.id && cat.id !== "new";
              const isNew = cat.id === "new";
              return (
                <button key={cat.id} onClick={() => isNew ? setShowAddCategory(true) : setActiveCategory(cat.id)}
                  style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: isNew ? "1.5px dashed #bbb" : "none", background: isActive ? "#34a853" : isNew ? "transparent" : "#f0f0f0", color: isActive ? "#fff" : isNew ? "#999" : "#555", fontWeight: isActive ? 700 : 400, fontSize: 13, fontFamily: NOTO, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 0 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f0f0", borderRadius: 8, padding: "7px 10px", flex: 1 }}>
              <IconSearch />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋食材..."
                style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", width: "100%", fontFamily: NOTO }} />
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSortDropdown(p => !p)}
                style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: NOTO, color: "#444", whiteSpace: "nowrap" }}>
                {sortBy} <IconChevron />
              </button>
              {showSortDropdown && (
                <div style={{ position: "absolute", right: 0, top: 36, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 150, overflow: "hidden" }}>
                  {SORT_OPTIONS.map(opt => (
                    <div key={opt} onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                      style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: NOTO, background: sortBy === opt ? "#f0faf3" : "#fff", color: sortBy === opt ? "#34a853" : "#333", fontWeight: sortBy === opt ? 700 : 400 }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: 80, fontFamily: NOTO, fontSize: 14 }}>載入中...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa", marginTop: 60, fontFamily: NOTO, fontSize: 14 }}>還沒有食材，點 + 新增吧</div>
            ) : filtered.map((item, idx) => {
              const days = daysUntil(item.expiry);
              return (
                <div key={item.id} onClick={() => setSelectedItem(item)}
                  style={{ position: "relative", aspectRatio: "1 / 1.15", background: item.image_url ? "#eee" : BG_COLORS[idx % BG_COLORS.length], cursor: "pointer", overflow: "hidden" }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: NOTO, fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "0 6px" }}>{item.name}</span>
                      </div>
                  }
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.62))", padding: "24px 0 7px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
                      {days < 0
                        ? <span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 14, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>已過期</span>
                        : <><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 20, color: "#fff", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{days}</span><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", marginLeft: 1 }}>日</span></>
                      }
                    </div>
                    <div style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.4)", textAlign: "center", marginTop: 2 }}>{formatDate(item.expiry)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 375, display: "flex", justifyContent: "center", padding: "0 0 32px", zIndex: 100, pointerEvents: "none" }}>
          <button onClick={handleFabClick}
            style={{ pointerEvents: "all", background: "#34a853", border: "none", borderRadius: "50%", width: 90, height: 90, fontSize: 36, color: "#fff", cursor: "pointer", boxShadow: "0 6px 24px rgba(52,168,83,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            +
          </button>
        </div>

        {addScreen && <AddScreen image={addScreen.image} categories={categories} onClose={() => setAddScreen(null)} onSave={handleSaveItem} />}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
            onClick={e => e.target === e.currentTarget && setShowAddCategory(false)}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 375, margin: "0 auto", padding: "24px 20px 44px" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16, fontFamily: NOTO }}>新增分類</div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4, fontFamily: NOTO }}>分類名稱</label>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="輸入分類名稱"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: NOTO, borderRadius: 8, marginBottom: 16 }} />
              <button onClick={handleAddCategory} style={{ width: "100%", padding: "13px", background: newCatName ? "#34a853" : "#e0e0e0", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: NOTO }}>
                新增分類
              </button>
            </div>
          </div>
        )}

        {/* Item Detail — full page like reference image */}
        {selectedItem && (
          <div style={{ position: "fixed", inset: 0, background: "#f5f5f5", zIndex: 300, maxWidth: 375, margin: "0 auto", overflowY: "auto", fontFamily: NOTO }}>

            {/* Back arrow */}
            <button onClick={() => setSelectedItem(null)}
              style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", fontSize: 22, color: "#34a853", cursor: "pointer", zIndex: 10, padding: 4 }}>‹</button>

            {/* Square image preview */}
            <div style={{ padding: "60px 28px 24px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 320, aspectRatio: "1/1", overflow: "hidden", position: "relative", background: selectedItem.image_url ? "transparent" : "#5b8fa8", boxShadow: "0 4px 24px rgba(0,0,0,0.13)" }}>
                {selectedItem.image_url
                  ? <img src={selectedItem.image_url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{selectedItem.name}</div>
                }
                {/* Gradient overlay same as card */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.62))", padding: "32px 0 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
                    {daysUntil(selectedItem.expiry) < 0
                      ? <span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 14, color: "#fff" }}>已過期</span>
                      : <><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 20, color: "#fff", lineHeight: 1 }}>{daysUntil(selectedItem.expiry)}</span><span style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "#fff", marginLeft: 1 }}>日</span></>
                    }
                  </div>
                  <div style={{ fontFamily: NOTO, fontWeight: 300, fontSize: 9, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 2 }}>{formatDate(selectedItem.expiry)}</div>
                </div>
              </div>
            </div>

            {/* Detail fields */}
            <div style={{ background: "#fff", margin: "0 0 8px", padding: "0 20px" }}>

              {/* Name */}
              <div style={{ borderBottom: "1px solid #eee", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888", fontSize: 15 }}>名稱</span>
                <span style={{ fontSize: 15, color: "#111" }}>{selectedItem.name}</span>
              </div>

              {/* Qty */}
              <div style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#888", fontSize: 15 }}>數量</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button onClick={async () => {
                    const newQty = Math.max(1, (selectedItem.qty || 1) - 1);
                    try {
                      await dbFetch(`items?id=eq.${selectedItem.id}`, { method: "PATCH", body: JSON.stringify({ qty: newQty }) });
                      setSelectedItem(p => ({ ...p, qty: newQty }));
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, qty: newQty } : i));
                    } catch(e) {}
                  }} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #34a853", background: "#fff", fontSize: 18, color: "#34a853", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 17, fontWeight: 500, minWidth: 20, textAlign: "center" }}>{selectedItem.qty || 1}</span>
                  <button onClick={async () => {
                    const newQty = (selectedItem.qty || 1) + 1;
                    try {
                      await dbFetch(`items?id=eq.${selectedItem.id}`, { method: "PATCH", body: JSON.stringify({ qty: newQty }) });
                      setSelectedItem(p => ({ ...p, qty: newQty }));
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, qty: newQty } : i));
                    } catch(e) {}
                  }} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #34a853", background: "#fff", fontSize: 18, color: "#34a853", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>

              {/* Expiry */}
              <div style={{ borderBottom: "1px solid #eee", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888", fontSize: 15 }}>保存期限</span>
                <span style={{ fontSize: 15, color: "#111" }}>{formatDate(selectedItem.expiry)}</span>
              </div>

              {/* Category */}
              <div style={{ borderBottom: "1px solid #eee", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888", fontSize: 15 }}>分類</span>
                <span style={{ fontSize: 15, color: "#111" }}>{categories.find(c => c.id === selectedItem.category)?.label || "—"}</span>
              </div>

              {/* Memo */}
              <div style={{ padding: "14px 0" }}>
                <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>備註</div>
                <div style={{ fontSize: 14, color: selectedItem.memo ? "#111" : "#bbb" }}>{selectedItem.memo || "無備註"}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: "12px 20px 4px" }}>
              <button onClick={() => handleDeleteItem(selectedItem.id)}
                style={{ width: "100%", padding: "15px", background: "#34a853", border: "none", borderRadius: 30, color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: NOTO }}>
                處理完畢
              </button>
            </div>
            <div style={{ padding: "8px 20px 44px" }}>
              <button onClick={() => setSelectedItem(null)}
                style={{ width: "100%", padding: "13px", background: "transparent", border: "1.5px solid #ddd", borderRadius: 30, color: "#888", fontSize: 15, cursor: "pointer", fontFamily: NOTO }}>
                返回
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

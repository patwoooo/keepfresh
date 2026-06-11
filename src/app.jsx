import { useState, useRef } from "react";

const NOTO = "'Noto Sans TC', 'Noto Sans', sans-serif";

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

const SAMPLE_ITEMS = [
  { id: 1, name: "ハッピーターン 250%スパイス", category: "snack", expiry: "2026-07-28", image: null },
  { id: 2, name: "皮付きランチポテト", category: "snack", expiry: "2026-09-01", image: null },
  { id: 3, name: "チーズビット", category: "snack", expiry: "2026-09-01", image: null },
  { id: 4, name: "極厚あみじゃが スパイス塩", category: "snack", expiry: "2026-09-05", image: null },
  { id: 5, name: "柿の種 ハッピーコラボ", category: "snack", expiry: "2026-09-20", image: null },
  { id: 6, name: "ハッピーターン ハニー", category: "snack", expiry: "2026-09-22", image: null },
  { id: 7, name: "マカダミアチョコ", category: "snack", expiry: "2026-10-01", image: null },
  { id: 8, name: "ザ厚切りコンソメ", category: "snack", expiry: "2026-10-01", image: null },
  { id: 9, name: "ハッピーターン パウダー", category: "snack", expiry: "2026-10-18", image: null },
  { id: 10, name: "LOTTE グミ", category: "snack", expiry: "2026-11-12", image: null },
  { id: 11, name: "LOTTE クリーム", category: "snack", expiry: "2026-11-20", image: null },
  { id: 12, name: "ポリンキー", category: "snack", expiry: "2026-12-11", image: null },
];

const BG_COLORS = [
  "#4caf7d", "#5b8fa8", "#7a6fa8", "#a86f6f",
  "#6fa87a", "#a8956f", "#6f8fa8", "#8fa86f",
  "#7a7a7a", "#6f7aa8", "#a87a6f", "#6fa89e",
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

function daysColor(days) {
  if (days <= 7) return "#d32f2f";
  if (days <= 30) return "#f57c00";
  return "#ffffff";
}

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
);
const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconList = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#34a853" : "#aaa"} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="4" rx="1"/>
    <rect x="3" y="10" width="18" height="4" rx="1"/>
    <rect x="3" y="16" width="18" height="4" rx="1"/>
  </svg>
);
const IconBell = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#34a853" : "#aaa"} strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function KeepFresh() {
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("即將到期優先");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", category: "snack", expiry: "", image: null });
  const [activeTab, setActiveTab] = useState("inventory");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef();

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

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewItem(prev => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function handleAddItem() {
    if (!newItem.name || !newItem.expiry) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ name: "", category: "snack", expiry: "", image: null });
    setShowAdd(false);
  }

  function handleDeleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  }

  function handleAddCategory() {
    if (!newCatName) return;
    const id = newCatName.toLowerCase().replace(/\s/g,"_") + Date.now();
    setCategories(prev => [
      ...prev.filter(c => c.id !== "new"),
      { id, label: newCatName },
      { id: "new", label: "+ 新增分類" }
    ]);
    setNewCatName("");
    setShowAddCategory(false);
  }

  const expiringSoon = items.filter(i => daysUntil(i.expiry) <= 7);
  const expiringWeek = items.filter(i => daysUntil(i.expiry) > 7 && daysUntil(i.expiry) <= 30);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: NOTO, background: "#f2f4f3", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: 80 }}>

        <div style={{ background: "#fff", padding: "16px 20px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ width: 44 }} />
            <span style={{ fontFamily: NOTO, fontSize: 24, fontWeight: 700, color: "#34a853", letterSpacing: 2 }}>KeepFresh</span>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ cursor: "pointer" }}><IconSettings /></span>
              <span style={{ cursor: "pointer" }}><IconUser /></span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {categories.map(cat => {
              const isActive = activeCategory === cat.id && cat.id !== "new";
              const isNew = cat.id === "new";
              return (
                <button key={cat.id} onClick={() => isNew ? setShowAddCategory(true) : setActiveCategory(cat.id)}
                  style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: isNew ? "1.5px dashed #bbb" : "none", background: isActive ? "#34a853" : isNew ? "transparent" : "#f0f0f0", color: isActive ? "#fff" : isNew ? "#999" : "#555", fontWeight: isActive ? 700 : 400, fontSize: 13, fontFamily: NOTO, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f0f0", borderRadius: 10, padding: "8px 12px", flex: 1 }}>
              <IconSearch />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋食材..."
                style={{ border: "none", background: "transparent", fontSize: 14, outline: "none", width: "100%", fontFamily: NOTO }} />
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSortDropdown(p => !p)}
                style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: NOTO, whiteSpace: "nowrap", color: "#444" }}>
                {sortBy} <IconChevron />
              </button>
              {showSortDropdown && (
                <div style={{ position: "absolute", right: 0, top: 38, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.13)", zIndex: 200, minWidth: 150, overflow: "hidden" }}>
                  {SORT_OPTIONS.map(opt => (
                    <div key={opt} onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                      style={{ padding: "11px 16px", fontSize: 13, cursor: "pointer", fontFamily: NOTO, background: sortBy === opt ? "#f0faf3" : "#fff", color: sortBy === opt ? "#34a853" : "#333", fontWeight: sortBy === opt ? 700 : 400 }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === "inventory" && (
          <div style={{ padding: "12px 8px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", marginTop: 60, fontFamily: NOTO }}>
                <div style={{ fontSize: 15 }}>還沒有食材，點 + 新增吧</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {filtered.map((item, idx) => {
                  const days = daysUntil(item.expiry);
                  return (
                    <div key={item.id} onClick={() => setSelectedItem(item)}
                      style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", aspectRatio: "1 / 1.15", position: "relative", background: item.image ? "#eee" : BG_COLORS[idx % BG_COLORS.length], boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: NOTO, fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "0 6px" }}>{item.name}</span>
                          </div>
                      }
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.68))", padding: "20px 6px 6px" }}>
                        <div style={{ color: daysColor(days), fontSize: days > 99 ? 17 : 21, fontWeight: 900, lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.5)", fontFamily: NOTO }}>
                          {days < 0 ? "已過期" : `剩 ${days} 天`}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 9.5, marginTop: 2, fontFamily: NOTO }}>{formatDate(item.expiry)}</div>
                      </div>
                      {days <= 7 && days >= 0 && (
                        <div style={{ position: "absolute", top: 6, right: 6, background: "#d32f2f", borderRadius: 99, width: 8, height: 8 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, fontFamily: NOTO }}>通知</div>
            {expiringSoon.length === 0 && expiringWeek.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", marginTop: 40, fontFamily: NOTO }}>
                <div style={{ fontSize: 14 }}>目前沒有到期通知</div>
              </div>
            ) : (
              <>
                {expiringSoon.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, color: "#d32f2f", fontWeight: 700, marginBottom: 8, fontFamily: NOTO }}>7 天內到期</div>
                    {expiringSoon.map(item => (
                      <div key={item.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: "4px solid #d32f2f" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, fontFamily: NOTO }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontFamily: NOTO }}>{formatDate(item.expiry)}</div>
                        </div>
                        <div style={{ color: "#d32f2f", fontWeight: 900, fontSize: 18, fontFamily: NOTO }}>
                          {daysUntil(item.expiry) < 0 ? "已過期" : `剩 ${daysUntil(item.expiry)} 天`}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {expiringWeek.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, color: "#f57c00", fontWeight: 700, margin: "12px 0 8px", fontFamily: NOTO }}>30 天內到期</div>
                    {expiringWeek.map(item => (
                      <div key={item.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: "4px solid #f57c00" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, fontFamily: NOTO }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontFamily: NOTO }}>{formatDate(item.expiry)}</div>
                        </div>
                        <div style={{ color: "#f57c00", fontWeight: 900, fontSize: 18, fontFamily: NOTO }}>剩 {daysUntil(item.expiry)} 天</div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 16px", zIndex: 100 }}>
          <button onClick={() => setActiveTab("inventory")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <IconList active={activeTab === "inventory"} />
            <span style={{ fontSize: 11, color: activeTab === "inventory" ? "#34a853" : "#aaa", fontFamily: NOTO }}>食材庫存</span>
          </button>
          <button onClick={() => setShowAdd(true)} style={{ background: "#34a853", border: "none", borderRadius: "50%", width: 54, height: 54, fontSize: 26, color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(52,168,83,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontFamily: NOTO }}>
            +
          </button>
          <button onClick={() => setActiveTab("notifications")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
            <IconBell active={activeTab === "notifications"} />
            {expiringSoon.length > 0 && (
              <div style={{ position: "absolute", top: -2, right: -4, background: "#d32f2f", color: "#fff", borderRadius: 99, fontSize: 10, width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{expiringSoon.length}</div>
            )}
            <span style={{ fontSize: 11, color: activeTab === "notifications" ? "#34a853" : "#aaa", fontFamily: NOTO }}>通知</span>
          </button>
        </div>

        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
            onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 20px 40px" }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, fontFamily: NOTO }}>新增食材</div>
              <div onClick={() => fileInputRef.current.click()}
                style={{ width: "100%", height: 150, borderRadius: 14, background: newItem.image ? "transparent" : "#f7f7f7", border: "1.5px dashed #ddd", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden" }}>
                {newItem.image
                  ? <img src={newItem.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ textAlign: "center", color: "#bbb" }}>
                      <IconCamera />
                      <div style={{ fontSize: 13, marginTop: 6, fontFamily: NOTO }}>點擊上傳照片</div>
                    </div>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
              {[
                { label: "食材名稱", node: <input value={newItem.name} onChange={e => setNewItem(p => ({...p, name: e.target.value}))} placeholder="輸入食材名稱" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: NOTO }} /> },
                { label: "分類", node: <select value={newItem.category} onChange={e => setNewItem(p => ({...p, category: e.target.value}))} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: NOTO }}>
                  {categories.filter(c => c.id !== "all" && c.id !== "new").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select> },
                { label: "到期日", node: <input type="date" value={newItem.expiry} onChange={e => setNewItem(p => ({...p, expiry: e.target.value}))} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: NOTO }} /> },
              ].map(({ label, node }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 4, fontFamily: NOTO }}>{label}</label>
                  {node}
                </div>
              ))}
              <button onClick={handleAddItem} style={{ width: "100%", padding: "14px", borderRadius: 14, background: newItem.name && newItem.expiry ? "#34a853" : "#e0e0e0", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: NOTO }}>
                新增食材
              </button>
            </div>
          </div>
        )}

        {showAddCategory && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
            onClick={e => e.target === e.currentTarget && setShowAddCategory(false)}>
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 20px 40px" }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, fontFamily: NOTO }}>新增分類</div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 4, fontFamily: NOTO }}>分類名稱</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="輸入分類名稱"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: NOTO }} />
              </div>
              <button onClick={handleAddCategory} style={{ width: "100%", padding: "14px", borderRadius: 14, background: newCatName ? "#34a853" : "#e0e0e0", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: NOTO }}>
                新增分類
              </button>
            </div>
          </div>
        )}

        {selectedItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
            onClick={e => e.target === e.currentTarget && setSelectedItem(null)}>
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 20px 40px" }}>
              {selectedItem.image && <img src={selectedItem.image} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 14, marginBottom: 16 }} />}
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, fontFamily: NOTO }}>{selectedItem.name}</div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 4, fontFamily: NOTO }}>分類：{categories.find(c => c.id === selectedItem.category)?.label}</div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 12, fontFamily: NOTO }}>到期日：{formatDate(selectedItem.expiry)}</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20, fontFamily: NOTO, color: daysUntil(selectedItem.expiry) <= 7 ? "#d32f2f" : daysUntil(selectedItem.expiry) <= 30 ? "#f57c00" : "#34a853" }}>
                {daysUntil(selectedItem.expiry) < 0 ? "已過期！" : `還有 ${daysUntil(selectedItem.expiry)} 天`}
              </div>
              <button onClick={() => handleDeleteItem(selectedItem.id)} style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#d32f2f", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: NOTO }}>
                刪除此食材
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

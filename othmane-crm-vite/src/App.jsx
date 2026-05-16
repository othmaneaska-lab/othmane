import { useState, useRef, useEffect } from "react";

// ── Brand Colors ──────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D48B";
const GOLD_DARK = "#8B6914";
const BG_DARK = "#0D0D0D";
const BG_CARD = "#141414";
const BG_CARD2 = "#1A1A1A";
const BORDER = "#2A2A2A";

// ── Logo SVG (reproduced from brand mark geometry) ────────────
function OBLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GOLD_DARK} />
          <stop offset="50%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_LIGHT} />
        </linearGradient>
      </defs>
      {/* B shape: vertical bar */}
      <rect x="18" y="15" width="10" height="70" rx="3" fill="url(#goldGrad)" />
      {/* B top bump */}
      <path d="M28 15 Q58 15 58 32 Q58 49 28 49Z" fill="url(#goldGrad)" />
      {/* B bottom bump */}
      <path d="M28 49 Q62 49 62 67 Q62 85 28 85Z" fill="url(#goldGrad)" />
      {/* circle O inside lower bump */}
      <circle cx="47" cy="68" r="10" fill={BG_DARK} />
    </svg>
  );
}

// ── Sample Data ───────────────────────────────────────────────
const DEMO = [
  { id: 1, name: "أحمد محمد السيد", phone: "0501234567", type: "عميل", status: "نشط", lastVisit: "2026-05-10", notes: "يفضل التواصل مساءً", tags: ["VIP"] },
  { id: 2, name: "سارة علي الزهراني", phone: "0559876543", type: "مريض", status: "متابعة", lastVisit: "2026-05-14", notes: "مراجعة كل أسبوعين", tags: ["أولوية"] },
  { id: 3, name: "محمد عبدالله النجار", phone: "0521112233", type: "عميل", status: "جديد", lastVisit: "2026-05-15", notes: "مهتم بالعروض الجديدة", tags: ["جديد"] },
  { id: 4, name: "فاطمة حسن العمري", phone: "0534445566", type: "مريض", status: "نشط", lastVisit: "2026-05-08", notes: "حساسية من البنسلين", tags: ["تنبيه طبي"] },
  { id: 5, name: "خالد سعد الدوسري", phone: "0577778899", type: "عميل", status: "غير نشط", lastVisit: "2026-03-20", notes: "لم يتواصل منذ فترة", tags: [] },
];

const STATUS_META = {
  "نشط":      { bg: "#0d2b1e", text: "#34d399", dot: "#10b981" },
  "متابعة":   { bg: "#2b1f0a", text: "#fbbf24", dot: "#f59e0b" },
  "جديد":     { bg: "#0a1a2b", text: "#60a5fa", dot: "#3b82f6" },
  "غير نشط": { bg: "#1a1a1a", text: "#6b7280", dot: "#4b5563" },
};

const TAG_META = {
  "VIP":        GOLD,
  "منتظم":      "#0891b2",
  "أولوية":     "#ef4444",
  "جديد":       "#10b981",
  "تنبيه طبي": "#f97316",
};

// ── Avatar initials ───────────────────────────────────────────
function Avatar({ name, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "12px", flexShrink: 0,
      background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#000", fontWeight: "800", fontSize: size * 0.38,
      fontFamily: "'Cairo', sans-serif",
    }}>{name[0]}</div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: "16px",
      padding: "20px", display: "flex", alignItems: "center", gap: "14px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", borderRadius: "0 16px 0 80px", background: accent + "12" }} />
      <div style={{ width: 48, height: 48, borderRadius: "12px", background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [clients, setClients]       = useState(DEMO);
  const [view, setView]             = useState("list");
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("الكل");
  const [chatMessages, setChat]     = useState([]);
  const [chatInput, setChatInput]   = useState("");
  const [apiKey, setApiKey]         = useState("");
  const [apiInput, setApiInput]     = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [newC, setNewC]             = useState({ name:"", phone:"", type:"عميل", status:"جديد", notes:"", tags:[] });
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const filtered = clients.filter(c =>
    (c.name.includes(search) || c.phone.includes(search)) &&
    (filterStatus === "الكل" || c.status === filterStatus)
  );

  const stats = {
    total:   clients.length,
    active:  clients.filter(c => c.status === "نشط").length,
    newC:    clients.filter(c => c.status === "جديد").length,
    follow:  clients.filter(c => c.status === "متابعة").length,
  };

  // ── AI Chat ────────────────────────────────────────────────
  async function sendMessage() {
    if (!chatInput.trim()) return;
    if (!apiKey) { setShowModal(true); return; }
    const msg = chatInput.trim();
    setChatInput("");
    setChat(p => [...p, { role:"user", content: msg }]);
    setLoading(true);

    const sys = `أنت مساعد ذكاء اصطناعي لنظام إدارة عملاء شركة Othmane Benhadjer.
بيانات العملاء:
${clients.map(c=>`- ${c.name} | ${c.phone} | ${c.type} | ${c.status} | آخر زيارة: ${c.lastVisit} | ${c.notes}`).join("\n")}
الإجماليات: الكل ${stats.total} | نشط ${stats.active} | جديد ${stats.newC} | متابعة ${stats.follow}
أجب بالعربية بشكل مختصر ومفيد.`;

    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: sys,
          messages: [...history, { role:"user", content: msg }],
        }),
      });
      const data = await res.json();
      setChat(p => [...p, { role:"assistant", content: data.content?.[0]?.text || "حدث خطأ." }]);
    } catch {
      setChat(p => [...p, { role:"assistant", content: "❌ تعذر الاتصال. تحقق من مفتاح API." }]);
    }
    setLoading(false);
  }

  function addClient() {
    if (!newC.name || !newC.phone) return;
    setClients(p => [{ ...newC, id: Date.now(), lastVisit: new Date().toISOString().split("T")[0] }, ...p]);
    setNewC({ name:"", phone:"", type:"عميل", status:"جديد", notes:"", tags:[] });
    setView("list");
  }

  // ── Shared input style ─────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: `1px solid ${BORDER}`, background: BG_CARD2,
    color: "#fff", fontSize: "14px", fontFamily: "'Cairo', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const navItems = [
    { id:"list",  icon:"👥", label:"العملاء" },
    { id:"add",   icon:"➕", label:"إضافة عميل" },
    { id:"chat",  icon:"🤖", label:"AI Assistant" },
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'Cairo', 'Segoe UI', sans-serif", direction:"rtl", minHeight:"100vh", background: BG_DARK, display:"flex" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 230, background: BG_CARD, borderLeft: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column", position: "fixed",
        height: "100vh", right: 0, top: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            <OBLogo size={42} />
            <div>
              <div style={{ color: GOLD, fontWeight: 800, fontSize: 13, letterSpacing: "0.04em" }}>OTHMANE</div>
              <div style={{ color: GOLD_LIGHT, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em" }}>BENHADJER</div>
              <div style={{ color: "#4b5563", fontSize: 10, marginTop: 1 }}>نظام إدارة العملاء</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"11px 14px", borderRadius:10, border:"none", cursor:"pointer",
                marginBottom:4, fontSize:13, fontFamily:"inherit",
                background: active ? GOLD + "20" : "transparent",
                color: active ? GOLD : "#6b7280",
                fontWeight: active ? 700 : 400,
                transition:"all 0.2s",
                borderRight: active ? `3px solid ${GOLD}` : "3px solid transparent",
              }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                {item.label}
                {item.id === "chat" && !apiKey && (
                  <span style={{ marginRight:"auto", background:"#ef4444", color:"#fff", fontSize:9, padding:"2px 6px", borderRadius:10 }}>API</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* API Key button */}
        <div style={{ padding:16, borderTop:`1px solid ${BORDER}` }}>
          <button onClick={() => setShowModal(true)} style={{
            width:"100%", padding:"9px", borderRadius:8,
            border: `1px solid ${apiKey ? "#065f46" : GOLD_DARK}`,
            background: apiKey ? "#0d2b1e" : GOLD + "15",
            color: apiKey ? "#34d399" : GOLD,
            fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
          }}>
            {apiKey ? "✅ API متصل" : "🔑 إعداد API Key"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginRight: 230, flex: 1, padding: 24, minHeight: "100vh" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          <StatCard icon="👥" label="إجمالي العملاء" value={stats.total}  accent={GOLD} />
          <StatCard icon="✅" label="النشطون"         value={stats.active} accent="#10b981" />
          <StatCard icon="🆕" label="عملاء جدد"      value={stats.newC}   accent="#3b82f6" />
          <StatCard icon="⏰" label="متابعة"          value={stats.follow} accent="#f59e0b" />
        </div>

        {/* ── LIST ── */}
        {view === "list" && (
          <div style={{ background: BG_CARD, border:`1px solid ${BORDER}`, borderRadius:20, overflow:"hidden" }}>
            {/* Toolbar */}
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 بحث..."
                style={{ ...inputStyle, width:220, flex:"none" }} />
              {["الكل","نشط","متابعة","جديد","غير نشط"].map(s => (
                <button key={s} onClick={()=>setFilter(s)} style={{
                  padding:"8px 14px", borderRadius:8, border:"none", cursor:"pointer",
                  fontSize:12, fontFamily:"inherit",
                  background: filterStatus===s ? GOLD : "#1f1f1f",
                  color: filterStatus===s ? "#000" : "#6b7280",
                  fontWeight: filterStatus===s ? 700 : 400,
                }}>{s}</button>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((c, idx) => {
              const sc = STATUS_META[c.status] || STATUS_META["نشط"];
              return (
                <div key={c.id} onClick={()=>{ setSelected(c); setView("detail"); }}
                  style={{
                    display:"flex", alignItems:"center", padding:"14px 24px", cursor:"pointer",
                    borderBottom: idx < filtered.length-1 ? `1px solid ${BORDER}` : "none",
                    transition:"background 0.15s", gap:14,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=BG_CARD2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <Avatar name={c.name} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:700, color:"#fff", fontSize:14 }}>{c.name}</span>
                      {c.tags.map(t => (
                        <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:(TAG_META[t]||GOLD)+"22", color:TAG_META[t]||GOLD, fontWeight:600 }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:"#4b5563", marginTop:3 }}>📱 {c.phone} &nbsp;|&nbsp; {c.lastVisit}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:sc.bg }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:sc.dot }} />
                    <span style={{ fontSize:12, color:sc.text, fontWeight:600 }}>{c.status}</span>
                  </div>
                  <div style={{ fontSize:11, color:"#4b5563", background:"#1f1f1f", padding:"4px 10px", borderRadius:6 }}>{c.type}</div>
                </div>
              );
            })}
            {filtered.length===0 && (
              <div style={{ textAlign:"center", padding:60, color:"#4b5563" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                <div>لا توجد نتائج</div>
              </div>
            )}
          </div>
        )}

        {/* ── DETAIL ── */}
        {view === "detail" && selected && (
          <div>
            <button onClick={()=>setView("list")} style={{ marginBottom:16, padding:"8px 16px", borderRadius:8, border:`1px solid ${BORDER}`, background:BG_CARD, cursor:"pointer", fontSize:13, fontFamily:"inherit", color:"#9ca3af" }}>← رجوع</button>
            <div style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
                <Avatar name={selected.name} size={64} />
                <div>
                  <h2 style={{ margin:0, fontSize:22, color:"#fff" }}>{selected.name}</h2>
                  <div style={{ color:"#6b7280", marginTop:4, fontSize:14 }}>{selected.type}</div>
                </div>
                <button onClick={()=>{ setClients(p=>p.filter(c=>c.id!==selected.id)); setView("list"); }} style={{ marginRight:"auto", padding:"9px 18px", borderRadius:10, border:"1px solid #3f1f1f", background:"#1f0f0f", color:"#ef4444", cursor:"pointer", fontSize:13, fontFamily:"inherit", fontWeight:600 }}>
                  🗑️ حذف
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"رقم الهاتف", value:selected.phone, icon:"📱" },
                  { label:"الحالة",     value:selected.status, icon:"📊" },
                  { label:"آخر زيارة", value:selected.lastVisit, icon:"📅" },
                  { label:"النوع",      value:selected.type, icon:"🏷️" },
                ].map((f,i)=>(
                  <div key={i} style={{ background:BG_CARD2, borderRadius:12, padding:16, border:`1px solid ${BORDER}` }}>
                    <div style={{ fontSize:11, color:"#4b5563", marginBottom:6 }}>{f.icon} {f.label}</div>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:15 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div style={{ marginTop:14, background:"#1a1200", borderRadius:12, padding:16, border:`1px solid ${GOLD_DARK}40` }}>
                  <div style={{ fontSize:11, color:GOLD_DARK, marginBottom:6 }}>📝 ملاحظات</div>
                  <div style={{ color:GOLD_LIGHT, fontSize:14 }}>{selected.notes}</div>
                </div>
              )}
              {selected.tags.length>0 && (
                <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {selected.tags.map(t=>(
                    <span key={t} style={{ fontSize:12, padding:"5px 14px", borderRadius:20, background:(TAG_META[t]||GOLD)+"22", color:TAG_META[t]||GOLD, fontWeight:600 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADD ── */}
        {view === "add" && (
          <div style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:32, maxWidth:560 }}>
            <h2 style={{ margin:"0 0 24px", color:"#fff", fontSize:20 }}>➕ إضافة عميل جديد</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"الاسم الكامل *", key:"name", ph:"أدخل الاسم الكامل..." },
                { label:"رقم الهاتف *",   key:"phone", ph:"05XXXXXXXX" },
                { label:"ملاحظات",         key:"notes", ph:"ملاحظات مهمة..." },
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ display:"block", fontSize:13, color:"#9ca3af", marginBottom:6, fontWeight:600 }}>{f.label}</label>
                  <input value={newC[f.key]} onChange={e=>setNewC(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={inputStyle} />
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"النوع", key:"type", opts:["عميل","مريض"] },
                  { label:"الحالة", key:"status", opts:["جديد","نشط","متابعة","غير نشط"] },
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{ display:"block", fontSize:13, color:"#9ca3af", marginBottom:6, fontWeight:600 }}>{f.label}</label>
                    <select value={newC[f.key]} onChange={e=>setNewC(p=>({...p,[f.key]:e.target.value}))} style={{ ...inputStyle }}>
                      {f.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={addClient} style={{
                padding:13, borderRadius:12, border:"none",
                background:`linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
                color:"#000", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginTop:8,
              }}>✅ حفظ العميل</button>
            </div>
          </div>
        )}

        {/* ── AI CHAT ── */}
        {view === "chat" && (
          <div style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:20, display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
            {/* Header */}
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
              <div>
                <div style={{ fontWeight:700, color:GOLD, fontSize:15 }}>AI Assistant</div>
                <div style={{ fontSize:12, color:"#4b5563" }}>مدعوم بـ Claude AI · اسألني عن عملاءك</div>
              </div>
              {!apiKey && (
                <button onClick={()=>setShowModal(true)} style={{ marginRight:"auto", padding:"8px 16px", borderRadius:8, border:`1px solid ${GOLD_DARK}`, background:GOLD+"15", color:GOLD, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                  🔑 ربط API Key
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:14 }}>
              {chatMessages.length===0 && (
                <div style={{ textAlign:"center", marginTop:40 }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>✨</div>
                  <div style={{ color:"#6b7280", fontSize:15, marginBottom:24 }}>مرحباً! أنا مساعدك الذكي من Othmane Benhadjer</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                    {["من هم العملاء غير النشطين؟","كم عدد المرضى؟","من يحتاج متابعة؟","حلل بيانات العملاء"].map(q=>(
                      <button key={q} onClick={()=>setChatInput(q)} style={{
                        padding:"8px 16px", borderRadius:20, border:`1px solid ${BORDER}`,
                        background:BG_CARD2, cursor:"pointer", fontSize:13, fontFamily:"inherit", color:"#9ca3af",
                      }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-start" : "flex-end" }}>
                  <div style={{
                    maxWidth:"72%", padding:"12px 16px", lineHeight:1.7, fontSize:14, whiteSpace:"pre-wrap",
                    borderRadius: m.role==="user" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    background: m.role==="user" ? BG_CARD2 : `linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                    color: m.role==="user" ? "#d1d5db" : "#000",
                    border: m.role==="user" ? `1px solid ${BORDER}` : "none",
                  }}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <div style={{ padding:"12px 20px", borderRadius:"16px 4px 16px 16px", background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`, color:"#000" }}>⏳ جاري التفكير...</div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>

            {/* Input */}
            <div style={{ padding:"14px 20px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:10 }}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
                placeholder="اكتب سؤالك هنا... (Enter للإرسال)"
                style={{ ...inputStyle, flex:1 }} />
              <button onClick={sendMessage} disabled={loading} style={{
                padding:"12px 18px", borderRadius:12, border:"none",
                background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                color:"#000", fontSize:18, cursor:"pointer", opacity: loading ? 0.6 : 1,
              }}>➤</button>
            </div>
          </div>
        )}
      </main>

      {/* ── API Key Modal ── */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:32, width:420 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <OBLogo size={36} />
              <h3 style={{ margin:0, color:GOLD, fontSize:17 }}>إعداد Anthropic API Key</h3>
            </div>
            <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 20px", lineHeight:1.7 }}>
              احصل على مفتاحك من <strong style={{color:GOLD}}>console.anthropic.com</strong> ← API Keys ← Create Key
            </p>
            <input value={apiInput} onChange={e=>setApiInput(e.target.value)}
              placeholder="sk-ant-..." type="password"
              style={{ ...inputStyle, marginBottom:16 }} />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{ setApiKey(apiInput); setShowModal(false); }} style={{
                flex:1, padding:12, borderRadius:10, border:"none",
                background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                color:"#000", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
              }}>✅ حفظ وتفعيل</button>
              <button onClick={()=>setShowModal(false)} style={{
                flex:1, padding:12, borderRadius:10, border:`1px solid ${BORDER}`,
                background:"transparent", color:"#6b7280", fontSize:14, cursor:"pointer", fontFamily:"inherit",
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

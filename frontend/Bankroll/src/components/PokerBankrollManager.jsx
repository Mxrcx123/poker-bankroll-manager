import { useState, useEffect } from "react";
import AddDeposit from "./AddDeposit.jsx";
import RecordWithdrawal from "./RecordWithdrawl.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — später durch API-Calls ersetzen
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_BANKROLL = {
  current: 1340.0,
  totalDeposits: 1000.0,
  totalWithdrawals: 200.0,
  netProfit: 540.0,
};

const MOCK_STATS = {
  totalSessions: 47,
  winRate: 61.7,
  avgProfit: 11.49,
  bestSession: 320.0,
  worstSession: -85.0,
  totalHours: 138,
};

const MOCK_SESSIONS = [
  { id: 1, date: "2026-04-07", game_mode: "cashgame",   platform: "PokerStars", buy_in: 50,  cash_out: 118, profit: 68,   notes: "Gutes Spiel, Position gut genutzt" },
  { id: 2, date: "2026-04-05", game_mode: "tournament", platform: "GGPoker",    buy_in: 22,  fee: 2, rebuys: 0, winnings: 0,  profit: -24, notes: "Bad beat am Bubble" },
  { id: 3, date: "2026-04-03", game_mode: "cashgame",   platform: "PokerStars", buy_in: 100, cash_out: 240, profit: 140, notes: "" },
  { id: 4, date: "2026-04-01", game_mode: "tournament", platform: "888poker",   buy_in: 10,  fee: 1, rebuys: 1, winnings: 85, profit: 63,  notes: "3. Platz" },
  { id: 5, date: "2026-03-29", game_mode: "cashgame",   platform: "PokerStars", buy_in: 50,  cash_out: 35, profit: -15, notes: "" },
  { id: 6, date: "2026-03-27", game_mode: "cashgame",   platform: "GGPoker",    buy_in: 100, cash_out: 185, profit: 85,  notes: "Nits geblufft" },
];

const MOCK_BANKROLL_EVENTS = [
  { id: 1, type: "deposit",    amount: 500, date: "2026-01-10", notes: "" },
  { id: 2, type: "deposit",    amount: 500, date: "2026-02-15", notes: "" },
  { id: 3, type: "withdrawal", amount: 200, date: "2026-03-01", notes: "" },
];

const MOCK_CHART_DATA = [
  { label: "Jan", value: 500 },
  { label: "Feb", value: 680 },
  { label: "Mär", value: 920 },
  { label: "Apr", value: 1340 },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE HELPERS — von EinzahlungView und HistoryView genutzt
// ─────────────────────────────────────────────────────────────────────────────

function loadEvents() {
  try {
    const raw = localStorage.getItem("bankroll_events");
    return raw ? JSON.parse(raw) : MOCK_BANKROLL_EVENTS;
  } catch {
    return MOCK_BANKROLL_EVENTS;
  }
}

function saveEvents(events) {
  localStorage.setItem("bankroll_events", JSON.stringify(events));
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Bankroll: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5S13.38 12 12 12s-2.5 1.12-2.5 2.5S10.62 17 12 17s2.5-1.12 2.5-2.5" />
    </svg>
  ),
  Sessions: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 8v4l3 3" /><path d="M3.05 11a9 9 0 1 0 .5-3M3 4v4h4" />
    </svg>
  ),
  Stats: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 18l5-6 4 3 5-8 4 4" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  TrendUp: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 17l5-5 4 4 9-9M17 7h4v4" />
    </svg>
  ),
  TrendDown: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 7l5 5 4-4 9 9M17 17h4v-4" />
    </svg>
  ),
  Chips: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  Export: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// FARBEN & STYLES
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#0d1520",
  surface: "#111c2d",
  card: "#162035",
  cardHover: "#1a2740",
  border: "#1e3050",
  borderLight: "#243860",
  green: "#22c55e",
  greenDim: "#16a34a",
  greenMuted: "#14532d",
  greenText: "#4ade80",
  gold: "#f59e0b",
  goldDim: "#d97706",
  goldMuted: "#451a03",
  goldText: "#fbbf24",
  red: "#ef4444",
  redMuted: "#450a0a",
  redText: "#f87171",
  text: "#f0f6ff",
  textMuted: "#7a9cc4",
  textDim: "#3d5a8a",
  white: "#ffffff",
};

const css = {
  app: {
    display: "flex", height: "100vh", width: "100vw",
    overflow: "hidden",
    background: COLORS.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: COLORS.text,
    position: "fixed", top: 0, left: 0,
  },
  sidebar: {
    width: "220px", minWidth: "220px",
    background: COLORS.surface,
    borderRight: `1px solid ${COLORS.border}`,
    display: "flex", flexDirection: "column",
  },
  logo: {
    padding: "24px 20px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex", alignItems: "center", gap: "10px",
  },
  logoIcon: {
    width: "32px", height: "32px",
    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDim})`,
    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: "15px", fontWeight: "700", letterSpacing: "0.02em", color: COLORS.text, lineHeight: 1.2 },
  logoSub:  { fontSize: "10px", color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" },
  nav: { padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 12px", borderRadius: "8px", cursor: "pointer",
    fontSize: "14px", fontWeight: active ? "600" : "400",
    color: active ? COLORS.greenText : COLORS.textMuted,
    background: active ? `${COLORS.green}18` : "transparent",
    border: active ? `1px solid ${COLORS.green}30` : "1px solid transparent",
    outline: "none", transition: "all 0.15s",
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    padding: "18px 28px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: COLORS.surface,
  },
  pageTitle:    { fontSize: "18px", fontWeight: "700", color: COLORS.text, letterSpacing: "-0.01em" },
  pageSubtitle: { fontSize: "12px", color: COLORS.textMuted, marginTop: "2px" },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 16px", borderRadius: "8px",
    background: COLORS.green, color: "#0d1520",
    fontSize: "13px", fontWeight: "700", border: "none", cursor: "pointer",
  },
  btnSecondary: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", borderRadius: "8px",
    background: "transparent", color: COLORS.textMuted,
    fontSize: "13px", fontWeight: "500",
    border: `1px solid ${COLORS.border}`, cursor: "pointer",
  },
  content: { flex: 1, padding: "24px 28px", overflowY: "auto" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" },
  grid3: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", marginBottom: "20px" },
  card: {
    background: COLORS.card, border: `1px solid ${COLORS.border}`,
    borderRadius: "12px", padding: "20px",
  },
  cardLabel: {
    fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
    textTransform: "uppercase", color: COLORS.textDim, marginBottom: "8px",
  },
  statCard: {
    background: COLORS.card, border: `1px solid ${COLORS.border}`,
    borderRadius: "10px", padding: "14px 16px",
  },
  tag: (color) => ({
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase",
    background: color === "green" ? COLORS.greenMuted : color === "gold" ? COLORS.goldMuted : COLORS.redMuted,
    color:      color === "green" ? COLORS.greenText  : color === "gold" ? COLORS.goldText  : COLORS.redText,
  }),
  profit: (val) => ({ fontSize: "14px", fontWeight: "700", color: val >= 0 ? COLORS.greenText : COLORS.redText }),
  sectionTitle: {
    fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em",
    textTransform: "uppercase", color: COLORS.textMuted,
    marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "80px 90px 110px 1fr 80px",
    gap: "8px", padding: "10px 4px",
    borderBottom: `1px solid ${COLORS.border}`,
    alignItems: "center", fontSize: "13px",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART KOMPONENTEN
// ─────────────────────────────────────────────────────────────────────────────

function SparkChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const h = 60, w = 200;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / range) * h * 0.85 - 4}`);
  return (
    <svg width="100%" height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.green} stopOpacity="0.25" />
          <stop offset="100%" stopColor={COLORS.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts.join(" ")} fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function BankrollChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  const h = 120, w = 400;
  const pts = data.map((d, i) => ({
    x: 30 + (i / (data.length - 1)) * (w - 40),
    y: 10 + (1 - d.value / (max * 1.1)) * (h - 20),
    ...d,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width="100%" height={h + 24} viewBox={`0 0 ${w} ${h + 24}`}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.green} stopOpacity="0.3" />
          <stop offset="100%" stopColor={COLORS.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`30,${h} ${line} ${pts[pts.length-1].x},${h}`} fill="url(#ag)" />
      <polyline points={line} fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS.green} stroke={COLORS.card} strokeWidth="2" />)}
      {pts.map((p, i) => <text key={i} x={p.x} y={h+18} textAnchor="middle" fontSize="11" fill={COLORS.textMuted} fontFamily="DM Sans,sans-serif">{p.label}</text>)}
      {pts.map((p, i) => <text key={i} x={p.x} y={p.y-8} textAnchor="middle" fontSize="10" fill={COLORS.greenText} fontFamily="DM Sans,sans-serif" fontWeight="600">€{p.value}</text>)}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView() {
  // Dashboard liest Balance direkt aus localStorage
  const events = loadEvents();
  const balance = events.reduce((s, e) => e.type === "deposit" ? s + e.amount : s - e.amount, 0);
  const profitPositive = balance >= 0;

  return (
    <div>
      {/* Bankroll Hero */}
      <div style={{ ...css.card, marginBottom: "20px", background: "linear-gradient(135deg, #162035 0%, #0f2318 100%)", border: `1px solid ${COLORS.green}30`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "200px", height: "200px", borderRadius: "50%", background: `${COLORS.green}08`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.greenText, opacity: 0.7, marginBottom: "8px" }}>Aktuelle Bankroll</div>
            <div style={{ fontSize: "48px", fontWeight: "800", letterSpacing: "-0.03em", color: COLORS.text, lineHeight: 1 }}>
              €{balance.toFixed(2)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={css.tag(profitPositive ? "green" : "red")}>{profitPositive ? "↑" : "↓"} Bankroll</span>
              <span style={{ fontSize: "12px", color: COLORS.textMuted }}>{events.length} Events gesamt</span>
            </div>
          </div>
          <div style={{ width: "200px" }}><SparkChart data={MOCK_CHART_DATA} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", marginTop: "20px", borderTop: `1px solid ${COLORS.green}20`, paddingTop: "16px" }}>
          {[
            { label: "Eingezahlt", value: `€${events.filter(e=>e.type==="deposit").reduce((s,e)=>s+e.amount,0).toFixed(0)}` },
            { label: "Ausgezahlt", value: `€${events.filter(e=>e.type==="withdrawal").reduce((s,e)=>s+e.amount,0).toFixed(0)}` },
            { label: "Sessions",   value: MOCK_STATS.totalSessions },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: i === 1 ? "center" : i === 2 ? "right" : "left" }}>
              <div style={{ fontSize: "11px", color: COLORS.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.text, marginTop: "2px" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={css.grid4}>
        {[
          { label: "Gewinnrate",       value: `${MOCK_STATS.winRate}%`,                          color: "green" },
          { label: "Ø Profit/Session", value: `€${MOCK_STATS.avgProfit.toFixed(2)}`,             color: MOCK_STATS.avgProfit >= 0 ? "green" : "red" },
          { label: "Beste Session",    value: `+€${MOCK_STATS.bestSession}`,                     color: "gold" },
          { label: "Schlechteste",     value: `€${MOCK_STATS.worstSession}`,                     color: "red" },
        ].map((item, i) => (
          <div key={i} style={css.statCard}>
            <div style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: item.color === "green" ? COLORS.greenText : item.color === "gold" ? COLORS.goldText : COLORS.redText }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + letzte Events */}
      <div style={css.grid3}>
        <div style={css.card}>
          <div style={css.sectionTitle}><span>Bankroll-Entwicklung</span><span style={{ fontSize: "11px", color: COLORS.textDim, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>2026</span></div>
          <BankrollChart data={MOCK_CHART_DATA} />
        </div>
        <div style={css.card}>
          <div style={css.sectionTitle}>Letzte Events</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {events.slice(0, 4).map((ev) => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: COLORS.surface, borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
                <span style={css.tag(ev.type === "deposit" ? "green" : "red")}>{ev.type === "deposit" ? "Einzahlung" : "Auszahlung"}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: ev.type === "deposit" ? COLORS.greenText : COLORS.redText }}>
                    {ev.type === "deposit" ? "+" : "-"}€{ev.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "11px", color: COLORS.textDim }}>{ev.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Letzte Sessions */}
      <div style={css.card}>
        <div style={css.sectionTitle}><span>Letzte Sessions</span></div>
        <div style={{ ...css.tableRow, borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: "6px" }}>
          {["Datum","Modus","Plattform","Notiz","Profit"].map((h, i) => (
            <div key={i} style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, fontWeight: "600" }}>{h}</div>
          ))}
        </div>
        {MOCK_SESSIONS.slice(0, 5).map((s) => (
          <div key={s.id} style={css.tableRow}>
            <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{s.date.slice(5)}</div>
            <div><span style={css.tag(s.game_mode === "cashgame" ? "green" : "gold")}>{s.game_mode === "cashgame" ? "Cash" : "Turnier"}</span></div>
            <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{s.platform}</div>
            <div style={{ fontSize: "12px", color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", ...css.profit(s.profit) }}>
              {s.profit >= 0 ? <Icon.TrendUp /> : <Icon.TrendDown />}
              {s.profit >= 0 ? "+" : ""}€{s.profit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSAKTIONS VIEW — rendert AddDeposit und RecordWithdrawal, schreibt in localStorage
// ─────────────────────────────────────────────────────────────────────────────

function TransaktionenView({ onNavigate }) {
  function handle_deposit_success(new_event) {
    const updated = [new_event, ...loadEvents()];
    saveEvents(updated);
    setTimeout(() => onNavigate("history"), 1600);
  }

  function handle_withdrawal_success(new_event) {
    const updated = [new_event, ...loadEvents()];
    saveEvents(updated);
    setTimeout(() => onNavigate("history"), 1600);
  }

  const events = loadEvents();
  const current_bankroll = events.reduce(
    (s, e) => e.type === "deposit" ? s + e.amount : s - e.amount, 0
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px" }}>
      <AddDeposit onSuccess={handle_deposit_success} />
      <RecordWithdrawal
        currentBankroll={current_bankroll}
        onSuccess={handle_withdrawal_success}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY VIEW — liest aus localStorage, zeigt Balance + alle Events
// ─────────────────────────────────────────────────────────────────────────────

function HistoryView() {
  const [events, setEvents] = useState(() => loadEvents());

  // Beim Mounten immer frisch aus localStorage laden
  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const totalDeposits    = events.filter(e => e.type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const balance          = totalDeposits - totalWithdrawals;

  return (
    <div>
      {/* Balance-Karten */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Aktuelle Bankroll", value: `€${balance.toFixed(2)}`,           color: COLORS.text      },
          { label: "Gesamt eingezahlt", value: `+€${totalDeposits.toFixed(2)}`,    color: COLORS.greenText },
          { label: "Gesamt ausgezahlt", value: `-€${totalWithdrawals.toFixed(2)}`, color: COLORS.redText   },
        ].map((item, i) => (
          <div key={i} style={css.statCard}>
            <div style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Event-Liste */}
      <div style={css.card}>
        <div style={css.sectionTitle}>
          <span>Alle Einträge</span>
          <span style={{ fontSize: "12px", color: COLORS.textDim, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>
            {events.length} Einträge
          </span>
        </div>

        {events.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: COLORS.textDim, fontSize: "14px" }}>
            Noch keine Einträge. Mache deine erste Einzahlung!
          </div>
        )}

        {events.map((ev) => (
          <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 8px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                background: ev.type === "deposit" ? COLORS.greenMuted : COLORS.redMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ev.type === "deposit" ? COLORS.greenText : COLORS.redText, fontSize: "16px",
              }}>
                {ev.type === "deposit" ? "↑" : "↓"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: COLORS.text }}>
                  {ev.type === "deposit" ? "Einzahlung" : "Auszahlung"}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{ev.date}</div>
                {ev.notes && (
                  <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "2px" }}>{ev.notes}</div>
                )}
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: ev.type === "deposit" ? COLORS.greenText : COLORS.redText }}>
              {ev.type === "deposit" ? "+" : "-"}€{ev.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsView() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div style={css.card}>
          <div style={css.cardLabel}>Cashgame Session</div>
          {["Plattform", "Buy-in (€)", "Cash-out (€)"].map((ph, i) => (
            <input key={i} placeholder={ph} style={{ width: "100%", padding: "10px 12px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.text, fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }} />
          ))}
          <textarea placeholder="Notizen..." rows={2} style={{ width: "100%", padding: "10px 12px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.text, fontSize: "14px", marginBottom: "12px", resize: "none", boxSizing: "border-box" }} />
          <button style={{ ...css.btnPrimary, width: "100%", justifyContent: "center" }}>
            <Icon.Plus /> Session speichern
          </button>
        </div>
        <div style={css.card}>
          <div style={css.cardLabel}>Turnier Session</div>
          {["Plattform", "Buy-in (€)", "Fee (€)", "Rebuys gesamt (€)", "Gewinn (€)"].map((ph, i) => (
            <input key={i} placeholder={ph} style={{ width: "100%", padding: "10px 12px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.text, fontSize: "14px", marginBottom: "8px", boxSizing: "border-box" }} />
          ))}
          <button style={{ ...css.btnPrimary, width: "100%", justifyContent: "center", marginTop: "4px" }}>
            <Icon.Plus /> Turnier speichern
          </button>
        </div>
      </div>
      <div style={css.card}>
        <div style={css.sectionTitle}><span>Alle Sessions</span></div>
        <div style={{ ...css.tableRow, borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: "6px" }}>
          {["Datum","Modus","Plattform","Notiz","Profit"].map((h, i) => (
            <div key={i} style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, fontWeight: "600" }}>{h}</div>
          ))}
        </div>
        {MOCK_SESSIONS.map((s) => (
          <div key={s.id} style={css.tableRow}>
            <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{s.date}</div>
            <div><span style={css.tag(s.game_mode === "cashgame" ? "green" : "gold")}>{s.game_mode === "cashgame" ? "Cash" : "Turnier"}</span></div>
            <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{s.platform}</div>
            <div style={{ fontSize: "12px", color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", ...css.profit(s.profit) }}>
              {s.profit >= 0 ? <Icon.TrendUp /> : <Icon.TrendDown />}
              {s.profit >= 0 ? "+" : ""}€{s.profit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsView() {
  const events = loadEvents();
  const totalDeposits = events.filter(e => e.type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const balance = totalDeposits - totalWithdrawals;

  return (
    <div>
      <div style={css.grid4}>
        {[
          { label: "Gesamt Bankroll",  value: `€${balance.toFixed(2)}`,               color: "green" },
          { label: "Sessions gesamt",  value: MOCK_STATS.totalSessions,                color: "text"  },
          { label: "Stunden gespielt", value: MOCK_STATS.totalHours,                   color: "text"  },
          { label: "Gewinnrate",       value: `${MOCK_STATS.winRate}%`,                color: "gold"  },
        ].map((item, i) => (
          <div key={i} style={css.statCard}>
            <div style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: item.color === "green" ? COLORS.greenText : item.color === "gold" ? COLORS.goldText : COLORS.text }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <div style={css.card}>
        <div style={css.sectionTitle}>Bankroll-Entwicklung 2026</div>
        <BankrollChart data={MOCK_CHART_DATA} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
        <div style={css.card}>
          <div style={css.sectionTitle}>Sessions nach Modus</div>
          {[
            { label: "Cashgame", count: 34, pct: 72, color: COLORS.green },
            { label: "Turnier",  count: 13, pct: 28, color: COLORS.gold  },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px", color: COLORS.textMuted }}>
                <span>{item.label}</span><span style={{ color: COLORS.text, fontWeight: "600" }}>{item.count}</span>
              </div>
              <div style={{ height: "6px", background: COLORS.surface, borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={css.card}>
          <div style={css.sectionTitle}>Sessions pro Monat</div>
          {[
            { label: "Januar",       count: 9  },
            { label: "Februar",      count: 14 },
            { label: "März",         count: 16 },
            { label: "April (lfd.)", count: 8  },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "13px", color: COLORS.textMuted }}>
                <span>{item.label}</span><span style={{ color: COLORS.text, fontWeight: "600" }}>{item.count}</span>
              </div>
              <div style={{ height: "5px", background: COLORS.surface, borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${(item.count / 16) * 100}%`, background: COLORS.green, opacity: 0.7, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

const VIEWS = [
  { id: "dashboard",     label: "Dashboard",    Icon: Icon.Dashboard },
  { id: "transaktionen", label: "Transaktionen",Icon: Icon.Bankroll  },
  { id: "history",       label: "History",      Icon: Icon.History   },
  { id: "sessions",      label: "Sessions",     Icon: Icon.Sessions  },
  { id: "stats",         label: "Statistiken",  Icon: Icon.Stats     },
];

const VIEW_META = {
  dashboard:     { title: "Dashboard",     sub: "Übersicht deiner Bankroll & Performance"  },
  transaktionen: { title: "Transaktionen", sub: "Einzahlungen & Auszahlungen erfassen"     },
  history:       { title: "History",       sub: "Alle Einzahlungen & Auszahlungen"         },
  sessions:      { title: "Sessions",      sub: "Cashgame & Turniere erfassen"             },
  stats:         { title: "Statistiken",   sub: "Analyse deiner Poker-Performance"         },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function PokerBankrollManager() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
  switch (activeView) {
    case "dashboard":     return <DashboardView />;
    case "transaktionen": return <TransaktionenView onNavigate={setActiveView} />;
    case "history":       return <HistoryView />;
    case "sessions":      return <SessionsView />;
    case "stats":         return <StatsView />;
    default:              return <DashboardView />;
  }
  };

  const meta = VIEW_META[activeView];

  return (
    <div style={css.app}>
      {/* Sidebar */}
      <div style={css.sidebar}>
        <div style={css.logo}>
          <div style={css.logoIcon}><Icon.Chips /></div>
          <div>
            <div style={css.logoText}>Bankroll</div>
            <div style={css.logoSub}>Poker Manager</div>
          </div>
        </div>
        <nav style={css.nav}>
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => setActiveView(v.id)} style={css.navItem(activeView === v.id)}>
              <v.Icon />
              {v.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: COLORS.card }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: COLORS.greenMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: COLORS.greenText }}>
              PL
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: COLORS.text }}>Player</div>
              <div style={{ fontSize: "10px", color: COLORS.textDim }}>poker@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={css.main}>
        <div style={css.topbar}>
          <div>
            <div style={css.pageTitle}>{meta.title}</div>
            <div style={css.pageSubtitle}>{meta.sub}</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {activeView === "sessions" && (
              <button style={css.btnPrimary}><Icon.Plus /> Neue Session</button>
            )}
            {activeView === "stats" && (
              <button style={css.btnSecondary}><Icon.Export /> Report exportieren</button>
            )}
          </div>
        </div>
        <div style={css.content}>{renderView()}</div>
      </div>
    </div>
  );
}

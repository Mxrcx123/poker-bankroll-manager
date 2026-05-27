import { useState, useEffect, useCallback } from "react";
import AddDeposit from "./AddDeposit.jsx";
import RecordWithdrawal from "./RecordWithdrawl.jsx";
import CreateSession from "./CreateSession.jsx";
import AuthScreen from "./AuthScreen.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG  (USER_ID kommt jetzt vom eingeloggten User — keine Konstante mehr)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

const api = {
  // ── Bankroll Events ────────────────────────────────────────────────────────
  getBankrollEvents: (userId) =>
    apiFetch(`/bankroll-event/user/${userId}`),

  createDeposit: (userId, amount, notes = "") =>
    apiFetch(`/deposits/`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, amount, notes }),
      headers: { "Content-Type": "application/json" },
    }),

  createWithdrawal: (amount, notes = "") =>
    apiFetch(`/withdrawals/`, {
      method: "POST",
      body: JSON.stringify({ amount, notes }),
    }),

  // ── Sessions ───────────────────────────────────────────────────────────────
  getSessions: (userId) =>
    apiFetch(`/session/user/${userId}`),

  createSession: (userId, game_mode_id, platform_id, notes) => {
    const params = new URLSearchParams();
    if (platform_id != null) params.append("platform_id", platform_id);
    if (notes)               params.append("notes",       notes);
    const qs = params.toString();
    return apiFetch(`/session/${userId}/${game_mode_id}${qs ? `?${qs}` : ""}`, {
      method: "POST",
    });
  },

  deleteSession: (session_id) =>
    apiFetch(`/session/delete/${session_id}`, { method: "DELETE" }),

  // ── Cash Sessions ──────────────────────────────────────────────────────────
  getCashSession: (session_id) =>
    apiFetch(`/cash-session/session/${session_id}`),

  createCashSession: (session_id, buy_in, cash_out) => {
    const qs = cash_out != null ? `?cash_out=${cash_out}` : "";
    return apiFetch(`/cash-session/${session_id}/${buy_in}${qs}`, {
      method: "POST",
    });
  },

  // ── Tournaments ────────────────────────────────────────────────────────────
  getTournament: (session_id) =>
    apiFetch(`/tournament/session/${session_id}`),

  createTournament: (session_id, buy_in, opts = {}) => {
    const params = new URLSearchParams();
    if (opts.fee             != null) params.append("fee",             opts.fee);
    if (opts.rebuys          != null) params.append("rebuys",          opts.rebuys);
    if (opts.rebuy_cost      != null) params.append("rebuy_cost",      opts.rebuy_cost);
    if (opts.add_ons         != null) params.append("add_ons",         opts.add_ons);
    if (opts.add_on_cost     != null) params.append("add_on_cost",     opts.add_on_cost);
    if (opts.winnings        != null) params.append("winnings",        opts.winnings);
    if (opts.finish_position != null) params.append("finish_position", opts.finish_position);
    const qs = params.toString();
    return apiFetch(`/tournament/${session_id}/${buy_in}${qs ? `?${qs}` : ""}`, {
      method: "POST",
    });
  },

  // ── Lookup-Daten ───────────────────────────────────────────────────────────
  getPlatforms:  ()       => apiFetch(`/platform/all`),
  getGameModes:  ()       => apiFetch(`/game-mode/all`),
  getSnapshots:  (userId) => apiFetch(`/bankroll-snapshot/user/${userId}`),
};

const GAME_MODE_ID = { cashgame: 1, tournament: 2 };

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS  (alle User-spezifischen Hooks nehmen jetzt userId als Parameter)
// ─────────────────────────────────────────────────────────────────────────────

function useBankrollEvents(userId) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBankrollEvents(userId);
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  return { events, loading, error, reload: load };
}

function useSessions(userId) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSessions(userId);
      const raw  = data.sessions ?? [];

      const enriched = await Promise.all(
        raw.map(async (s) => {
          try {
            if (s.game_mode_id === GAME_MODE_ID.cashgame) {
              const cs     = await api.getCashSession(s.id);
              const profit = (cs.cash_out ?? cs.buy_in) - cs.buy_in;
              return { ...s, game_mode: "cashgame", buy_in: cs.buy_in, cash_out: cs.cash_out, profit };
            } else {
              const t         = await api.getTournament(s.id);
              const totalCost =
                (t.buy_in  ?? 0) +
                (t.fee     ?? 0) +
                (t.rebuys  ?? 0) * (t.rebuy_cost  ?? 0) +
                (t.add_ons ?? 0) * (t.add_on_cost ?? 0);
              const profit = (t.winnings ?? 0) - totalCost;
              return { ...s, game_mode: "tournament", buy_in: t.buy_in, fee: t.fee, winnings: t.winnings, profit };
            }
          } catch {
            return { ...s, profit: 0 };
          }
        })
      );

      setSessions(enriched);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  return { sessions, loading, error, reload: load };
}

function useSnapshots(userId) {
  const [snapshots, setSnapshots] = useState([]);
  useEffect(() => {
    api.getSnapshots(userId)
      .then(data => setSnapshots(data.snapshots ?? []))
      .catch(() => setSnapshots([]));
  }, [userId]);
  return snapshots;
}

function usePlatforms() {
  const [platforms, setPlatforms] = useState([]);
  useEffect(() => {
    api.getPlatforms()
      .then(data => setPlatforms(data.platforms ?? []))
      .catch(() => setPlatforms([]));
  }, []);
  return platforms;
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
  Trash: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// FARBEN & STYLES
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  bg:          "#0d1520",
  surface:     "#111c2d",
  card:        "#162035",
  cardHover:   "#1a2740",
  border:      "#1e3050",
  borderLight: "#243860",
  green:       "#22c55e",
  greenDim:    "#16a34a",
  greenMuted:  "#14532d",
  greenText:   "#4ade80",
  gold:        "#f59e0b",
  goldDim:     "#d97706",
  goldMuted:   "#451a03",
  goldText:    "#fbbf24",
  red:         "#ef4444",
  redMuted:    "#450a0a",
  redText:     "#f87171",
  text:        "#f0f6ff",
  textMuted:   "#7a9cc4",
  textDim:     "#3d5a8a",
  white:       "#ffffff",
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
    color:      active ? COLORS.greenText : COLORS.textMuted,
    background: active ? `${COLORS.green}18` : "transparent",
    border:     active ? `1px solid ${COLORS.green}30` : "1px solid transparent",
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
  content:  { flex: 1, padding: "24px 28px", overflowY: "auto" },
  grid4:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" },
  grid3:    { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", marginBottom: "20px" },
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
    display: "grid", gridTemplateColumns: "80px 90px 110px 1fr 80px 36px",
    gap: "8px", padding: "10px 4px",
    borderBottom: `1px solid ${COLORS.border}`,
    alignItems: "center", fontSize: "13px",
  },
  loadingText: {
    textAlign: "center", padding: "40px",
    color: COLORS.textDim, fontSize: "14px",
  },
  errorText: {
    textAlign: "center", padding: "20px",
    color: COLORS.redText, fontSize: "13px",
    background: COLORS.redMuted, borderRadius: "8px", marginBottom: "16px",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART KOMPONENTEN
// ─────────────────────────────────────────────────────────────────────────────

function SparkChart({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const h = 60, w = 200;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / range) * h * 0.85 - 4}`);
  return (
    <svg width="100%" height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={COLORS.green} stopOpacity="0.25" />
          <stop offset="100%" stopColor={COLORS.green} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts.join(" ")} fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function BankrollChart({ data }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign: "center", padding: "40px", color: COLORS.textDim, fontSize: "13px" }}>
      Noch nicht genug Daten für eine Grafik.
    </div>
  );
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
          <stop offset="0%"   stopColor={COLORS.green} stopOpacity="0.3" />
          <stop offset="100%" stopColor={COLORS.green} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon points={`30,${h} ${line} ${pts[pts.length-1].x},${h}`} fill="url(#ag)" />
      <polyline points={line} fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS.green} stroke={COLORS.card} strokeWidth="2" />)}
      {pts.map((p, i) => <text key={i} x={p.x} y={h + 18} textAnchor="middle" fontSize="11" fill={COLORS.textMuted} fontFamily="DM Sans,sans-serif">{p.label}</text>)}
      {pts.map((p, i) => <text key={i} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fill={COLORS.greenText} fontFamily="DM Sans,sans-serif" fontWeight="600">€{p.value}</text>)}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS  (alle erhalten userId als Prop)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView({ userId }) {
  const { events, loading, error } = useBankrollEvents(userId);
  const { sessions, loading: sessLoading } = useSessions(userId);
  const snapshots = useSnapshots(userId);

  const totalDeposits    = events.filter(e => e.event_type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.event_type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const balance          = totalDeposits - totalWithdrawals;

  const chartData = snapshots.map(s => ({
    label: new Date(s.recorded_at).toLocaleDateString("de-AT", { month: "short" }),
    value: s.amount,
  }));

  const profits      = sessions.map(s => s.profit).filter(p => p !== undefined);
  const winRate      = profits.length > 0 ? ((profits.filter(p => p > 0).length / profits.length) * 100).toFixed(1) : "—";
  const avgProfit    = profits.length > 0 ? (profits.reduce((a, b) => a + b, 0) / profits.length).toFixed(2) : 0;
  const bestSession  = profits.length > 0 ? Math.max(...profits) : 0;
  const worstSession = profits.length > 0 ? Math.min(...profits) : 0;

  if (loading) return <div style={css.loadingText}>Lade Bankroll-Daten…</div>;
  if (error)   return <div style={css.errorText}>Fehler: {error}</div>;

  return (
    <div>
      <div style={{ ...css.card, marginBottom: "20px", background: "linear-gradient(135deg, #162035 0%, #0f2318 100%)", border: `1px solid ${COLORS.green}30`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "200px", height: "200px", borderRadius: "50%", background: `${COLORS.green}08`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.greenText, opacity: 0.7, marginBottom: "8px" }}>Aktuelle Bankroll</div>
            <div style={{ fontSize: "48px", fontWeight: "800", letterSpacing: "-0.03em", color: COLORS.text, lineHeight: 1 }}>
              €{balance.toFixed(2)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={css.tag(balance >= 0 ? "green" : "red")}>{balance >= 0 ? "↑" : "↓"} Bankroll</span>
              <span style={{ fontSize: "12px", color: COLORS.textMuted }}>{events.length} Events gesamt</span>
            </div>
          </div>
          <div style={{ width: "200px" }}><SparkChart data={chartData} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", marginTop: "20px", borderTop: `1px solid ${COLORS.green}20`, paddingTop: "16px" }}>
          {[
            { label: "Eingezahlt", value: `€${totalDeposits.toFixed(0)}`    },
            { label: "Ausgezahlt", value: `€${totalWithdrawals.toFixed(0)}` },
            { label: "Sessions",   value: sessions.length                   },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: i === 1 ? "center" : i === 2 ? "right" : "left" }}>
              <div style={{ fontSize: "11px", color: COLORS.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.text, marginTop: "2px" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={css.grid4}>
        {[
          { label: "Gewinnrate",       value: `${winRate}%`,                              color: "green" },
          { label: "Ø Profit/Session", value: `€${avgProfit}`,                            color: Number(avgProfit) >= 0 ? "green" : "red" },
          { label: "Beste Session",    value: bestSession > 0 ? `+€${bestSession}` : "—", color: "gold" },
          { label: "Schlechteste",     value: worstSession < 0 ? `€${worstSession}` : "—", color: "red" },
        ].map((item, i) => (
          <div key={i} style={css.statCard}>
            <div style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: item.color === "green" ? COLORS.greenText : item.color === "gold" ? COLORS.goldText : COLORS.redText }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={css.grid3}>
        <div style={css.card}>
          <div style={css.sectionTitle}><span>Bankroll-Entwicklung</span><span style={{ fontSize: "11px", color: COLORS.textDim, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>2026</span></div>
          <BankrollChart data={chartData} />
        </div>
        <div style={css.card}>
          <div style={css.sectionTitle}>Letzte Events</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {events.slice(0, 4).map((ev) => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: COLORS.surface, borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
                <span style={css.tag(ev.event_type === "deposit" ? "green" : "red")}>{ev.event_type === "deposit" ? "Einzahlung" : "Auszahlung"}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: ev.event_type === "deposit" ? COLORS.greenText : COLORS.redText }}>
                    {ev.event_type === "deposit" ? "+" : "-"}€{ev.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "11px", color: COLORS.textDim }}>
                    {ev.created_at ? new Date(ev.created_at).toLocaleDateString("de-AT") : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={css.card}>
        <div style={css.sectionTitle}><span>Letzte Sessions</span></div>
        {sessLoading ? (
          <div style={css.loadingText}>Lade Sessions…</div>
        ) : (
          <>
            <div style={{ ...css.tableRow, borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: "6px" }}>
              {["Datum","Modus","Plattform","Notiz","Profit"].map((h, i) => (
                <div key={i} style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, fontWeight: "600" }}>{h}</div>
              ))}
            </div>
            {sessions.slice(0, 5).map((s) => (
              <div key={s.id} style={css.tableRow}>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {s.started_at ? new Date(s.started_at).toLocaleDateString("de-AT").slice(0, 5) : "—"}
                </div>
                <div><span style={css.tag(s.game_mode === "cashgame" ? "green" : "gold")}>{s.game_mode === "cashgame" ? "Cash" : "Turnier"}</span></div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{s.platform_id ?? "—"}</div>
                <div style={{ fontSize: "12px", color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", ...css.profit(s.profit) }}>
                  {s.profit >= 0 ? <Icon.TrendUp /> : <Icon.TrendDown />}
                  {s.profit >= 0 ? "+" : ""}€{s.profit}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSAKTIONEN VIEW
// ─────────────────────────────────────────────────────────────────────────────

function TransaktionenView({ userId, onNavigate }) {
  const { events, reload } = useBankrollEvents(userId);

  const totalDeposits    = events.filter(e => e.event_type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.event_type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const currentBankroll  = totalDeposits - totalWithdrawals;

  async function handle_deposit_success(formData) {
    await api.createDeposit(userId, formData.amount, formData.notes ?? "");
    await reload();
    setTimeout(() => onNavigate("history"), 1600);
  }

  async function handle_withdrawal_success(formData) {
    await api.createWithdrawal(formData.amount, formData.notes ?? "");
    await reload();
    setTimeout(() => onNavigate("history"), 1600);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px" }}>
      {/* userId wird jetzt korrekt weitergegeben */}
      <AddDeposit userId={userId} onSuccess={handle_deposit_success} />
      <RecordWithdrawal
        currentBankroll={currentBankroll}
        onSuccess={handle_withdrawal_success}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function HistoryView({ userId }) {
  const { events, loading, error } = useBankrollEvents(userId);

  const totalDeposits    = events.filter(e => e.event_type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.event_type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const balance          = totalDeposits - totalWithdrawals;

  if (loading) return <div style={css.loadingText}>Lade Transaktionshistorie…</div>;

  return (
    <div>
      {error && <div style={css.errorText}>Fehler beim Laden: {error}</div>}

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
                background: ev.event_type === "deposit" ? COLORS.greenMuted : COLORS.redMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ev.event_type === "deposit" ? COLORS.greenText : COLORS.redText, fontSize: "16px",
              }}>
                {ev.event_type === "deposit" ? "↑" : "↓"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: COLORS.text }}>
                  {ev.event_type === "deposit" ? "Einzahlung" : "Auszahlung"}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {ev.created_at ? new Date(ev.created_at).toLocaleDateString("de-AT") : ""}
                </div>
                {ev.notes && (
                  <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "2px" }}>{ev.notes}</div>
                )}
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: ev.event_type === "deposit" ? COLORS.greenText : COLORS.redText }}>
              {ev.event_type === "deposit" ? "+" : "-"}€{ev.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmModal({ session, onConfirm, onCancel }) {
  if (!session) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "28px 32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.text, marginBottom: "8px" }}>Session löschen?</div>
        <div style={{ fontSize: "13px", color: COLORS.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>
          Session vom <strong style={{ color: COLORS.text }}>
            {session.started_at ? new Date(session.started_at).toLocaleDateString("de-AT") : "—"}
          </strong>{" "}
          ({session.game_mode === "cashgame" ? "Cash" : "Turnier"},{" "}
          <span style={{ color: session.profit >= 0 ? COLORS.greenText : COLORS.redText, fontWeight: "700" }}>
            {session.profit >= 0 ? "+" : ""}€{session.profit}
          </span>
          ) wird unwiderruflich entfernt.
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ ...css.btnSecondary }}>Abbrechen</button>
          <button onClick={() => onConfirm(session.id)} style={{ ...css.btnPrimary, background: COLORS.red, color: COLORS.white }}>
            <Icon.Trash /> Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────

function SessionsView({ userId }) {
  const { sessions, loading, error, reload } = useSessions(userId);
  const platforms = usePlatforms();
  const [showCreateForm,  setShowCreateForm]  = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const handleAddSession = async (formData) => {
    const game_mode_id = GAME_MODE_ID[formData.game_mode] ?? 1;

    const session = await api.createSession(
      userId,
      game_mode_id,
      formData.platform_id ?? null,
      formData.notes ?? null,
    );
    if (!session.id) {
      throw new Error(session.error ?? "Session konnte nicht erstellt werden.");
    }

    if (formData.game_mode === "cashgame") {
      await api.createCashSession(session.id, formData.buy_in, formData.cash_out);
    } else {
      const rebuys_total = formData.rebuys ?? 0;
      const addons_total = formData.addons ?? 0;
      await api.createTournament(session.id, formData.buy_in, {
        fee:         formData.fee    ?? null,
        rebuys:      rebuys_total > 0 ? 1 : 0,
        rebuy_cost:  rebuys_total > 0 ? rebuys_total : null,
        add_ons:     addons_total > 0 ? 1 : 0,
        add_on_cost: addons_total > 0 ? addons_total : null,
        winnings:    formData.winnings ?? 0,
      });
    }

    await reload();
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await api.deleteSession(id);
      await reload();
    } catch (e) {
      console.error("Löschen fehlgeschlagen:", e);
    } finally {
      setSessionToDelete(null);
    }
  };

  return (
    <div>
      <DeleteConfirmModal
        session={sessionToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSessionToDelete(null)}
      />

      <div style={{ marginBottom: "20px" }}>
        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)} style={{ ...css.btnPrimary, padding: "12px 20px" }}>
            <Icon.Plus /> Neue Session erfassen
          </button>
        ) : (
          <CreateSession
            platforms={platforms}
            onSuccess={handleAddSession}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </div>

      <div style={css.card}>
        <div style={css.sectionTitle}><span>Alle Sessions</span></div>
        {loading && <div style={css.loadingText}>Lade Sessions…</div>}
        {error   && <div style={css.errorText}>Fehler: {error}</div>}

        {!loading && !error && (
          <>
            <div style={{ ...css.tableRow, borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: "6px" }}>
              {["Datum","Modus","Plattform","Notiz","Profit",""].map((h, i) => (
                <div key={i} style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, fontWeight: "600" }}>{h}</div>
              ))}
            </div>
            {sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px", color: COLORS.textDim, fontSize: "14px" }}>
                Noch keine Sessions. Erstelle deine erste Session!
              </div>
            )}
            {sessions.map((s) => (
              <div key={s.id} style={css.tableRow}>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {s.started_at ? new Date(s.started_at).toLocaleDateString("de-AT") : "—"}
                </div>
                <div><span style={css.tag(s.game_mode === "cashgame" ? "green" : "gold")}>{s.game_mode === "cashgame" ? "Cash" : "Turnier"}</span></div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {platforms.find(p => p.id === s.platform_id)?.name ?? s.platform_id ?? "—"}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", ...css.profit(s.profit) }}>
                  {s.profit >= 0 ? <Icon.TrendUp /> : <Icon.TrendDown />}
                  {s.profit >= 0 ? "+" : ""}€{s.profit}
                </div>
                <button
                  onClick={() => setSessionToDelete(s)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "4px", borderRadius: "6px" }}
                >
                  <Icon.Trash />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS VIEW
// ─────────────────────────────────────────────────────────────────────────────

function StatsView({ userId }) {
  const { events }   = useBankrollEvents(userId);
  const { sessions } = useSessions(userId);
  const snapshots    = useSnapshots(userId);

  const totalDeposits    = events.filter(e => e.event_type === "deposit").reduce((s, e) => s + e.amount, 0);
  const totalWithdrawals = events.filter(e => e.event_type === "withdrawal").reduce((s, e) => s + e.amount, 0);
  const balance          = totalDeposits - totalWithdrawals;

  const profits  = sessions.map(s => s.profit).filter(p => p !== undefined);
  const winRate  = profits.length > 0 ? ((profits.filter(p => p > 0).length / profits.length) * 100).toFixed(1) : "—";

  const chartData = snapshots.map(s => ({
    label: new Date(s.recorded_at).toLocaleDateString("de-AT", { month: "short" }),
    value: s.amount,
  }));

  const cashSessions  = sessions.filter(s => s.game_mode === "cashgame");
  const tournSessions = sessions.filter(s => s.game_mode === "tournament");
  const total         = sessions.length || 1;

  const monthCounts = {};
  sessions.forEach(s => {
    if (!s.started_at) return;
    const key = new Date(s.started_at).toLocaleDateString("de-AT", { month: "long", year: "numeric" });
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  const monthEntries = Object.entries(monthCounts).slice(-4);
  const maxMonth     = Math.max(...monthEntries.map(([, v]) => v), 1);

  return (
    <div>
      <div style={css.grid4}>
        {[
          { label: "Gesamt Bankroll",  value: `€${balance.toFixed(2)}`, color: "green" },
          { label: "Sessions gesamt",  value: sessions.length,           color: "text"  },
          { label: "Deposits",         value: events.filter(e => e.event_type === "deposit").length, color: "text" },
          { label: "Gewinnrate",       value: `${winRate}%`,             color: "gold"  },
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
        <BankrollChart data={chartData} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
        <div style={css.card}>
          <div style={css.sectionTitle}>Sessions nach Modus</div>
          {[
            { label: "Cashgame", count: cashSessions.length,  pct: Math.round((cashSessions.length  / total) * 100), color: COLORS.green },
            { label: "Turnier",  count: tournSessions.length, pct: Math.round((tournSessions.length / total) * 100), color: COLORS.gold  },
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
          {monthEntries.length === 0 ? (
            <div style={{ fontSize: "13px", color: COLORS.textDim }}>Noch keine Session-Daten.</div>
          ) : monthEntries.map(([label, count], i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "13px", color: COLORS.textMuted }}>
                <span>{label}</span><span style={{ color: COLORS.text, fontWeight: "600" }}>{count}</span>
              </div>
              <div style={{ height: "5px", background: COLORS.surface, borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${(count / maxMonth) * 100}%`, background: COLORS.green, opacity: 0.7, borderRadius: "3px" }} />
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
  { id: "dashboard",     label: "Dashboard",     Icon: Icon.Dashboard },
  { id: "transaktionen", label: "Transaktionen", Icon: Icon.Bankroll  },
  { id: "history",       label: "History",       Icon: Icon.History   },
  { id: "sessions",      label: "Sessions",      Icon: Icon.Sessions  },
  { id: "stats",         label: "Statistiken",   Icon: Icon.Stats     },
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
  const [user,       setUser]       = useState(null); // { id, username }

  // ── Nicht eingeloggt → AuthScreen anzeigen ────────────────────────────────
  if (!user) {
    return <AuthScreen onAuth={(u) => setUser(u)} />;
  }

  const meta = VIEW_META[activeView];

  const renderView = () => {
    switch (activeView) {
      case "dashboard":     return <DashboardView     userId={user.id} />;
      case "transaktionen": return <TransaktionenView userId={user.id} onNavigate={setActiveView} />;
      case "history":       return <HistoryView       userId={user.id} />;
      case "sessions":      return <SessionsView      userId={user.id} />;
      case "stats":         return <StatsView         userId={user.id} />;
      default:              return <DashboardView     userId={user.id} />;
    }
  };

  return (
    <div style={css.app}>
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

        {/* ── User-Info + Logout ── */}
        <div style={{ padding: "16px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: COLORS.card, marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: COLORS.greenMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: COLORS.greenText, flexShrink: 0 }}>
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.username}
              </div>
              <div style={{ fontSize: "10px", color: COLORS.textDim }}>ID #{user.id}</div>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", padding: "7px", borderRadius: "7px",
              background: "transparent", border: `1px solid ${COLORS.border}`,
              color: COLORS.textDim, fontSize: "12px", fontWeight: "500",
              cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
          >
            <Icon.Logout /> Abmelden
          </button>
        </div>
      </div>

      <div style={css.main}>
        <div style={css.topbar}>
          <div>
            <div style={css.pageTitle}>{meta.title}</div>
            <div style={css.pageSubtitle}>{meta.sub}</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
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
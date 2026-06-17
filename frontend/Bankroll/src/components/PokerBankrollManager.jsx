import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import AddDeposit from "./AddDeposit.jsx";
import RecordWithdrawal from "./RecordWithdrawl.jsx";
import AuthScreen from "./AuthScreen.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
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

  // Deposit via deposit_api.py → POST /deposits/ mit JSON-Body
  createDeposit: (userId, amount, notes = "") =>
    apiFetch(`/deposits/`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, amount: Number(amount), notes: notes || null }),
    }),

  // Withdrawal via withdrawal_api.py → POST /withdrawals/ mit JSON-Body
  createWithdrawal: (userId, amount, notes = "") =>
    apiFetch(`/withdrawals/`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, amount: Number(amount), note: notes || null, currency: "EUR", date: new Date().toISOString() }),
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
  getPlatforms:   ()       => apiFetch(`/platform/all`),
  createPlatform: (name)   => apiFetch(`/platform/${encodeURIComponent(name)}`, { method: "POST" }),
  getGameModes:   ()       => apiFetch(`/game-mode/all`),
  getSnapshots:   (userId) => apiFetch(`/bankroll-snapshot/user/${userId}`),
};

const GAME_MODE_ID = { cashgame: 1, tournament: 2 };

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useBankrollEvents(userId) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBankrollEvents(userId);
      setEvents(data.bankroll_events ?? data.events ?? []);
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
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
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
    if (!userId) { setSnapshots([]); return; }
    api.getSnapshots(userId)
      .then(data => setSnapshots(data.snapshots ?? []))
      .catch(() => setSnapshots([]));
  }, [userId]);
  return snapshots;
}

// usePlatforms gibt jetzt { platforms, reload } zurück
// reload() wird nach dem Erstellen einer neuen Plattform aufgerufen
function usePlatforms() {
  const [platforms, setPlatforms] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getPlatforms();
      setPlatforms(data.platforms ?? []);
    } catch {
      setPlatforms([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { platforms, reload: load };
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
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  btnSecondary: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", borderRadius: "8px",
    background: "transparent", color: COLORS.textMuted,
    fontSize: "13px", fontWeight: "500",
    border: `1px solid ${COLORS.border}`, cursor: "pointer",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
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
// PROFIT LINE CHART  – kumulativer Profit über Sessions
// ─────────────────────────────────────────────────────────────────────────────

function ProfitLineChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px", color: COLORS.textDim, fontSize: "13px" }}>
      Keine Session-Daten für diesen Zeitraum.
    </div>
  );
  if (data.length === 1) {
    const v = data[0].value;
    return (
      <div style={{ textAlign: "center", padding: "30px" }}>
        <div style={{ fontSize: "24px", fontWeight: "800", color: v >= 0 ? COLORS.greenText : COLORS.redText }}>
          {v >= 0 ? "+" : ""}€{v.toFixed(2)}
        </div>
        <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "4px" }}>nach 1 Session</div>
      </div>
    );
  }

  const W = 560, H = 160, PAD_L = 52, PAD_R = 20, PAD_T = 24, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const values = data.map(d => d.value);
  const maxV   = Math.max(...values, 0);
  const minV   = Math.min(...values, 0);
  const range  = maxV - minV || 1;

  const toX = (i) => PAD_L + (i / (data.length - 1)) * plotW;
  const toY = (v) => PAD_T + (1 - (v - minV) / range) * plotH;
  const zeroY = toY(0);

  const pts      = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));
  const linePts  = pts.map(p => `${p.x},${p.y}`).join(" ");
  const showIdx  = new Set([0, Math.floor((pts.length - 1) / 2), pts.length - 1]);

  return (
    <svg width="100%" height={H + 10} viewBox={`0 0 ${W} ${H + 10}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="plg-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={COLORS.green} stopOpacity="0.28" />
          <stop offset="100%" stopColor={COLORS.green} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="plg-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={COLORS.red} stopOpacity="0.02" />
          <stop offset="100%" stopColor={COLORS.red} stopOpacity="0.28" />
        </linearGradient>
        <clipPath id="clip-above-zero">
          <rect x={PAD_L} y={PAD_T} width={plotW} height={Math.max(0, zeroY - PAD_T)} />
        </clipPath>
        <clipPath id="clip-below-zero">
          <rect x={PAD_L} y={Math.max(PAD_T, zeroY)} width={plotW} height={Math.max(0, H - PAD_B - zeroY)} />
        </clipPath>
      </defs>

      {/* Zero reference line */}
      <line x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY}
        stroke={COLORS.borderLight} strokeWidth="1" strokeDasharray="4 3" />
      <text x={PAD_L - 6} y={zeroY + 4} textAnchor="end" fontSize="10"
        fill={COLORS.textDim} fontFamily="DM Sans,sans-serif">€0</text>

      {/* Y-axis bounds */}
      <text x={PAD_L - 6} y={PAD_T + 4} textAnchor="end" fontSize="10"
        fill={COLORS.textDim} fontFamily="DM Sans,sans-serif">€{maxV.toFixed(0)}</text>
      {minV < 0 && (
        <text x={PAD_L - 6} y={H - PAD_B + 4} textAnchor="end" fontSize="10"
          fill={COLORS.redText} fontFamily="DM Sans,sans-serif">€{minV.toFixed(0)}</text>
      )}

      {/* Fill areas */}
      <polygon
        points={`${PAD_L},${zeroY} ${linePts} ${pts[pts.length-1].x},${zeroY}`}
        fill="url(#plg-g)" clipPath="url(#clip-above-zero)" />
      <polygon
        points={`${PAD_L},${zeroY} ${linePts} ${pts[pts.length-1].x},${zeroY}`}
        fill="url(#plg-r)" clipPath="url(#clip-below-zero)" />

      {/* Line segments colored by zone */}
      <polyline points={linePts} fill="none" stroke={COLORS.green}
        strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        clipPath="url(#clip-above-zero)" />
      <polyline points={linePts} fill="none" stroke={COLORS.red}
        strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        clipPath="url(#clip-below-zero)" />

      {/* Data dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y}
          r={i === 0 || i === pts.length - 1 ? 4 : 2.5}
          fill={p.value >= 0 ? COLORS.green : COLORS.red}
          stroke={COLORS.card} strokeWidth="1.5" />
      ))}

      {/* X-axis date labels */}
      {pts.map((p, i) => showIdx.has(i) && (
        <text key={i} x={p.x} y={H + 6} textAnchor="middle" fontSize="10"
          fill={COLORS.textMuted} fontFamily="DM Sans,sans-serif">{p.label}</text>
      ))}

      {/* End-value label */}
      {(() => {
        const last = pts[pts.length - 1];
        return (
          <text x={last.x} y={last.y - 10}
            textAnchor={last.x > W * 0.72 ? "end" : "middle"}
            fontSize="11" fontWeight="700"
            fill={last.value >= 0 ? COLORS.greenText : COLORS.redText}
            fontFamily="DM Sans,sans-serif">
            {last.value >= 0 ? "+" : ""}€{last.value.toFixed(2)}
          </text>
        );
      })()}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY BAR CHART  – Sessions oder Profit pro Monat
// ─────────────────────────────────────────────────────────────────────────────

function MonthlyBarChart({ data }) {
  const [metric, setMetric] = useState("count"); // "count" | "profit"

  if (!data || data.length === 0) return (
    <div style={{ textAlign: "center", padding: "30px", color: COLORS.textDim, fontSize: "13px" }}>
      Noch keine Monatsdaten vorhanden.
    </div>
  );

  const values = data.map(d => metric === "count" ? d.count : d.profit);
  const maxAbs = Math.max(...values.map(Math.abs), 1);
  const BAR_H  = 90;
  const barW   = Math.min(34, Math.max(16, Math.floor(560 / data.length) - 8));

  return (
    <div>
      {/* Metric toggle */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[["count","Anzahl Sessions"],["profit","Profit €"]].map(([val, label]) => (
          <button key={val} onClick={() => setMetric(val)} style={{
            padding: "4px 12px", borderRadius: "16px", fontSize: "11px", fontWeight: "600",
            cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            background: metric === val ? `${COLORS.green}18` : "transparent",
            color:      metric === val ? COLORS.greenText : COLORS.textDim,
            border: `1px solid ${metric === val ? COLORS.green + "50" : COLORS.border}`,
          }}>{label}</button>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        {data.map((d, i) => {
          const rawVal  = metric === "count" ? d.count : d.profit;
          const isNeg   = rawVal < 0;
          const frac    = Math.abs(rawVal) / maxAbs;
          const barH    = Math.max(3, Math.round(frac * BAR_H));
          const accent  = metric === "count" ? COLORS.green : (isNeg ? COLORS.red : COLORS.green);
          const txtCol  = metric === "count" ? COLORS.greenText : (isNeg ? COLORS.redText : COLORS.greenText);

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: `${barW}px` }}>
              {/* Value label */}
              <div style={{ fontSize: "10px", fontWeight: "700", color: txtCol, marginBottom: "4px", whiteSpace: "nowrap" }}>
                {metric === "count" ? rawVal : `${isNeg ? "" : "+"}€${rawVal.toFixed(0)}`}
              </div>
              {/* Bar container – fixed height with bar growing from bottom */}
              <div style={{ width: "100%", height: `${BAR_H}px`, display: "flex", flexDirection: "column", justifyContent: isNeg ? "flex-start" : "flex-end" }}>
                <div style={{
                  width: "100%", height: `${barH}px`,
                  background: `linear-gradient(to ${isNeg ? "bottom" : "top"}, ${accent}55, ${accent}bb)`,
                  borderRadius: isNeg ? "0 0 4px 4px" : "4px 4px 0 0",
                  border: `1px solid ${accent}40`,
                }} />
              </div>
              {/* Month label */}
              <div style={{ fontSize: "10px", color: COLORS.textMuted, marginTop: "6px", textAlign: "center" }}>
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION CREATE FORM
// Ersetzt den externen CreateSession-Import. Enthält:
//   • Spielmodus-Toggle (Cash / Turnier)
//   • Plattform-Select mit Inline-Erstellen einer neuen Plattform
//   • Modus-spezifische Felder (Buy-in, Cash-out / Fee, Rebuys, Add-ons, Gewinn)
//   • Notiz-Feld
// ─────────────────────────────────────────────────────────────────────────────

function SessionCreateForm({ platforms, reloadPlatforms, onSuccess, onCancel }) {
  const [gameMode,         setGameMode]         = useState("cashgame");
  const [selectValue,      setSelectValue]      = useState("");
  const [platformId,       setPlatformId]       = useState(null);
  const [showNewPlatform,  setShowNewPlatform]  = useState(false);
  const [newPlatformName,  setNewPlatformName]  = useState("");
  const [creatingPlatform, setCreatingPlatform] = useState(false);
  const [platformSuccess,  setPlatformSuccess]  = useState("");

  const [buyIn,    setBuyIn]    = useState("");
  const [cashOut,  setCashOut]  = useState("");
  const [fee,      setFee]      = useState("");
  const [rebuys,   setRebuys]   = useState("");
  const [addons,   setAddons]   = useState("");
  const [winnings, setWinnings] = useState("");
  const [notes,    setNotes]    = useState("");

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  // Nach dem Reload der Plattformen die neu erstellte automatisch auswählen
  const pendingSelectRef = useRef(null);
  useEffect(() => {
    if (pendingSelectRef.current) {
      const created = platforms.find(p => p.name === pendingSelectRef.current);
      if (created) {
        setPlatformId(created.id);
        setSelectValue(String(created.id));
        pendingSelectRef.current = null;
      }
    }
  }, [platforms]);

  const handlePlatformSelectChange = (e) => {
    const val = e.target.value;
    if (val === "__new__") {
      setShowNewPlatform(true);
      setSelectValue("__new__");
      setPlatformId(null);
      setPlatformSuccess("");
    } else {
      setSelectValue(val);
      setPlatformId(val ? Number(val) : null);
      setShowNewPlatform(false);
    }
  };

  const handleCancelNewPlatform = () => {
    setShowNewPlatform(false);
    setNewPlatformName("");
    setSelectValue("");
    setPlatformId(null);
  };

  const handleCreatePlatform = async () => {
    const trimmed = newPlatformName.trim();
    if (!trimmed) return;
    setCreatingPlatform(true);
    setError(null);
    try {
      const result = await api.createPlatform(trimmed);
      if (result.error) throw new Error(result.error);
      pendingSelectRef.current = trimmed;
      setNewPlatformName("");
      setShowNewPlatform(false);
      setPlatformSuccess(`„${trimmed}" erstellt`);
      await reloadPlatforms();
    } catch (e) {
      setError(`Plattform konnte nicht erstellt werden: ${e.message}`);
    } finally {
      setCreatingPlatform(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const bIn = parseFloat(buyIn);
    if (!buyIn || isNaN(bIn) || bIn <= 0) {
      setError("Bitte einen gültigen Buy-in eingeben.");
      return;
    }
    setSaving(true);
    try {
      await onSuccess({
        game_mode:   gameMode,
        platform_id: platformId,
        notes:       notes.trim() || null,
        buy_in:      bIn,
        cash_out:    cashOut  !== "" ? parseFloat(cashOut)  : null,
        fee:         fee      !== "" ? parseFloat(fee)      : null,
        rebuys:      rebuys   !== "" ? parseFloat(rebuys)   : null,
        addons:      addons   !== "" ? parseFloat(addons)   : null,
        winnings:    winnings !== "" ? parseFloat(winnings) : 0,
      });
      onCancel(); // Formular nach Erfolg schließen
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  // Gemeinsame Input-Stile (passend zum bestehenden Dark-Design)
  const field = {
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding:      "9px 12px",
    color:        COLORS.text,
    fontSize:     "13px",
    fontFamily:   "'DM Sans', 'Segoe UI', sans-serif",
    width:        "100%",
    outline:      "none",
    boxSizing:    "border-box",
  };

  // Select mit eigenem Chevron-Pfeil
  const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%237a9cc4' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C%2Fsvg%3E")`;
  const selectField = {
    ...field,
    cursor:             "pointer",
    appearance:         "none",
    WebkitAppearance:   "none",
    backgroundImage:    chevron,
    backgroundRepeat:   "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight:       "36px",
  };

  const lbl = {
    display:       "block",
    fontSize:      "11px",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color:         COLORS.textDim,
    fontWeight:    "600",
    marginBottom:  "6px",
  };

  return (
    <div style={{ ...css.card, marginBottom: "20px", border: `1px solid ${COLORS.borderLight}` }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: COLORS.text, marginBottom: "18px" }}>
        Neue Session erfassen
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "8px", marginBottom: "14px",
          background: COLORS.redMuted, border: `1px solid ${COLORS.red}40`,
          color: COLORS.redText, fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      {/* ── Spielmodus ── */}
      <div style={{ marginBottom: "14px" }}>
        <span style={lbl}>Spielmodus</span>
        <div style={{ display: "flex", gap: "8px" }}>
          {[["cashgame", "Cash Game"], ["tournament", "Turnier"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setGameMode(val)}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: "8px",
                cursor: "pointer", border: "none",
                fontSize: "13px", fontWeight: "600",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                transition: "all 0.15s",
                background: gameMode === val
                  ? (val === "cashgame" ? COLORS.greenMuted : COLORS.goldMuted)
                  : COLORS.surface,
                color: gameMode === val
                  ? (val === "cashgame" ? COLORS.greenText : COLORS.goldText)
                  : COLORS.textMuted,
                outline: gameMode === val
                  ? `1px solid ${val === "cashgame" ? COLORS.green + "50" : COLORS.gold + "50"}`
                  : `1px solid ${COLORS.border}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plattform ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ ...lbl, marginBottom: 0 }}>Plattform</span>
          {platformSuccess && (
            <span style={{ fontSize: "11px", color: COLORS.greenText, display: "flex", alignItems: "center", gap: "4px" }}>
              <span>✓</span> {platformSuccess}
            </span>
          )}
        </div>

        <select
          value={selectValue}
          onChange={handlePlatformSelectChange}
          style={selectField}
        >
          <option value="">— Keine Plattform —</option>
          {platforms.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option disabled style={{ color: COLORS.textDim }}>────────────────</option>
          <option value="__new__">＋ Neue Plattform erstellen …</option>
        </select>

        {/* Inline-Eingabe für neue Plattform */}
        {showNewPlatform && (
          <div style={{
            display: "flex", gap: "8px", marginTop: "8px", alignItems: "stretch",
            padding: "12px",
            background: `${COLORS.green}08`,
            border: `1px solid ${COLORS.green}25`,
            borderRadius: "8px",
          }}>
            <input
              value={newPlatformName}
              onChange={e => { setNewPlatformName(e.target.value); setPlatformSuccess(""); }}
              onKeyDown={e => {
                if (e.key === "Enter") handleCreatePlatform();
                if (e.key === "Escape") handleCancelNewPlatform();
              }}
              placeholder="Plattform-Name, z.B. PokerStars"
              style={{ ...field, flex: 1 }}
              autoFocus
            />
            <button
              onClick={handleCreatePlatform}
              disabled={!newPlatformName.trim() || creatingPlatform}
              style={{
                ...css.btnPrimary,
                whiteSpace: "nowrap",
                padding: "9px 16px",
                opacity: (!newPlatformName.trim() || creatingPlatform) ? 0.45 : 1,
                cursor: (!newPlatformName.trim() || creatingPlatform) ? "not-allowed" : "pointer",
              }}
            >
              {creatingPlatform ? "…" : "Erstellen"}
            </button>
            <button
              onClick={handleCancelNewPlatform}
              style={{ ...css.btnSecondary, padding: "9px 12px" }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── Cash Game Felder ── */}
      {gameMode === "cashgame" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <span style={lbl}>Buy-in (€) *</span>
            <input
              type="number" min="0" step="0.01"
              value={buyIn} onChange={e => setBuyIn(e.target.value)}
              placeholder="0.00" style={field}
            />
          </div>
          <div>
            <span style={lbl}>Cash-out (€)</span>
            <input
              type="number" min="0" step="0.01"
              value={cashOut} onChange={e => setCashOut(e.target.value)}
              placeholder="0.00" style={field}
            />
          </div>
        </div>
      )}

      {/* ── Turnier Felder ── */}
      {gameMode === "tournament" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <span style={lbl}>Buy-in (€) *</span>
              <input
                type="number" min="0" step="0.01"
                value={buyIn} onChange={e => setBuyIn(e.target.value)}
                placeholder="0.00" style={field}
              />
            </div>
            <div>
              <span style={lbl}>Fee (€)</span>
              <input
                type="number" min="0" step="0.01"
                value={fee} onChange={e => setFee(e.target.value)}
                placeholder="0.00" style={field}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <span style={lbl}>Rebuys (€)</span>
              <input
                type="number" min="0" step="0.01"
                value={rebuys} onChange={e => setRebuys(e.target.value)}
                placeholder="0.00" style={field}
              />
            </div>
            <div>
              <span style={lbl}>Add-ons (€)</span>
              <input
                type="number" min="0" step="0.01"
                value={addons} onChange={e => setAddons(e.target.value)}
                placeholder="0.00" style={field}
              />
            </div>
            <div>
              <span style={lbl}>Gewinn (€)</span>
              <input
                type="number" min="0" step="0.01"
                value={winnings} onChange={e => setWinnings(e.target.value)}
                placeholder="0.00" style={field}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Notiz ── */}
      <div style={{ marginBottom: "18px" }}>
        <span style={lbl}>Notiz</span>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optionale Anmerkung …"
          style={field}
        />
      </div>

      {/* ── Aktionen ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onCancel} style={css.btnSecondary}>Abbrechen</button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ ...css.btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Speichert …" : "Session speichern"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView({ userId, events, eventsLoading, eventsError }) {
  const { sessions, loading: sessLoading } = useSessions(userId);
  const { platforms } = usePlatforms();
  const snapshots = useSnapshots(userId);

  const totalDeposits    = events.filter(e => e.event_type?.toUpperCase() === "DEPOSIT"   ).reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalWithdrawals = events.filter(e => e.event_type?.toUpperCase() === "WITHDRAWAL").reduce((s, e) => s + Math.abs(e.amount), 0);
  const balance          = totalDeposits - totalWithdrawals;

  const chartData = [...events]
  .filter(e => e.occurred_at)
  .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))
  .reduce((acc, e) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].value : 0;
    const delta = e.event_type?.toUpperCase() === "DEPOSIT"
      ? Math.abs(e.amount)
      : -Math.abs(e.amount);
    acc.push({
      label: new Date(e.occurred_at).toLocaleDateString("de-AT", { day: "2-digit", month: "short" }),
      value: +(prev + delta).toFixed(2),
    });
    return acc;
  }, []);

  const profits      = sessions.map(s => s.profit).filter(p => p !== undefined);
  const winRate      = profits.length > 0 ? ((profits.filter(p => p > 0).length / profits.length) * 100).toFixed(1) : "—";
  const avgProfit    = profits.length > 0 ? (profits.reduce((a, b) => a + b, 0) / profits.length).toFixed(2) : 0;
  const bestSession  = profits.length > 0 ? Math.max(...profits) : 0;
  const worstSession = profits.length > 0 ? Math.min(...profits) : 0;

  if (eventsLoading) return <div style={css.loadingText}>Lade Bankroll-Daten…</div>;
  if (eventsError)   return <div style={css.errorText}>Fehler: {eventsError}</div>;

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
                <span style={css.tag(ev.event_type?.toUpperCase() === "DEPOSIT" ? "green" : "red")}>{ev.event_type?.toUpperCase() === "DEPOSIT" ? "Einzahlung" : "Auszahlung"}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: ev.event_type?.toUpperCase() === "DEPOSIT" ? COLORS.greenText : COLORS.redText }}>
                    {ev.event_type?.toUpperCase() === "DEPOSIT" ? "+" : "-"}€{ev.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "11px", color: COLORS.textDim }}>
                    {ev.occurred_at ? new Date(ev.occurred_at).toLocaleDateString("de-AT") : ""}
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
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {platforms.find(p => p.id === s.platform_id)?.name ?? (s.platform_id ? `#${s.platform_id}` : "—")}
                </div>
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

function TransaktionenView({ userId, events, reloadEvents, onNavigate }) {
  const [notification, setNotification] = useState(null);

  const totalDeposits    = events.filter(e => e.event_type?.toUpperCase() === "DEPOSIT"   ).reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalWithdrawals = events.filter(e => e.event_type?.toUpperCase() === "WITHDRAWAL").reduce((s, e) => s + Math.abs(e.amount), 0);
  const currentBankroll  = totalDeposits - totalWithdrawals;

  function showNotification(type, msg) {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  }

  async function handle_deposit_success(formData) {
    try {
      await api.createDeposit(userId, formData.amount, formData.notes ?? "");
      showNotification("success", `Einzahlung von €${Number(formData.amount).toFixed(2)} erfasst!`);
      setTimeout(() => onNavigate("history"), 1600);
    } catch (e) {
      showNotification("error", `Fehler beim Speichern: ${e.message}`);
    } finally {
      await reloadEvents();
    }
  }

  async function handle_withdrawal_success(formData) {
    try {
      await api.createWithdrawal(userId, formData.amount, formData.notes ?? "");
      showNotification("success", `Auszahlung von €${Number(formData.amount).toFixed(2)} erfasst!`);
      setTimeout(() => onNavigate("history"), 1600);
    } catch (e) {
      showNotification("error", `Fehler beim Speichern: ${e.message}`);
    } finally {
      await reloadEvents();
    }
  }

  return (
    <div>
      {notification && (
        <div style={{
          padding: "12px 18px", borderRadius: "10px", marginBottom: "16px",
          background: notification.type === "success" ? COLORS.greenMuted : COLORS.redMuted,
          border: `1px solid ${notification.type === "success" ? COLORS.green : COLORS.red}40`,
          color:  notification.type === "success" ? COLORS.greenText : COLORS.redText,
          fontSize: "13px", fontWeight: "600",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          {notification.type === "success" ? "✓" : "✕"} {notification.msg}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px" }}>
        <AddDeposit userId={userId} onSuccess={handle_deposit_success} />
        <RecordWithdrawal
          currentBankroll={currentBankroll}
          onSuccess={handle_withdrawal_success}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function HistoryView({ events, eventsLoading, eventsError }) {
  const totalDeposits    = events.filter(e => e.event_type?.toUpperCase() === "DEPOSIT"   ).reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalWithdrawals = events.filter(e => e.event_type?.toUpperCase() === "WITHDRAWAL").reduce((s, e) => s + Math.abs(e.amount), 0);
  const balance          = totalDeposits - totalWithdrawals;

  if (eventsLoading) return <div style={css.loadingText}>Lade Transaktionshistorie…</div>;

  return (
    <div>
      {eventsError && <div style={css.errorText}>Fehler beim Laden: {eventsError}</div>}

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
                background: ev.event_type?.toUpperCase() === "DEPOSIT" ? COLORS.greenMuted : COLORS.redMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ev.event_type?.toUpperCase() === "DEPOSIT" ? COLORS.greenText : COLORS.redText, fontSize: "16px",
              }}>
                {ev.event_type?.toUpperCase() === "DEPOSIT" ? "↑" : "↓"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: COLORS.text }}>
                  {ev.event_type?.toUpperCase() === "DEPOSIT" ? "Einzahlung" : "Auszahlung"}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                  {ev.occurred_at ? new Date(ev.occurred_at).toLocaleDateString("de-AT") : ""}
                </div>
                {ev.notes && (
                  <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "2px" }}>{ev.notes}</div>
                )}
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: ev.event_type?.toUpperCase() === "DEPOSIT" ? COLORS.greenText : COLORS.redText }}>
              {ev.event_type?.toUpperCase() === "DEPOSIT" ? "+" : "-"}€{ev.amount.toFixed(2)}
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
  const { sessions, loading, error, reload }           = useSessions(userId);
  const { platforms, reload: reloadPlatforms }         = usePlatforms();
  const [showCreateForm,  setShowCreateForm]           = useState(false);
  const [sessionToDelete, setSessionToDelete]          = useState(null);

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
          <SessionCreateForm
            platforms={platforms}
            reloadPlatforms={reloadPlatforms}
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
                  {platforms.find(p => p.id === s.platform_id)?.name ?? (s.platform_id ? `#${s.platform_id}` : "—")}
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
// STATS VIEW  – vollständige Statistik-Seite
// ─────────────────────────────────────────────────────────────────────────────

function StatsView({ userId, events }) {
  const { sessions, loading: sessLoading } = useSessions(userId);

  const [period,     setPeriod]     = useState("all");  // "month" | "year" | "all" | "custom"
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [activeMode, setActiveMode] = useState("all");  // "all" | "cashgame" | "tournament"

  // ── Zeitfilter ───────────────────────────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let filtered = sessions;

    if (period === "month") {
      filtered = sessions.filter(s => {
        if (!s.started_at) return false;
        const d = new Date(s.started_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (period === "year") {
      filtered = sessions.filter(s => {
        if (!s.started_at) return false;
        return new Date(s.started_at).getFullYear() === now.getFullYear();
      });
    } else if (period === "custom" && customFrom && customTo) {
      const from = new Date(customFrom);
      const to   = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      filtered = sessions.filter(s => {
        if (!s.started_at) return false;
        const d = new Date(s.started_at);
        return d >= from && d <= to;
      });
    }

    if (activeMode !== "all") {
      filtered = filtered.filter(s => s.game_mode === activeMode);
    }
    return filtered;
  }, [sessions, period, customFrom, customTo, activeMode]);

  // ── Aggregierte KPIs ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const profits     = filteredSessions.map(s => s.profit ?? 0);
    const totalProfit = profits.reduce((a, b) => a + b, 0);
    const wins        = profits.filter(p => p > 0).length;
    const winRate     = profits.length > 0 ? (wins / profits.length) * 100 : 0;
    const avgProfit   = profits.length > 0 ? totalProfit / profits.length : 0;
    const volume      = filteredSessions.reduce((s, e) => s + (e.buy_in ?? 0), 0);
    const roi         = volume > 0 ? (totalProfit / volume) * 100 : 0;
    const bestSession  = profits.length > 0 ? Math.max(...profits) : 0;
    const worstSession = profits.length > 0 ? Math.min(...profits) : 0;

    const cashSessions  = filteredSessions.filter(s => s.game_mode === "cashgame");
    const tournSessions = filteredSessions.filter(s => s.game_mode === "tournament");
    const cashProfit    = cashSessions.reduce((s, e)  => s + (e.profit ?? 0), 0);
    const tournProfit   = tournSessions.reduce((s, e) => s + (e.profit ?? 0), 0);
    const cashVolume    = cashSessions.reduce((s, e)  => s + (e.buy_in  ?? 0), 0);
    const tournVolume   = tournSessions.reduce((s, e) => s + (e.buy_in  ?? 0), 0);

    return {
      totalProfit, winRate, avgProfit, volume, roi,
      bestSession, worstSession,
      sessionCount: filteredSessions.length,
      cashSessions, tournSessions,
      cashProfit, tournProfit, cashVolume, tournVolume,
    };
  }, [filteredSessions]);

  // ── Kumulativer Profit für Chart ──────────────────────────────────────────────
  const profitChartData = useMemo(() => {
    const sorted = [...filteredSessions]
      .filter(s => s.started_at)
      .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    let cum = 0;
    return sorted.map(s => {
      cum += (s.profit ?? 0);
      return {
        label: new Date(s.started_at).toLocaleDateString("de-AT", { day: "2-digit", month: "short" }),
        value: cum,
      };
    });
  }, [filteredSessions]);

  // ── Monatliche Daten (immer alle Sessions als Kontext) ────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    sessions.filter(s => s.started_at).forEach(s => {
      const d     = new Date(s.started_at);
      const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("de-AT", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { key, label, count: 0, profit: 0 };
      map[key].count++;
      map[key].profit += (s.profit ?? 0);
    });
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12);
  }, [sessions]);

  if (sessLoading) return <div style={css.loadingText}>Lade Statistiken…</div>;

  const periodLabel = {
    month:  new Date().toLocaleDateString("de-AT", { month: "long", year: "numeric" }),
    year:   String(new Date().getFullYear()),
    all:    "Gesamt",
    custom: customFrom && customTo ? `${customFrom} – ${customTo}` : "Benutzerdefiniert",
  }[period];

  // Shared input style for date pickers
  const dateInput = {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
    padding: "6px 10px", color: COLORS.text, fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif", colorScheme: "dark",
  };

  return (
    <div>
      {/* ── Filter-Leiste ── */}
      <div style={{ ...css.card, marginBottom: "20px", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {/* Zeitraum-Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: COLORS.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>Zeitraum</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[["month","Monat"],["year","Jahr"],["all","Gesamt"],["custom","Zeitraum…"]].map(([val, label]) => (
                <button key={val} onClick={() => setPeriod(val)} style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", border: "none", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  background: period === val ? COLORS.green : "transparent",
                  color:      period === val ? "#0d1520"    : COLORS.textMuted,
                  outline:    period !== val ? `1px solid ${COLORS.border}` : "none",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ width: "1px", height: "20px", background: COLORS.border, flexShrink: 0 }} />

          {/* Modus-Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: COLORS.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>Modus</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                ["all",        "Alle",    null          ],
                ["cashgame",   "Cash",    COLORS.green  ],
                ["tournament", "Turnier", COLORS.gold   ],
              ].map(([val, label, accent]) => (
                <button key={val} onClick={() => setActiveMode(val)} style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", border: "none", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  background: activeMode === val ? (accent ? `${accent}20` : COLORS.surface) : "transparent",
                  color:      activeMode === val ? (accent ?? COLORS.text) : COLORS.textMuted,
                  outline: `1px solid ${activeMode === val ? (accent ? `${accent}55` : COLORS.borderLight) : COLORS.border}`,
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Benutzerdefinierter Zeitraum */}
        {period === "custom" && (
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center", borderTop: `1px solid ${COLORS.border}`, paddingTop: "12px" }}>
            <span style={{ fontSize: "12px", color: COLORS.textDim }}>Von</span>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={dateInput} />
            <span style={{ fontSize: "12px", color: COLORS.textDim }}>Bis</span>
            <input type="date" value={customTo}   onChange={e => setCustomTo(e.target.value)}   style={dateInput} />
          </div>
        )}
      </div>

      {/* ── KPI-Karten ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: "Gesamt-Profit", value: `${stats.totalProfit >= 0 ? "+" : ""}€${stats.totalProfit.toFixed(2)}`, color: stats.totalProfit >= 0 ? COLORS.greenText : COLORS.redText },
          { label: "Sessions",      value: stats.sessionCount, color: COLORS.text },
          { label: "Volumen",       value: `€${stats.volume.toFixed(0)}`, color: COLORS.text },
          { label: "Gewinnrate",    value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? COLORS.greenText : COLORS.redText },
          { label: "Ø Profit",      value: `€${stats.avgProfit.toFixed(2)}`, color: stats.avgProfit >= 0 ? COLORS.greenText : COLORS.redText },
          { label: "ROI",           value: `${stats.roi.toFixed(1)}%`, color: stats.roi >= 0 ? COLORS.greenText : COLORS.redText },
        ].map((item, i) => (
          <div key={i} style={css.statCard}>
            <div style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Profit-Entwicklung ── */}
      <div style={{ ...css.card, marginBottom: "20px" }}>
        <div style={css.sectionTitle}>
          <span>Profit-Entwicklung</span>
          <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: COLORS.textMuted, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>
            <span style={{ color: COLORS.textDim }}>{periodLabel}</span>
            {stats.bestSession > 0 && (
              <span>Best <strong style={{ color: COLORS.greenText }}>+€{stats.bestSession.toFixed(2)}</strong></span>
            )}
            {stats.worstSession < 0 && (
              <span>Worst <strong style={{ color: COLORS.redText }}>€{stats.worstSession.toFixed(2)}</strong></span>
            )}
          </div>
        </div>
        <ProfitLineChart data={profitChartData} />
      </div>

      {/* ── Modus-spezifische Statistiken ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <ModeStatsCard
          title="Cash Game" color="green"
          sessions={stats.cashSessions} profit={stats.cashProfit} volume={stats.cashVolume}
        />
        <ModeStatsCard
          title="Turniere" color="gold"
          sessions={stats.tournSessions} profit={stats.tournProfit} volume={stats.tournVolume}
        />
      </div>

      {/* ── Monatsauswertung ── */}
      <div style={css.card}>
        <div style={css.sectionTitle}>
          <span>Monatsauswertung</span>
          <span style={{ fontSize: "11px", color: COLORS.textDim, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>letzte 12 Monate</span>
        </div>
        <MonthlyBarChart data={monthlyData} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE STATS CARD
// ─────────────────────────────────────────────────────────────────────────────

function ModeStatsCard({ title, color, sessions, profit, volume }) {
  const profits    = sessions.map(s => s.profit ?? 0);
  const winRate    = profits.length > 0 ? ((profits.filter(p => p > 0).length / profits.length) * 100).toFixed(1) : "—";
  const avgProfit  = profits.length > 0 ? (profit / profits.length).toFixed(2) : "0.00";
  const roi        = volume > 0 ? ((profit / volume) * 100).toFixed(1) : "—";
  const best       = profits.length > 0 ? Math.max(...profits) : 0;
  const accentColor = color === "green" ? COLORS.green     : COLORS.gold;
  const accentText  = color === "green" ? COLORS.greenText : COLORS.goldText;

  return (
    <div style={{ ...css.card, borderColor: `${accentColor}35` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: accentText }}>
          {title}
        </div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: profit >= 0 ? COLORS.greenText : COLORS.redText }}>
          {profit >= 0 ? "+" : ""}€{profit.toFixed(2)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { label: "Sessions",      value: sessions.length },
          { label: "Gewinnrate",    value: `${winRate}%`   },
          { label: "Ø Profit",      value: `€${avgProfit}` },
          { label: "ROI",           value: `${roi}%`       },
          { label: "Volumen",       value: `€${volume.toFixed(0)}` },
          { label: "Beste Session", value: best > 0 ? `+€${best.toFixed(2)}` : "—" },
        ].map((item, i) => (
          <div key={i} style={{ background: COLORS.surface, borderRadius: "8px", padding: "9px 12px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: "3px" }}>{item.label}</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: COLORS.text }}>{item.value}</div>
          </div>
        ))}
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
  const [user,       setUser]       = useState(null);

  const {
    events,
    loading: eventsLoading,
    error:   eventsError,
    reload:  reloadEvents,
  } = useBankrollEvents(user?.id);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onAuth={(u) => setUser(u)} />;
  }

  const meta = VIEW_META[activeView];

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            userId={user.id}
            events={events}
            eventsLoading={eventsLoading}
            eventsError={eventsError}
          />
        );
      case "transaktionen":
        return (
          <TransaktionenView
            userId={user.id}
            events={events}
            reloadEvents={reloadEvents}
            onNavigate={setActiveView}
          />
        );
      case "history":
        return (
          <HistoryView
            events={events}
            eventsLoading={eventsLoading}
            eventsError={eventsError}
          />
        );
      case "sessions":
        return <SessionsView userId={user.id} />;
      case "stats":
        return (
          <StatsView
            userId={user.id}
            events={events}
          />
        );
      default:
        return (
          <DashboardView
            userId={user.id}
            events={events}
            eventsLoading={eventsLoading}
            eventsError={eventsError}
          />
        );
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
            onClick={handleLogout}
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
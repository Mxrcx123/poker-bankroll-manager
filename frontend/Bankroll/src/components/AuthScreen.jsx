import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Identisches Farbschema wie der Rest des Projekts
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  bg:         "#0d1520",
  surface:    "#111c2d",
  card:       "#162035",
  border:     "#1e3050",
  green:      "#22c55e",
  greenDim:   "#16a34a",
  greenMuted: "#14532d",
  greenText:  "#4ade80",
  red:        "#ef4444",
  redText:    "#f87171",
  text:       "#f0f6ff",
  textMuted:  "#7a9cc4",
  textDim:    "#3d5a8a",
};

const BASE_URL = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const ChipsIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// API-Helfer
// ─────────────────────────────────────────────────────────────────────────────

async function apiLogin(username, password) {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json(); // { id, username, created_at }
}

async function apiRegister(username, password) {
  const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(username)}/${encodeURIComponent(password)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.error ?? `HTTP ${res.status}`);
  }
  return res.json(); // { message, id }
}

// ─────────────────────────────────────────────────────────────────────────────
// FormField-Hilfkomponente
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, icon, error, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: error ? COLORS.redText : COLORS.textDim,
        marginBottom: "6px",
      }}>
        {icon}{label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: "12px", color: COLORS.redText, marginTop: "5px" }}>⚠ {error}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Haupt-Komponente
// onAuth(user) wird aufgerufen wenn Login/Register erfolgreich
// user = { id, username }
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthScreen({ onAuth }) {
  const [tab,      setTab]      = useState("login");    // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [status,   setStatus]   = useState("idle");     // idle | loading | success
  const [error,    setError]    = useState("");

  function resetForm() {
    setUsername(""); setPassword(""); setPwConfirm("");
    setError(""); setStatus("idle");
  }

  function switchTab(t) { setTab(t); resetForm(); }

  function validate() {
    if (!username.trim())         return "Benutzername ist erforderlich.";
    if (username.trim().length < 3) return "Benutzername muss mindestens 3 Zeichen haben.";
    if (!password)                return "Passwort ist erforderlich.";
    if (password.length < 6)      return "Passwort muss mindestens 6 Zeichen haben.";
    if (tab === "register" && password !== pwConfirm) return "Passwörter stimmen nicht überein.";
    return null;
  }

  async function handleSubmit() {
    const validErr = validate();
    if (validErr) { setError(validErr); return; }

    setStatus("loading");
    setError("");

    try {
      if (tab === "login") {
        const user = await apiLogin(username.trim(), password);
        setStatus("success");
        setTimeout(() => onAuth({ id: user.id, username: user.username ?? username.trim() }), 600);
      } else {
        const result = await apiRegister(username.trim(), password);
        // Nach Register direkt einloggen
        const user = await apiLogin(username.trim(), password);
        setStatus("success");
        setTimeout(() => onAuth({ id: user.id ?? result.id, username: username.trim() }), 600);
      }
    } catch (e) {
      setError(e.message ?? "Unbekannter Fehler.");
      setStatus("idle");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  const inputStyle = (hasError) => ({
    width: "100%", padding: "11px 12px 11px 36px",
    background: COLORS.surface,
    border: `1px solid ${hasError ? COLORS.red : COLORS.border}`,
    borderRadius: "8px", color: COLORS.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    transition: "border-color 0.15s",
  });

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <div style={{
      minHeight: "100vh", width: "100vw",
      background: COLORS.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "20px", boxSizing: "border-box",
    }}>
      {/* Hintergrund-Deko */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-120px", left: "-120px", width: "400px", height: "400px", borderRadius: "50%", background: `${COLORS.green}06` }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: `${COLORS.green}04` }} />
      </div>

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", color: "#0d1520",
          }}>
            <ChipsIcon />
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: COLORS.text, letterSpacing: "-0.02em" }}>
            Bankroll Manager
          </div>
          <div style={{ fontSize: "12px", color: COLORS.textMuted, marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Poker Tracker
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "16px",
          padding: "28px 24px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}>

          {/* Tab-Toggle */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: COLORS.surface, borderRadius: "10px",
            padding: "4px", border: `1px solid ${COLORS.border}`,
            marginBottom: "24px",
          }}>
            {["login", "register"].map((t) => {
              const active = tab === t;
              return (
                <button key={t} onClick={() => switchTab(t)} style={{
                  padding: "9px 0", borderRadius: "7px", border: "none",
                  cursor: "pointer", fontSize: "13px",
                  fontWeight: active ? "700" : "400",
                  background: active ? `${COLORS.green}22` : "transparent",
                  color: active ? COLORS.greenText : COLORS.textMuted,
                  outline: active ? `1.5px solid ${COLORS.green}55` : "none",
                  transition: "all 0.15s",
                  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                }}>
                  {t === "login" ? "Anmelden" : "Registrieren"}
                </button>
              );
            })}
          </div>

          {/* API-Fehler */}
          {error && (
            <div style={{
              fontSize: "12px", color: COLORS.redText,
              background: "#450a0a", borderRadius: "8px",
              padding: "10px 12px", marginBottom: "16px",
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Erfolgs-Feedback */}
          {isSuccess && (
            <div style={{
              fontSize: "12px", color: COLORS.greenText,
              background: COLORS.greenMuted, borderRadius: "8px",
              padding: "10px 12px", marginBottom: "16px",
              textAlign: "center",
            }}>
              ✓ {tab === "login" ? "Willkommen zurück!" : "Konto erstellt! Wird eingeloggt…"}
            </div>
          )}

          {/* Benutzername */}
          <Field label="Benutzername" icon={<UserIcon />} error={null}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: COLORS.textDim, pointerEvents: "none" }}>
                <UserIcon />
              </span>
              <input
                type="text"
                placeholder="dein_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isSuccess}
                style={inputStyle(false)}
              />
            </div>
          </Field>

          {/* Passwort */}
          <Field label="Passwort" icon={<LockIcon />} error={null}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: COLORS.textDim, pointerEvents: "none" }}>
                <LockIcon />
              </span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isSuccess}
                style={{ ...inputStyle(false), paddingRight: "40px" }}
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute", right: "10px", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer",
                  color: COLORS.textDim, padding: "4px",
                }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </Field>

          {/* Passwort bestätigen — nur bei Register */}
          {tab === "register" && (
            <Field label="Passwort wiederholen" icon={<LockIcon />} error={null}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: COLORS.textDim, pointerEvents: "none" }}>
                  <LockIcon />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isSuccess}
                  style={inputStyle(pwConfirm && pwConfirm !== password)}
                />
              </div>
            </Field>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
            style={{
              width: "100%", padding: "12px",
              borderRadius: "8px", border: "none",
              background: isSuccess ? COLORS.greenMuted : isLoading ? COLORS.greenDim : COLORS.green,
              color: isSuccess ? COLORS.greenText : "#0d1520",
              fontSize: "14px", fontWeight: "700",
              cursor: isLoading || isSuccess ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              marginTop: "4px",
              transition: "all 0.15s",
            }}
          >
            {isLoading
              ? (tab === "login" ? "Wird angemeldet…" : "Wird registriert…")
              : isSuccess ? "✓ Erfolgreich"
              : (tab === "login" ? "Anmelden" : "Konto erstellen")}
          </button>

          {/* Hinweis-Text */}
          <div style={{ fontSize: "12px", color: COLORS.textDim, textAlign: "center", marginTop: "16px" }}>
            {tab === "login"
              ? <>Noch kein Konto? <span onClick={() => switchTab("register")} style={{ color: COLORS.greenText, cursor: "pointer", fontWeight: "600" }}>Registrieren</span></>
              : <>Bereits registriert? <span onClick={() => switchTab("login")} style={{ color: COLORS.greenText, cursor: "pointer", fontWeight: "600" }}>Anmelden</span></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

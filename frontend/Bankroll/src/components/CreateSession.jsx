import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Farben — identisch mit dem restlichen Projekt
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#0d1520",
  surface: "#111c2d",
  card: "#162035",
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
  redDim: "#b91c1c",
  redMuted: "#450a0a",
  redText: "#f87171",
  text: "#f0f6ff",
  textMuted: "#7a9cc4",
  textDim: "#3d5a8a",
};

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const NoteIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const EuroIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 7.5A6 6 0 1 0 17 16.5M3 10h10M3 14h10" />
  </svg>
);

const ChipsIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </svg>
);

const PlatformIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 17l5-5 4 4 9-9M17 7h4v4" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 7l5 5 4-4 9 9M17 17h4v-4" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function calcProfit(mode, fields) {
  if (mode === "cashgame") {
    return parseNum(fields.cash_out) - parseNum(fields.buy_in);
  }
  // Turnier: Winnings − (buy_in + fee + rebuys + addons)
  return (
    parseNum(fields.winnings) -
    parseNum(fields.buy_in) -
    parseNum(fields.fee) -
    parseNum(fields.rebuys) -
    parseNum(fields.addons)
  );
}

function validateForm(mode, fields) {
  const errors = {};
  const buy_in = parseNum(fields.buy_in);

  if (!fields.date) {
    errors.date = "Datum ist erforderlich.";
  }
  if (!fields.buy_in || fields.buy_in.trim() === "") {
    errors.buy_in = "Buy-in ist erforderlich.";
  } else if (buy_in <= 0) {
    errors.buy_in = "Buy-in muss positiv sein.";
  }

  if (mode === "cashgame") {
    const cash_out = parseNum(fields.cash_out);
    if (!fields.cash_out || fields.cash_out.trim() === "") {
      errors.cash_out = "Cash-out ist erforderlich.";
    } else if (cash_out < 0) {
      errors.cash_out = "Cash-out darf nicht negativ sein.";
    }
  } else {
    const winnings = parseNum(fields.winnings);
    if (!fields.winnings || fields.winnings.trim() === "") {
      errors.winnings = "Gewinn/Auszahlung ist erforderlich.";
    } else if (winnings < 0) {
      errors.winnings = "Wert darf nicht negativ sein.";
    }
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Komponenten
// ─────────────────────────────────────────────────────────────────────────────

function FormField({ label, icon, error, hint, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: error ? COLORS.redText : COLORS.textDim,
        marginBottom: "6px",
      }}>
        {icon}{label}
        {hint && (
          <span style={{ fontSize: "10px", fontWeight: "400", letterSpacing: "0", textTransform: "none", color: COLORS.textDim, marginLeft: "4px" }}>
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: "12px", color: COLORS.redText, marginTop: "5px" }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

function EuroInput({ value, onChange, onBlur, hasError, placeholder = "0.00" }) {
  const inputStyle = {
    width: "100%", padding: "9px 12px 9px 28px",
    background: COLORS.surface,
    border: `1px solid ${hasError ? COLORS.red : COLORS.border}`,
    borderRadius: "8px", color: COLORS.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  };
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: "12px", top: "50%",
        transform: "translateY(-50%)",
        color: COLORS.textMuted, fontSize: "14px", pointerEvents: "none",
      }}>€</span>
      <input
        type="number" min="0" step="0.01" placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={inputStyle}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   onSuccess(newSession) — wird nach dem Speichern aufgerufen
//   onCancel()            — optional, zeigt Abbrechen-Button
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateSession({ onSuccess, onCancel }) {
  const [mode,    setMode]    = useState("cashgame"); // "cashgame" | "tournament"
  const [status,  setStatus]  = useState("idle");     // "idle" | "loading" | "success"
  const [touched, setTouched] = useState({});
  const [errors,  setErrors]  = useState({});

  // Gemeinsame Felder
  const [date,     setDate]     = useState(getTodayString());
  const [platform, setPlatform] = useState("");
  const [notes,    setNotes]    = useState("");
  const [buy_in,   setBuyIn]    = useState("");

  // Cashgame-spezifisch
  const [cash_out, setCashOut] = useState("");

  // Turnier-spezifisch
  const [fee,      setFee]      = useState("");
  const [rebuys,   setRebuys]   = useState("");
  const [addons,   setAddons]   = useState("");
  const [winnings, setWinnings] = useState("");

  const currentFields = () => ({ date, buy_in, cash_out, fee, rebuys, addons, winnings });

  const profit = calcProfit(mode, currentFields());
  const showPreview = buy_in !== "" && parseNum(buy_in) > 0 &&
    (mode === "cashgame" ? cash_out !== "" : winnings !== "");

  function handleModeChange(newMode) {
    setMode(newMode);
    setTouched({});
    setErrors({});
  }

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validateForm(mode, currentFields()));
  }

  async function handleSubmit() {
    const allTouched = { date: true, buy_in: true, cash_out: true, winnings: true };
    setTouched(allTouched);
    const errs = validateForm(mode, currentFields());
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");

    // ── API-Platzhalter — später ersetzen ──────────────────────────────────
    // const payload = {
    //   type: mode,
    //   date,
    //   platform: platform.trim() || null,
    //   buy_in:   parseNum(buy_in),
    //   notes:    notes.trim() || null,
    //   ...(mode === "cashgame"
    //     ? { cash_out: parseNum(cash_out) }
    //     : {
    //         fee:      parseNum(fee),
    //         rebuys:   parseNum(rebuys),
    //         addons:   parseNum(addons),
    //         winnings: parseNum(winnings),
    //       }),
    // };
    // const res = await fetch("/api/sessions", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
    // const newSession = await res.json();
    // ──────────────────────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 700));

    const newSession = {
      id: Date.now(),
      game_mode: mode,
      date,
      platform: platform.trim() || null,
      buy_in:   parseNum(buy_in),
      notes:    notes.trim() || null,
      profit,
      ...(mode === "cashgame"
        ? { cash_out: parseNum(cash_out) }
        : {
            fee:      parseNum(fee),
            rebuys:   parseNum(rebuys),
            addons:   parseNum(addons),
            winnings: parseNum(winnings),
          }),
    };

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setDate(getTodayString());
      setPlatform("");
      setNotes("");
      setBuyIn("");
      setCashOut("");
      setFee("");
      setRebuys("");
      setAddons("");
      setWinnings("");
      setTouched({});
      setErrors({});
      if (onSuccess) onSuccess(newSession);
    }, 1600);
  }

  const inputStyle = (hasError) => ({
    width: "100%", padding: "9px 12px",
    background: COLORS.surface,
    border: `1px solid ${hasError ? COLORS.red : COLORS.border}`,
    borderRadius: "8px", color: COLORS.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  });

  // ── Erfolgs-Screen ──────────────────────────────────────────────────────────
  if (status === "success") {
    const isWin = profit >= 0;
    return (
      <div style={{
        background: COLORS.card,
        border: `1px solid ${isWin ? COLORS.green : COLORS.red}50`,
        borderRadius: "12px", padding: "40px 24px", textAlign: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: isWin ? COLORS.greenMuted : COLORS.redMuted,
          border: `2px solid ${isWin ? COLORS.green : COLORS.red}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          color: isWin ? COLORS.greenText : COLORS.redText,
        }}>
          <CheckIcon />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.text, marginBottom: "6px" }}>
          Session gespeichert!
        </div>
        <div style={{ fontSize: "13px", color: COLORS.textMuted }}>
          {mode === "cashgame" ? "Cashgame" : "Turnier"} am {date}
          {" — "}
          <span style={{ fontWeight: "700", color: isWin ? COLORS.greenText : COLORS.redText }}>
            {isWin ? "+" : ""}€{profit.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Modus-Farben
  // ─────────────────────────────────────────────────────────────────────────
  const accentColor = mode === "cashgame" ? COLORS.green : COLORS.gold;
  const accentText  = mode === "cashgame" ? COLORS.greenText : COLORS.goldText;
  const accentMuted = mode === "cashgame" ? COLORS.greenMuted : COLORS.goldMuted;
  const accentDim   = mode === "cashgame" ? COLORS.greenDim : COLORS.goldDim;

  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${accentColor}30`,
      borderRadius: "12px", padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
          textTransform: "uppercase", color: accentText, marginBottom: "4px",
        }}>
          Sessions
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
          Session erfassen
        </div>
      </div>

      {/* ── Modus-Toggle ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
          textTransform: "uppercase", color: COLORS.textDim, marginBottom: "8px",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <ChipsIcon /> Spielmodus
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          background: COLORS.surface, borderRadius: "10px", padding: "4px",
          border: `1px solid ${COLORS.border}`,
        }}>
          {[
            { id: "cashgame",   label: "Cashgame",  color: COLORS.green,    text: COLORS.greenText },
            { id: "tournament", label: "Turnier",   color: COLORS.gold,     text: COLORS.goldText  },
          ].map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                style={{
                  padding: "8px 0", borderRadius: "7px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: active ? "700" : "400",
                  background: active ? m.color + "22" : "transparent",
                  color: active ? m.text : COLORS.textMuted,
                  outline: active ? `1.5px solid ${m.color}55` : "none",
                  transition: "all 0.15s",
                  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: active ? m.color : COLORS.textDim,
                  display: "inline-block", flexShrink: 0,
                }} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Datum & Plattform nebeneinander ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <FormField label="Datum" icon={<CalendarIcon />} error={touched.date && errors.date}>
          <input
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => handleBlur("date")}
            style={inputStyle(touched.date && errors.date)}
          />
        </FormField>

        <FormField label="Plattform" icon={<PlatformIcon />} hint="(optional)">
          <input
            type="text" placeholder="z.B. PokerStars, live…"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={inputStyle(false)}
          />
        </FormField>
      </div>

      {/* ── Divider ── */}
      <div style={{
        borderTop: `1px solid ${COLORS.border}`, margin: "4px 0 16px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{
          marginTop: "-1px", fontSize: "10px", fontWeight: "600",
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: accentText, background: COLORS.card, padding: "0 8px",
        }}>
          {mode === "cashgame" ? "Cashgame-Details" : "Turnier-Details"}
        </span>
      </div>

      {/* ── Cashgame-Felder ── */}
      {mode === "cashgame" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Buy-in" icon={<EuroIcon />} error={touched.buy_in && errors.buy_in}>
            <EuroInput
              value={buy_in}
              onChange={(e) => setBuyIn(e.target.value)}
              onBlur={() => handleBlur("buy_in")}
              hasError={touched.buy_in && errors.buy_in}
            />
          </FormField>
          <FormField label="Cash-out" icon={<EuroIcon />} error={touched.cash_out && errors.cash_out}>
            <EuroInput
              value={cash_out}
              onChange={(e) => setCashOut(e.target.value)}
              onBlur={() => handleBlur("cash_out")}
              hasError={touched.cash_out && errors.cash_out}
            />
          </FormField>
        </div>
      )}

      {/* ── Turnier-Felder ── */}
      {mode === "tournament" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormField label="Buy-in" icon={<EuroIcon />} error={touched.buy_in && errors.buy_in}>
              <EuroInput
                value={buy_in}
                onChange={(e) => setBuyIn(e.target.value)}
                onBlur={() => handleBlur("buy_in")}
                hasError={touched.buy_in && errors.buy_in}
              />
            </FormField>
            <FormField label="Fee / Rake" icon={<EuroIcon />} hint="(optional)">
              <EuroInput
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                onBlur={() => handleBlur("fee")}
                hasError={false}
              />
            </FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <FormField label="Rebuys" icon={<EuroIcon />} hint="(optional)">
              <EuroInput
                value={rebuys}
                onChange={(e) => setRebuys(e.target.value)}
                onBlur={() => handleBlur("rebuys")}
                hasError={false}
              />
            </FormField>
            <FormField label="Add-ons" icon={<EuroIcon />} hint="(optional)">
              <EuroInput
                value={addons}
                onChange={(e) => setAddons(e.target.value)}
                onBlur={() => handleBlur("addons")}
                hasError={false}
              />
            </FormField>
            <FormField label="Gewinn" icon={<EuroIcon />} error={touched.winnings && errors.winnings}>
              <EuroInput
                value={winnings}
                onChange={(e) => setWinnings(e.target.value)}
                onBlur={() => handleBlur("winnings")}
                hasError={touched.winnings && errors.winnings}
                placeholder="0.00"
              />
            </FormField>
          </div>
        </>
      )}

      {/* ── Notizen ── */}
      <FormField label="Notizen" icon={<NoteIcon />} hint="(optional)">
        <textarea
          placeholder={
            mode === "cashgame"
              ? "z.B. gute Tischauswahl, Tilt-Control…"
              : "z.B. 3. Platz, Final-Table, Bad Beat…"
          }
          rows={2} value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle(false), resize: "vertical", lineHeight: "1.5" }}
        />
      </FormField>

      {/* ── Profit-Vorschau ── */}
      {showPreview && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: COLORS.textMuted }}>Ergebnis dieser Session</span>
            <span style={{
              fontSize: "17px", fontWeight: "800",
              color: profit >= 0 ? COLORS.greenText : COLORS.redText,
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {profit >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
              {profit >= 0 ? "+" : ""}€{profit.toFixed(2)}
            </span>
          </div>
          {/* Detail-Zeile */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {mode === "cashgame" ? (
              <>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>
                  Buy-in <strong style={{ color: COLORS.textMuted }}>€{parseNum(buy_in).toFixed(2)}</strong>
                </span>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>→</span>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>
                  Cash-out <strong style={{ color: COLORS.textMuted }}>€{parseNum(cash_out).toFixed(2)}</strong>
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>
                  Kosten <strong style={{ color: COLORS.textMuted }}>
                    €{(parseNum(buy_in) + parseNum(fee) + parseNum(rebuys) + parseNum(addons)).toFixed(2)}
                  </strong>
                </span>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>→</span>
                <span style={{ fontSize: "11px", color: COLORS.textDim }}>
                  Gewinn <strong style={{ color: COLORS.textMuted }}>€{parseNum(winnings).toFixed(2)}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Buttons ── */}
      <div style={{ display: "flex", gap: "10px" }}>
        {onCancel && (
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", borderRadius: "8px",
            background: "transparent", border: `1px solid ${COLORS.border}`,
            color: COLORS.textMuted, fontSize: "14px", fontWeight: "500",
            cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}>
            Abbrechen
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          style={{
            flex: 2, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", padding: "10px", borderRadius: "8px",
            background: status === "loading" ? accentDim : accentColor,
            color: mode === "cashgame" ? "#0d1520" : "#0d1520",
            fontSize: "14px", fontWeight: "700",
            border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            opacity: status === "loading" ? 0.8 : 1,
          }}
        >
          {status === "loading" ? "Wird gespeichert…" : <><SaveIcon /> Session speichern</>}
        </button>
      </div>
    </div>
  );
}

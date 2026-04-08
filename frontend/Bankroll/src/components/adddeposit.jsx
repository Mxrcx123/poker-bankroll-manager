import { useState } from "react";

const COLORS = {
  bg: "#0d1520",
  surface: "#111c2d",
  card: "#162035",
  border: "#1e3050",
  green: "#22c55e",
  greenDim: "#16a34a",
  greenMuted: "#14532d",
  greenText: "#4ade80",
  red: "#ef4444",
  redText: "#f87171",
  text: "#f0f6ff",
  textMuted: "#7a9cc4",
  textDim: "#3d5a8a",
};

const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const EuroIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 7.5A6 6 0 1 0 17 16.5M3 10h10M3 14h10" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
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

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function validateForm(amount, date) {
  const errors = {};
  const parsed = parseFloat(amount);
  if (!amount || amount.trim() === "") {
    errors.amount = "Betrag ist erforderlich.";
  } else if (isNaN(parsed) || parsed <= 0) {
    errors.amount = "Betrag muss eine positive Zahl sein.";
  } else if (parsed > 100000) {
    errors.amount = "Maximaler Betrag: €100.000";
  }
  if (!date) errors.date = "Datum ist erforderlich.";
  return errors;
}

function FormField({ label, icon, error, children }) {
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
        <div style={{ fontSize: "12px", color: COLORS.redText, marginTop: "5px" }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   onSuccess(newEvent)  — wird nach dem Speichern aufgerufen
//   onCancel()           — optional, zeigt Abbrechen-Button
// ─────────────────────────────────────────────────────────────────────────────
export default function AddDeposit({ onSuccess, onCancel }) {
  const [amount,  setAmount]  = useState("");
  const [date,    setDate]    = useState(getTodayString());
  const [notes,   setNotes]   = useState("");
  const [errors,  setErrors]  = useState({});
  const [status,  setStatus]  = useState("idle");
  const [touched, setTouched] = useState({});

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validateForm(amount, date));
  }

  async function handleSubmit() {
    setTouched({ amount: true, date: true });
    const errs = validateForm(amount, date);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");

    // ── API-Platzhalter — später ersetzen ──────────────────────────────────
    // const res = await fetch("/api/bankroll-events", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ type: "deposit", amount: parseFloat(amount), date, notes }),
    // });
    // const savedEvent = await res.json();
    // ──────────────────────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 700));

    const newEvent = {
      id: Date.now(),
      type: "deposit",
      amount: parseFloat(amount),
      date,
      notes: notes.trim(),
    };

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setAmount("");
      setDate(getTodayString());
      setNotes("");
      setTouched({});
      setErrors({});
      if (onSuccess) onSuccess(newEvent);
    }, 1400);
  }

  const inputStyle = (hasError) => ({
    width: "100%", padding: "10px 12px",
    background: COLORS.surface,
    border: `1px solid ${hasError ? COLORS.red : COLORS.border}`,
    borderRadius: "8px", color: COLORS.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  });

  if (status === "success") {
    return (
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.green}50`,
        borderRadius: "12px", padding: "40px 24px", textAlign: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: COLORS.greenMuted, border: `2px solid ${COLORS.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", color: COLORS.greenText,
        }}>
          <CheckIcon />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.text, marginBottom: "6px" }}>
          Einzahlung gespeichert!
        </div>
        <div style={{ fontSize: "13px", color: COLORS.textMuted }}>
          +€{parseFloat(amount).toFixed(2)} wurde zur Bankroll hinzugefügt.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.green}30`,
      borderRadius: "12px", padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.greenText, marginBottom: "4px" }}>
          Bankroll
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
          Einzahlung erfassen
        </div>
      </div>

      <FormField label="Betrag" icon={<EuroIcon />} error={touched.amount && errors.amount}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted, fontSize: "14px", pointerEvents: "none" }}>€</span>
          <input
            type="number" min="0.01" step="0.01" placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur("amount")}
            style={{ ...inputStyle(touched.amount && errors.amount), paddingLeft: "28px" }}
          />
        </div>
      </FormField>

      <FormField label="Datum" icon={<CalendarIcon />} error={touched.date && errors.date}>
        <input
          type="date" value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => handleBlur("date")}
          style={inputStyle(touched.date && errors.date)}
        />
      </FormField>

      <FormField label="Notizen (optional)" icon={<NoteIcon />}>
        <textarea
          placeholder="z.B. Ersteinzahlung, Bonus..."
          rows={3} value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle(false), resize: "vertical", lineHeight: "1.5" }}
        />
      </FormField>

      {amount && parseFloat(amount) > 0 && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "12px", color: COLORS.textMuted }}>Bankroll erhöht sich um</span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: COLORS.greenText }}>
            +€{parseFloat(amount).toFixed(2)}
          </span>
        </div>
      )}

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
            background: status === "loading" ? COLORS.greenDim : COLORS.green,
            color: "#0d1520", fontSize: "14px", fontWeight: "700",
            border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            opacity: status === "loading" ? 0.8 : 1,
          }}
        >
          {status === "loading" ? "Wird gespeichert…" : <><PlusIcon /> Einzahlung speichern</>}
        </button>
      </div>
    </div>
  );
}

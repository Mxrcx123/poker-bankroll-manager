import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Farben — identisch mit dem restlichen Projekt
// ─────────────────────────────────────────────────────────────────────────────

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

const MinusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14" />
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

// ─────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function validateForm(amount, date, currentBankroll) {
  const errors = {};
  const parsed = parseFloat(amount);

  if (!amount || amount.trim() === "") {
    errors.amount = "Betrag ist erforderlich.";
  } else if (isNaN(parsed) || parsed <= 0) {
    errors.amount = "Betrag muss eine positive Zahl sein.";
  } else if (parsed > 100000) {
    errors.amount = "Maximaler Betrag: €100.000";
  } else if (currentBankroll !== undefined && parsed > currentBankroll) {
    errors.amount = `Betrag überschreitet die aktuelle Bankroll (€${currentBankroll.toFixed(2)}).`;
  }

  if (!date) errors.date = "Datum ist erforderlich.";

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormField — gleiche Struktur wie in AddDeposit
// ─────────────────────────────────────────────────────────────────────────────

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
//   currentBankroll  — aktuelle Bankroll (für Validierung & Anzeige)
//   onSuccess(event) — wird nach dem Speichern aufgerufen
//   onCancel()       — optional, zeigt Abbrechen-Button
// ─────────────────────────────────────────────────────────────────────────────

export default function RecordWithdrawal({ currentBankroll, onSuccess, onCancel }) {
  const [amount,  set_amount]  = useState("");
  const [date,    set_date]    = useState(getTodayString());
  const [notes,   set_notes]   = useState("");
  const [errors,  set_errors]  = useState({});
  const [status,  set_status]  = useState("idle");
  const [touched, set_touched] = useState({});

  const parsed_amount = parseFloat(amount) || 0;

  function handle_blur(field) {
    set_touched((p) => ({ ...p, [field]: true }));
    set_errors(validateForm(amount, date, currentBankroll));
  }

  async function handle_submit() {
    set_touched({ amount: true, date: true });
    const errs = validateForm(amount, date, currentBankroll);
    set_errors(errs);
    if (Object.keys(errs).length > 0) return;

    set_status("loading");

    // ── API-Platzhalter — später ersetzen ──────────────────────────────────
    // const res = await fetch("/api/bankroll-events", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ type: "withdrawal", amount: parseFloat(amount), date, notes }),
    // });
    // const savedEvent = await res.json();
    // ──────────────────────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 700));

    const new_event = {
      id: Date.now(),
      type: "withdrawal",
      amount: parsed_amount,
      date,
      notes: notes.trim(),
    };

    set_status("success");
    setTimeout(() => {
      set_status("idle");
      set_amount("");
      set_date(getTodayString());
      set_notes("");
      set_touched({});
      set_errors({});
      if (onSuccess) onSuccess(new_event);
    }, 1400);
  }

  const input_style = (has_error) => ({
    width: "100%", padding: "10px 12px",
    background: COLORS.surface,
    border: `1px solid ${has_error ? COLORS.red : COLORS.border}`,
    borderRadius: "8px", color: COLORS.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  });

  // ── Erfolgs-Screen ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.red}50`,
        borderRadius: "12px", padding: "40px 24px", textAlign: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: COLORS.redMuted, border: `2px solid ${COLORS.red}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", color: COLORS.redText,
        }}>
          <CheckIcon />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.text, marginBottom: "6px" }}>
          Auszahlung gespeichert!
        </div>
        <div style={{ fontSize: "13px", color: COLORS.textMuted }}>
          −€{parsed_amount.toFixed(2)} wurde von der Bankroll abgezogen.
        </div>
      </div>
    );
  }

  // ── Formular ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.red}30`,
      borderRadius: "12px", padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
          textTransform: "uppercase", color: COLORS.redText, marginBottom: "4px",
        }}>
          Bankroll
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
          Auszahlung erfassen
        </div>
      </div>

      {/* Felder */}
      <FormField label="Betrag" icon={<EuroIcon />} error={touched.amount && errors.amount}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: COLORS.textMuted, fontSize: "14px", pointerEvents: "none",
          }}>
            €
          </span>
          <input
            type="number" min="0.01" step="0.01" placeholder="0.00"
            value={amount}
            onChange={(e) => set_amount(e.target.value)}
            onBlur={() => handle_blur("amount")}
            style={{ ...input_style(touched.amount && errors.amount), paddingLeft: "28px" }}
          />
        </div>
      </FormField>

      <FormField label="Datum" icon={<CalendarIcon />} error={touched.date && errors.date}>
        <input
          type="date" value={date}
          onChange={(e) => set_date(e.target.value)}
          onBlur={() => handle_blur("date")}
          style={input_style(touched.date && errors.date)}
        />
      </FormField>

      <FormField label="Notizen (optional)" icon={<NoteIcon />}>
        <textarea
          placeholder="z.B. Auszahlung auf Bankkonto, Turnier-Gewinn entnommen..."
          rows={3} value={notes}
          onChange={(e) => set_notes(e.target.value)}
          style={{ ...input_style(false), resize: "vertical", lineHeight: "1.5" }}
        />
      </FormField>

      {/* Vorschau */}
      {parsed_amount > 0 && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "12px", color: COLORS.textMuted }}>Bankroll verringert sich um</span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: COLORS.redText }}>
            −€{parsed_amount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Buttons */}
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
          onClick={handle_submit}
          disabled={status === "loading"}
          style={{
            flex: 2, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", padding: "10px", borderRadius: "8px",
            background: status === "loading" ? COLORS.redDim : COLORS.red,
            color: "#fff", fontSize: "14px", fontWeight: "700",
            border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            opacity: status === "loading" ? 0.8 : 1,
          }}
        >
          {status === "loading" ? "Wird gespeichert…" : <><MinusIcon /> Auszahlung speichern</>}
        </button>
      </div>
    </div>
  );
}

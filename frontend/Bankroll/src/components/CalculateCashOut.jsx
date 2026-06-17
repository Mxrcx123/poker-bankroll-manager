import { useState } from "react";

// File Author: Stefan Derler, User Story 11

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
  gold: "#f59e0b",
  goldDim: "#d97706",
  goldMuted: "#451a03",
  goldText: "#fbbf24",
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

const CalculatorIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <rect x="4" y="6" width="16" height="6" />
    <line x1="8" y1="15" x2="8" y2="18" />
    <line x1="16" y1="15" x2="16" y2="18" />
    <line x1="8" y1="18" x2="16" y2="18" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────────────────────────

function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function validateForm(buyIn, cashOut) {
  const errors = {};
  const buyInNum = parseNum(buyIn);
  const cashOutNum = parseNum(cashOut);

  if (!buyIn || buyIn.trim() === "") {
    errors.buyIn = "Buy-in ist erforderlich.";
  } else if (buyInNum <= 0) {
    errors.buyIn = "Buy-in muss positiv sein.";
  }

  if (!cashOut || cashOut.trim() === "") {
    errors.cashOut = "Cash-out ist erforderlich.";
  } else if (cashOutNum < 0) {
    errors.cashOut = "Cash-out darf nicht negativ sein.";
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormField Component
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CalculateCashOut({ sessionId, onSuccess, onCancel }) {
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState({});

  const buyInNum = parseNum(buyIn);
  const cashOutNum = parseNum(cashOut);
  const profit = cashOutNum - buyInNum;
  const profitPercent = buyInNum > 0 ? ((profit / buyInNum) * 100).toFixed(1) : 0;
  const isProfitable = profit >= 0;

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validateForm(buyIn, cashOut));
  }

  async function handleSubmit() {
    setTouched({ buyIn: true, cashOut: true });
    const errs = validateForm(buyIn, cashOut);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");

    // API Placeholder — später durch echte API-Aufrufe ersetzen
    // const res = await fetch(`/api/cash-session/session/${sessionId}/cash-out/${cashOutNum}`, {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    // });
    // const result = await res.json();

    await new Promise((r) => setTimeout(r, 700));

    const result = {
      sessionId: sessionId || Date.now(),
      buyIn: buyInNum,
      cashOut: cashOutNum,
      profit: profit,
      profitPercent: profitPercent,
    };

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setBuyIn("");
      setCashOut("");
      setTouched({});
      setErrors({});
      if (onSuccess) onSuccess(result);
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

  const buttonStyle = (disabled, variant = "primary") => {
    const baseStyle = {
      padding: "11px 18px", fontSize: "13px", fontWeight: "600",
      borderRadius: "8px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      textTransform: "uppercase", letterSpacing: "0.05em",
    };

    if (variant === "cancel") {
      return {
        ...baseStyle,
        background: COLORS.surface, color: COLORS.textMuted,
        opacity: disabled ? 0.5 : 1,
      };
    }

    return {
      ...baseStyle,
      background: disabled ? COLORS.textDim : COLORS.greenDim,
      color: COLORS.text,
      opacity: disabled ? 0.5 : 1,
    };
  };

  // Success Screen
  if (status === "success") {
    return (
      <div style={{
        background: COLORS.card, border: `1px solid ${isProfitable ? COLORS.green : COLORS.red}30`,
        borderRadius: "12px", padding: "40px 24px", textAlign: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: isProfitable ? COLORS.greenMuted : COLORS.redMuted,
          border: `2px solid ${isProfitable ? COLORS.green : COLORS.red}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", color: isProfitable ? COLORS.greenText : COLORS.redText,
        }}>
          <CheckIcon />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.text, marginBottom: "6px" }}>
          Cash-out gespeichert!
        </div>
        <div style={{
          fontSize: "13px", color: COLORS.textMuted, marginBottom: "20px",
        }}>
          Buy-in: €{buyInNum.toFixed(2)} | Cash-out: €{cashOutNum.toFixed(2)}
        </div>
        <div style={{
          fontSize: "18px", fontWeight: "700",
          color: isProfitable ? COLORS.greenText : COLORS.redText,
        }}>
          {isProfitable ? "+" : "−"}€{Math.abs(profit).toFixed(2)}
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: "12px", padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
          textTransform: "uppercase", color: COLORS.greenText, marginBottom: "4px",
        }}>
          Cashgame
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
          Cash-out berechnen
        </div>
      </div>

      {/* Buy-in Field */}
      <FormField label="Buy-in" icon={<ChipsIcon />} error={touched.buyIn && errors.buyIn}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: COLORS.textMuted, fontSize: "14px", pointerEvents: "none",
          }}>
            €
          </span>
          <input
            type="number" min="0.01" step="0.01" placeholder="0.00"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            onBlur={() => handleBlur("buyIn")}
            style={{ ...inputStyle(touched.buyIn && errors.buyIn), paddingLeft: "28px" }}
          />
        </div>
      </FormField>

      {/* Cash-out Field */}
      <FormField label="Cash-out" icon={<EuroIcon />} error={touched.cashOut && errors.cashOut}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: COLORS.textMuted, fontSize: "14px", pointerEvents: "none",
          }}>
            €
          </span>
          <input
            type="number" min="0" step="0.01" placeholder="0.00"
            value={cashOut}
            onChange={(e) => setCashOut(e.target.value)}
            onBlur={() => handleBlur("cashOut")}
            style={{ ...inputStyle(touched.cashOut && errors.cashOut), paddingLeft: "28px" }}
          />
        </div>
      </FormField>

      {/* Profit Preview */}
      {buyInNum > 0 && cashOutNum > 0 && (
        <div style={{
          background: COLORS.surface, borderRadius: "8px", padding: "16px",
          marginBottom: "20px", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "8px",
          }}>
            <span style={{ fontSize: "13px", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: "6px" }}>
              <CalculatorIcon /> Gewinn/Verlust
            </span>
            <span style={{
              fontSize: "16px", fontWeight: "700", color: isProfitable ? COLORS.greenText : COLORS.redText,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              {isProfitable ? <TrendUpIcon /> : <TrendDownIcon />}
              {isProfitable ? "+" : "−"}€{Math.abs(profit).toFixed(2)}
            </span>
          </div>
          <div style={{
            fontSize: "12px", color: COLORS.textMuted,
            textAlign: "right",
          }}>
            {profitPercent}% ROI
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ ...buttonStyle(false, "cancel"), flex: 1 }}
          >
            Abbrechen
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          style={{ ...buttonStyle(status === "loading"), flex: onCancel ? 1 : "auto", minWidth: "120px" }}
        >
          {status === "loading" ? "Wird gespeichert..." : "Speichern"}
        </button>
      </div>
    </div>
  );
}

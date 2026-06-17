import { useState } from "react";

// File Author: Stefan Derler, User Story 12

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

const ChipsIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </svg>
);

const EuroIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 7.5A6 6 0 1 0 17 16.5M3 10h10M3 14h10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const PlatformIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
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

const EditIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────────────────────────

function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function formatCurrency(value) {
  return `€${Math.abs(value).toFixed(2)}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, subtext, color = "text" }) {
  const colorMap = {
    green: COLORS.greenText,
    red: COLORS.redText,
    gold: COLORS.goldText,
    text: COLORS.text,
  };

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: "8px", padding: "16px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
        textTransform: "uppercase", color: COLORS.textDim, marginBottom: "8px",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        {icon}{label}
      </div>
      <div style={{
        fontSize: "20px", fontWeight: "700", color: colorMap[color],
        marginBottom: subtext ? "4px" : "0",
      }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
          {subtext}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CalculateCashgameProfit({
  sessionId,
  date = new Date().toISOString().split("T")[0],
  platform = "PokerStars",
  buyIn = 0,
  cashOut = 0,
  hours = 0,
  notes = "",
  onEdit,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const buyInNum = parseNum(buyIn);
  const cashOutNum = parseNum(cashOut);
  const profit = cashOutNum - buyInNum;
  const hoursNum = parseNum(hours);
  const roi = buyInNum > 0 ? ((profit / buyInNum) * 100).toFixed(1) : 0;
  const hourlyRate = hoursNum > 0 ? (profit / hoursNum).toFixed(2) : 0;

  const isProfitable = profit >= 0;
  const profitColor = isProfitable ? "green" : "red";

  const roiColor = roi >= 0 ? "green" : roi >= -20 ? "gold" : "red";

  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: "12px", padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: "20px",
      }}>
        <div>
          <div style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
            textTransform: "uppercase", color: COLORS.greenText, marginBottom: "4px",
          }}>
            Cashgame Session
          </div>
          <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
            Gewinn/Verlust-Übersicht
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: "6px", padding: "8px 12px", cursor: "pointer",
              color: COLORS.textMuted, fontSize: "12px",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.borderColor = COLORS.text}
            onMouseLeave={(e) => e.target.style.borderColor = COLORS.border}
          >
            <EditIcon />
            Bearbeiten
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px", marginBottom: "20px",
      }}>
        <StatCard
          icon={<EuroIcon />}
          label="Buy-in"
          value={formatCurrency(buyInNum)}
          color="text"
        />
        <StatCard
          icon={<EuroIcon />}
          label="Cash-out"
          value={formatCurrency(cashOutNum)}
          color="text"
        />
        <StatCard
          icon={<TrendUpIcon />}
          label="Gewinn/Verlust"
          value={isProfitable ? "+" : "−"}
          color={profitColor}
          subtext={formatCurrency(profit)}
        />
        <StatCard
          icon={<CalculatorIcon />}
          label="ROI"
          value={roi + "%"}
          color={roiColor}
          subtext={isProfitable ? "Positive Rendite" : "Negative Rendite"}
        />
      </div>

      {/* Session Details */}
      <div style={{
        background: COLORS.surface, borderRadius: "8px", padding: "16px",
        marginBottom: "20px", border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
              color: COLORS.textDim, marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <CalendarIcon /> Datum
            </div>
            <div style={{ fontSize: "14px", color: COLORS.text, fontWeight: "500" }}>
              {formatDate(date)}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
              color: COLORS.textDim, marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <PlatformIcon /> Plattform
            </div>
            <div style={{ fontSize: "14px", color: COLORS.text, fontWeight: "500" }}>
              {platform}
            </div>
          </div>

          {hoursNum > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
                color: COLORS.textDim, marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px",
              }}>
                <ClockIcon /> Spielzeit
              </div>
              <div style={{ fontSize: "14px", color: COLORS.text, fontWeight: "500" }}>
                {hoursNum.toFixed(1)}h
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Rate */}
      {hoursNum > 0 && (
        <div style={{
          background: COLORS.surface, borderRadius: "8px", padding: "16px",
          marginBottom: "20px", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: "13px", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: "6px",
            }}>
              <ClockIcon /> Stundensatz
            </span>
            <span style={{
              fontSize: "16px", fontWeight: "700", color: hourlyRate >= 0 ? COLORS.greenText : COLORS.redText,
            }}>
              {hourlyRate >= 0 ? "+" : "−"}€{Math.abs(hourlyRate).toFixed(2)}/h
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{
          background: COLORS.surface, borderRadius: "8px", padding: "16px",
          marginBottom: "20px", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
            color: COLORS.textDim, marginBottom: "8px",
          }}>
            Notizen
          </div>
          <div style={{ fontSize: "13px", color: COLORS.text, lineHeight: "1.5" }}>
            {notes}
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          width: "100%", padding: "12px", background: COLORS.surface,
          border: `1px solid ${COLORS.border}`, borderRadius: "8px",
          color: COLORS.textMuted, fontSize: "13px", cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = COLORS.border;
          e.target.style.color = COLORS.text;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = COLORS.surface;
          e.target.style.color = COLORS.textMuted;
        }}
      >
        {showDetails ? "Details ausblenden ▼" : "Berechnung anzeigen ▶"}
      </button>

      {/* Details Breakdown */}
      {showDetails && (
        <div style={{
          marginTop: "20px", padding: "16px", background: COLORS.surface,
          borderRadius: "8px", border: `1px solid ${COLORS.border}`,
          fontSize: "12px",
        }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
              color: COLORS.textDim, marginBottom: "12px",
            }}>
              Berechnung
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: "8px",
              rowGap: "10px",
            }}>
              <span style={{ color: COLORS.textMuted }}>Cash-out:</span>
              <span style={{ color: COLORS.text, textAlign: "right" }}>
                {formatCurrency(cashOutNum)}
              </span>

              <span style={{ color: COLORS.textMuted }}>− Buy-in:</span>
              <span style={{ color: COLORS.text, textAlign: "right" }}>
                −{formatCurrency(buyInNum)}
              </span>

              <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${COLORS.border}`, marginTop: "8px" }} />

              <span style={{
                color: COLORS.text, fontWeight: "600",
                fontSize: "13px",
              }}>
                = Gewinn/Verlust:
              </span>
              <span style={{
                color: isProfitable ? COLORS.greenText : COLORS.redText,
                textAlign: "right", fontWeight: "600", fontSize: "13px",
              }}>
                {isProfitable ? "+" : "−"}{formatCurrency(profit)}
              </span>
            </div>
          </div>

          {hoursNum > 0 && (
            <div style={{
              paddingTop: "12px", borderTop: `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
                color: COLORS.textDim, marginBottom: "8px",
              }}>
                Stundensatz-Berechnung
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: "8px",
                rowGap: "10px",
              }}>
                <span style={{ color: COLORS.textMuted }}>Gewinn:</span>
                <span style={{ color: COLORS.text, textAlign: "right" }}>
                  {formatCurrency(profit)}
                </span>

                <span style={{ color: COLORS.textMuted }}>÷ Stunden:</span>
                <span style={{ color: COLORS.text, textAlign: "right" }}>
                  {hoursNum.toFixed(1)}h
                </span>

                <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${COLORS.border}`, marginTop: "8px" }} />

                <span style={{
                  color: COLORS.text, fontWeight: "600",
                  fontSize: "13px",
                }}>
                  = Stundensatz:
                </span>
                <span style={{
                  color: hourlyRate >= 0 ? COLORS.greenText : COLORS.redText,
                  textAlign: "right", fontWeight: "600", fontSize: "13px",
                }}>
                  {hourlyRate >= 0 ? "+" : "−"}€{Math.abs(hourlyRate).toFixed(2)}/h
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

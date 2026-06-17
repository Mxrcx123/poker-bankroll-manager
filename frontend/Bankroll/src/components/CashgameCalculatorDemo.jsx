import { useState } from "react";
import CalculateCashOut from "./CalculateCashOut.jsx";
import CalculateCashgameProfit from "./CalculateCashgameProfit.jsx";

// File Author: Stefan Derler, User Story 11/12

// ─────────────────────────────────────────────────────────────────────────────
// Farben
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
  text: "#f0f6ff",
  textMuted: "#7a9cc4",
  textDim: "#3d5a8a",
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo Component — zeigt die Verwendung beider Komponenten
// ─────────────────────────────────────────────────────────────────────────────

export default function CashgameCalculatorDemo() {
  const [view, setView] = useState("calculator"); // "calculator" | "result"
  const [sessionData, setSessionData] = useState({
    date: new Date().toISOString().split("T")[0],
    platform: "PokerStars",
    buyIn: 0,
    cashOut: 0,
    hours: 0,
    notes: "",
  });

  function handleCashOutSuccess(result) {
    setSessionData((prev) => ({
      ...prev,
      buyIn: result.buyIn,
      cashOut: result.cashOut,
    }));
    setView("result");
  }

  function handleEditClick() {
    setView("calculator");
  }

  function handleCreateAnother() {
    setSessionData({
      date: new Date().toISOString().split("T")[0],
      platform: "PokerStars",
      buyIn: 0,
      cashOut: 0,
      hours: 0,
      notes: "",
    });
    setView("calculator");
  }

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: COLORS.text,
            marginBottom: "6px",
          }}>
            Cashgame Session Kalkulator
          </h1>
          <p style={{
            fontSize: "14px",
            color: COLORS.textMuted,
          }}>
            Berechne deine Cash-out und Gewinne/Verluste für Cash Game Sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: "12px",
        }}>
          <button
            onClick={() => setView("calculator")}
            style={{
              padding: "8px 16px",
              background: view === "calculator" ? COLORS.greenDim : "transparent",
              color: view === "calculator" ? COLORS.greenText : COLORS.textMuted,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            📊 Kalkulator
          </button>
          <button
            onClick={() => setView("result")}
            disabled={sessionData.buyIn === 0 && sessionData.cashOut === 0}
            style={{
              padding: "8px 16px",
              background: view === "result" ? COLORS.greenDim : "transparent",
              color: view === "result" ? COLORS.greenText : COLORS.textMuted,
              border: "none",
              borderRadius: "6px",
              cursor: sessionData.buyIn === 0 && sessionData.cashOut === 0 ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
              opacity: sessionData.buyIn === 0 && sessionData.cashOut === 0 ? 0.5 : 1,
            }}
          >
            📈 Ergebnis
          </button>
        </div>

        {/* Content */}
        {view === "calculator" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "30px",
          }}>
            {/* Calculator Component */}
            <div>
              <CalculateCashOut
                sessionId="session-001"
                onSuccess={handleCashOutSuccess}
                onCancel={() => console.log("Cancelled")}
              />
            </div>

            {/* Session Info Form */}
            <div style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.greenText,
                  marginBottom: "4px",
                }}>
                  Sessiondetails
                </div>
                <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.text }}>
                  Zusätzliche Informationen
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  color: COLORS.textDim,
                  marginBottom: "6px",
                }}>
                  Plattform
                </label>
                <select
                  value={sessionData.platform}
                  onChange={(e) =>
                    setSessionData((p) => ({ ...p, platform: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.text,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <option>PokerStars</option>
                  <option>GGPoker</option>
                  <option>888poker</option>
                  <option>Bet365</option>
                  <option>Live Cash Game</option>
                </select>
              </div>

              {/* Date */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  color: COLORS.textDim,
                  marginBottom: "6px",
                }}>
                  Datum
                </label>
                <input
                  type="date"
                  value={sessionData.date}
                  onChange={(e) =>
                    setSessionData((p) => ({ ...p, date: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.text,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  }}
                />
              </div>

              {/* Hours */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  color: COLORS.textDim,
                  marginBottom: "6px",
                }}>
                  Spieldauer (Stunden) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="z.B. 3.5"
                  value={sessionData.hours}
                  onChange={(e) =>
                    setSessionData((p) => ({ ...p, hours: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.text,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "0" }}>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  color: COLORS.textDim,
                  marginBottom: "6px",
                }}>
                  Notizen
                </label>
                <textarea
                  placeholder="z.B. Gutes Spiel, ..."
                  value={sessionData.notes}
                  onChange={(e) =>
                    setSessionData((p) => ({ ...p, notes: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.text,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                    minHeight: "120px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "20px",
            marginBottom: "30px",
          }}>
            {/* Profit Component */}
            <CalculateCashgameProfit
              sessionId="session-001"
              date={sessionData.date}
              platform={sessionData.platform}
              buyIn={sessionData.buyIn}
              cashOut={sessionData.cashOut}
              hours={sessionData.hours}
              notes={sessionData.notes}
              onEdit={handleEditClick}
            />

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
            }}>
              <button
                onClick={handleCreateAnother}
                style={{
                  padding: "12px 24px",
                  background: COLORS.greenDim,
                  color: COLORS.greenText,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.green;
                  e.target.style.color = "#0d1520";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.greenDim;
                  e.target.style.color = COLORS.greenText;
                }}
              >
                ➕ Neue Session
              </button>
            </div>
          </div>
        )}

        {/* Example Sessions */}
        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          padding: "20px",
          marginTop: "40px",
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.greenText,
            marginBottom: "12px",
          }}>
            📚 Beispiele
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}>
            <CalculateCashgameProfit
              sessionId="example-1"
              date="2026-04-07"
              platform="PokerStars"
              buyIn={50}
              cashOut={118}
              hours={4.5}
              notes="Gutes Spiel, Position gut genutzt"
            />
            <CalculateCashgameProfit
              sessionId="example-2"
              date="2026-04-05"
              platform="GGPoker"
              buyIn={100}
              cashOut={85}
              hours={2}
              notes="Bad beats, nicht optimal gespielt"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

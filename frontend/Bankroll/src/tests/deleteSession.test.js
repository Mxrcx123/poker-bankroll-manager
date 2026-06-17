// ─────────────────────────────────────────────────────────────────────────────
// Tests für deleteSession
// User Story: Als Pokerspieler möchte ich eine Session löschen,
//             damit fehlerhafte Einträge entfernt werden können.
// Acceptance Criteria:
//   Given eine Session existiert
//   When der Benutzer die Session löscht
//   Then wird sie aus der Datenbank (localStorage) entfernt
// ─────────────────────────────────────────────────────────────────────────────

// Hilfsfunktionen direkt aus PokerBankrollManager übernommen (da nicht exportiert)
function deleteSession(sessions, id) {
  return sessions.filter((s) => s.id !== id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Testdaten
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_SESSIONS = [
  { id: 1, date: "2026-04-07", game_mode: "cashgame",   platform: "PokerStars", buy_in: 50,  cash_out: 118, profit: 68,  notes: "" },
  { id: 2, date: "2026-04-05", game_mode: "tournament", platform: "GGPoker",    buy_in: 22,  fee: 2, rebuys: 0, winnings: 0, profit: -24, notes: "Bad beat" },
  { id: 3, date: "2026-04-03", game_mode: "cashgame",   platform: "PokerStars", buy_in: 100, cash_out: 240, profit: 140, notes: "" },
];

// ─────────────────────────────────────────────────────────────────────────────
// deleteSession – Kernlogik
// ─────────────────────────────────────────────────────────────────────────────

describe("deleteSession – Kernlogik", () => {
  test("Löscht eine Session anhand der ID", () => {
    const result = deleteSession(SAMPLE_SESSIONS, 2);
    expect(result).toHaveLength(2);
    expect(result.find((s) => s.id === 2)).toBeUndefined();
  });

  test("Behält alle anderen Sessions bei", () => {
    const result = deleteSession(SAMPLE_SESSIONS, 2);
    expect(result.find((s) => s.id === 1)).toBeDefined();
    expect(result.find((s) => s.id === 3)).toBeDefined();
  });

  test("Löscht die erste Session korrekt", () => {
    const result = deleteSession(SAMPLE_SESSIONS, 1);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
  });

  test("Löscht die letzte Session korrekt", () => {
    const result = deleteSession(SAMPLE_SESSIONS, 3);
    expect(result).toHaveLength(2);
    expect(result.find((s) => s.id === 3)).toBeUndefined();
  });

  test("Gibt leeres Array zurück wenn einzige Session gelöscht wird", () => {
    const single = [SAMPLE_SESSIONS[0]];
    const result = deleteSession(single, 1);
    expect(result).toHaveLength(0);
  });

  test("Gibt unverändertes Array zurück wenn ID nicht existiert", () => {
    const result = deleteSession(SAMPLE_SESSIONS, 999);
    expect(result).toHaveLength(3);
  });

  test("Gibt leeres Array zurück wenn Eingabe leer ist", () => {
    const result = deleteSession([], 1);
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteSession – Acceptance Criteria
// Given a session exists / When deleted / Then removed from storage
// ─────────────────────────────────────────────────────────────────────────────

describe("deleteSession – Acceptance Criteria", () => {
  test("Given eine Session existiert – When sie gelöscht wird – Then ist sie nicht mehr in der Liste", () => {
    // Given
    const sessions = [...SAMPLE_SESSIONS];
    const targetId = 1;
    expect(sessions.find((s) => s.id === targetId)).toBeDefined();

    // When
    const updated = deleteSession(sessions, targetId);

    // Then
    expect(updated.find((s) => s.id === targetId)).toBeUndefined();
  });

  test("Daten werden nach dem Löschen korrekt in localStorage gespeichert", () => {
    // Simulated localStorage
    const storage = {};
    const mockLocalStorage = {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, val) => { storage[key] = val; },
    };

    // Setup: Session in Storage schreiben
    mockLocalStorage.setItem("bankroll_sessions", JSON.stringify(SAMPLE_SESSIONS));

    // When: Session löschen und speichern
    const stored = JSON.parse(mockLocalStorage.getItem("bankroll_sessions"));
    const updated = deleteSession(stored, 2);
    mockLocalStorage.setItem("bankroll_sessions", JSON.stringify(updated));

    // Then: Daten im Storage sind aktualisiert
    const afterDelete = JSON.parse(mockLocalStorage.getItem("bankroll_sessions"));
    expect(afterDelete).toHaveLength(2);
    expect(afterDelete.find((s) => s.id === 2)).toBeUndefined();
  });

  test("Andere Sessions bleiben nach dem Löschen unverändert erhalten", () => {
    const updated = deleteSession(SAMPLE_SESSIONS, 1);
    const remaining = updated.find((s) => s.id === 2);
    expect(remaining).toMatchObject({
      id: 2,
      date: "2026-04-05",
      platform: "GGPoker",
      profit: -24,
    });
  });
});

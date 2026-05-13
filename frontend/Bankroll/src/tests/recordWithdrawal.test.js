// ─────────────────────────────────────────────────────────────────────────────
// Tests für RecordWithdrawal
// Getestet wird: validateForm (Betrag, Datum, Bankroll-Limit)
// ─────────────────────────────────────────────────────────────────────────────

// validateForm direkt aus der Datei übernommen (da nicht exportiert)
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
// Betrag-Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("RecordWithdrawal – validateForm – Betrag", () => {
  const today = "2026-04-01";

  test("Fehler wenn Betrag leer ist", () => {
    const errors = validateForm("", today, 500);
    expect(errors.amount).toBe("Betrag ist erforderlich.");
  });

  test("Fehler wenn Betrag nur Leerzeichen enthält", () => {
    const errors = validateForm("   ", today, 500);
    expect(errors.amount).toBe("Betrag ist erforderlich.");
  });

  test("Fehler wenn Betrag negativ ist", () => {
    const errors = validateForm("-10", today, 500);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag gleich 0 ist", () => {
    const errors = validateForm("0", today, 500);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag kein gültiger Wert ist (Text)", () => {
    const errors = validateForm("xyz", today, 500);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag über 100.000 liegt", () => {
    const errors = validateForm("100001", today, 200000);
    expect(errors.amount).toBe("Maximaler Betrag: €100.000");
  });

  test("Kein Fehler bei normalem gültigen Betrag", () => {
    const errors = validateForm("100", today, 500);
    expect(errors.amount).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bankroll-Limit
// ─────────────────────────────────────────────────────────────────────────────

describe("RecordWithdrawal – validateForm – Bankroll-Limit", () => {
  const today = "2026-04-01";

  test("Fehler wenn Auszahlung die Bankroll überschreitet", () => {
    const errors = validateForm("600", today, 500);
    expect(errors.amount).toBe("Betrag überschreitet die aktuelle Bankroll (€500.00).");
  });

  test("Kein Fehler wenn Auszahlung exakt der Bankroll entspricht", () => {
    const errors = validateForm("500", today, 500);
    expect(errors.amount).toBeUndefined();
  });

  test("Kein Fehler wenn Auszahlung unter der Bankroll liegt", () => {
    const errors = validateForm("100", today, 500);
    expect(errors.amount).toBeUndefined();
  });

  test("Kein Fehler wenn currentBankroll nicht übergeben wird (undefined)", () => {
    const errors = validateForm("999", today, undefined);
    expect(errors.amount).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Datum-Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("RecordWithdrawal – validateForm – Datum", () => {
  test("Fehler wenn Datum fehlt (undefined)", () => {
    const errors = validateForm("100", undefined, 500);
    expect(errors.date).toBe("Datum ist erforderlich.");
  });

  test("Fehler wenn Datum leer ist", () => {
    const errors = validateForm("100", "", 500);
    expect(errors.date).toBe("Datum ist erforderlich.");
  });

  test("Kein Fehler bei gültigem Datum", () => {
    const errors = validateForm("100", "2026-03-15", 500);
    expect(errors.date).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kombinierte Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("RecordWithdrawal – validateForm – kombiniert", () => {
  test("Kein Fehler bei vollständig gültigen Eingaben", () => {
    const errors = validateForm("250", "2026-04-01", 500);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("Zwei Fehler wenn Betrag und Datum beide fehlen", () => {
    const errors = validateForm("", "", 500);
    expect(errors.amount).toBeDefined();
    expect(errors.date).toBeDefined();
  });
});

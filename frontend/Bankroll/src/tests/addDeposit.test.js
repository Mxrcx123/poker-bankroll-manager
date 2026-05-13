// ─────────────────────────────────────────────────────────────────────────────
// Tests für AddDeposit
// Getestet wird: validateForm (die zentrale Validierungslogik)
// ─────────────────────────────────────────────────────────────────────────────

// validateForm direkt aus der Datei übernommen (da nicht exportiert)
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

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Betrag-Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("AddDeposit – validateForm – Betrag", () => {
  const today = getTodayString();

  test("Fehler wenn Betrag leer ist", () => {
    const errors = validateForm("", today);
    expect(errors.amount).toBe("Betrag ist erforderlich.");
  });

  test("Fehler wenn Betrag nur Leerzeichen enthält", () => {
    const errors = validateForm("   ", today);
    expect(errors.amount).toBe("Betrag ist erforderlich.");
  });

  test("Fehler wenn Betrag negativ ist", () => {
    const errors = validateForm("-5", today);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag gleich 0 ist", () => {
    const errors = validateForm("0", today);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag kein gültiger Wert ist (Text)", () => {
    const errors = validateForm("abc", today);
    expect(errors.amount).toBe("Betrag muss eine positive Zahl sein.");
  });

  test("Fehler wenn Betrag über 100.000 liegt", () => {
    const errors = validateForm("100001", today);
    expect(errors.amount).toBe("Maximaler Betrag: €100.000");
  });

  test("Kein Fehler bei genau 100.000", () => {
    const errors = validateForm("100000", today);
    expect(errors.amount).toBeUndefined();
  });

  test("Kein Fehler bei normalem positiven Betrag", () => {
    const errors = validateForm("50", today);
    expect(errors.amount).toBeUndefined();
  });

  test("Kein Fehler bei Dezimalwert", () => {
    const errors = validateForm("12.50", today);
    expect(errors.amount).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Datum-Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("AddDeposit – validateForm – Datum", () => {
  test("Fehler wenn Datum fehlt (undefined)", () => {
    const errors = validateForm("50", undefined);
    expect(errors.date).toBe("Datum ist erforderlich.");
  });

  test("Fehler wenn Datum leer ist", () => {
    const errors = validateForm("50", "");
    expect(errors.date).toBe("Datum ist erforderlich.");
  });

  test("Kein Fehler bei gültigem Datum", () => {
    const errors = validateForm("50", "2026-01-15");
    expect(errors.date).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kombinierte Validierung
// ─────────────────────────────────────────────────────────────────────────────

describe("AddDeposit – validateForm – kombiniert", () => {
  test("Kein Fehler bei gültigem Betrag und Datum", () => {
    const errors = validateForm("200", "2026-04-01");
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("Zwei Fehler wenn sowohl Betrag als auch Datum fehlen", () => {
    const errors = validateForm("", "");
    expect(errors.amount).toBeDefined();
    expect(errors.date).toBeDefined();
  });
});

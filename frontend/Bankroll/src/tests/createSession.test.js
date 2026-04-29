// ─────────────────────────────────────────────────────────────────────────────
// Tests für CreateSession
// Getestet wird: calcProfit und validateForm
// ─────────────────────────────────────────────────────────────────────────────

// Hilfsfunktionen direkt aus der Datei übernommen (da nicht exportiert)
function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function calcProfit(mode, fields) {
  if (mode === "cashgame") {
    return parseNum(fields.cash_out) - parseNum(fields.buy_in);
  }
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
// parseNum
// ─────────────────────────────────────────────────────────────────────────────

describe("CreateSession – parseNum", () => {
  test("Gibt 0 zurück für leeren String", () => {
    expect(parseNum("")).toBe(0);
  });

  test("Gibt 0 zurück für Text", () => {
    expect(parseNum("abc")).toBe(0);
  });

  test("Gibt korrekte Zahl zurück für gültigen String", () => {
    expect(parseNum("42.5")).toBe(42.5);
  });

  test("Gibt 0 zurück für undefined", () => {
    expect(parseNum(undefined)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcProfit – Cashgame
// ─────────────────────────────────────────────────────────────────────────────

describe("CreateSession – calcProfit – Cashgame", () => {
  test("Positiver Profit wenn cash_out größer als buy_in", () => {
    const profit = calcProfit("cashgame", { buy_in: "100", cash_out: "150" });
    expect(profit).toBe(50);
  });

  test("Negativer Profit wenn cash_out kleiner als buy_in", () => {
    const profit = calcProfit("cashgame", { buy_in: "100", cash_out: "60" });
    expect(profit).toBe(-40);
  });

  test("Profit ist 0 wenn buy_in gleich cash_out", () => {
    const profit = calcProfit("cashgame", { buy_in: "100", cash_out: "100" });
    expect(profit).toBe(0);
  });

  test("Profit ist negativ wenn cash_out 0 ist (vollständiger Verlust)", () => {
    const profit = calcProfit("cashgame", { buy_in: "200", cash_out: "0" });
    expect(profit).toBe(-200);
  });

  test("Profit mit Dezimalwerten korrekt berechnet", () => {
    const profit = calcProfit("cashgame", { buy_in: "50.50", cash_out: "75.25" });
    expect(profit).toBeCloseTo(24.75);
  });

  test("Fehlende Felder werden als 0 behandelt", () => {
    const profit = calcProfit("cashgame", { buy_in: "100", cash_out: "" });
    expect(profit).toBe(-100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcProfit – Turnier
// ─────────────────────────────────────────────────────────────────────────────

describe("CreateSession – calcProfit – Turnier", () => {
  test("Positiver Profit wenn Gewinn größer als Gesamtkosten", () => {
    const profit = calcProfit("tournament", {
      buy_in: "100", fee: "10", rebuys: "0", addons: "0", winnings: "500",
    });
    expect(profit).toBe(390);
  });

  test("Negativer Profit wenn kein Gewinn (Bust-out)", () => {
    const profit = calcProfit("tournament", {
      buy_in: "50", fee: "5", rebuys: "0", addons: "0", winnings: "0",
    });
    expect(profit).toBe(-55);
  });

  test("Rebuys und Add-ons werden korrekt abgezogen", () => {
    const profit = calcProfit("tournament", {
      buy_in: "100", fee: "10", rebuys: "50", addons: "20", winnings: "300",
    });
    expect(profit).toBe(120); // 300 - 100 - 10 - 50 - 20 = 120
  });

  test("Profit ist 0 wenn Gewinn exakt die Kosten deckt", () => {
    const profit = calcProfit("tournament", {
      buy_in: "100", fee: "10", rebuys: "0", addons: "0", winnings: "110",
    });
    expect(profit).toBe(0);
  });

  test("Leere optionale Felder (fee, rebuys, addons) werden als 0 behandelt", () => {
    const profit = calcProfit("tournament", {
      buy_in: "100", fee: "", rebuys: "", addons: "", winnings: "200",
    });
    expect(profit).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateForm – Cashgame
// ─────────────────────────────────────────────────────────────────────────────

describe("CreateSession – validateForm – Cashgame", () => {
  const validFields = { date: "2026-04-01", buy_in: "100", cash_out: "150" };

  test("Kein Fehler bei gültigen Cashgame-Daten", () => {
    const errors = validateForm("cashgame", validFields);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("Fehler wenn Datum fehlt", () => {
    const errors = validateForm("cashgame", { ...validFields, date: "" });
    expect(errors.date).toBeDefined();
  });

  test("Fehler wenn buy_in fehlt", () => {
    const errors = validateForm("cashgame", { ...validFields, buy_in: "" });
    expect(errors.buy_in).toBe("Buy-in ist erforderlich.");
  });

  test("Fehler wenn buy_in negativ ist", () => {
    const errors = validateForm("cashgame", { ...validFields, buy_in: "-10" });
    expect(errors.buy_in).toBe("Buy-in muss positiv sein.");
  });

  test("Fehler wenn buy_in gleich 0 ist", () => {
    const errors = validateForm("cashgame", { ...validFields, buy_in: "0" });
    expect(errors.buy_in).toBe("Buy-in muss positiv sein.");
  });

  test("Fehler wenn cash_out fehlt", () => {
    const errors = validateForm("cashgame", { ...validFields, cash_out: "" });
    expect(errors.cash_out).toBe("Cash-out ist erforderlich.");
  });

  test("Fehler wenn cash_out negativ ist", () => {
    const errors = validateForm("cashgame", { ...validFields, cash_out: "-5" });
    expect(errors.cash_out).toBe("Cash-out darf nicht negativ sein.");
  });

  test("Kein Fehler wenn cash_out 0 ist (vollständiger Verlust)", () => {
    const errors = validateForm("cashgame", { ...validFields, cash_out: "0" });
    expect(errors.cash_out).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateForm – Turnier
// ─────────────────────────────────────────────────────────────────────────────

describe("CreateSession – validateForm – Turnier", () => {
  const validFields = {
    date: "2026-04-01", buy_in: "100", fee: "10",
    rebuys: "0", addons: "0", winnings: "300",
  };

  test("Kein Fehler bei gültigen Turnier-Daten", () => {
    const errors = validateForm("tournament", validFields);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("Fehler wenn winnings fehlt", () => {
    const errors = validateForm("tournament", { ...validFields, winnings: "" });
    expect(errors.winnings).toBe("Gewinn/Auszahlung ist erforderlich.");
  });

  test("Fehler wenn winnings negativ ist", () => {
    const errors = validateForm("tournament", { ...validFields, winnings: "-50" });
    expect(errors.winnings).toBe("Wert darf nicht negativ sein.");
  });

  test("Kein Fehler wenn winnings 0 ist (Bust-out)", () => {
    const errors = validateForm("tournament", { ...validFields, winnings: "0" });
    expect(errors.winnings).toBeUndefined();
  });

  test("cash_out wird im Turnier-Modus nicht validiert", () => {
    const errors = validateForm("tournament", { ...validFields, cash_out: "" });
    expect(errors.cash_out).toBeUndefined();
  });

  test("Fehler wenn buy_in fehlt", () => {
    const errors = validateForm("tournament", { ...validFields, buy_in: "" });
    expect(errors.buy_in).toBeDefined();
  });
});

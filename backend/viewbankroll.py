from datetime import date

class BankrollEvent:
    def __init__(self, id, type, amount, date):
        self.id = id
        self.type = type
        self.amount = amount
        self.date = date

    def __str__(self):
        return f"{self.date} | {self.type} | {self.amount}€"


# Beispiel-Daten
events = [
    BankrollEvent(1, "deposit", 100, date(2026, 3, 20)),
    BankrollEvent(2, "withdrawal", 80, date(2026, 3, 24)),
    BankrollEvent(3, "deposit", 200, date(2026, 3, 22)),
]


def get_bankroll_history(events):
    # nach Datum sortieren (neueste zuerst)
    sorted_events = sorted(events, key=lambda e: e.date, reverse=True)
    return sorted_events


def show_history():
    history = get_bankroll_history(events)

    if not history:
        print("Keine Events vorhanden")
        return

    for event in history:
        print(event)


# Aufruf
show_history()
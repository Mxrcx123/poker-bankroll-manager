# Poker Bankroll Manager  
*(optionale Erweiterung: Blackjack Strategy Trainer)*

---

## Projektübersicht

Das Projekt umfasst die Entwicklung eines **Poker Bankroll Managers** mit Fokus auf strukturierte Datenerfassung, automatische Ergebnisberechnung, statistische Auswertung und Reporting.

Ziel ist es, Poker-Aktivitäten vollständig zu dokumentieren und daraus **nachvollziehbare Profit-/Loss-Statistiken** sowie **Zeit- und Spielmodus-Auswertungen** zu erzeugen.

Optional wird das System um einen **Blackjack Strategy Trainer** erweitert werden, der als Lernwerkzeug dient.  
Der Blackjack-Trainer ist **nicht Teil des Pflichtumfangs**, Optional nach beendigung des Br-Manager.

---

## Projektziel

- Verwaltung einer Poker-Bankroll
- Erfassung von Einzahlungen und Auszahlungen
- Dokumentation von Poker-Sessions und Turnieren
- Automatische Berechnung von Profit und Gesamtstatistiken
- Darstellung der Ergebnisse in einer intuitiv-übersichtlichen Benutzeroberfläche
- Export und Reporting der Daten
- Modulare und erweiterbare Softwarearchitektur

---

## Projektumfang & Priorisierung

### Pflichtumfang
- Vollständiger Poker Bankroll Manager
- Statistik- und Analysefunktionen
- Reporting und Exporte
- Benutzeroberfläche
- Dokumentation und Qualitätssicherung

### Optional
- Blackjack Strategy Trainer  
  (Bewertung des Spiels bei unterschiedlichen Händen)

---

## Übersicht

Das Projekt gliedert sich in folgende Bereiche:

- Datenbank & Datenmodell
- Businesslogik (Bankroll & Poker)
- Statistik- und Analyse-Engine
- Backend / API
- Frontend / Benutzeroberfläche
- Reporting & Exporte
- Qualitätssicherung & Dokumentation

---

## Kernmodul: Poker Bankroll Manager

Der Poker Bankroll Manager bildet den **zentralen Bestandteil** des Projekts und deckt alle wesentlichen Funktionen zur Verwaltung und Analyse einer Poker-Bankroll ab.

---

### 1. Bankroll-Verwaltung

- Erfassung von Einzahlungen (Deposits) und Auszahlungen (Withdraws)
- Historische Nachvollziehbarkeit aller Bankroll-Änderungen
- Trennung von Bankroll-Events und Poker-Ergebnissen
- Automatische Berechnung der aktuellen Bankroll
- Validierung von Beträgen und Zeitpunkten

---

### 2. Poker-Sessions & Turniere

- Verwaltung von Poker-Sessions mit klar definiertem Lebenszyklus
- Unterstützung von Cashgame- und Turnierformaten
- Erfassung relevanter Spieldaten:
  - Buy-in und Cash-out
  - Turnier-Buy-in und Fee getrennt
  - Rebuys und Add-ons
- Abschluss von Sessions mit automatischer Ergebnisberechnung
- Ergänzende Informationen wie Notizen und Tags

---

### 3. Businesslogik & Ergebnisberechnung

- Automatische Berechnung von Profit/Loss pro Session
- Korrekte Verrechnung von Turnierkosten und Gewinnen
- Aggregation aller Ergebnisse zur Gesamtbankroll
- Validierungen zur Sicherstellung konsistenter Daten
- Zentrale Logik zur Vermeidung manueller Fehler

---

### 4. Statistik & Analyse

- Darstellung der Bankroll-Entwicklung über Zeit
- Gesamtstatistiken (Profit, Anzahl Sessions, Volumen)
- Zeitbasierte Auswertungen (Monat, Jahr, frei wählbarer Zeitraum)
- Spielmodus-spezifische Statistiken (Cashgame vs. Turniere)
- Analyse der gespielten Sessions pro Zeitraum

---

### 5. Reporting & Exporte

- Erstellung von Monats- und Zeitraum-Reports
- Export von Daten in strukturierter Form (z. B. CSV/PDF)
- Aufbereitung der Ergebnisse für externe Weiterverarbeitung
- Vergleich von Zeiträumen (z. B. Monat zu Monat)

---

### 6. Benutzeroberfläche (Frontend)

- Übersichtliches Dashboard mit zentralen Kennzahlen
- Masken zur Erfassung und Verwaltung aller Daten
- Filter- und Suchfunktionen
- Übersichtliche Darstellung von Statistiken und Reports
- Gestaltung mit Fokus auf Benutzerfreundlichkeit und Erweiterbarkeit

---

### 7. Softwarequalität & Dokumentation

- Modularer Aufbau der Anwendung
- Klare Trennung von Datenhaltung, Logik und Darstellung
- Tests für zentrale Berechnungen
- Technische Dokumentation (Architektur, Setup)
- Benutzerhandbuch
- Nachvollziehbarer Projektverlauf

---

## Optionales Modul: Blackjack Strategy Trainer (Bonus)

Der Blackjack Strategy Trainer ist ein **optionales Erweiterungsmodul**, das nur umgesetzt wird, wenn der Poker-Kern vollständig abgeschlossen ist.

### Ziel
Training und Analyse optimaler Entscheidungsfindung im Blackjack.

### Funktionsumfang
- Präsentation einzelner Entscheidungssituationen:
  - Spielerhand
  - Dealer-Upcard
- Bewertung der Benutzerentscheidung anhand vordefinierter Basic-Strategy-Regeln
- Ausgabe von Feedback und kurzen Erklärungen
- Statistik über den Trainingsfortschritt

### Abgrenzung
- Kein vollständiges Blackjack-Spiel
- Keine Echtgeldsimulation
- Keine Auswirkung auf den Poker-Kern

---

## Projektorganisation & Zusammenarbeit

Das Projekt ist von Beginn an modular aufgebaut, sodass die einzelnen Funktionsbereiche klar getrennt bearbeitet werden können.  
Die Aufgaben sind so strukturiert dass Einzelarbeit als auch Zusammenarbeit in kleinen Gruppen möglich ist.

Jedes Teammitglied dokumentiert seinen eigenen Arbeitsbereich, zusätzlich zur einer zentrale Projektdokumentation 

## Ergebnis

Am Ende des Projekts steht:
- eine funktionsfähige Anwendung
- ein strukturiertes und dokumentiertes Softwaresystem
- eine nachvollziehbare Umsetzung aller Anforderungen
- eine Präsentation der Ergebnisse

---

## Zusammenfassung

- Der Arbeitsumfang sollte genug für 1 Semester betragen

- Poker Bankroll Manager ist der **klare Kern** des Projekts
- Blackjack Strategy Trainer ist ein **sauber abgegrenzter Bonus**
- Erweiterbarkeit und Softwarequalität stehen im Vordergrund

# Poker Bankroll Manager

## Projektübersicht

Der Poker Bankroll Manager ist eine Webanwendung zur Verwaltung und Analyse einer Poker-Bankroll. Benutzer können Einzahlungen, Auszahlungen und Pokersessions erfassen sowie die Entwicklung ihrer Bankroll über einen längeren Zeitraum verfolgen.

Das Projekt wurde im Team entwickelt und verwendet eine Client-Server-Architektur mit getrenntem Frontend und Backend.

---

## Ziele des Projekts

- Verwaltung der persönlichen Poker-Bankroll
- Erfassung von Einzahlungen und Auszahlungen
- Dokumentation von Pokersessions
- Statistische Auswertung der Ergebnisse
- Übersichtliche Darstellung der Bankrollentwicklung
- Benutzerfreundliche Weboberfläche

---

## Systemarchitektur

Das Projekt besteht aus folgenden Hauptkomponenten:

### Frontend

Das Frontend stellt die Benutzeroberfläche bereit und ermöglicht eine einfache und übersichtliche Interaktion mit dem System.

Aufgaben:

- Darstellung der Daten
- Formulare für Einzahlungen und Sessions
- Kommunikation mit dem Backend über REST-APIs
- Visualisierung von Statistiken

Technologien:

- React
- JavaScript
- npm

---

### Backend

Das Backend verarbeitet die Geschäftslogik und stellt die nötigen REST-Schnittstellen bereit.

Aufgaben:

- Verarbeitung von API-Anfragen
- Validierung der Daten
- Datenbankzugriffe
- Berechnung von Statistiken

Technologien:

- Python
- FastAPI
- Pydantic

---

### Datenbank

Die Datenbank speichert dauerhaft alle relevanten Informationen.

Gespeicherte Daten:

- Benutzer
- Deposits
- Withdrawals
- Pokersessions
- Bankrollhistorie

---

## Projektstruktur

```text
backend/
    api/
    crud/
    schema/

database/

frontend/
    Bankroll/

tests/
docs/
```

---

## Zentrale Funktionen

### Einzahlung (Deposit)

Benutzer können Einzahlungen in ihre Bankroll erfassen.

Gespeicherte Informationen:

- Betrag
- Datum
- Beschreibung

---

### Auszahlung (Withdrawal)

Auszahlungen können dokumentiert werden.

Gespeicherte Informationen:

- Betrag
- Datum
- Beschreibung

---

### Pokersessions

Für jede Session können verschiedene Informationen gespeichert werden:

- Datum
- Spieltyp
- Einsatz
- Gewinn oder Verlust
- Dauer der Session
- Notizen

---

### Bankrollberechnung

Die aktuelle Bankroll wird automatisch aus allen Transaktionen berechnet.

Formel:

```text
Bankroll = Deposits - Withdrawals + Sessionergebnisse
```

---

## API-Kommunikation

Die Kommunikation zwischen Frontend und Backend erfolgt über REST-APIs.

Beispiel:

```text
Frontend → API → Backend → Datenbank
                         ↓
Frontend ← JSON ← Backend
```

---

## Entwicklungsprozess

Das Projekt wurde mit Git und GitHub verwaltet.

Verwendete Branches:

- main
- Staging
- frontend
- Almer
- Rechberger
- Derler
- Pucher
- Haas
- Handler
- Jafari
- Testing

Zur Integration der einzelnen Entwicklungsstände wurde ein gemeinsamer Staging-Branch verwendet (mehr oder weniger).

---

## Herausforderungen während der Entwicklung

Während der Entwicklung traten mehrere Herausforderungen auf. Da mehrere Entwickler gleichzeitig an verschiedenen Features arbeiteten, entstanden unterschiedliche Entwicklungsstände und zahlreiche Branches, mehrere Ordnerstrukturen und und und.

Besonders aufwendig waren:

- Merge-Konflikte zwischen verschiedenen Branches
- Unterschiedliche Implementierungen der ursprünglichen Ordnerstruktur
- Vereinheitlichung der Projektstruktur
- Wiederherstellung eines lauffähigen Gesamtsystems

---

## Entwicklungsaufwand und Integration

Ein besonders aufwendiger Teil war die Zusammenführung der einzelnen Entwicklungsstände der Teammitglieder. Da mehrere Entwickler gleichzeitig an unterschiedlichen Features gearbeitet haben, entstanden zahlreiche Branches mit unterschiedlichen Projektständen.

Die größte Herausforderung bestand darin, die Branches zu analysieren, zusammenzuführen und auftretende Konflikte zu beheben. Besonders bei der Integration von Frontend und Backend traten mehrfach Probleme auf, da verschiedene Entwickler an ähnlichen Komponenten gearbeitet haben.

Während der Integration mussten unter anderem:

- Merge-Konflikte gelöst werden,
- Änderungen verschiedener Entwickler verglichen werden,
- inkompatible Codeabschnitte angepasst werden weil ein abhängiger teil nicht da war z.b.,
- Frontend und Backend miteinander verbunden werden,
- sowie die Funktionsfähigkeit des Gesamtsystems sichergestellt werden.

Ein großer Teil der Projektarbeit bestand daher nicht nur aus dem Schreiben von neuem Code, sondern auch aus dem Integrieren, Testen und Debuggen bereits bestehender Funktionen.

Dadurch konnte am Ende eine gemeinsame und funktionierende Version des Projekts erstellt werden.

---

## Qualitätssicherung

Zur Sicherstellung der Funktionsfähigkeit wurden verschiedene Maßnahmen durchgeführt:

- Manuelle Tests
- Merge-Tests
- Code-Reviews
- Konfliktbehebung während der Integration
- Testen der API-Endpunkte (nach dem 1. sprint)
- Überprüfung der Kommunikation zwischen Frontend und Backend

---

## Installation

### Backend starten

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend starten

```bash
npm install
npm run dev
```

---

## Zukünftige Erweiterungen

- 
- 
- 

---

## Persönliche Erfahrungen und Lernerfolge

Durch die Entwicklung dieses Projekts konnten viele praktische Erfahrungen gesammelt werden, die über den normalen Unterricht hinausgehen.

Besonders verbessert wurden unsere Kenntnisse in folgenden Bereichen:

- Versionsverwaltung mit Git und GitHub
- Arbeiten mit Branches und Merge-Konflikten
- Frontend-Entwicklung mit React
- Backend-Entwicklung mit FastAPI
- Datenmodellierung und Datenbankzugriffe
- Fehlersuche und Debugging
- Teamarbeit in Softwareprojekten

Das Projekt zeigte, dass Softwareentwicklung nicht nur aus Programmieren besteht, sondern auch aus Planung, Kommunikation, Integration und ausführlichem Testen.

---

## Fazit

Mit dem Poker Bankroll Manager konnte eine vollständige Webanwendung zur Verwaltung und Analyse einer Poker-Bankroll entwickelt werden.

Trotz zahlreicher Herausforderungen während der Entwicklung – insbesondere durch unterschiedliche Branches, Merge-Konflikte und die Integration verschiedener Komponenten – konnte eine funktionierende Gesamtlösung erstellt werden.

Die Arbeit an diesem Projekt vermittelte nicht nur technisches Wissen, sondern auch wichtige Erfahrungen im Bereich Teamarbeit und Projektorganisation. Die dabei gesammelten Kenntnisse werden für zukünftige Softwareprojekte von großem Nutzen sein.

---

## Autoren

Entwickelt im Rahmen eines Teamprojekts.

Mitwirkende:

- Marco     Rechberger
- Katharina Almer
- Stefan    Derler
- Sebastian Pucher
- Andreas   Haas
- Tizian    Handler
- Amir      Jafari

Autor des Dokuments:
- Rechberger

---

## Lizenz

Dieses Projekt wurde im Rahmen eines Schulprojekts entwickelt und dient ausschließlich Ausbildungszwecken.
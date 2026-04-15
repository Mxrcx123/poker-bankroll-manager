# Namenskonventionen für unser Poker Bankroll Manager - Projekt

## Für interne Dateien, die z.B. über Teams Chat geschickt werden:

**Konvention:** Eigene Konvention für gute Lesbarkeit und Verständnis ausgedacht

**Regeln:**
* Titel_Datum 
* Ganz normale Rechtschreibung mit Großbuchstabe  am Anfang 
* Wenn mehrere Wörter im Titel vorkommen, dann die Namen mit Unterstrich trennen
* Datum mit Bindestrichen dazwischen im Format Jahr-Monat-Tag

**Beispiele:**
* Titel_2026-03-11
* Titel_des_Projekts_2026-03-11

## Im Codespace:
### 1. Name von Klassen
**Konvention:** PascalCase (auch CapWords genannt)

**Regeln:**
* Jedes Wort beginnt mit einem Großbuchstaben
* Keine Unterstriche

**Beispiele:**
* class User:
* class DataProcessor:
* class HttpRequestHandler:
* class MachineLearningModel:

### 2. Name von Objekten / Variablen
**Konvention:** snake_case

**Regeln:**
* nur Kleinbuchstaben
* Wörter mit _ trennen
* beschreibende Namen verwenden

**Beispiele**
* user_name = "Max"
* total_price = 120
* file_path = "/data/input.csv"
* model_accuracy = 0.92
* Kurzlebige Variablen (z.B. Schleifen)
* for i in range(10):  
    ...

### 3. Name von Namespaces / Modulen
(In Python meist Module oder Packages)

**Konvention:** snake_case oder kurze Kleinbuchstaben

**Regeln:**
* möglichst kurz
* keine Großbuchstaben
* keine Bindestriche

**Beispiele:**
* import data_processing
* import machine_learning
* import user_management

### 4. Name von Ordnern (Packages)
**Konvention:** snake_case

**Regeln:**
* Kleinbuchstaben
* Wörter mit Unterstrich trennen
* Domain-orientierte Struktur

**Beispiel Projektstruktur**

project_name/  
│  
├── data_processing/  
├── machine_learning/  
├── api_client/  
├── utils/  
└── tests/  


### 5. Name von Dateien (Python-Dateien)
**Konvention:** snake_case.py

**Regeln:**
* Kleinbuchstaben
* Unterstriche erlaubt
* beschreibend, aber nicht zu lang

**Beispiele:**
* data_loader.py
* model_trainer.py
* api_client.py
* config_manager.py

## Zusätzliche sinnvolle Regeln
### Konstanten
**Konvention:**
* UPPER_CASE
* MAX_USERS = 100
* DEFAULT_TIMEOUT = 30
* API_BASE_URL = "https://api.example.com"

### Private Attribute / Methoden
**Konvention:** führender Unterstrich

**Beispiel:**
class User:
    def _calculate_hash(self):
        pass

### Interne Variablenkonflikte vermeiden
class_ = "Math"

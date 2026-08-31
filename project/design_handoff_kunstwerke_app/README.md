# Handoff: Kunstwerke-Katalogisierungs-App (Design)

## Overview
Klickbarer Prototyp einer privaten PWA zur Katalogisierung selbst fotografierter Kunstwerke aus Museumsbesuchen (Gemälde, Skulpturen, Zeichnungen, Fresken). Enthält die 7 Kernscreens: Scankarte, Sammlung/Galerie, Künstler-Übersicht, Werk-Detailansicht, Einpflege-Korrekturmaske, Suche, Mehr/Statistik. Vollständiges Produktkonzept siehe `kunstwerke-app-konzept.md`.

## About the Design Files
Die Datei `Kunstwerke App.dc.html` ist ein **Design-Referenzprototyp** (HTML/React, Design-Component-Format), kein produktionsreifer Code zum direkten Übernehmen. `ios-frame.jsx` liefert nur den iPhone-Bezel/Status-Bar für die Vorschau und ist keine Produktionskomponente. Die Aufgabe ist, dieses Design **in der Zielumgebung (vermutlich React/PWA gemäß Konzept Abschnitt 7, ggf. React Native oder ein anderes PWA-Framework) neu zu implementieren** — unter Verwendung der dort etablierten Patterns und Libraries — inklusive echter Funktionalität (Supabase, Kamera, Claude Vision API, Offline-Sync) gemäß Konzeptdokument Abschnitt 4, 7 und 9. Öffnet man die `.dc.html`-Datei direkt im Browser, läuft der Prototyp interaktiv mit Beispieldaten.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände und Interaktionen sind final gemeint; Bildinhalte sind Platzhalter (gestreifte Flächen mit Monospace-Beschriftung) — echte Werkfotos ersetzen diese 1:1 an gleicher Stelle/Seitenverhältnis.

## Leitmotiv
Dunkel-elegantes Galerie-Gefühl statt App-Funktionalismus: abgedunkelter Museumssaal, warme Goldakzente als "Lichtpunkte", großzügiger Weißraum, Serife für Werktitel/Künstlernamen, klare Grotesk für UI-Text.

## Screens / Views

### 1. Scankarte (Tab, Startscreen)
- **Zweck**: Neues Werk fotografieren/erfassen.
- **Layout**: Titel (Serife, 26px) + Subtitle. Zwei nebeneinander liegende Karten (flex, gap 10px) "Einzelscan" / "Doppelscan", je 14px Radius, Icon-Chip 34×34px oben. Darunter gestrichelter Button "Aus Fotomediathek importieren". Liste "Zuletzt erfasst" (3 Einträge, 38×38px Thumbnail + Titel/Datum).
- **States**: `idle` → `scanning` (Spinner, 900ms simuliert) → `result` (Foto-Vorschau 4:3, Konfidenz-Badge "sicher"/"Vorschlag, bitte prüfen", extrahierte Felder, Buttons "Übernehmen" / "Bearbeiten"). Doppelscan liefert immer `sicher`, Einzelscan `Vorschlag, bitte prüfen`.
- Bulk-Import-Button navigiert direkt in die Korrekturmaske.

### 2. Sammlung / Galerie (Tab)
- **Zweck**: Alle erfassten Werke durchsuchen/filtern.
- **Layout**: Titel + Werkanzahl + Toggle "Raster ↔ Liste" oben rechts. Horizontal scrollende Filter-Chip-Reihe (Epoche, Gattung, Status; Mehrfachauswahl, aktiv = Gold-Outline + Gold-Text).
- **Raster-Ansicht**: CSS-Columns (2 Spalten, 10px Gap), Karten mit individuellem Seitenverhältnis (3/4, 4/3), Titel (Serife 11.5px) + Künstler-Zeile darunter.
- **Listen-Ansicht**: 46×46px Thumbnail + Titel/Künstler/Museum, 1px Trennlinie.
- Tap auf Karte → Werk-Detailansicht.

### 3. Künstler-Übersicht (Tab)
- **Zweck**: Nach Werkanzahl sortierte Künstlerliste.
- **Layout**: Zeilen mit 42px rundem Avatar-Platzhalter (Initiale, Serife), Rufname fett hervorgehoben im Namenszug, kleinere Zusatzzeile mit vollständigem Namen (entfällt bei Notnamen), rechtsbündige Werkanzahl.
- Notname-Sonderfall (z. B. "Meister von Flémalle") zeigt nur den Rufnamen, keine Zusatzzeile.
- Tap auf Zeile → Künstler-Detailscreen (Mini-Galerie, 2-spaltig, seiner Werke).

### 4. Werk-Detailansicht (Push-Screen, voller Bildschirm)
- **Zweck**: Alle Metadaten eines Werks.
- **Layout**: Vollbild-Hero-Bild (Seitenverhältnis wie Werk), darüber Zurück-Button (34px Kreis) links, Merken/Bearbeiten rechts, alle mit halbtransparentem schwarzem Kreis-Hintergrund. Darunter: Titel (Serife 23px), Künstlerzeile mit hervorgehobenem Rufnamen, Jahr/Epoche/Gattung, Status-Badge (Punkt + Label), Trennlinie, Metadaten-Zeilen (Museum, Ort im Museum, Stadt/Land, Material/Technik, Aufnahmedatum) als Label/Wert-Paare, optional Tafel-Foto-Thumbnail (104×78px) als Beleg, Tag-Chips, Notizen (kursiv, Serife).

### 5. Einpflege-Korrekturmaske (Push-Screen)
- **Zweck**: KI-Vorschläge aus Bulk-Import/Scan prüfen und bestätigen (Konzept Abschnitt 4.2).
- **Layout**: Zurück-Button + Titel, Zähler "N Vorschläge zu prüfen". Karten (14px Radius, dunkler Kartenhintergrund): 52×52px Foto-Platzhalter, extrahierte Felder (Titel/Künstler/Jahr/Museum), Konfidenz-Badge oben rechts. Zwei Buttons pro Karte: "Bestätigen" (Gold, primär) und "Korrigieren" (Outline) — Korrigieren schaltet die Felder in editierbare Textfelder um ("Fertig" zum Abschließen).
- Leerzustand: "Alle Vorschläge geprüft."

### 6. Suche (Tab)
- **Zweck**: Volltextsuche über Künstler, Titel, Museum, Notizen, Tags.
- **Layout**: Eingabefeld oben. Leerzustand zeigt Vorschlags-Chips (Tag-Vorschläge). Ergebnisliste identisch zur Listen-Ansicht der Sammlung. Kein-Treffer-Meldung bei leerem Ergebnis.

### 7. Mehr / Statistik (Tab)
- **Zweck**: Dashboard + Einstellungen.
- **Layout**: 2×2-Grid-Kacheln (12px Radius) für Kennzahlen (Werke gesamt, Museen besucht, meistvertretene Epoche als breite Kachel). Balkendiagramm "Erfassungen nach Monat" (8 Balken, Gold bei 55% Deckkraft). Liste (12px Radius, 1px Trennlinien) mit Export-PDF, Karten-Ansicht, Freigabe & Zugriffsrechte, Backup-Erinnerung (Status "Fällig" in Terrakotta), Einstellungen & Sync.

## Interactions & Behavior
- **Tab-Navigation**: 5 Tabs unten (Scankarte, Sammlung, Künstler, Suche, Mehr); aktiver Tab = Gold-Icon/-Label (font-weight 600), inaktiv = gedämpftes Grau.
- **Push-Navigation**: Werk-Detail, Künstler-Detail und Korrekturmaske überdecken den gesamten Screen (inkl. Tab-Bar) mit `fadeUp`-Einblendung (0.25s ease, translateY 10px→0); Zurück-Button (‹) kehrt zum zuletzt aktiven Tab zurück.
- **Scan-Flow**: Tap Einzel-/Doppelscan → 900ms simulierte Ladeanimation (Spinner, `spin` 0.9s linear infinite) → Ergebniskarte mit Konfidenz. "Übernehmen" fügt das Werk vorne in die Sammlung ein und zeigt einen Toast ("Werk hinzugefügt", 2.2s, `toastIn`-Animation, unten mittig über der Tab-Bar). "Bearbeiten" öffnet die Korrekturmaske mit dem neuen Eintrag.
- **Filter-Chips**: Mehrfachauswahl, Toggle-Verhalten, Filterung per OR-Verknüpfung über Epoche/Gattung/Status/Museum.
- **Korrekturmaske**: "Bestätigen" setzt Status auf "vollständig" und entfernt die Karte aus der Warteliste (Toast "Werk bestätigt"). "Korrigieren" schaltet Titel/Künstler-Feld in editierbare Inputs.
- **Suche**: Live-Filterung bei jedem Tastenanschlag, keine Verzögerung.
- Alle Übergänge nutzen einfache CSS-Transitions/Keyframes, keine externen Animationsbibliotheken.

## State Management
Zentrale Zustände (im Prototyp als lokaler Component-State):
- `works`: Array aller erfassten Werke (Datenmodell s. u.)
- `tab`: aktiver Tab (`scan` | `sammlung` | `kuenstler` | `suche` | `mehr`)
- `screen`: `tab` | `detail` | `artist` | `korrektur` (Push-Screen-Ebene)
- `selectedWorkId`, `selectedArtistCall`: Referenz für Detailscreens
- `galleryView`: `masonry` | `list`
- `activeChips`: aktive Filter-Labels (Array)
- `searchQuery`: Sucheingabe
- `scanMode` (`single`|`double`), `scanStep` (`null`|`scanning`|`result`): Scan-Flow-Zustand
- `editingId`: welche Korrekturmaske-Karte aktuell editiert wird
- `toast`: aktuelle Toast-Nachricht (mit Timeout)

**Datenmodell pro Werk** (vollständig gemäß Konzept Abschnitt 2): `artistFull`, `artistCall` (Rufname), `isNotname`, `title`, `year`, `epoch`, `genre`, `museum`, `room`, `city`, `material`, `tags[]`, `notes`, `dateAdded`, `status` (`vollständig`|`zu prüfen`|`unvollständig`), `confidence` (`sicher`|`Vorschlag, bitte prüfen`), `hasTafel`.

In der echten App ersetzen Supabase-Queries (Postgres + Storage) diesen lokalen State; der Scan-Flow ruft real die Claude Vision API auf statt der 900ms-Simulation; Offline-Fälle cachen lokal und syncen bei Verbindung (Konzept Abschnitt 4.1, 7).

## Design Tokens

**Farben** (als CSS `oklch()`, direkt übernehmbar oder in Hex konvertierbar):
- Hintergrund App: `oklch(0.16 0.012 50)`
- Hintergrund Karten: `oklch(0.20 0.014 50)`
- Hintergrund Karten (hell/Chips inaktiv): `oklch(0.22–0.26 0.015 50)`
- Rahmen/Trennlinien: `oklch(0.28–0.32 0.014 50 / 0.5–0.7)`
- Text primär: `oklch(0.92–0.95 0.01 60)`
- Text sekundär: `oklch(0.72–0.78 0.015–0.02 55)`
- Text tertiär: `oklch(0.5–0.55 0.015 55)`
- **Akzent 1 (Gold, positiv/„sicher"/„vollständig"/aktiver Tab)**: `oklch(0.78 0.13 75)`, Tint-Hintergrund `oklch(0.78 0.13 75 / 0.16)`
- **Akzent 2 (Terrakotta, Warnung/„zu prüfen"/„unvollständig")**: `oklch(0.72 0.13 35)`, Tint-Hintergrund `oklch(0.72 0.13 35 / 0.18)`
- Beide Akzente teilen Chroma (0.13) und Lightness (0.72–0.78), nur der Hue variiert (75 vs. 35) — bei Erweiterung um weitere Statusfarben dieses Prinzip fortsetzen.

**Typografie**:
- Serife (Werktitel, Künstlernamen, große Überschriften): "Source Serif 4" — Titel-Screen 26px/700, Werktitel-Detail 23px, Karten-Titel 11.5–14px
- Grotesk (UI-Text, Labels, Buttons, Metadaten): "Work Sans" — Body 12–13.5px, Labels/Meta 10–12px uppercase mit 0.06em Letter-Spacing
- Zeilenhöhe Fließtext ~1.4–1.6

**Radien**: Karten/Buttons groß 12–14px, kleine Chips/Kreise pill (100px) oder 50%, Thumbnails 7–10px.

**Schatten**: Toast `0 8px 24px rgba(0,0,0,0.4)`; sonst bewusst schattenarm (flache, dunkle Flächen statt Elevation).

**Spacing-Skala**: 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 22 / 24 / 32px (Vielfache von 2, konsistent in Padding/Gap verwendet).

## Assets
Keine echten Bilddateien — alle Werk- und Tafelfotos sind Platzhalter (`repeating-linear-gradient`-Streifenmuster in Werk-spezifischer Hue + zentrierte Monospace-Beschriftung mit Werktitel/„WERKFOTO"/„TAFEL"). In der Produktivversion werden diese 1:1 durch die vom Nutzer aufgenommenen/importierten Fotos ersetzt (gleiches Seitenverhältnis, gleiche Rundung). Icons (Kamera, Raster, Person, Lupe, Mehr-Punkte) sind einfache Inline-SVGs, im Handoff-Ordner im Quellcode der `.dc.html` enthalten (Suche nach `ICON_`).

## Files
- `Kunstwerke App.dc.html` — vollständiger Design-Prototyp (Markup + State-Logik in einer Datei; React-artige Komponente, im Browser direkt lauffähig).
- `ios-frame.jsx` — nur Vorschau-Bezel (iPhone-Rahmen/Status-Bar), keine Produktionskomponente.
- `kunstwerke-app-konzept.md` — vollständiges Produktkonzept (Datenmodell, Funktionen, KI-Erkennung, Backend-Vorschlag, Gestaltungsvorgaben). Referenzpunkt für alle Abschnittsverweise oben.

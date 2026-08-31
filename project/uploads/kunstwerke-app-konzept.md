# Konzept: Private Kunstwerk-Katalogisierungs-App

## 1. Vision

Eine persönliche Progressive Web App (PWA) zur Katalogisierung selbst fotografierter Kunstwerke (Gemälde, Skulpturen, Zeichnungen, Fresken) aus Museumsbesuchen. Ziel: sich anfühlen wie eine hochwertige native iPhone/iPad-App – ruhige, museale Ästhetik, keine Ladeverzögerungen, automatisches Speichern, Sync zwischen iPhone und iPad über eine gemeinsame Cloud-Datenbank.

**Leitmotiv für das Design:** Galerie-Gefühl statt App-Funktionalismus. Großzügiger Weißraum, gedeckte Farben, edle Typografie (Serife für Werktitel/Künstlernamen, klare Grotesk für UI-Elemente), Fotos immer im Zentrum der Aufmerksamkeit.

---

## 2. Datenmodell

Jedes Werk enthält:

| Feld | Beschreibung |
|---|---|
| Künstler (vollständig) | Vollständiger Name, deutsche kanonische Schreibweise (s. Abschnitt 6) |
| Künstler (Rufname) | Der kunsthistorisch gebräuchliche Kurzname, wird bei der Anzeige hervorgehoben (s. Abschnitt 6) |
| Werktitel | Deutscher Titel, sofern nicht Eigenname/fremdsprachiger Originaltitel üblich |
| Entstehungsjahr / Zeitraum | Jahr oder Circa-Angabe ("um 1620") |
| Epoche | z. B. Barock, Renaissance, Impressionismus – wählbar aus Liste, KI-Vorschlag möglich |
| Gattung | Gemälde, Skulptur, Zeichnung, Fresko, Grafik etc. |
| Museum | Name der Institution |
| Ort im Museum | Saal/Raum-Nummer, optional |
| Stadt/Land | für Filterung nach Reisezielen |
| Material/Technik | Öl auf Leinwand, Marmor etc. (optional, wenn auf Tafel erkennbar) |
| Foto(s) | Werkfoto, optional Tafel-Foto, optional Detailfotos |
| Eigene Notizen | Freitextfeld |
| Tags | frei vergebbare Schlagworte (z. B. "Stillleben", "Selbstbildnis") |
| Aufnahmedatum | automatisch, mit Reise/Besuch verknüpfbar |
| Status | vollständig erfasst / unvollständig / zu prüfen |

---

## 3. Screens & Navigation

**Tab-Leiste (unten, wie native iOS-App):**
1. **Scankarte** – Startpunkt zum Fotografieren/Einpflegen
2. **Sammlung** – Galerie-Übersicht aller Werke, filter- und sortierbar
3. **Künstler** – Top-Künstler-Liste, gruppiert nach Werkanzahl
4. **Suche** – übergreifende Volltextsuche
5. **Mehr** – Statistiken, Export, Einstellungen

---

## 4. Kernfunktionen im Detail

### 4.1 Scankarte (Aufnahme neuer Werke)
- **Einzelscan:** Ein Foto des Werks – manuelle oder KI-gestützte Eintragung danach.
- **Doppelscan:** Zwei Fotos – Werk + Beschreibungstafel. Die App verknüpft beide automatisch als ein Werk-Eintrag.
- **Live-Erkennung:** Nach der Aufnahme läuft automatisch eine KI-Analyse (Vision-Modell), die:
  - bei vorhandenem Tafel-Foto: Künstler, Titel, Jahr, Material aus dem Text extrahiert (OCR + Verständnis, kein stures Zeichenlesen – auch bei Schrägaufnahmen oder Teilverdeckung)
  - bei Werk-Foto ohne Tafel: einen Erkennungsversuch auf Basis von Bildmerkmalen unternimmt (Stil, bekannte Kompositionen) und die Trefferwahrscheinlichkeit ehrlich kennzeichnet ("sicher" / "Vorschlag, bitte prüfen")
- **Automatische Zuschnitt-/Randoptimierung:** Nach der Aufnahme wird der Bildbereich außerhalb des Rahmens/der Werkgrenzen erkannt und automatisch zugeschnitten (ähnlich der Dokumentenerkennung von Scanner-Apps, nur für Kunstwerke statt Papier). Perspektivkorrektur bei schräg aufgenommenen Fotos. Manuelle Nachjustierung der Eckpunkte bleibt möglich.
- **Sofortige lokale Zwischenspeicherung**, auch offline im Museum (kein WLAN) – Sync folgt automatisch, sobald wieder Internet verfügbar ist.

### 4.2 Einpflege-Apparat (nachträgliches Erfassen & Bearbeiten)
- Bulk-Import aus der iPhone-Fotomediathek (Mehrfachauswahl)
- Automatische Erkennung von Bildpaaren: Wenn zwei zeitlich/örtlich nah aufgenommene Fotos existieren, schlägt die App vor, sie als Werk+Tafel zu verknüpfen
- Für jedes importierte Foto: gleiche KI-Erkennung wie beim Live-Scan
- Übersichtliche Korrekturmaske: alle KI-Vorschläge nebeneinander mit Konfidenz-Kennzeichnung, ein Tap bestätigt oder korrigiert
- **Lernmechanismus:** Wenn du eine KI-Zuordnung manuell korrigierst, sollte das (soweit über die Vision-API sinnvoll umsetzbar) als Kontext für ähnliche künftige Fälle gespeichert werden – z. B. eine eigene Liste bereits bestätigter Künstler/Werke, die bei künftigen Erkennungen zuerst abgeglichen wird, bevor eine neue KI-Anfrage läuft. Das verbessert Treffsicherheit UND spart API-Kosten.

### 4.3 Sammlung / Galerie
- Ansicht als Bilderraster (Pinterest-artig, unterschiedliche Bildhöhen) oder Liste
- Filter/Sortierung nach: Museum, Künstler, Epoche, Gattung, Reise/Datum, Status (vollständig/zu prüfen)
- Detailansicht je Werk im Vollbild, mit Tafel-Foto als Beleg daneben

### 4.4 Künstler-Übersicht
- Sortiert nach Werkanzahl ("deine Top-Künstler")
- Pro Künstler: Mini-Galerie seiner erfassten Werke, Epochenzuordnung, Anzahl besuchter Museen mit Werken von ihm

### 4.5 Suche
- Volltextsuche über alle Felder (Künstler, Titel, Museum, Notizen, Tags)

---

## 5. Zusätzliche Funktionsvorschläge (Ergänzung zu deiner Liste)

- **Reise-/Besuchsgruppen:** Werke automatisch nach Museumsbesuch/Datum gruppieren – praktisch für rückblickende Sortierung ("Rom, September 2026")
- **Karten-Ansicht:** Museen als Punkte auf einer Karte, Klick öffnet die dort erfassten Werke
- **Statistik-Dashboard:** Anzahl Werke, meistvertretene Epoche, meistbesuchtes Museum, Zeitverlauf deiner Erfassungen
- **Merkliste/Favoriten:** eigene Lieblingswerke markieren, unabhängig von Vollständigkeit der Daten
- **Export als PDF-Katalog:** eigene kleine "Ausstellungskataloge" nach Filter generieren (z. B. alle Werke eines Künstlers) – schön für Archivzwecke oder zum Teilen
- **Zitier-/Quellenfeld:** Platz für Literaturhinweise, falls du Werke später wissenschaftlich weiterverwenden willst (passend zu deinem Studium)
- **Ähnliche-Werke-Vorschlag:** KI schlägt beim Erfassen thematisch/stilistisch verwandte, bereits erfasste Werke vor (z. B. gleiche Werkgruppe, gleicher Auftraggeber)
- **Backup-Erinnerung:** regelmäßiger Hinweis, einen vollständigen Export anzulegen (zusätzlich zur Cloud-Sicherung)

---

## 6. Deutsche kanonische Schreibweise & Namensdarstellung

Für Künstlernamen und Werktitel gilt die im deutschen kunsthistorischen Sprachgebrauch etablierte Form (wie in Standardwerken/Museumsbeschriftungen üblich), nicht die wörtliche Übersetzung und nicht automatisch die Originalsprache:
- Beispiele: *Raffael* (nicht Raffaello/Raphael), *Tizian* (nicht Tiziano), *Michelangelo* (bleibt), *Leonardo da Vinci* (bleibt)
- Werktitel: deutsche kunsthistorische Standardbezeichnung, sofern etabliert (z. B. *Das Mädchen mit dem Perlenohrring*), sonst Originaltitel beibehalten, wenn kein deutscher Titel gebräuchlich ist
- Diese Regel sollte der KI-Erkennung als Vorgabe mitgegeben werden, damit sie nicht einfach den auf der Tafel stehenden Landessprachen-Titel übernimmt

**Vollständiger Name vs. Rufname:**
Es wird sowohl der vollständige Name als auch der kunsthistorisch gebräuchliche Rufname erfasst. Bei der Anzeige (Künstlerliste, Werk-Detailansicht) wird der Rufname innerhalb des vollständigen Namens optisch hervorgehoben (z. B. fett), sodass auf einen Blick erkennbar ist, wie der Künstler üblicherweise genannt wird, ohne die vollständige Namensform zu verlieren.

- Beispiel: **Michelangelo Merisi da *Caravaggio*** → Rufname *Caravaggio* fett/hervorgehoben
- Beispiel: **Tiziano Vecellio** → Rufname *Tizian* (deutsche Form), vollständiger Name als Nebeninformation
- In Listenansichten (z. B. Künstler-Top-Liste, Sortierung) wird primär nach dem Rufnamen sortiert und dieser prominent angezeigt; der vollständige Name erscheint als kleinere Zusatzzeile oder beim Aufklappen der Detailansicht
- Die KI-Erkennung soll bei der Zuordnung beide Formen ermitteln und getrennt befüllen, nicht nur eine kombinierte Freitext-Zeichenkette

**Notnamen (anonyme/unbekannte Meister):**
Für Künstler ohne überlieferten Eigennamen (häufig bei mittelalterlicher und teils frühneuzeitlicher Kunst) wird der etablierte kunsthistorische Notname als Rufname geführt, das Feld "vollständiger Name" bleibt in diesem Fall leer bzw. wird nicht angezeigt.
- Beispiele: *Meister von Flémalle*, *Meister des Bartholomäus-Altars*, *Meister der Heiligen Sippe*, *Wiener Schottenmeister*
- Notnamen werden wie reguläre Rufnamen behandelt – gleiche Sortierung, gleiche Hervorhebung, kein Sonderfall in der Datenstruktur, nur inhaltlich als solcher kenntlich (optionales Kennzeichen "Notname" für spätere Filterung, falls gewünscht)
- Die KI-Erkennung soll bei Tafeln, die einen Notnamen nennen (z. B. "Meister von …"), diesen korrekt als Rufname erkennen und nicht versuchen, einen vollständigen Namen zu erfinden

---

## 7. Technischer Stack (Vorschlag)

- **Frontend:** PWA (HTML/CSS/JS), installierbar auf iPhone/iPad über "Zum Home-Bildschirm hinzufügen"
- **Backend/Datenbank:** Supabase (Postgres-Datenbank + Datei-Speicher für Fotos + Auth), kostenloses Kontingent ausreichend für den Start
- **Bilderkennung/Texterkennung:** Anthropic Claude Vision API (für Tafel-Auslesen und Werk-Erkennung)
- **Bildzuschnitt/Perspektivkorrektur:** clientseitig via Canvas/JS (Kantenerkennung), ggf. unterstützt durch die Vision-API zur Eckpunkt-Erkennung
- **Offline-Fähigkeit:** Service Worker + lokale Zwischenspeicherung, Sync bei Internetverbindung

---

## 8. Vorgeschlagener Ablauf mit Claude Design & Claude Code

**Schritt 1 – Claude Design (Aussehen):**
Design der 4–5 Kernscreens (Scankarte, Sammlung/Galerie, Künstlerliste, Werk-Detailansicht, Einpflege-Korrekturmaske) auf Basis des in Abschnitt 1 beschriebenen Leitmotivs. Ergebnis: fertiges visuelles System (Farben, Typografie, Komponenten) als laufender Code.

**Schritt 2 – Handoff an Claude Code:**
Übergabe der Design-Komponenten plus dieses Konzeptpapiers. Claude Code baut darauf die komplette Funktionalität: Datenbank-Anbindung (Supabase), Kamera-Integration, KI-Erkennung (Claude Vision API), Zuschnitt-Logik, Offline-Sync, Suche/Filter.

**Schritt 3 – Iteration:**
Testen auf iPhone/iPad, Rückmeldungen zu Design und Funktion, gezielte Nachbesserung in beiden Tools.

---

## 9. Gestaltungs- und Nutzungsvorgaben (geklärt)

- **Farbwelt/Stimmung:** dunkel-elegant, wie ein abgedunkelter Museumssaal – dunkler Hintergrund, warme Akzentfarben, Fotos als Lichtpunkte im Raum
- **Epochenliste:** von Beginn an differenziert und umfangreich angelegt (z. B. Antike, Romanik, Gotik, Frührenaissance, Hochrenaissance, Manierismus, Barock, Rokoko, Klassizismus, Romantik, Realismus, Impressionismus, Postimpressionismus, Jugendstil, Expressionismus, Klassische Moderne, Nachkriegsmoderne, Zeitgenössisch – als Startpunkt, nicht abschließend), zusätzlich frei erweiterbar für Sonderfälle
- **Teilen-Funktion (perspektivisch):** Die App soll so angelegt werden, dass eine spätere Freigabe an andere Personen technisch möglich ist, auch wenn sie zum Start nicht aktiv genutzt wird. Praktisch bedeutet das: Die Datenbankstruktur (Supabase) von Anfang an mit Nutzer-/Rechteverwaltung planen, auch wenn zunächst nur ein Account existiert. So lässt sich später ohne Umbau ein zweiter Zugang mit Lese- oder Bearbeitungsrechten hinzufügen (z. B. für gemeinsame Reisen).

---

## 10. Weiteres Vorgehen mit dem fertigen Dokument

1. **Für Claude Design:** Neues Design-Projekt unter claude.ai/design öffnen, die Abschnitte 1, 3, 4 und 9 (Vision, Screens, Funktionen, Gestaltungsvorgaben) einfügen oder zusammenfassen einfügen und Claude Design bitten, die Kernscreens auf dieser Basis zu entwerfen.
2. **Für Claude Code:** Sobald das Design steht, dessen Export/Handoff zusammen mit dem kompletten Dokument (idealerweise als Datei-Upload oder eingefügter Text) an Claude Code übergeben, mit dem Auftrag, die Funktionalität gemäß Abschnitt 4, 7 und 9 umzusetzen.
3. Das Dokument selbst bleibt dabei dein Referenzpunkt – bei Rückfragen von Claude Design oder Claude Code kannst du jederzeit den entsprechenden Abschnitt zitieren oder die Datei erneut hochladen.


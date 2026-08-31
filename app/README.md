# Kunstwerke

Private Katalogisierungs-App für selbst fotografierte Kunstwerke aus Museumsbesuchen. Ursprünglich als React/Vite-PWA-Reimplementierung des Claude-Design-Handoffs in `project/design_handoff_kunstwerke_app/` gestartet, seither Struktur und Bildsprache an einer Referenz-App angeglichen (Home-Dashboard, 4-Tab-Navigation).

## KI-Erkennung aktivieren (Claude Vision)

Scan und Bulk-Import erkennen Künstler/Titel/Jahr/Museum/Material automatisch aus dem Werk- und Tafelfoto, sobald ein Anthropic API-Key hinterlegt ist — läuft über `api/recognize.ts` (Vercel Serverless Function), der Key bleibt dabei serverseitig:

1. Vercel-Projekt → **Settings → Environment Variables** → `ANTHROPIC_API_KEY` mit dem echten Key eintragen (Production **und** Preview), neu deployen.
2. Fertig — kein Code ändern nötig. Ohne Key antwortet die Function mit 503, der Client fällt automatisch auf die bisherige ehrliche Leer-Erfassung zurück (kein sichtbarer Fehler).

Lokal (`npm run dev`) läuft `/api/recognize` nicht mit (Vite dev-Server kennt keine Vercel-Functions) — für den vollen Flow lokal `vercel dev` verwenden, sonst greift derselbe Fallback.

## Stand dieser Implementierung

**Navigation:** 4 Tabs — Home, Scannen, Sammlung, Entdecken. Push-Screens: Werk-Detail, Künstler-Detail, Korrekturmaske, Einstellungen (über das Zahnrad auf Home), Sammlungs-Detail.

- **Home** (`screens/HomeScreen.tsx`): Begrüßung + Zahnrad zu den Einstellungen; "Zuletzt hinzugefügt"-Hero; Kürzliche Scans; Top-Künstler-Karussell (Wikipedia-Porträt oder Initiale); "Ihre Scankarte" (Leaflet/OpenStreetMap, kein Key nötig) mit den beim Scan erfassten Standorten; "Museen in der Nähe" über die kostenlose Overpass-API.
- **Scannen** (`screens/ScanScreen.tsx`): Einzel-/Doppelscan über die native Kamera, Bulk-Import aus der Fotomediathek — echte Foto-Aufnahme (`services/camera.ts`), clientseitig komprimiert (`lib/image.ts`). Zeitlich nah aufgenommene Fotos werden beim Import automatisch als Werk+Tafel-Paar erkannt (`lib/pairing.ts`) statt als zwei separate Werke.
- **Sammlung** (`screens/SammlungScreen.tsx`): Bibliothek (Listenzeilen mit Foto + farbiger Kante), Besuche (nach Museum gruppiert), Sammlungen (frei benennbare eigene Ordner, `screens/CollectionDetailScreen.tsx` zum Zuordnen).
- **Entdecken** (`screens/EntdeckenScreen.tsx`): Volltextsuche + Künstlerliste (Wikipedia-Porträts).

Die App arbeitet mit **echten, selbst aufgenommenen/importierten Fotos** statt Beispieldaten — die Sammlung startet leer und persistiert in `localStorage`:

- **KI-Erkennung** (`api/recognize.ts` + `services/recognition.ts`): mit hinterlegtem `ANTHROPIC_API_KEY` liest Claude Vision das Tafelfoto (auch bei Schrägaufnahme), extrahiert Künstler (voller Name + Rufname getrennt, deutsche kanonische Schreibweise, Notnamen-Erkennung), Titel, Jahr, Museum, Material, Tags und vergibt die Konfidenz ehrlich ("sicher" nur bei eindeutig lesbarem Tafeltext). Zusätzlich schlägt sie einen Zuschnitt vor, der die Wand um das Werk entfernt (`lib/image.ts#cropPhoto`). Ohne Key bleiben die Felder wie bisher ehrlich leer statt eines vorgetäuschten Treffers — Titel/Künstler trägt man dann über „Bearbeiten"/„Korrigieren" selbst ein.
- Künstler-Porträts holt `services/artistPortrait.ts` automatisch über die kostenlose Wikipedia/Wikimedia-API (kein Key), sobald ein Werk mit echtem Künstlernamen bestätigt wird.
- Standort wird beim Scan/Import best-effort per Browser-Geolocation erfasst (`services/geolocation.ts`, abschaltbar in den Einstellungen) — Basis für Karte und Museen-in-der-Nähe.
- **Einstellungen**: Export als echter PDF-Katalog (`lib/pdfCatalog.ts`, jsPDF, per Klick nachgeladen), lokale Sicherung als JSON zum Herunterladen/Wiederherstellen (`lib/backup.ts`), Standort-Erfassung an/aus. Freigabe & Zugriffsrechte bleibt Platzhalter (braucht Supabase).

Bewusst weiterhin **nicht** enthalten (siehe `src/services/*.ts` für TODO-Kommentare und Konzept-Verweise):

- **`services/backend.ts`** — Supabase (Postgres + Storage + Auth) statt `localStorage`; Nutzer-/Rechteverwaltung für spätere Freigabe (Konzept Abschnitt 2, 7, 9).
- **`services/camera.ts`** — automatische Perspektivkorrektur bei schräg aufgenommenen Fotos fehlt noch (der Zuschnitt selbst funktioniert bereits über die Vision API, s. o.); manuelle Eckpunkt-Nachjustierung ebenfalls offen.
- **`services/offlineSync.ts`** — Sync-Warteschlange über mehrere Geräte; der Service Worker (vite-plugin-pwa) cacht bereits die App-Shell fürs Offline-Laden.

`ios-frame.jsx` aus dem ursprünglichen Handoff ist nur der Vorschau-Bezel und wird hier nicht verwendet — die App füllt den echten Viewport (Safe-Area-bewusst für Dynamic Island/Notch).

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Typecheck + Produktions-Build
npm run lint      # oxlint
```

Icons in `public/icons/` per `node scripts/generate-icons.mjs` (benötigt `sharp` aus den devDependencies) neu erzeugbar.

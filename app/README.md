# Kunstwerke

Private Katalogisierungs-App für selbst fotografierte Kunstwerke aus Museumsbesuchen. Ursprünglich als React/Vite-PWA-Reimplementierung des Claude-Design-Handoffs in `project/design_handoff_kunstwerke_app/` gestartet, seither Struktur und Bildsprache an einer Referenz-App angeglichen (Home-Dashboard, 4-Tab-Navigation).

## Stand dieser Implementierung

**Navigation:** 4 Tabs — Home, Scannen, Sammlung, Entdecken. Push-Screens: Werk-Detail, Künstler-Detail, Korrekturmaske, Einstellungen (über das Zahnrad auf Home), Sammlungs-Detail.

- **Home** (`screens/HomeScreen.tsx`): Begrüßung + Zahnrad zu den Einstellungen; "Zuletzt hinzugefügt"-Hero (ehrlicher Ersatz für ein KI-"Gemälde des Tages", das den Anthropic-Key bräuchte); Kürzliche Scans; Top-Künstler-Karussell (Wikipedia-Porträt oder Initiale); "Ihre Scankarte" (Leaflet/OpenStreetMap, kein Key nötig) mit den beim Scan erfassten Standorten; "Museen in der Nähe" über die kostenlose Overpass-API.
- **Scannen** (`screens/ScanScreen.tsx`): Einzel-/Doppelscan über die native Kamera, Bulk-Import aus der Fotomediathek — beides echte Foto-Aufnahme (`services/camera.ts`), clientseitig komprimiert (`lib/image.ts`).
- **Sammlung** (`screens/SammlungScreen.tsx`): Bibliothek (Listenzeilen mit Foto + farbiger Kante), Besuche (nach Museum gruppiert), Sammlungen (frei benennbare eigene Ordner, `screens/CollectionDetailScreen.tsx` zum Zuordnen).
- **Entdecken** (`screens/EntdeckenScreen.tsx`): Volltextsuche + Künstlerliste (Wikipedia-Porträts).

Die App arbeitet mit **echten, selbst aufgenommenen/importierten Fotos** statt Beispieldaten — die Sammlung startet leer und persistiert in `localStorage`:

- Ohne Anthropic API-Key kann nichts erkannt werden — Scan-/Import-Ergebnisse sind bewusst ehrlich leer („Unbenanntes Werk" / „Vorschlag, bitte prüfen") statt eines vorgetäuschten Treffers; Titel/Künstler trägt man über „Bearbeiten"/„Korrigieren" selbst ein.
- Künstler-Porträts holt `services/artistPortrait.ts` automatisch über die kostenlose Wikipedia/Wikimedia-API (kein Key), sobald ein Werk mit echtem Künstlernamen bestätigt wird.
- Standort wird beim Scan/Import best-effort per Browser-Geolocation erfasst (`services/geolocation.ts`, abschaltbar in den Einstellungen) — Basis für Karte und Museen-in-der-Nähe.
- **Einstellungen**: Export als echter PDF-Katalog (`lib/pdfCatalog.ts`, jsPDF, per Klick nachgeladen), lokale Sicherung als JSON zum Herunterladen/Wiederherstellen (`lib/backup.ts`), Standort-Erfassung an/aus. Freigabe & Zugriffsrechte bleibt Platzhalter (braucht Supabase).

Bewusst weiterhin **nicht** enthalten (siehe `src/services/*.ts` für TODO-Kommentare und Konzept-Verweise):

- **`services/backend.ts`** — Supabase (Postgres + Storage + Auth) statt `localStorage`; Nutzer-/Rechteverwaltung für spätere Freigabe (Konzept Abschnitt 2, 7, 9).
- **`services/recognition.ts`** — echte Claude-Vision-API-Anbindung; Server-Proxy nötig, da der API-Key nicht im Client liegen darf (Konzept Abschnitt 4.1, 4.2, 7).
- **`services/camera.ts`** — automatische Zuschnitt-/Perspektivkorrektur der Fotos fehlt noch.
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

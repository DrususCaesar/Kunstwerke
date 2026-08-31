# Kunstwerke

Private Katalogisierungs-App für selbst fotografierte Kunstwerke aus Museumsbesuchen — React/Vite-PWA-Reimplementierung des Claude-Design-Handoffs in `project/design_handoff_kunstwerke_app/`.

## Stand dieser Implementierung

Alle 7 Screens (Scankarte, Sammlung, Künstler, Werk-Detail, Künstler-Detail, Korrekturmaske, Suche, Mehr) sind 1:1 nach dem Design-Handoff umgesetzt, inklusive Tab-/Push-Navigation, Filter-Chips, Masonry-/Listenansicht, Scan-Flow und Korrektur-Flow. Tab-Reihenfolge: Künstler, Suche, **Scankarte**, **Sammlung**, Mehr.

Die App arbeitet inzwischen mit **echten, selbst aufgenommenen/importierten Fotos** statt Beispieldaten:

- **Einzel-/Doppelscan** (`services/camera.ts`) öffnen die native Kamera, das Foto wird clientseitig komprimiert (`lib/image.ts`) und landet direkt im Werk-Eintrag.
- **Bulk-Import** öffnet die Fotomediathek mit Mehrfachauswahl und legt für jedes Foto einen leeren „zu prüfen"-Eintrag in der Korrekturmaske an.
- Ohne Anthropic API-Key kann nichts erkannt werden — die Scan-/Import-Ergebnisse sind bewusst ehrlich leer („Unbenanntes Werk" / „Vorschlag, bitte prüfen") statt eines vorgetäuschten Treffers; Titel/Künstler trägt man über „Bearbeiten"/„Korrigieren" selbst ein.
- Die Sammlung persistiert in `localStorage` (`state/CollectionContext.tsx`) und übersteht Reloads; **keine Beispielwerke mehr** — die App startet leer.
- **Mehr**: Export als echter PDF-Katalog (`lib/pdfCatalog.ts`, jsPDF, per Klick nachgeladen), lokale Sicherung als JSON zum Herunterladen/Wiederherstellen (`lib/backup.ts`), echte Einstellung für die Standard-Galerieansicht. Karten-Ansicht und Freigabe & Zugriffsrechte bleiben Platzhalter (Karten-API bzw. Supabase nötig).

Bewusst weiterhin **nicht** enthalten (siehe `src/services/*.ts` für TODO-Kommentare und Konzept-Verweise):

- **`services/backend.ts`** — Supabase (Postgres + Storage + Auth) statt `localStorage`; Nutzer-/Rechteverwaltung für spätere Freigabe (Konzept Abschnitt 2, 7, 9).
- **`services/recognition.ts`** — echte Claude-Vision-API-Anbindung; Server-Proxy nötig, da der API-Key nicht im Client liegen darf (Konzept Abschnitt 4.1, 4.2, 7).
- **`services/camera.ts`** — automatische Zuschnitt-/Perspektivkorrektur der Fotos fehlt noch.
- **`services/offlineSync.ts`** — Sync-Warteschlange über mehrere Geräte; der Service Worker (vite-plugin-pwa) cacht bereits die App-Shell fürs Offline-Laden.

`ios-frame.jsx` aus dem Handoff ist nur der Vorschau-Bezel und wird hier nicht verwendet — die App füllt den echten Viewport (Safe-Area-bewusst für Dynamic Island/Notch).

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Typecheck + Produktions-Build
npm run lint      # oxlint
```

Icons in `public/icons/` per `node scripts/generate-icons.mjs` (benötigt `sharp` aus den devDependencies) neu erzeugbar.

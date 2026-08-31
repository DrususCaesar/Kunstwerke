# Kunstwerke

Private Katalogisierungs-App für selbst fotografierte Kunstwerke aus Museumsbesuchen — React/Vite-PWA-Reimplementierung des Claude-Design-Handoffs in `project/design_handoff_kunstwerke_app/`.

## Stand dieser Implementierung

Alle 7 Screens (Scankarte, Sammlung, Künstler, Werk-Detail, Künstler-Detail, Korrekturmaske, Suche, Mehr) sind 1:1 nach dem Design-Handoff umgesetzt, inklusive Tab-/Push-Navigation, Filter-Chips, Masonry-/Listenansicht, Scan-Flow (Spinner → Ergebnis mit Konfidenz), Korrektur-Flow und Statistik-Dashboard. Zustand liegt — wie im Prototyp — lokal im Browser (`src/state/CollectionContext.tsx`), mit neun Beispielwerken (`src/data/sampleWorks.ts`).

Bewusst **nicht** enthalten (siehe `src/services/*.ts` für die jeweiligen TODO-Kommentare und Konzept-Verweise):

- **`services/backend.ts`** — Supabase (Postgres + Storage + Auth) statt lokalem State; Nutzer-/Rechteverwaltung für spätere Freigabe (Konzept Abschnitt 2, 7, 9).
- **`services/recognition.ts`** — echte Claude-Vision-API-Anbindung statt simulierter 900-ms-Erkennung; Server-Proxy nötig, da der API-Key nicht im Client liegen darf (Konzept Abschnitt 4.1, 4.2, 7).
- **`services/camera.ts`** — `capturePhoto()` funktioniert bereits real (native Kamera via `<input capture>`), es fehlt noch die automatische Zuschnitt-/Perspektivkorrektur.
- **`services/offlineSync.ts`** — Sync-Warteschlange für Offline-Erfassung; der Service Worker (vite-plugin-pwa) cacht bereits die App-Shell.

`ios-frame.jsx` aus dem Handoff ist nur der Vorschau-Bezel und wird hier nicht verwendet — die App füllt den echten Viewport (Safe-Area-bewusst für Dynamic Island/Notch).

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Typecheck + Produktions-Build
npm run lint      # oxlint
```

Icons in `public/icons/` per `node scripts/generate-icons.mjs` (benötigt `sharp` aus den devDependencies) neu erzeugbar.

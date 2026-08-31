/**
 * Offline-Fähigkeit — Konzept Abschnitt 4.1, 7.
 *
 * TODO(Produktivversion):
 *  - Service Worker (z. B. via vite-plugin-pwa/Workbox, s. vite.config.ts)
 *    cacht die App-Shell für den Offline-Start.
 *  - Neu erfasste Werke (inkl. Fotos) werden bei fehlender Verbindung in
 *    einer lokalen Warteschlange (IndexedDB) zwischengespeichert und beim
 *    nächsten Verbindungsaufbau automatisch mit Supabase synchronisiert
 *    (services/backend.ts).
 *  - `navigator.onLine` + `online`/`offline`-Events als Trigger für den
 *    Sync-Versuch.
 *
 * Aktuell ein reiner Platzhalter: der Prototyp-Zustand lebt nur im
 * Arbeitsspeicher des Tabs.
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

export function queueForSync<T>(_item: T): void {
  throw new Error('offlineSync.queueForSync: noch nicht implementiert');
}

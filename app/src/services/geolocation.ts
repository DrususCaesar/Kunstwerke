import type { GeoLocation } from '../types';

/**
 * Best-effort Standorterfassung beim Scan/Import — Grundlage für "Ihre
 * Scankarte" auf der Home-Seite. Kein Backend/Key nötig (Browser-API).
 * Liefert `null` bei fehlender Berechtigung, Timeout oder wenn die API
 * nicht verfügbar ist — der Scan-Flow läuft in jedem Fall weiter.
 */
export function getCurrentLocationBestEffort(timeoutMs = 4000): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

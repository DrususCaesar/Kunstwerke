/**
 * Foto-Aufnahme — Konzept Abschnitt 4.1.
 *
 * `capturePhoto()` funktioniert bereits real: `<input type="file"
 * accept="image/*" capture="environment">` öffnet auf iOS/Android die
 * native Kamera-App und liefert ein echtes Foto zurück, ganz ohne
 * zusätzliche Berechtigungen oder Backend — geeignet, um die Scankarte
 * an echte Kamera-Aufnahmen anzuschließen.
 *
 * TODO(Produktivversion):
 *  - Automatische Zuschnitt-/Randerkennung + Perspektivkorrektur
 *    (Canvas/JS-Kantenerkennung, ggf. unterstützt durch die Vision-API zur
 *    Eckpunkt-Erkennung), mit manueller Nachjustierung der Eckpunkte.
 *  - Sofortige lokale Zwischenspeicherung (auch offline im Museum ohne
 *    WLAN) — s. services/offlineSync.ts.
 */
export function capturePhoto(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

/**
 * Foto-Aufnahme — Konzept Abschnitt 4.1, 4.2.
 *
 * `capturePhoto()` und `pickPhotos()` funktionieren bereits real über die
 * native Datei-/Kamera-Auswahl des Betriebssystems, ganz ohne zusätzliche
 * Berechtigungen oder Backend.
 *
 * TODO(Produktivversion):
 *  - Automatische Zuschnitt-/Randerkennung + Perspektivkorrektur
 *    (Canvas/JS-Kantenerkennung, ggf. unterstützt durch die Vision-API zur
 *    Eckpunkt-Erkennung), mit manueller Nachjustierung der Eckpunkte.
 *  - Sofortige lokale Zwischenspeicherung (auch offline im Museum ohne
 *    WLAN) — s. services/offlineSync.ts.
 */

function pickFiles(opts: { capture: boolean; multiple: boolean }): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = opts.multiple;
    if (opts.capture) input.capture = 'environment';

    let settled = false;
    const finish = (files: File[]) => {
      if (settled) return;
      settled = true;
      resolve(files);
    };
    input.onchange = () => finish(input.files ? Array.from(input.files) : []);
    // 'cancel' ist auf modernen Browsern (inkl. iOS/iPadOS Safari) verfügbar —
    // ohne diesen Listener bliebe ein abgebrochener Dialog sonst hängen.
    input.oncancel = () => finish([]);
    input.click();
  });
}

/** Öffnet die native Kamera (ein Foto) — für Einzel-/Doppelscan. */
export async function capturePhoto(): Promise<File | null> {
  const [file] = await pickFiles({ capture: true, multiple: false });
  return file ?? null;
}

/** Öffnet die Fotomediathek mit Mehrfachauswahl — für den Bulk-Import (Konzept 4.2). */
export function pickPhotos(): Promise<File[]> {
  return pickFiles({ capture: false, multiple: true });
}

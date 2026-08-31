/**
 * Automatische Erkennung von Bildpaaren beim Bulk-Import — Konzept 4.2:
 * "Wenn zwei zeitlich/örtlich nah aufgenommene Fotos existieren, schlägt die
 * App vor, sie als Werk+Tafel zu verknüpfen." Ohne Vision-API kann die App
 * nicht wissen, welches der beiden Fotos das Werk und welches die Tafel
 * zeigt — Reihenfolge nach Aufnahmezeit ist die beste verfügbare Annahme,
 * in der Korrekturmaske lässt sich das mit einem Tap tauschen.
 */

const PAIR_THRESHOLD_MS = 60_000;

export interface PhotoPair {
  primary: File;
  tafel?: File;
}

export function pairPhotosByCaptureTime(files: File[]): PhotoPair[] {
  const sorted = [...files].sort((a, b) => a.lastModified - b.lastModified);
  const pairs: PhotoPair[] = [];
  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (next && Math.abs(next.lastModified - current.lastModified) <= PAIR_THRESHOLD_MS) {
      pairs.push({ primary: current, tafel: next });
      i += 2;
    } else {
      pairs.push({ primary: current });
      i += 1;
    }
  }
  return pairs;
}

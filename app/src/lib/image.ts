/**
 * Foto → komprimierte data: URL fürs Speichern in localStorage (services/backend.ts
 * ersetzt das später durch Supabase Storage). Skaliert auf eine vernünftige
 * Kantenlänge herunter und liefert das echte Seitenverhältnis des Fotos mit —
 * ersetzt damit das feste `aspect` der Platzhalter-Beispieldaten.
 */

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

export interface CompressedPhoto {
  dataUrl: string;
  aspect: string;
}

export function fileToCompressedPhoto(file: File): Promise<CompressedPhoto> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('fileToCompressedPhoto: 2D-Canvas-Kontext nicht verfügbar'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
        aspect: `${img.naturalWidth}/${img.naturalHeight}`,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('fileToCompressedPhoto: Bild konnte nicht gelesen werden'));
    };
    img.src = objectUrl;
  });
}

export interface CropBox {
  xMinPct: number;
  yMinPct: number;
  xMaxPct: number;
  yMaxPct: number;
}

/**
 * Schneidet ein Foto auf die von der Vision-API vorgeschlagene Werk-/Rahmen-
 * grenze zu (Konzept 4.1: "automatische Zuschnitt-/Randoptimierung"). Rein
 * achsenparalleler Zuschnitt, keine Perspektivkorrektur — das bleibt ein
 * offener Punkt (s. services/camera.ts).
 */
export function cropPhoto(dataUrl: string, box: CropBox): Promise<CompressedPhoto> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const xMin = clampPct(box.xMinPct);
      const yMin = clampPct(box.yMinPct);
      const xMax = clampPct(box.xMaxPct);
      const yMax = clampPct(box.yMaxPct);
      const sx = (xMin / 100) * img.naturalWidth;
      const sy = (yMin / 100) * img.naturalHeight;
      const sw = Math.max(1, ((xMax - xMin) / 100) * img.naturalWidth);
      const sh = Math.max(1, ((yMax - yMin) / 100) * img.naturalHeight);

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('cropPhoto: 2D-Canvas-Kontext nicht verfügbar'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
        aspect: `${canvas.width}/${canvas.height}`,
      });
    };
    img.onerror = () => reject(new Error('cropPhoto: Bild konnte nicht gelesen werden'));
    img.src = dataUrl;
  });
}

function clampPct(v: number): number {
  return Math.min(100, Math.max(0, v));
}

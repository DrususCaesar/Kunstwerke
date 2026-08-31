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

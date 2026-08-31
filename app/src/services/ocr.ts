/**
 * Kostenlose, clientseitige OCR (Tesseract.js) als Ersatz für die Claude
 * Vision API, solange kein ANTHROPIC_API_KEY hinterlegt ist — s. lib/ocrFallback.ts
 * für die komplette Erkennungs-Pipeline (OCR + Zuschnitt-Heuristik +
 * Text-Parsing). Läuft komplett im Browser, kein Server, kein Key, keine
 * laufenden Kosten. Tesseract.js selbst wird erst bei Bedarf nachgeladen
 * (dynamischer Import), damit es nicht im Haupt-Bundle landet.
 *
 * Qualität ist ehrlich begrenzt: ohne echtes Sprachverständnis hilft nur
 * rohe Texterkennung + Heuristik — bei stark schräg fotografierten oder
 * kleinteiligen Tafeln (wie bei einer Vision-API) spürbar unzuverlässiger.
 * Deshalb: probiert das Foto in 4 Rotationen (0°/90°/180°/270°) und nimmt
 * das Ergebnis mit der höchsten Tesseract-Konfidenz — die häufigste Ursache
 * für komplett unbrauchbare OCR-Ergebnisse ist ein falsch herum gehaltenes
 * Handy, nicht ein leicht schräger Winkel.
 */

const LANGS = ['deu', 'eng'];
const ROTATIONS = [0, 90, 180, 270] as const;

export interface OcrResult {
  text: string;
  confidence: number;
}

let workerPromise: ReturnType<typeof createOcrWorker> | null = null;

async function createOcrWorker() {
  const { createWorker } = await import('tesseract.js');
  return createWorker(LANGS);
}

function getWorker() {
  if (!workerPromise) workerPromise = createOcrWorker();
  return workerPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('loadImage: Bild konnte nicht geladen werden'));
    img.src = src;
  });
}

/** Rotiert + graustuft + spreizt den Kontrast — verbessert die OCR-Trefferquote auf Fotos deutlich. */
async function rotatedGrayscaleCanvas(img: HTMLImageElement, degrees: number): Promise<HTMLCanvasElement> {
  const swap = degrees === 90 || degrees === 270;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? img.naturalHeight : img.naturalWidth;
  canvas.height = swap ? img.naturalWidth : img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('rotatedGrayscaleCanvas: 2D-Canvas-Kontext nicht verfügbar');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;
  const gray = new Uint8ClampedArray(d.length / 4);
  let min = 255;
  let max = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    gray[p] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const stretched = ((gray[p] - min) / range) * 255;
    d[i] = d[i + 1] = d[i + 2] = stretched;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Läuft OCR über alle vier Rotationen und liefert das Ergebnis mit der höchsten Konfidenz. */
export async function recognizeTafelText(dataUrl: string): Promise<OcrResult> {
  const worker = await getWorker();
  const img = await loadImage(dataUrl);

  let best: OcrResult = { text: '', confidence: 0 };
  for (const degrees of ROTATIONS) {
    try {
      const canvas = await rotatedGrayscaleCanvas(img, degrees);
      const { data } = await worker.recognize(canvas);
      if (data.confidence > best.confidence) {
        best = { text: data.text, confidence: data.confidence };
      }
    } catch (e) {
      console.error(`OCR bei ${degrees}° fehlgeschlagen`, e);
    }
  }
  return best;
}

import type { CropBox } from './image';

/**
 * Zuschnitt-Vorschlag ohne Vision-API: reine Bildverarbeitung im Browser,
 * kein Key, keine Kosten. Idee: an einer möglichst schlichten Museumswand
 * hat der Bildrand wenig Kanten-/Kontrastenergie, das Werk (Rahmenkante +
 * Motiv) deutlich mehr — also links/rechts/oben/unten so weit eintrimmen,
 * bis die "ruhigen" Randstreifen weg sind. Deutlich unzuverlässiger als
 * eine Vision-API (versagt bei texturierten Wänden oder randfüllenden
 * Motiven) — schlägt deshalb im Zweifel lieber gar keinen Zuschnitt vor,
 * statt einen falschen zu riskieren.
 */

const ANALYSIS_SIZE = 320;
const EDGE_ENERGY_FRACTION = 0.015;
const MIN_TRIM_PCT = 6;
const MIN_KEEP_PCT = 50;
const PAD_PCT = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('loadImage: Bild konnte nicht geladen werden'));
    img.src = src;
  });
}

function boundsFromProjection(arr: Float32Array): [number, number] | null {
  const total = arr.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  const marginEnergy = total * EDGE_ENERGY_FRACTION;

  let cum = 0;
  let start = 0;
  for (; start < arr.length; start++) {
    cum += arr[start];
    if (cum >= marginEnergy) break;
  }

  cum = 0;
  let end = arr.length - 1;
  for (; end >= 0; end--) {
    cum += arr[end];
    if (cum >= marginEnergy) break;
  }

  return end > start ? [start, end] : null;
}

function isWorthwhileCrop(box: CropBox): boolean {
  const width = box.xMaxPct - box.xMinPct;
  const height = box.yMaxPct - box.yMinPct;
  const trimmedX = box.xMinPct + (100 - box.xMaxPct);
  const trimmedY = box.yMinPct + (100 - box.yMaxPct);
  const trimmedEnough = trimmedX >= MIN_TRIM_PCT || trimmedY >= MIN_TRIM_PCT;
  const keptEnough = width >= MIN_KEEP_PCT && height >= MIN_KEEP_PCT;
  return trimmedEnough && keptEnough;
}

function padded(box: CropBox): CropBox {
  return {
    xMinPct: Math.max(0, box.xMinPct - PAD_PCT),
    yMinPct: Math.max(0, box.yMinPct - PAD_PCT),
    xMaxPct: Math.min(100, box.xMaxPct + PAD_PCT),
    yMaxPct: Math.min(100, box.yMaxPct + PAD_PCT),
  };
}

export async function detectArtworkCrop(dataUrl: string): Promise<CropBox | null> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, ANALYSIS_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const grad = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx = gray[idx + 1] - gray[idx - 1];
      const gy = gray[idx + w] - gray[idx - w];
      grad[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  const rowSum = new Float32Array(h);
  const colSum = new Float32Array(w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grad[y * w + x];
      rowSum[y] += v;
      colSum[x] += v;
    }
  }

  const rowBounds = boundsFromProjection(rowSum);
  const colBounds = boundsFromProjection(colSum);
  if (!rowBounds || !colBounds) return null;

  const box: CropBox = {
    xMinPct: (colBounds[0] / w) * 100,
    yMinPct: (rowBounds[0] / h) * 100,
    xMaxPct: (colBounds[1] / w) * 100,
    yMaxPct: (rowBounds[1] / h) * 100,
  };

  return isWorthwhileCrop(box) ? padded(box) : null;
}

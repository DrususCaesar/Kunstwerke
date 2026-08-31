import type { Confidence, Werk } from '../types';
import type { CropBox } from '../lib/image';
import { recognizeTafelText } from './ocr';
import { parseTafelText } from '../lib/tafelParser';
import { detectArtworkCrop } from '../lib/autoCrop';

/**
 * KI-gestützte Werkerkennung — Konzept Abschnitt 4.1, 4.2, 7. Zwei Stufen:
 *
 * 1. `/api/recognize` (Vercel Serverless Function, s. api/recognize.ts) —
 *    Claude Vision API, serverseitig mit dem ANTHROPIC_API_KEY aus einer
 *    Vercel-Umgebungsvariable aufgerufen (nie im Client). Beste Qualität.
 * 2. Ist die Function nicht erreichbar/nicht konfiguriert (kein Key
 *    hinterlegt, oder lokale Entwicklung ohne Vercel), fällt diese Funktion
 *    automatisch auf eine kostenlose, clientseitige Erkennung zurück:
 *    Tesseract.js liest das Tafelfoto (services/ocr.ts), eine Heuristik
 *    parst den Rohtext in Felder (lib/tafelParser.ts), und eine einfache
 *    Bildanalyse schlägt einen Zuschnitt vor (lib/autoCrop.ts). Deutlich
 *    unzuverlässiger als Stufe 1, aber ohne Key nutzbar. Findet auch das
 *    nichts Brauchbares, bleibt es beim ehrlich leeren Ergebnis wie bisher.
 */

export type RecognitionResult = Omit<Werk, 'id' | 'status' | 'dateAdded'>;

interface RecognizeInput {
  primaryDataUrl: string;
  tafelDataUrl?: string;
}

interface RecognizeApiResponse {
  title: string;
  artistFull: string;
  artistCall: string;
  isNotname: boolean;
  year: string;
  epoch: string;
  genre: string;
  museum: string;
  room: string;
  city: string;
  material: string;
  tags: string[];
  notes: string;
  confidence: Confidence;
  crop: CropBox | null;
}

function blankResult(): Omit<RecognitionResult, 'confidence'> {
  return {
    artistFull: '',
    artistCall: 'Unbekannt',
    isNotname: true,
    title: 'Unbenanntes Werk',
    year: '',
    epoch: '',
    genre: '',
    museum: '',
    room: '',
    city: '',
    material: '',
    tags: [],
    notes: '',
    hasTafel: false,
    aspect: '3/4',
  };
}

export interface RecognizeOutcome {
  fields: RecognitionResult;
  /** Zuschnitt-Vorschlag fürs Werkfoto (Konzept 4.1), nur bei erfolgreicher Erkennung. */
  crop: CropBox | null;
}

async function callVisionApi(input: RecognizeInput): Promise<RecognizeOutcome | null> {
  try {
    const res = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryImage: input.primaryDataUrl, tafelImage: input.tafelDataUrl }),
    });
    if (!res.ok) {
      // 503 = kein Key hinterlegt, 404 = lokale Entwicklung ohne Vercel — beides erwartbar, kein Fehlerlog nötig.
      if (res.status !== 503 && res.status !== 404) {
        console.warn('recognizeArtwork: /api/recognize antwortete mit', res.status);
      }
      return null;
    }
    const data: RecognizeApiResponse = await res.json();
    return {
      fields: {
        title: data.title || 'Unbenanntes Werk',
        artistFull: data.artistFull,
        artistCall: data.artistCall || 'Unbekannt',
        isNotname: data.isNotname,
        year: data.year,
        epoch: data.epoch,
        genre: data.genre,
        museum: data.museum,
        room: data.room,
        city: data.city,
        material: data.material,
        tags: data.tags ?? [],
        notes: data.notes,
        confidence: data.confidence,
        hasTafel: false, // wird vom Aufrufer anhand des Tafel-Fotos selbst gesetzt
        aspect: '3/4', // wird vom Aufrufer anhand des echten Fotos überschrieben
      },
      crop: data.crop,
    };
  } catch (e) {
    console.error('recognizeArtwork: /api/recognize-Anfrage fehlgeschlagen', e);
    return null;
  }
}

/** Kostenlose Notlösung ohne Vision API: OCR + Heuristik-Parsing + Zuschnitt-Analyse. */
async function recognizeLocally(input: RecognizeInput): Promise<RecognizeOutcome> {
  const cropPromise = detectArtworkCrop(input.primaryDataUrl).catch((e) => {
    console.error('lokale Zuschnitt-Analyse fehlgeschlagen', e);
    return null;
  });

  let fields = blankResult();
  if (input.tafelDataUrl) {
    try {
      const ocr = await recognizeTafelText(input.tafelDataUrl);
      const parsed = parseTafelText(ocr.text);
      const foundSomething = parsed.title || parsed.artistCall !== 'Unbekannt' || parsed.museum || parsed.material;
      if (foundSomething) {
        fields = {
          ...fields,
          title: parsed.title || fields.title,
          artistFull: parsed.artistFull,
          artistCall: parsed.artistCall,
          isNotname: parsed.isNotname,
          year: parsed.year,
          museum: parsed.museum,
          city: parsed.city,
          material: parsed.material,
          tags: parsed.tags,
        };
      }
    } catch (e) {
      console.error('lokale OCR fehlgeschlagen', e);
    }
  }

  const crop = await cropPromise;
  return { fields: { ...fields, confidence: 'Vorschlag, bitte prüfen' }, crop };
}

export async function recognizeArtwork(input: RecognizeInput): Promise<RecognizeOutcome> {
  const viaApi = await callVisionApi(input);
  if (viaApi) return viaApi;
  return recognizeLocally(input);
}

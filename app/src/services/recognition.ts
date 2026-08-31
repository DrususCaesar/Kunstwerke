import type { Confidence, Werk } from '../types';
import type { CropBox } from '../lib/image';

/**
 * KI-gestützte Werkerkennung — Konzept Abschnitt 4.1, 4.2, 7.
 *
 * Ruft `/api/recognize` (Vercel Serverless Function, s. api/recognize.ts)
 * auf, die serverseitig die Claude Vision API mit dem ANTHROPIC_API_KEY
 * aufruft — der Key liegt dort in einer Vercel-Umgebungsvariable, niemals
 * im Client. Ist die Function nicht erreichbar/nicht konfiguriert (lokale
 * Entwicklung ohne Vercel, oder der Key fehlt noch), fällt diese Funktion
 * ohne sichtbaren Fehler auf ein ehrlich leeres Ergebnis zurück — die
 * Nutzerin trägt die Felder dann wie bisher über "Bearbeiten"/"Korrigieren"
 * selbst ein.
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

export async function recognizeArtwork({ primaryDataUrl, tafelDataUrl }: RecognizeInput): Promise<RecognizeOutcome> {
  try {
    const res = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryImage: primaryDataUrl, tafelImage: tafelDataUrl }),
    });
    if (!res.ok) {
      // 503 = kein Key hinterlegt, 404 = lokale Entwicklung ohne Vercel — beides erwartbar, kein Fehlerlog nötig.
      if (res.status !== 503 && res.status !== 404) {
        console.warn('recognizeArtwork: /api/recognize antwortete mit', res.status);
      }
      return { fields: { ...blankResult(), confidence: 'Vorschlag, bitte prüfen' }, crop: null };
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
    console.error('recognizeArtwork: Anfrage fehlgeschlagen', e);
    return { fields: { ...blankResult(), confidence: 'Vorschlag, bitte prüfen' }, crop: null };
  }
}

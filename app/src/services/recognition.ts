import type { Confidence, ScanMode, Werk } from '../types';

/**
 * Stub für die KI-gestützte Werkerkennung — Konzept Abschnitt 4.1, 4.2, 7.
 *
 * TODO(Produktivversion): durch einen Server-Aufruf der Claude Vision API
 * ersetzen (der API-Key darf nicht im Client liegen):
 *  - Tafel-Foto vorhanden → OCR + Verständnis (Künstler/Titel/Jahr/Material),
 *    auch bei Schrägaufnahmen/Teilverdeckung.
 *  - nur Werk-Foto → Stilerkennung anhand Bildmerkmalen, ehrliche Konfidenz
 *    ("sicher" / "Vorschlag, bitte prüfen").
 *  - Deutsche kanonische Schreibweise für Künstler/Titel vorgeben (Konzept 6).
 *  - Lernmechanismus: bestätigte Korrekturen serverseitig als Kontext für
 *    künftige Erkennungen ablegen, vor jeder neuen API-Anfrage abgleichen
 *    (Trefferquote ↑, API-Kosten ↓).
 */

const RECOGNITION_DELAY_MS = 900;

export type RecognitionResult = Omit<Werk, 'id' | 'status' | 'dateAdded'>;

const MOCK_RESULT: Omit<RecognitionResult, 'confidence'> = {
  artistFull: 'Peter Paul Rubens',
  artistCall: 'Peter Paul Rubens',
  isNotname: false,
  title: 'Das Pelzchen',
  year: 'um 1638',
  epoch: 'Barock',
  genre: 'Gemälde',
  museum: 'Kunsthistorisches Museum',
  room: 'Saal X',
  city: 'Wien, Österreich',
  material: 'Öl auf Holz',
  tags: ['Porträt'],
  notes: '',
  hasTafel: false,
  aspect: '3/4',
};

/**
 * Simuliert Aufnahme + KI-Analyse. Doppelscan (Werk + Tafel) liefert dank
 * Tafel-Text immer "sicher", Einzelscan ohne Tafel ehrlich "Vorschlag, bitte
 * prüfen" — s. Handoff README → Scankarte "States".
 */
export function recognizeArtwork(mode: ScanMode): Promise<RecognitionResult> {
  const confidence: Confidence = mode === 'double' ? 'sicher' : 'Vorschlag, bitte prüfen';
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_RESULT, confidence }), RECOGNITION_DELAY_MS);
  });
}

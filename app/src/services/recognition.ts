import type { Confidence, ScanMode, Werk } from '../types';

/**
 * Stub für die KI-gestützte Werkerkennung — Konzept Abschnitt 4.1, 4.2, 7.
 *
 * Ohne Anthropic API-Key kann hier ehrlich nichts erkannt werden: statt wie
 * im Design-Prototyp ein festes Beispielwerk vorzutäuschen, liefert dieser
 * Stub ein leeres Werk mit Konfidenz "Vorschlag, bitte prüfen" — die
 * Nutzerin/der Nutzer trägt die Felder über "Bearbeiten"/die Korrekturmaske
 * selbst ein.
 *
 * TODO(Produktivversion): durch einen Server-Aufruf der Claude Vision API
 * ersetzen (der API-Key darf nicht im Client liegen):
 *  - Tafel-Foto vorhanden → OCR + Verständnis (Künstler/Titel/Jahr/Material),
 *    auch bei Schrägaufnahmen/Teilverdeckung. Erst dann rechtfertigt ein
 *    Doppelscan wieder die pauschale Konfidenz "sicher" aus dem Design.
 *  - nur Werk-Foto → Stilerkennung anhand Bildmerkmalen, ehrliche Konfidenz
 *    ("sicher" / "Vorschlag, bitte prüfen").
 *  - Deutsche kanonische Schreibweise für Künstler/Titel vorgeben (Konzept 6).
 *  - Lernmechanismus: bestätigte Korrekturen serverseitig als Kontext für
 *    künftige Erkennungen ablegen, vor jeder neuen API-Anfrage abgleichen
 *    (Trefferquote ↑, API-Kosten ↓).
 */

const RECOGNITION_DELAY_MS = 900;

export type RecognitionResult = Omit<Werk, 'id' | 'status' | 'dateAdded'>;

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

/** Simuliert die Analysezeit; das Ergebnis bleibt bis zur echten Vision-API-Anbindung leer. */
export function recognizeArtwork(_mode: ScanMode): Promise<RecognitionResult> {
  const confidence: Confidence = 'Vorschlag, bitte prüfen';
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...blankResult(), confidence }), RECOGNITION_DELAY_MS);
  });
}

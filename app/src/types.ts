export type WerkStatus = 'vollständig' | 'zu prüfen' | 'unvollständig';
export type Confidence = 'sicher' | 'Vorschlag, bitte prüfen';

/** Datenmodell pro Werk — Konzept Abschnitt 2. */
export interface Werk {
  id: number;
  artistFull: string;
  artistCall: string;
  /** Notname (z. B. "Meister von Flémalle") statt bürgerlichem Namen — Konzept Abschnitt 6. */
  isNotname: boolean;
  title: string;
  year: string;
  epoch: string;
  genre: string;
  museum: string;
  room: string;
  city: string;
  material: string;
  tags: string[];
  notes: string;
  dateAdded: string;
  status: WerkStatus;
  confidence: Confidence;
  hasTafel: boolean;
  /** CSS aspect-ratio des Werkfotos, z. B. "4/3" oder "3/4". */
  aspect: string;
  /** Echtes, clientseitig komprimiertes Foto (JPEG data: URL) — fehlt nur bei Alt-Einträgen ohne Foto. */
  photoDataUrl?: string;
  /** Tafel-Foto beim Doppelscan (Konzept 4.1); nur gesetzt, wenn hasTafel true ist. */
  tafelPhotoDataUrl?: string;
}

export type GalleryView = 'masonry' | 'list';
export type ScanMode = 'single' | 'double' | null;
export type ScanStep = 'scanning' | 'result' | null;
export type Screen = 'tab' | 'detail' | 'artist' | 'korrektur';
export type Tab = 'scan' | 'sammlung' | 'kuenstler' | 'suche' | 'mehr';

/** Startpunkt-Epochenliste — Konzept Abschnitt 9 (frei erweiterbar). */
export const EPOCHS = [
  'Antike',
  'Romanik',
  'Gotik',
  'Frührenaissance',
  'Hochrenaissance',
  'Manierismus',
  'Barock',
  'Rokoko',
  'Klassizismus',
  'Romantik',
  'Realismus',
  'Impressionismus',
  'Postimpressionismus',
  'Jugendstil',
  'Expressionismus',
  'Klassische Moderne',
  'Nachkriegsmoderne',
  'Zeitgenössisch',
] as const;

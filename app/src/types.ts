export type WerkStatus = 'vollständig' | 'zu prüfen' | 'unvollständig';
export type Confidence = 'sicher' | 'Vorschlag, bitte prüfen';

export interface GeoLocation {
  lat: number;
  lng: number;
}

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
  /** Tafel-Foto beim Doppelscan/Bulk-Import-Paar (Konzept 4.1, 4.2); nur gesetzt, wenn hasTafel true ist. */
  tafelPhotoDataUrl?: string;
  /** Seitenverhältnis des Tafel-Fotos, für einen sauberen Tausch mit dem Werkfoto. */
  tafelAspect?: string;
  /** Beim Scan best-effort per Browser-Geolocation erfasst — Basis für "Ihre Scankarte". */
  location?: GeoLocation;
}

/** Nutzerdefinierte, frei benennbare Sammlung (Ordner) — Sammlung-Tab "Sammlungen". */
export interface WerkCollection {
  id: string;
  name: string;
  workIds: number[];
}

export type ScanMode = 'single' | 'double' | null;
export type ScanStep = 'scanning' | 'result' | null;
export type Screen = 'tab' | 'detail' | 'artist' | 'korrektur' | 'settings' | 'collection';
export type Tab = 'home' | 'scan' | 'sammlung' | 'entdecken';
export type SammlungSubTab = 'bibliothek' | 'besuche' | 'sammlungen';

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

/**
 * Heuristisches Parsing von OCR-Rohtext einer Museumstafel in Werk-Felder —
 * Ersatz für echtes Sprachverständnis, solange keine Vision API verbunden
 * ist (s. services/ocr.ts). Arbeitet nach Stichworten/Mustern statt
 * Verständnis — entsprechend vorsichtig: liefert nie "sicher", nur
 * Vorschläge zur Prüfung in der Korrekturmaske.
 */

export interface ParsedTafel {
  title: string;
  artistFull: string;
  artistCall: string;
  isNotname: boolean;
  year: string;
  material: string;
  museum: string;
  city: string;
  tags: string[];
}

const MATERIAL_KEYWORDS: { pattern: RegExp; tag: string }[] = [
  { pattern: /öl auf leinwand|oil on canvas|huile sur toile/i, tag: 'Gemälde' },
  { pattern: /öl auf holz(tafel)?|oil on (wood|panel)|huile sur (bois|panneau)/i, tag: 'Gemälde' },
  { pattern: /tempera/i, tag: 'Gemälde' },
  { pattern: /aquarell|watercolour|watercolor|aquarelle/i, tag: 'Gemälde' },
  { pattern: /gouache/i, tag: 'Gemälde' },
  { pattern: /fresko|fresco|fresque/i, tag: 'Fresko' },
  { pattern: /marmor|marble|marbre/i, tag: 'Skulptur' },
  { pattern: /bronze/i, tag: 'Skulptur' },
  { pattern: /terrakotta|terracotta/i, tag: 'Skulptur' },
  { pattern: /holzschnitt|woodcut|kupferstich|engraving|radierung|etching|lithograph/i, tag: 'Grafik' },
  { pattern: /zeichnung|drawing|dessin/i, tag: 'Zeichnung' },
];

const MUSEUM_KEYWORDS = /museum|musée|musee|galerie|gallery|pinakothek|sammlung|gemäldegalerie|kunsthalle|akademie|palazzo|palais/i;

function cleanLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length >= 2 && /[a-zA-ZÀ-ÿ]{2}/.test(l));
}

function findYear(text: string): string {
  // Lebensdaten-Spannen (z. B. "1571–1610") zuerst maskieren, damit sie nicht als Entstehungsjahr durchgehen.
  const masked = text.replace(/\b(1[0-9]{3}|20[0-2][0-9])\s*[-–—]\s*(1[0-9]{3}|20[0-2][0-9])\b/g, '');
  const circa = masked.match(/\b(um|ca\.?|circa|about|vers)\s*(1[0-9]{3}|20[0-2][0-9])\b/i);
  if (circa) return `um ${circa[2]}`;
  const bare = masked.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
  return bare ? bare[1] : '';
}

/** Filtert OCR-Kauderwelsch aus Titel-Kandidaten: mindestens zwei echte Wörter, überwiegend Buchstaben. */
function looksLikeProse(line: string): boolean {
  const letters = (line.match(/[a-zA-ZÀ-ÿ]/g) ?? []).length;
  const words = line.split(' ').filter((w) => /[a-zA-ZÀ-ÿ]{2,}/.test(w));
  return words.length >= 2 && letters / line.length >= 0.6;
}

function findMaterial(lines: string[]): { material: string; tags: string[] } {
  for (const line of lines) {
    for (const { pattern, tag } of MATERIAL_KEYWORDS) {
      if (pattern.test(line)) return { material: line, tags: [tag] };
    }
  }
  return { material: '', tags: [] };
}

function findMuseum(lines: string[]): { museum: string; city: string } {
  const line = lines.find((l) => MUSEUM_KEYWORDS.test(l));
  if (!line) return { museum: '', city: '' };
  const [museum, city] = line.split(',').map((s) => s.trim());
  return { museum: museum ?? line, city: city ?? '' };
}

// Häufige satzeinleitende Wörter, die in mehreren Sprachen zufällig oft
// großgeschrieben vorkommen und sonst als falsche Eigennamen-Kandidaten durchgingen.
const STOPWORDS = new Set([
  'Der', 'Die', 'Das', 'Den', 'Dem', 'Ein', 'Eine',
  'The', 'This', 'That', 'These', 'Those', 'A', 'An',
  'Le', 'La', 'Les', 'Un', 'Une', 'Il', 'Elle',
  'Il', 'Lo', 'Gli', 'El', 'Los', 'Las',
]);

/**
 * Mehrsprachige Tafeln übersetzen Titel und Beschreibung, aber nicht
 * Eigennamen — "Marcello" oder "Castiglione-Colonna" stehen unverändert in
 * jedem Sprachblock, auch wenn die umgebenden Wörter je Sprache wechseln
 * (deshalb Wort- statt Zeilenvergleich). Ein einzelnes großgeschriebenes
 * Wort, das mehrfach im Text auftaucht, ist meist ein Eigenname.
 */
function findRepeatedProperNouns(lines: string[], exclude: Set<string>): string[] {
  const WORD_PATTERN = /\b[A-ZÀ-Ý][\p{L}'-]{2,}\b/gu;
  const counts = new Map<string, number>();
  for (const line of lines) {
    for (const match of line.matchAll(WORD_PATTERN)) {
      const word = match[0];
      if (STOPWORDS.has(word) || exclude.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

export function parseTafelText(rawText: string): ParsedTafel {
  const lines = cleanLines(rawText);
  const { material, tags } = findMaterial(lines);
  const { museum, city } = findMuseum(lines);
  const year = findYear(rawText);

  const excluded = new Set([material, museum, city].filter(Boolean));
  const candidates = findRepeatedProperNouns(lines, excluded).filter((c) => !MUSEUM_KEYWORDS.test(c));

  // Die Trennung "vollständiger Name" vs. Rufname (Konzept 6) lässt sich aus
  // wiederholten Wortfolgen allein nicht verlässlich bestimmen — deshalb
  // artistFull bewusst leer lassen und nur den Rufname-Kandidaten zeigen,
  // statt eine Zuordnung vorzutäuschen, die so nicht belegt ist.
  const artistCandidate = candidates[0] ?? '';

  const titleCandidate = lines.find(
    (l) =>
      l !== artistCandidate &&
      l !== material &&
      l !== museum &&
      !MUSEUM_KEYWORDS.test(l) &&
      l.length >= 3 &&
      l.length <= 80 &&
      looksLikeProse(l)
  );

  return {
    title: titleCandidate ?? '',
    artistFull: '',
    artistCall: artistCandidate || 'Unbekannt',
    isNotname: true,
    year,
    material,
    museum,
    city,
    tags,
  };
}

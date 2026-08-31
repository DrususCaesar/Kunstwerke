import type { Werk } from '../types';

/** Filter-Chips wirken als OR-Verknüpfung über Epoche/Gattung/Status/Museum. */
export function filterWorks(works: Werk[], activeChips: string[]): Werk[] {
  if (activeChips.length === 0) return works;
  return works.filter(
    (w) =>
      activeChips.includes(w.epoch) ||
      activeChips.includes(w.genre) ||
      activeChips.includes(w.status) ||
      activeChips.includes(w.museum)
  );
}

export function chipLabels(works: Werk[]): string[] {
  const dynamic = Array.from(new Set(works.flatMap((w) => [w.epoch, w.genre]).filter(Boolean)));
  return [...dynamic, 'vollständig', 'zu prüfen', 'unvollständig'];
}

/** Häufigste Epochen/Tags der eigenen Sammlung als Suchvorschläge (statt fixer Beispielwerte). */
export function suggestedSearchTags(works: Werk[], limit = 5): string[] {
  const counts = new Map<string, number>();
  works.forEach((w) => {
    [w.epoch, ...w.tags].filter(Boolean).forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => label);
}

export interface ArtistSummary {
  call: string;
  full: string;
  isNotname: boolean;
  count: number;
  museumCount: number;
  works: Werk[];
}

/** Nach Werkanzahl sortierte Künstlerliste — Konzept Abschnitt 4.4. */
export function groupByArtist(works: Werk[]): ArtistSummary[] {
  const byArtist = new Map<string, Werk[]>();
  works.forEach((w) => {
    const list = byArtist.get(w.artistCall) ?? [];
    list.push(w);
    byArtist.set(w.artistCall, list);
  });
  return Array.from(byArtist.entries())
    .map(([call, ws]) => ({
      call,
      full: ws[0].artistFull,
      isNotname: ws[0].isNotname,
      count: ws.length,
      museumCount: new Set(ws.map((w) => w.museum)).size,
      works: ws,
    }))
    .sort((a, b) => b.count - a.count || a.call.localeCompare(b.call));
}

/** Volltextsuche über Künstler, Titel, Museum, Tags — Konzept Abschnitt 4.5. */
export function searchWorks(works: Werk[], query: string): Werk[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return works.filter(
    (w) =>
      w.title.toLowerCase().includes(q) ||
      w.artistCall.toLowerCase().includes(q) ||
      w.artistFull.toLowerCase().includes(q) ||
      w.museum.toLowerCase().includes(q) ||
      w.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function korrekturQueue(works: Werk[]): Werk[] {
  return works.filter((w) => w.status !== 'vollständig');
}

export interface MonthBar {
  label: string;
  height: string;
}

export interface CollectionStats {
  total: number;
  museums: number;
  topEpoch: string;
  chart: MonthBar[];
}

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug'];
const MONTH_KEYS = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august'];

export function collectionStats(works: Werk[]): CollectionStats {
  const epochCounts = new Map<string, number>();
  works.forEach((w) => {
    if (!w.epoch) return; // noch nicht befüllte Felder zählen nicht als Epoche
    epochCounts.set(w.epoch, (epochCounts.get(w.epoch) ?? 0) + 1);
  });
  const topEpoch = [...epochCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '–';

  const monthCounts = MONTH_KEYS.map(() => 0);
  works.forEach((w) => {
    const idx = MONTH_KEYS.findIndex((k) => w.dateAdded.toLowerCase().includes(k));
    if (idx !== -1) monthCounts[idx]++;
  });
  const maxCount = Math.max(1, ...monthCounts);
  const chart = MONTHS.map((label, i) => ({ label, height: `${Math.max(8, (monthCounts[i] / maxCount) * 100)}%` }));

  return {
    total: works.length,
    museums: new Set(works.map((w) => w.museum).filter(Boolean)).size,
    topEpoch,
    chart,
  };
}

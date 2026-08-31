import type { Werk } from '../types';

/**
 * Stub für die Datenbank-Anbindung — Konzept Abschnitt 2, 7, 9.
 *
 * TODO(Produktivversion): durch Supabase ersetzen (Postgres + Storage + Auth):
 *  - Tabelle `werke` mit dem Datenmodell aus Konzept Abschnitt 2, Fotos im
 *    Supabase Storage.
 *  - Nutzer-/Rechteverwaltung von Anfang an mitplanen (Row Level Security),
 *    auch mit nur einem Account, damit später Lese-/Bearbeitungsrechte für
 *    eine zweite Person ohne Umbau ergänzt werden können (Konzept 9).
 *  - `src/state/CollectionContext.tsx` ruft dann diese Funktionen statt des
 *    lokalen `useReducer`-States auf; die Reducer-Actions (ADD_WORK,
 *    CONFIRM_WORK, UPDATE_WORK_FIELD, …) bleiben als Optimistic-Update-Layer
 *    bestehen.
 *
 * Die aktuellen Implementierungen sind bewusst reine Pass-throughs auf den
 * im Prototyp verwendeten lokalen Zustand (kein Netzwerk, keine Persistenz
 * über einen Seitenreload hinaus).
 */

export async function fetchWorks(): Promise<Werk[]> {
  throw new Error('backend.fetchWorks: Supabase-Anbindung noch nicht implementiert');
}

export async function saveWork(_work: Werk): Promise<void> {
  throw new Error('backend.saveWork: Supabase-Anbindung noch nicht implementiert');
}

export async function updateWork(_id: number, _patch: Partial<Werk>): Promise<void> {
  throw new Error('backend.updateWork: Supabase-Anbindung noch nicht implementiert');
}

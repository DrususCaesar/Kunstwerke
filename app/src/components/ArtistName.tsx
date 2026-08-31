import type { Werk } from '../types';

interface ArtistNameProps {
  werk: Pick<Werk, 'artistFull' | 'artistCall' | 'isNotname'>;
}

// Statt dem Browser-Standard-Bold (700) ein etwas leichteres, editorielleres
// Gewicht für den hervorgehobenen Rufnamen — s. Handoff "Verfeinere das
// Schriftdesign der Einträge".
const CALL_NAME_STYLE = { color: 'var(--text-primary)', fontWeight: 600 };

/**
 * Rufname innerhalb des vollständigen Namens hervorgehoben — Konzept Abschnitt 6.
 * Notnamen (kein vollständiger Name) zeigen nur den Rufnamen, fett.
 */
export function ArtistName({ werk }: ArtistNameProps) {
  const { artistFull, artistCall, isNotname } = werk;

  if (isNotname || !artistFull || artistFull === artistCall) {
    return <b style={CALL_NAME_STYLE}>{artistCall}</b>;
  }

  const idx = artistFull.indexOf(artistCall);
  if (idx === -1) {
    return (
      <>
        {artistFull} · <b style={CALL_NAME_STYLE}>{artistCall}</b>
      </>
    );
  }

  return (
    <>
      {artistFull.slice(0, idx)}
      <b style={CALL_NAME_STYLE}>{artistCall}</b>
      {artistFull.slice(idx + artistCall.length)}
    </>
  );
}

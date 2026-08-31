import type { Werk } from '../types';

interface ArtistNameProps {
  werk: Pick<Werk, 'artistFull' | 'artistCall' | 'isNotname'>;
}

/**
 * Rufname innerhalb des vollständigen Namens hervorgehoben — Konzept Abschnitt 6.
 * Notnamen (kein vollständiger Name) zeigen nur den Rufnamen, fett.
 */
export function ArtistName({ werk }: ArtistNameProps) {
  const { artistFull, artistCall, isNotname } = werk;

  if (isNotname || !artistFull || artistFull === artistCall) {
    return <b style={{ color: 'var(--text-primary)' }}>{artistCall}</b>;
  }

  const idx = artistFull.indexOf(artistCall);
  if (idx === -1) {
    return (
      <>
        {artistFull} · <b style={{ color: 'var(--text-primary)' }}>{artistCall}</b>
      </>
    );
  }

  return (
    <>
      {artistFull.slice(0, idx)}
      <b style={{ color: 'var(--text-primary)' }}>{artistCall}</b>
      {artistFull.slice(idx + artistCall.length)}
    </>
  );
}

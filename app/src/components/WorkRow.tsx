import type { Werk } from '../types';
import { PlaceholderArt } from './PlaceholderArt';
import { ArtistName } from './ArtistName';
import { IconPin } from './icons';

const SPINE_HUES = [50, 30, 65, 15, 80, 40, 55, 25, 70, 10];
function spineColor(seed: number): string {
  const h = SPINE_HUES[((seed % SPINE_HUES.length) + SPINE_HUES.length) % SPINE_HUES.length];
  return `oklch(0.6 0.1 ${h})`;
}

interface WorkRowProps {
  work: Werk;
  onClick: () => void;
  trailing?: React.ReactNode;
}

/** Listenzeile mit Foto + farbiger "Buchrücken"-Kante — Sammlung-Bibliothek/Besuche. */
export function WorkRow({ work, onClick, trailing }: WorkRowProps) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ position: 'relative', width: 50, height: 64, flexShrink: 0 }}>
        <PlaceholderArt seed={work.id} photoDataUrl={work.photoDataUrl} alt={work.title} radius={7} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '7px 0 0 7px', background: spineColor(work.id) }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {work.title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
          <ArtistName werk={work} />
        </div>
        {work.museum && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--text-quaternary)', marginTop: 2 }}>
            <IconPin size={10} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{work.museum}</span>
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}

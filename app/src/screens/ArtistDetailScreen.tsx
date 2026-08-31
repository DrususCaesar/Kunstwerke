import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { groupByArtist } from '../lib/selectors';
import { ArtistName } from '../components/ArtistName';
import { PlaceholderArt } from '../components/PlaceholderArt';
import { CircleButton } from '../components/CircleButton';
import { SCREEN_TOP_PADDING } from '../lib/layout';

export function ArtistDetailScreen() {
  const { state, actions } = useCollection();
  const artists = useMemo(() => groupByArtist(state.works), [state.works]);
  const artist = artists.find((a) => a.call === state.selectedArtistCall);
  if (!artist) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 30, overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
      <div style={{ padding: `${SCREEN_TOP_PADDING} 20px 16px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <CircleButton onClick={actions.closeScreen} variant="onCard">
          ‹
        </CircleButton>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Künstler</div>
      </div>

      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          <ArtistName werk={{ artistFull: artist.full, artistCall: artist.call, isNotname: artist.isNotname }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-quaternary)', marginTop: 4 }}>
          {artist.count} Werke erfasst · {artist.museumCount} Museen
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 20px 32px' }}>
        {artist.works.map((w) => (
          <div key={w.id} onClick={() => actions.openDetail(w.id)} style={{ width: 'calc(50% - 5px)', cursor: 'pointer' }}>
            <PlaceholderArt seed={w.id} photoDataUrl={w.photoDataUrl} alt={w.title} aspect={w.aspect} radius={10}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'oklch(0.6 0.02 55)', textAlign: 'center', padding: 6 }}>
                {w.title}
              </span>
            </PlaceholderArt>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-primary)',
                marginTop: 6,
                fontFamily: 'var(--font-serif)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              {w.title}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-quaternary)' }}>{w.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

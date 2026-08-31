import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { groupByArtist } from '../lib/selectors';
import { ArtistName } from '../components/ArtistName';
import { placeholderBg } from '../lib/placeholder';

export function ArtistsScreen() {
  const { state, actions } = useCollection();
  const artists = useMemo(() => groupByArtist(state.works), [state.works]);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)' }}>Künstler</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4, marginBottom: 16 }}>
        Sortiert nach Werkanzahl
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {artists.map((a) => {
          const showFull = !a.isNotname && !!a.full && a.full !== a.call;
          return (
            <div
              key={a.call}
              onClick={() => actions.openArtist(a.call)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 0',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: placeholderBg(a.call.length * 7),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'oklch(0.85 0.02 55)' }}>
                  {a.call[0]}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                  <ArtistName werk={{ artistFull: a.full, artistCall: a.call, isNotname: a.isNotname }} />
                </div>
                {showFull && <div style={{ fontSize: 10.5, color: 'var(--text-quaternary)' }}>{a.full}</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>{a.count} Werke</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

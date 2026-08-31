import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { korrekturQueue } from '../lib/selectors';
import { PlaceholderArt } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';
import { Badge, confidenceVariant } from '../components/Badge';
import { CircleButton } from '../components/CircleButton';
import { SCREEN_TOP_PADDING } from '../lib/layout';

export function KorrekturScreen() {
  const { state, actions } = useCollection();
  const queue = useMemo(() => korrekturQueue(state.works), [state.works]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 30, overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
      <div style={{ padding: `${SCREEN_TOP_PADDING} 20px 4px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <CircleButton onClick={actions.closeScreen} variant="onCard">
          ‹
        </CircleButton>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-primary)' }}>Korrekturmaske</div>
      </div>
      <div style={{ padding: '2px 20px 14px', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
        {queue.length} Vorschläge zu prüfen
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 20px 32px' }}>
        {queue.map((item) => {
          const editing = state.editingId === item.id;
          return (
            <div key={item.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <PlaceholderArt seed={item.id} radius={8} style={{ width: 52, height: 52, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing ? (
                    <>
                      <input
                        value={item.title}
                        onChange={(e) => actions.updateWorkField(item.id, 'title', e.target.value)}
                        style={{
                          width: '100%',
                          background: 'oklch(0.26 0.016 50)',
                          border: '1px solid var(--bg-input-border)',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          padding: '5px 8px',
                          fontFamily: 'var(--font-serif)',
                          marginBottom: 4,
                        }}
                      />
                      <input
                        value={item.artistCall}
                        onChange={(e) => actions.updateWorkField(item.id, 'artistCall', e.target.value)}
                        style={{
                          width: '100%',
                          background: 'oklch(0.26 0.016 50)',
                          border: '1px solid var(--bg-input-border)',
                          borderRadius: 6,
                          color: 'var(--text-secondary)',
                          fontSize: 12,
                          padding: '5px 8px',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        <ArtistName werk={item} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-quaternary)', marginTop: 2 }}>
                        {item.year} · {item.museum}
                      </div>
                    </>
                  )}
                </div>
                <Badge label={item.confidence} variant={confidenceVariant(item.confidence)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => actions.confirmWork(item.id)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--accent-gold)',
                    color: 'var(--accent-gold-text-on)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Bestätigen
                </button>
                <button
                  onClick={() => actions.toggleEdit(item.id)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--bg-input-border)',
                    background: 'transparent',
                    color: 'var(--text-outline-btn)',
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  {editing ? 'Fertig' : 'Korrigieren'}
                </button>
              </div>
            </div>
          );
        })}
        {queue.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
            Alle Vorschläge geprüft.
          </div>
        )}
      </div>
    </div>
  );
}

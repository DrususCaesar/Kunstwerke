import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { groupByArtist, searchWorks, suggestedSearchTags } from '../lib/selectors';
import { WorkRow } from '../components/WorkRow';
import { ArtistName } from '../components/ArtistName';
import { placeholderBg } from '../lib/placeholder';

export function EntdeckenScreen() {
  const { state, actions } = useCollection();
  const query = state.searchQuery.trim();
  const results = useMemo(() => searchWorks(state.works, state.searchQuery), [state.works, state.searchQuery]);
  const suggestions = useMemo(() => suggestedSearchTags(state.works), [state.works]);
  const artists = useMemo(() => groupByArtist(state.works), [state.works]);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 14 }}>
        Entdecken
      </div>
      <input
        value={state.searchQuery}
        onChange={(e) => actions.setSearchQuery(e.target.value)}
        placeholder="Künstler, Titel, Museum, Tag …"
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
          fontSize: 13.5,
          marginBottom: 16,
        }}
      />

      {query.length > 0 ? (
        results.length > 0 ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>{results.length} Ergebnisse</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {results.map((w) => (
                <WorkRow key={w.id} work={w} onClick={() => actions.openDetail(w.id)} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
            Keine Treffer für „{query}“
          </div>
        )
      ) : (
        <>
          {suggestions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-quaternary)',
                  marginBottom: 10,
                }}
              >
                Vorschläge
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => actions.setSearchQuery(tag)}
                    style={{
                      fontSize: 12,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            Künstler
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 14 }}>Sortiert nach Werkanzahl</div>

          {artists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
              Noch keine Werke erfasst — über Scannen oder Import geht's los.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {artists.map((a) => {
                const showFull = !a.isNotname && !!a.full && a.full !== a.call;
                const portrait = state.artistPortraits[a.call];
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
                        overflow: 'hidden',
                        background: portrait ? undefined : placeholderBg(a.call.length * 7),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {portrait ? (
                        <img src={portrait} alt={a.call} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'oklch(0.85 0.02 55)' }}>{a.call[0]}</span>
                      )}
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
          )}
        </>
      )}
    </div>
  );
}

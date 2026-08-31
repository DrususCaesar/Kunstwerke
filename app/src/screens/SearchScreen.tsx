import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { searchWorks, suggestedSearchTags } from '../lib/selectors';
import { PlaceholderArt } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';

export function SearchScreen() {
  const { state, actions } = useCollection();
  const query = state.searchQuery.trim();
  const results = useMemo(() => searchWorks(state.works, state.searchQuery), [state.works, state.searchQuery]);
  const suggestions = useMemo(() => suggestedSearchTags(state.works), [state.works]);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 14 }}>
        Suche
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

      {query.length === 0 && suggestions.length > 0 && (
        <>
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
        </>
      )}

      {query.length === 0 && suggestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
          Noch keine Werke erfasst — über die Scankarte oder den Import geht's los.
        </div>
      )}

      {query.length > 0 && results.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>{results.length} Ergebnisse</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((w) => (
              <div
                key={w.id}
                onClick={() => actions.openDetail(w.id)}
                style={{ display: 'flex', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
              >
                <PlaceholderArt
                  seed={w.id}
                  photoDataUrl={w.photoDataUrl}
                  alt={w.title}
                  radius={8}
                  style={{ width: 44, height: 44, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {w.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <ArtistName werk={w} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {query.length > 0 && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
          Keine Treffer für „{query}“
        </div>
      )}
    </div>
  );
}

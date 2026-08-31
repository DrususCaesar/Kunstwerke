import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { PlaceholderArt } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';
import { Chip } from '../components/Chip';
import { chipLabels, filterWorks } from '../lib/selectors';

export function GalleryScreen() {
  const { state, actions } = useCollection();

  const chips = useMemo(() => chipLabels(state.works), [state.works]);
  const filtered = useMemo(() => filterWorks(state.works, state.activeChips), [state.works, state.activeChips]);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)' }}>Sammlung</div>
        <button
          onClick={actions.toggleGalleryView}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11.5, cursor: 'pointer' }}
        >
          {state.galleryView === 'masonry' ? 'Liste' : 'Raster'}
        </button>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4, marginBottom: 14 }}>
        {filtered.length} Werke
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14, marginBottom: 4 }}>
        {chips.map((label) => (
          <Chip key={label} label={label} active={state.activeChips.includes(label)} onClick={() => actions.toggleChip(label)} />
        ))}
      </div>

      {state.galleryView === 'masonry' ? (
        <div style={{ columnCount: 2, columnGap: 10 }}>
          {filtered.map((w) => (
            <div key={w.id} onClick={() => actions.openDetail(w.id)} style={{ breakInside: 'avoid', marginBottom: 10, cursor: 'pointer' }}>
              <PlaceholderArt seed={w.id} aspect={w.aspect} radius={10} padding={8}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 7.5,
                    color: 'oklch(0.6 0.02 55)',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  {w.title}
                </span>
              </PlaceholderArt>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-primary)',
                  marginTop: 5,
                  fontFamily: 'var(--font-serif)',
                  lineHeight: 1.25,
                }}
              >
                {w.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                <ArtistName werk={w} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((w) => (
            <div
              key={w.id}
              onClick={() => actions.openDetail(w.id)}
              style={{ display: 'flex', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
            >
              <PlaceholderArt seed={w.id} radius={8} style={{ width: 46, height: 46, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {w.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <ArtistName werk={w} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>{w.museum}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useCollection } from '../state/CollectionContext';
import { WorkRow } from '../components/WorkRow';
import { CircleButton } from '../components/CircleButton';
import { SCREEN_TOP_PADDING } from '../lib/layout';

export function CollectionDetailScreen() {
  const { state, actions } = useCollection();
  const collection = state.collections.find((c) => c.id === state.selectedCollectionId);
  if (!collection) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 30, overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
      <div style={{ padding: `${SCREEN_TOP_PADDING} 20px 4px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <CircleButton onClick={actions.closeScreen} variant="onCard">
          ‹
        </CircleButton>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>
          {collection.name}
        </div>
      </div>
      <div style={{ padding: '2px 20px 14px', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
        {collection.workIds.length} {collection.workIds.length === 1 ? 'Werk' : 'Werke'} · antippen zum Hinzufügen/Entfernen
      </div>

      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column' }}>
        {state.works.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>
            Noch keine Werke in der Sammlung — erst über Scannen erfassen.
          </div>
        ) : (
          state.works.map((w) => {
            const included = collection.workIds.includes(w.id);
            return (
              <WorkRow
                key={w.id}
                work={w}
                onClick={() => actions.toggleWorkInCollection(collection.id, w.id)}
                trailing={
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: `1.5px solid ${included ? 'var(--accent-gold)' : 'var(--border-strong)'}`,
                      background: included ? 'var(--accent-gold)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold-text-on)',
                      fontSize: 13,
                    }}
                  >
                    {included && '✓'}
                  </div>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}

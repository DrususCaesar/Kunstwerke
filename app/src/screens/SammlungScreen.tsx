import { useMemo, useState } from 'react';
import { useCollection } from '../state/CollectionContext';
import { chipLabels, filterWorks, groupByMuseum } from '../lib/selectors';
import { Chip } from '../components/Chip';
import { WorkRow } from '../components/WorkRow';
import { PlaceholderArt } from '../components/PlaceholderArt';
import type { SammlungSubTab } from '../types';

const SUB_TABS: { id: SammlungSubTab; label: string }[] = [
  { id: 'bibliothek', label: 'Bibliothek' },
  { id: 'besuche', label: 'Besuche' },
  { id: 'sammlungen', label: 'Sammlungen' },
];

export function SammlungScreen() {
  const { state, actions } = useCollection();
  const chips = useMemo(() => chipLabels(state.works), [state.works]);
  const filtered = useMemo(() => filterWorks(state.works, state.activeChips), [state.works, state.activeChips]);
  const visits = useMemo(() => groupByMuseum(state.works), [state.works]);
  const [newCollectionName, setNewCollectionName] = useState('');

  const coverWork = state.works[0];

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <PlaceholderArt
          seed={coverWork?.id ?? 1}
          photoDataUrl={coverWork?.photoDataUrl}
          alt=""
          radius={12}
          style={{ width: 52, height: 52, flexShrink: 0 }}
        />
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>
            Persönliche Sammlung
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{state.works.length} Kunstwerke</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: 3,
          marginBottom: 16,
        }}
      >
        {SUB_TABS.map((t) => {
          const active = state.sammlungSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => actions.setSammlungSubTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                background: active ? 'var(--bg-card-light)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {state.sammlungSubTab === 'bibliothek' && (
        <>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14 }}>
            {chips.map((label) => (
              <Chip key={label} label={label} active={state.activeChips.includes(label)} onClick={() => actions.toggleChip(label)} />
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyHint text="Noch keine Werke — über Scannen kommen sie hierher." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((w) => (
                <WorkRow key={w.id} work={w} onClick={() => actions.openDetail(w.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {state.sammlungSubTab === 'besuche' && (
        <>
          {visits.length === 0 ? (
            <EmptyHint text="Sobald ein Museum erfasst ist, gruppiert die App deine Werke hier nach Besuch." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {visits.map((v) => (
                <div key={v.museum}>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{v.museum}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>
                      {v.city ? `${v.city} · ` : ''}
                      {v.works.length} {v.works.length === 1 ? 'Werk' : 'Werke'}
                    </div>
                  </div>
                  {v.works.map((w) => (
                    <WorkRow key={w.id} work={w} onClick={() => actions.openDetail(w.id)} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {state.sammlungSubTab === 'sammlungen' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Neue Sammlung benennen …"
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            />
            <button
              onClick={() => {
                if (!newCollectionName.trim()) return;
                actions.createCollection(newCollectionName);
                setNewCollectionName('');
              }}
              style={{
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--accent-gold)',
                color: 'var(--accent-gold-text-on)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Anlegen
            </button>
          </div>
          {state.collections.length === 0 ? (
            <EmptyHint text="Noch keine eigenen Sammlungen — leg oben deine erste an." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {state.collections.map((c) => (
                <div
                  key={c.id}
                  onClick={() => actions.openCollection(c.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 14px',
                    marginBottom: 2,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>
                      {c.workIds.length} {c.workIds.length === 1 ? 'Werk' : 'Werke'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteCollection(c.id);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-quaternary)', fontSize: 16, cursor: 'pointer', padding: 4 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-quaternary)', fontSize: 13 }}>{text}</div>;
}

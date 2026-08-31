import { useCollection } from '../state/CollectionContext';
import { PlaceholderArt, MonoLabel } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';
import { Badge, statusVariant } from '../components/Badge';
import { CircleButton } from '../components/CircleButton';
import { SCREEN_TOP_PADDING } from '../lib/layout';

export function WorkDetailScreen() {
  const { state, actions } = useCollection();
  const work = state.works.find((w) => w.id === state.selectedWorkId);
  if (!work) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 30, overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: work.aspect,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: SCREEN_TOP_PADDING,
          boxSizing: 'border-box',
        }}
      >
        <PlaceholderArt seed={work.id} radius={0} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'relative' }}>
          <MonoLabel>
            WERKFOTO
            <br />
            {work.title}
          </MonoLabel>
        </div>
        <CircleButton onClick={actions.closeScreen} style={{ position: 'absolute', top: SCREEN_TOP_PADDING, left: 14 }}>
          ‹
        </CircleButton>
        <div style={{ position: 'absolute', top: SCREEN_TOP_PADDING, right: 14, display: 'flex', gap: 8 }}>
          <CircleButton fontSize={15}>♡</CircleButton>
          <CircleButton fontSize={14}>✎</CircleButton>
        </div>
      </div>

      <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 23, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {work.title}
          </div>
          <div style={{ fontSize: 14, marginTop: 6, color: 'var(--text-secondary)' }}>
            <ArtistName werk={work} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {work.year} · {work.epoch} · {work.genre}
          </div>
        </div>

        <Badge label={work.status} variant={statusVariant(work.status)} dot />

        <div style={{ height: 1, background: 'var(--border-strong)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <MetaRow label="Museum" value={`${work.museum}, ${work.room}`} />
          <MetaRow label="Ort / Stadt" value={work.city} />
          <MetaRow label="Material/Technik" value={work.material} />
          <MetaRow label="Aufnahmedatum" value={work.dateAdded} />
        </div>

        {work.hasTafel && (
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-quaternary)', marginBottom: 8 }}>
              Beleg · Tafel-Foto
            </div>
            <div
              style={{
                width: 104,
                height: 78,
                borderRadius: 8,
                background: 'repeating-linear-gradient(135deg, oklch(0.26 0.015 50) 0 8px, oklch(0.22 0.013 50) 8px 16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-strong)',
              }}
            >
              <MonoLabel size={8}>TAFEL</MonoLabel>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-quaternary)', marginBottom: 6 }}>
            Tags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {work.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-card-light)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-quaternary)', marginBottom: 6 }}>
            Eigene Notizen
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
            {work.notes}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

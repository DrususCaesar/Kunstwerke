import { useMemo } from 'react';
import { useCollection } from '../state/CollectionContext';
import { collectionStats } from '../lib/selectors';

const SETTINGS_ROWS: { label: string; trailing: string; trailingColor: string }[] = [
  { label: 'Export als PDF-Katalog', trailing: '›', trailingColor: 'var(--text-quaternary)' },
  { label: 'Karten-Ansicht der Museen', trailing: '›', trailingColor: 'var(--text-quaternary)' },
  { label: 'Freigabe & Zugriffsrechte', trailing: '›', trailingColor: 'var(--text-quaternary)' },
  { label: 'Backup-Erinnerung', trailing: 'Fällig', trailingColor: 'var(--accent-terracotta)' },
  { label: 'Einstellungen & Sync', trailing: '›', trailingColor: 'var(--text-quaternary)' },
];

export function MoreScreen() {
  const { state } = useCollection();
  const stats = useMemo(() => collectionStats(state.works), [state.works]);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 16 }}>Mehr</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--accent-gold)' }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Werke erfasst</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--accent-gold)' }}>{stats.museums}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Museen besucht</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>Meistvertretene Epoche</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-primary)' }}>{stats.topEpoch}</div>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-quaternary)',
          marginBottom: 8,
        }}
      >
        Erfassungen nach Monat
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56, marginBottom: 26 }}>
        {stats.chart.map((bar) => (
          <div
            key={bar.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                width: '100%',
                borderRadius: '3px 3px 0 0',
                background: 'oklch(0.78 0.13 75 / 0.55)',
                height: bar.height,
              }}
            />
            <span style={{ fontSize: 8, color: 'var(--text-quaternary)' }}>{bar.label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--bg-card)',
        }}
      >
        {SETTINGS_ROWS.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '13px 14px',
              borderBottom: i < SETTINGS_ROWS.length - 1 ? '1px solid oklch(0.28 0.014 50)' : undefined,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{row.label}</span>
            <span style={{ fontSize: row.trailing === 'Fällig' ? 11 : undefined, color: row.trailingColor }}>{row.trailing}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

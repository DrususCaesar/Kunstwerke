import { useMemo, useState, type ReactNode } from 'react';
import { useCollection } from '../state/CollectionContext';
import { collectionStats } from '../lib/selectors';
import { exportBackup, importBackup, readLastBackupAt } from '../lib/backup';

const BACKUP_DUE_AFTER_DAYS = 14;

function formatBackupDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isBackupDue(lastBackupAt: Date | null): boolean {
  if (!lastBackupAt) return true;
  const days = (Date.now() - lastBackupAt.getTime()) / (1000 * 60 * 60 * 24);
  return days > BACKUP_DUE_AFTER_DAYS;
}

export function MoreScreen() {
  const { state, actions } = useCollection();
  const stats = useMemo(() => collectionStats(state.works), [state.works]);
  const [lastBackupAt, setLastBackupAt] = useState<Date | null>(() => readLastBackupAt());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const due = isBackupDue(lastBackupAt);

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
        <MoreRow
          label="Export als PDF-Katalog"
          trailing="›"
          onClick={async () => {
            if (state.works.length === 0) {
              actions.showToast('Noch keine Werke zum Exportieren');
              return;
            }
            // Dynamischer Import hält jsPDF aus dem Haupt-Bundle heraus —
            // die meisten Sitzungen exportieren nie einen Katalog.
            const { exportCollectionAsPdf } = await import('../lib/pdfCatalog');
            exportCollectionAsPdf(state.works);
          }}
        />
        <MoreRow label="Karten-Ansicht der Museen" trailing="›" disabledHint="benötigt Karten-API" />
        <MoreRow label="Freigabe & Zugriffsrechte" trailing="›" disabledHint="benötigt Supabase" />
        <MoreRow
          label="Backup-Erinnerung"
          trailing={due ? 'Fällig' : `Zuletzt: ${formatBackupDate(lastBackupAt!)}`}
          trailingColor={due ? 'var(--accent-terracotta)' : 'var(--text-quaternary)'}
          onClick={() => {
            exportBackup(state.works);
            setLastBackupAt(new Date());
            actions.showToast('Sicherung heruntergeladen');
          }}
        />
        <MoreRow
          label="Sicherung wiederherstellen"
          trailing="›"
          onClick={async () => {
            const works = await importBackup();
            if (works) actions.restoreWorks(works);
            else actions.showToast('Datei konnte nicht gelesen werden');
          }}
        />
        <MoreRow label="Einstellungen & Sync" trailing={settingsOpen ? '⌄' : '›'} onClick={() => setSettingsOpen((v) => !v)} isLast={!settingsOpen} />
        {settingsOpen && (
          <div style={{ padding: '10px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Standardansicht der Sammlung</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['masonry', 'list'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => actions.setGalleryView(view)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    cursor: 'pointer',
                    border: `1px solid ${state.galleryView === view ? 'var(--accent-gold)' : 'var(--border-strong)'}`,
                    background: state.galleryView === view ? 'var(--accent-gold-bg)' : 'transparent',
                    color: state.galleryView === view ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {view === 'masonry' ? 'Raster' : 'Liste'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-quaternary)', lineHeight: 1.5 }}>
              Wirkt sofort und bleibt auch nach dem nächsten Start erhalten. Sync über mehrere Geräte folgt, sobald Supabase verbunden ist.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MoreRow({
  label,
  trailing,
  trailingColor = 'var(--text-quaternary)',
  onClick,
  disabledHint,
  isLast = false,
}: {
  label: string;
  trailing: ReactNode;
  trailingColor?: string;
  onClick?: () => void;
  disabledHint?: string;
  isLast?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 14px',
        borderBottom: isLast ? undefined : '1px solid oklch(0.28 0.014 50)',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
        {label}
        {disabledHint && <span style={{ color: 'var(--text-quaternary)', fontSize: 11 }}> · {disabledHint}</span>}
      </span>
      <span style={{ fontSize: trailing === 'Fällig' || String(trailing).startsWith('Zuletzt') ? 11 : undefined, color: trailingColor }}>
        {trailing}
      </span>
    </div>
  );
}
